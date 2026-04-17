import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // Fetch employer company name
  const { data: employerRow } = await service
    .from("employers")
    .select("company_name")
    .eq("id", user.id)
    .single();
  const companyName = employerRow?.company_name ?? "Your Company";

  // Parallel: jobs + applications
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [jobsRes, allApplicationsRes] = await Promise.all([
    service
      .from("jobs")
      .select("id, title, status, location, closes_at, created_at, candidates_needed")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false }),
    service
      .from("job_applications")
      .select("id, job_id, candidate_id, stage, applied_at")
      .in("job_id",
        // We need job IDs — fetch them first or do a subquery approach
        // Use a workaround: fetch all applications then filter by job_id client-side
        (await service.from("jobs").select("id").eq("employer_id", user.id)).data?.map((j) => j.id as string) ?? []
      ),
  ]);

  const jobs         = jobsRes.data ?? [];
  const allApps      = allApplicationsRes.data ?? [];
  const liveJobs     = jobs.filter((j) => j.status === "live");
  const liveJobIds   = liveJobs.map((j) => j.id as string);

  // Jobs created this week (live)
  const newThisWeek  = liveJobs.filter((j) => (j.created_at as string) >= weekAgo).length;

  // Applications for live jobs only
  const liveApps     = allApps.filter((a) => liveJobIds.includes(a.job_id as string));

  // ── Stats ────────────────────────────────────────────────────────────────────

  // Offer acceptance rate
  const acceptedCount = allApps.filter((a) => a.stage === "accepted").length;
  const rejectedCount = allApps.filter((a) => a.stage === "rejected").length;
  const rateBase      = acceptedCount + rejectedCount;
  const offerRate     = rateBase > 0 ? Math.round((acceptedCount / rateBase) * 100) : null;

  // Avg time to hire (days from applied_at to now for accepted applications)
  const acceptedApps  = allApps.filter((a) => a.stage === "accepted");
  let avgTimeToHire: number | null = null;
  if (acceptedApps.length > 0) {
    const totalDays = acceptedApps.reduce((sum, a) => {
      return sum + Math.floor((Date.now() - new Date(a.applied_at as string).getTime()) / 86_400_000);
    }, 0);
    avgTimeToHire = Math.round(totalDays / acceptedApps.length);
  }

  // Total applicants count across all live jobs
  const totalApplicants = liveApps.length;

  // ── Recent applications (last 8) ─────────────────────────────────────────────

  const recentAppsSorted = [...liveApps]
    .sort((a, b) => new Date(b.applied_at as string).getTime() - new Date(a.applied_at as string).getTime())
    .slice(0, 8);

  let recentApplications: {
    id: string;
    candidateId: string;
    candidateName: string;
    initials: string;
    appliedAt: string;
    jobTitle: string;
    compliance: {
      rtwStatus:  "verified" | "pending" | "missing";
      dbsStatus:  "verified" | "pending" | "missing";
      suspended:  boolean;
    };
  }[] = [];

  if (recentAppsSorted.length > 0) {
    const candidateIds = [...new Set(recentAppsSorted.map((a) => a.candidate_id as string))];
    const appJobIds    = [...new Set(recentAppsSorted.map((a) => a.job_id as string))];

    const [profilesRes, candidatesRes, jobTitlesRes] = await Promise.all([
      service.from("profiles").select("id, full_name, status").in("id", candidateIds),
      service
        .from("candidates")
        .select("id, document_type, share_code, dbs_file_path, verified_docs")
        .in("id", candidateIds),
      service.from("jobs").select("id, title").in("id", appJobIds),
    ]);

    const profileMap: Record<string, { full_name: string; status: string }> = {};
    for (const p of profilesRes.data ?? []) {
      profileMap[p.id as string] = { full_name: p.full_name as string, status: p.status as string };
    }

    const candidateMap: Record<string, {
      document_type: string | null;
      share_code: string | null;
      dbs_file_path: string | null;
      verified_docs: Record<string, boolean> | null;
    }> = {};
    for (const c of candidatesRes.data ?? []) {
      candidateMap[c.id as string] = {
        document_type: c.document_type as string | null,
        share_code:    c.share_code as string | null,
        dbs_file_path: c.dbs_file_path as string | null,
        verified_docs: c.verified_docs as Record<string, boolean> | null,
      };
    }

    const jobTitleMap: Record<string, string> = {};
    for (const j of jobTitlesRes.data ?? []) {
      jobTitleMap[j.id as string] = j.title as string;
    }

    recentApplications = recentAppsSorted.map((a) => {
      const profile  = profileMap[a.candidate_id as string];
      const cand     = candidateMap[a.candidate_id as string];
      const fullName = profile?.full_name ?? "Unknown Candidate";
      const initials = fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "??";
      const vd       = cand?.verified_docs ?? {};
      const suspended = profile?.status === "suspended" || profile?.status === "flagged";

      // RTW: has a doc if document_type or share_code is set
      const hasRtwDoc = !!(cand?.document_type || cand?.share_code);
      const rtwVerified = hasRtwDoc && (vd["doc_meta"] === true || vd["share_code"] === true);
      const rtwStatus: "verified" | "pending" | "missing" =
        rtwVerified  ? "verified" :
        hasRtwDoc    ? "pending"  : "missing";

      // DBS: has a doc if dbs_file_path is set
      const hasDbsDoc = !!cand?.dbs_file_path;
      const dbsVerified = hasDbsDoc && vd["dbs"] === true;
      const dbsStatus: "verified" | "pending" | "missing" =
        dbsVerified ? "verified" :
        hasDbsDoc   ? "pending"  : "missing";

      return {
        id:            a.id as string,
        candidateId:   a.candidate_id as string,
        candidateName: fullName,
        initials,
        appliedAt:     relativeTime(a.applied_at as string),
        jobTitle:      jobTitleMap[a.job_id as string] ?? "Unknown Role",
        compliance:    { rtwStatus, dbsStatus, suspended },
      };
    });
  }

  // ── Active jobs panel (up to 5, sorted by closes_at asc) ─────────────────────

  const appCountByJob: Record<string, number> = {};
  for (const a of liveApps) {
    const jid = a.job_id as string;
    appCountByJob[jid] = (appCountByJob[jid] ?? 0) + 1;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeJobsPanel = liveJobs
    .slice(0, 5)
    .map((j) => {
      const applicants    = appCountByJob[j.id as string] ?? 0;
      const needed        = (j.candidates_needed as number) ?? 5;
      const progress      = Math.min(100, Math.round((applicants / Math.max(needed, 1)) * 100));
      let daysLeft: number | null = null;
      if (j.closes_at) {
        const closeDate = new Date(j.closes_at as string);
        closeDate.setHours(0, 0, 0, 0);
        daysLeft = Math.max(0, Math.round((closeDate.getTime() - today.getTime()) / 86_400_000));
      }
      return {
        id:         j.id as string,
        title:      j.title as string,
        location:   j.location as string,
        applicants,
        progress,
        daysLeft,
        urgent:     daysLeft !== null && daysLeft <= 3,
      };
    });

  return NextResponse.json({
    companyName,
    stats: {
      activeJobs:    liveJobs.length,
      newThisWeek,
      avgTimeToHire,
      totalApplicants,
      offerRate,
    },
    recentApplications,
    activeJobs: activeJobsPanel,
  });
}
