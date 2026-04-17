import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── GET /api/candidate/dashboard ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // ── Parallel queries ────────────────────────────────────────────────────────
  const [profileRes, candidateRes, applicationsRes, legalDocsRes, shiftAssignmentsRes] = await Promise.all([
    service.from("profiles").select("full_name, status").eq("id", user.id).single(),
    service
      .from("candidates")
      .select("sector, cv_file_path, dbs_file_path, document_type, share_code")
      .eq("id", user.id)
      .single(),
    service
      .from("job_applications")
      .select("id, job_id, stage, applied_at")
      .eq("candidate_id", user.id)
      .order("applied_at", { ascending: false }),
    service
      .from("candidate_legal_documents")
      .select("id")
      .eq("candidate_id", user.id),
    service
      .from("shift_assignments")
      .select("id, shift_id, status")
      .eq("candidate_id", user.id)
      .in("status", ["pending", "confirmed"]),
  ]);

  const profile = profileRes.data;
  const candidate = candidateRes.data;
  const applications = applicationsRes.data ?? [];
  const legalDocs = legalDocsRes.data ?? [];
  const shiftAssignments = shiftAssignmentsRes.data ?? [];

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";
  const candidateStatus = profile?.status ?? "pending";
  const sector = candidate?.sector ?? null;

  // ── Application stats ───────────────────────────────────────────────────────
  const totalApplied = applications.length;
  const newCount = applications.filter((a) => a.stage === "new").length;
  const interviewCount = applications.filter((a) => a.stage === "interviewing").length;
  const offersCount = applications.filter((a) => a.stage === "offers").length;
  const acceptedCount = applications.filter((a) => a.stage === "accepted").length;

  // ── Latest application with job details ─────────────────────────────────────
  let latestApplication: {
    id: string;
    jobTitle: string;
    company: string;
    stage: string;
    appliedAt: string;
  } | null = null;

  if (applications.length > 0) {
    const latest = applications[0]; // newest first
    const { data: job } = await service
      .from("jobs")
      .select("title, employer_id")
      .eq("id", latest.job_id)
      .single();

    let company = "Unknown Employer";
    if (job?.employer_id) {
      const { data: emp } = await service
        .from("employers")
        .select("company_name")
        .eq("id", job.employer_id)
        .single();
      company = emp?.company_name ?? company;
    }

    latestApplication = {
      id: latest.id,
      jobTitle: job?.title ?? "Unknown Role",
      company,
      stage: latest.stage,
      appliedAt: relativeTime(latest.applied_at),
    };
  }

  // ── Recommended jobs (sector match, not already applied, live) ──────────────
  const appliedJobIds = applications.map((a) => a.job_id);

  let recommendedJobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    remote: boolean;
    salary: string | null;
    type: string;
    posted: string;
  }[] = [];

  if (sector) {
    let query = service
      .from("jobs")
      .select("id, title, employer_id, location, remote, salary_min, salary_max, live_salary_min, live_salary_max, employment_type, created_at")
      .eq("status", "live")
      .eq("sector", sector)
      .order("created_at", { ascending: false })
      .limit(4);

    if (appliedJobIds.length > 0) {
      // Supabase doesn't support `not.in` on empty arrays cleanly
      query = query.not("id", "in", `(${appliedJobIds.join(",")})`);
    }

    const { data: jobs } = await query;

    if (jobs && jobs.length > 0) {
      const empIds = [...new Set(jobs.map((j) => j.employer_id))];
      const { data: employers } = await service
        .from("employers")
        .select("id, company_name")
        .in("id", empIds);
      const empMap: Record<string, string> = {};
      for (const e of employers ?? []) empMap[e.id] = e.company_name ?? "Unknown";

      recommendedJobs = jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: empMap[j.employer_id] ?? "Unknown Employer",
        location: j.location,
        remote: j.remote,
        salary: formatSalary(j.live_salary_min ?? j.salary_min, j.live_salary_max ?? j.salary_max),
        type: j.employment_type,
        posted: relativeTime(j.created_at),
      }));
    }
  }

  // ── Shift stats ─────────────────────────────────────────────────────────────
  const pendingShiftCount   = shiftAssignments.filter((a) => a.status === "pending").length;
  const confirmedShiftCount = shiftAssignments.filter((a) => a.status === "confirmed").length;

  let nextShift: {
    assignmentId: string;
    jobTitle:     string;
    date:         string;
    startTime:    string;
    endTime:      string;
    isRecurring:  boolean;
    recurrenceType: string | null;
  } | null = null;

  const confirmedIds = shiftAssignments
    .filter((a) => a.status === "confirmed")
    .map((a) => a.shift_id as string);

  if (confirmedIds.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: upcomingShifts } = await service
      .from("shifts")
      .select("id, date, start_time, end_time, job_id, is_recurring, recurrence_type")
      .in("id", confirmedIds)
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1);

    if (upcomingShifts && upcomingShifts.length > 0) {
      const s = upcomingShifts[0];
      const assignment = shiftAssignments.find((a) => a.shift_id === s.id);
      const { data: shiftJob } = await service
        .from("jobs")
        .select("title")
        .eq("id", s.job_id)
        .single();

      nextShift = {
        assignmentId: assignment?.id ?? "",
        jobTitle:     shiftJob?.title ?? "Unknown Role",
        date:         s.date as string,
        startTime:    (s.start_time as string).slice(0, 5),
        endTime:      (s.end_time as string).slice(0, 5),
        isRecurring:  (s.is_recurring as boolean) ?? false,
        recurrenceType: (s.recurrence_type as string | null) ?? null,
      };
    }
  }

  // ── Profile completeness ────────────────────────────────────────────────────
  const checks = [
    { label: "Full name",       done: !!(profile?.full_name && profile.full_name.trim()) },
    { label: "Sector selected", done: !!sector },
    { label: "CV uploaded",     done: !!candidate?.cv_file_path },
    { label: "Right to work",   done: !!(candidate?.document_type || candidate?.share_code || legalDocs.length > 0) },
    { label: "DBS certificate", done: !!candidate?.dbs_file_path },
  ];
  const completedChecks = checks.filter((c) => c.done).length;
  const completeness = Math.round((completedChecks / checks.length) * 100);

  return NextResponse.json({
    firstName,
    candidateStatus,
    sector,
    stats: {
      totalApplied,
      new: newCount,
      interviewing: interviewCount,
      offers: offersCount,
      accepted: acceptedCount,
    },
    shifts: {
      pending:   pendingShiftCount,
      confirmed: confirmedShiftCount,
      nextShift,
    },
    latestApplication,
    recommendedJobs,
    profile: {
      completeness,
      checks,
    },
  });
}
