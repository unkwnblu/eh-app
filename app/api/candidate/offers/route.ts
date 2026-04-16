import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { insertCandidateNotification } from "@/lib/notifications/candidate";

async function getCandidate() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Helper — mark the matching offer notification as read + acted so the
// Accept/Decline buttons are permanently hidden even if the notification
// was already manually marked as read before the candidate acted.
async function markOfferNotifActed(
  service: ReturnType<typeof import("@/lib/supabase/service").createServiceClient>,
  candidateId: string,
  applicationId: string,
  jobId: string,
  outcome: "accepted" | "declined",
) {
  try {
    // Try applicationId match first, fall back to jobId
    for (const filter of [{ applicationId }, { jobId }]) {
      const { data: rows } = await service
        .from("candidate_notifications")
        .select("id, metadata")
        .eq("candidate_id", candidateId)
        .eq("type", "offer")
        .contains("metadata", filter)
        .not("metadata->acted", "eq", '"accepted"')
        .not("metadata->acted", "eq", '"declined"')
        .limit(5);

      for (const row of rows ?? []) {
        await service
          .from("candidate_notifications")
          .update({
            read: true,
            metadata: { ...(row.metadata as Record<string, unknown> ?? {}), acted: outcome },
          })
          .eq("id", row.id);
      }
    }
  } catch {
    // Best-effort
  }
}

// POST — accept or decline an offer
// Body: { applicationId?: string, jobId?: string, action: "accept" | "decline" }
// applicationId is preferred; jobId is a fallback for older notifications that
// were created before applicationId was added to notification metadata.
export async function POST(request: NextRequest) {
  const user = await getCandidate();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { applicationId, jobId, action } = await request.json() as {
    applicationId?: string;
    jobId?:         string;
    action?:        string;
  };

  if (!["accept", "decline"].includes(action ?? "")) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }
  if (!applicationId && !jobId) {
    return NextResponse.json({ error: "applicationId or jobId is required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Fetch application — verify it belongs to this candidate and is at 'offers' stage
  let appQuery = service
    .from("job_applications")
    .select("id, stage, job_id, candidate_id")
    .eq("candidate_id", user.id)
    .eq("stage", "offers");

  if (applicationId) {
    appQuery = appQuery.eq("id", applicationId);
  } else {
    appQuery = appQuery.eq("job_id", jobId!);
  }

  const { data: app } = await appQuery.single();

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.stage !== "offers") return NextResponse.json({ error: "This offer is no longer pending" }, { status: 409 });

  // Fetch job details for notification copy + capacity check
  const { data: job } = await service
    .from("jobs")
    .select("title, employer_id, candidates_needed")
    .eq("id", app.job_id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const { data: employer } = await service
    .from("employers")
    .select("company_name")
    .eq("id", job.employer_id)
    .single();

  const company = employer?.company_name ?? "the employer";

  if (action === "accept") {
    // Capacity check: count how many candidates have already accepted this job
    const { count } = await service
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", app.job_id)
      .eq("stage", "accepted");

    const acceptedCount = count ?? 0;
    const needed = job.candidates_needed ?? 1;

    if (acceptedCount >= needed) {
      return NextResponse.json({
        error: `Sorry, all ${needed} position${needed !== 1 ? "s" : ""} for this role have been filled.`,
        code: "JOB_FULL",
      }, { status: 409 });
    }

    // Move to accepted
    const { error } = await service
      .from("job_applications")
      .update({ stage: "accepted" })
      .eq("id", app.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark the offer notification as read + acted so buttons are hidden permanently
    await markOfferNotifActed(service, user.id, app.id, app.job_id, "accepted");

    await insertCandidateNotification(
      service, user.id, "offer",
      "Offer Accepted",
      `You've successfully accepted the offer for **${job.title}** at ${company}. Welcome to the team!`,
      { jobId: app.job_id, jobTitle: job.title, company, acted: "accepted" }
    );

    return NextResponse.json({ success: true, stage: "accepted" });
  }

  // Decline
  const { error } = await service
    .from("job_applications")
    .update({ stage: "rejected" })
    .eq("id", app.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark the offer notification as read + acted so buttons are hidden permanently
  await markOfferNotifActed(service, user.id, app.id, app.job_id, "declined");

  return NextResponse.json({ success: true, stage: "rejected" });
}
