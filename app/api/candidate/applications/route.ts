import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { insertCandidateNotification, NOTIF_COPY } from "@/lib/notifications/candidate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return "1 day ago";
  if (days  < 30)  return `${days} days ago`;
  return formatDate(iso);
}

// ─── POST /api/candidate/applications ────────────────────────────────────────
// Submit an application for a live job.

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as { jobId?: string };
  if (!body.jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });

  const service = createServiceClient();

  // Must be an active (verified) candidate
  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active") {
    return NextResponse.json(
      { error: "Your profile must be verified before you can apply for roles." },
      { status: 403 },
    );
  }

  // Verify the job is live
  const { data: job } = await service
    .from("jobs")
    .select("id, title, employer_id, status")
    .eq("id", body.jobId)
    .single();

  if (!job || job.status !== "live") {
    return NextResponse.json(
      { error: "This job is no longer available." },
      { status: 404 },
    );
  }

  const { data: employer } = await service
    .from("employers")
    .select("company_name")
    .eq("id", job.employer_id)
    .single();

  const company = employer?.company_name ?? "the employer";

  // Insert the application
  const { data: application, error: insertError } = await service
    .from("job_applications")
    .insert({ job_id: body.jobId, candidate_id: user.id, stage: "new" })
    .select("id, stage, applied_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You have already applied for this role." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Fire-and-forget notification
  const copy = NOTIF_COPY.applicationSubmitted(job.title, company);
  await insertCandidateNotification(
    service, user.id, "application",
    copy.title, copy.body,
    { jobId: body.jobId, jobTitle: job.title, company },
  );

  return NextResponse.json({ application }, { status: 201 });
}

// ─── GET /api/candidate/applications ─────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // Fetch all applications for this candidate, newest first
  const { data: apps, error } = await service
    .from("job_applications")
    .select("id, job_id, stage, applied_at, updated_at")
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!apps || apps.length === 0) {
    return NextResponse.json({
      applications: [],
      stats: { total: 0, active: 0, interviewing: 0, offers: 0 },
    });
  }

  // Fetch job details for all applications
  const jobIds = apps.map((a) => a.job_id);
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title, sector, employer_id, closes_at")
    .in("id", jobIds);

  // Fetch employer names
  const employerIds = [...new Set((jobs ?? []).map((j) => j.employer_id))];
  const { data: employers } = await service
    .from("employers")
    .select("id, company_name")
    .in("id", employerIds);

  const jobMap: Record<string, { title: string; sector: string; employer_id: string; closes_at: string | null }> = {};
  for (const j of jobs ?? []) jobMap[j.id] = j;

  const empMap: Record<string, string> = {};
  for (const e of employers ?? []) empMap[e.id] = e.company_name ?? "Unknown Employer";

  const applications = apps.map((a) => {
    const job     = jobMap[a.job_id];
    const company = job ? (empMap[job.employer_id] ?? "Unknown Employer") : "Unknown";

    return {
      id:          a.id,
      jobId:       a.job_id,
      title:       job?.title    ?? "Unknown Role",
      company,
      sector:      job?.sector   ?? "",
      stage:       a.stage as "new" | "interviewing" | "offers" | "rejected",
      appliedDate: formatDate(a.applied_at),
      appliedAt:   a.applied_at,
      updatedAt:   a.updated_at,
      lastActivity: relativeTime(a.updated_at),
    };
  });

  // Compute stats
  const active       = applications.filter((a) => a.stage !== "rejected").length;
  const interviewing = applications.filter((a) => a.stage === "interviewing").length;
  const offers       = applications.filter((a) => a.stage === "offers").length;

  return NextResponse.json({
    applications,
    stats: {
      total: applications.length,
      active,
      interviewing,
      offers,
    },
  });
}
