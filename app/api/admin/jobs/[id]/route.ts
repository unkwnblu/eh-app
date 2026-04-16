import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { insertCandidateNotification, NOTIF_COPY } from "@/lib/notifications/candidate";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") return null;
  return user;
}

// ─── GET — single job detail + pipeline (for admin pipeline page) ────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  const { data: job, error: jobError } = await service
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Employer company name
  const { data: employer } = await service
    .from("employers")
    .select("company_name")
    .eq("id", job.employer_id)
    .single();

  // Applications + candidate profile info
  const { data: applications, error: appsError } = await service
    .from("job_applications")
    .select(`
      id, stage, applied_at, interview_date, interview_time, meeting_link,
      candidate:profiles!job_applications_candidate_id_fkey (
        id, full_name
      )
    `)
    .eq("job_id", id)
    .order("applied_at", { ascending: true });

  if (appsError) {
    return NextResponse.json({ error: appsError.message }, { status: 500 });
  }

  // Candidate compliance
  const candidateIds = (applications ?? []).map((a) => (a.candidate as unknown as { id: string }).id);
  const complianceMap: Record<string, { share_code: string | null; verified_docs: Record<string, boolean> }> = {};

  if (candidateIds.length > 0) {
    const { data: candidates } = await service
      .from("candidates")
      .select("id, share_code, verified_docs")
      .in("id", candidateIds);

    for (const c of candidates ?? []) {
      complianceMap[c.id] = { share_code: c.share_code, verified_docs: c.verified_docs ?? {} };
    }
  }

  const pipeline = (applications ?? []).map((a) => {
    const candidate  = a.candidate as unknown as { id: string; full_name: string };
    const compliance = complianceMap[candidate.id];
    const rtwVerified = !!compliance?.share_code;
    const dbsVerified = !!compliance?.verified_docs?.dbs;

    return {
      id:            a.id,
      candidateId:   candidate.id,
      name:          candidate.full_name,
      stage:         a.stage as "new" | "interviewing" | "offers" | "accepted" | "rejected",
      appliedAt:     a.applied_at,
      compliance:    rtwVerified ? "rtw-verified" : dbsVerified ? "dbs-verified" : "in-pipeline",
      interviewDate: (a as Record<string, unknown>).interview_date as string | null ?? null,
      interviewTime: (a as Record<string, unknown>).interview_time as string | null ?? null,
      meetingLink:   (a as Record<string, unknown>).meeting_link   as string | null ?? null,
    };
  });

  return NextResponse.json({
    job: {
      id:                     job.id,
      title:                  job.title,
      employer:               employer?.company_name ?? "Unknown Employer",
      employerId:             job.employer_id,
      sector:                 job.sector,
      employmentType:         job.employment_type,
      location:               job.location,
      remote:                 job.remote,
      salaryMin:              job.salary_min,
      salaryMax:              job.salary_max,
      liveSalaryMin:          job.live_salary_min ?? null,
      liveSalaryMax:          job.live_salary_max ?? null,
      description:            job.description,
      responsibilities:       job.responsibilities,
      requiredCertifications: job.required_certifications,
      experienceLevel:        job.experience_level,
      status:                 job.status,
      createdAt:              job.created_at,
      closesAt:               job.closes_at,
      candidatesNeeded:       job.candidates_needed ?? 1,
    },
    pipeline,
  });
}

// ─── PATCH ────────────────────────────────────────────────────────────────────
// Three shapes:
//   { action: "approve" | "flag" | "reject" | "reset" }         → update job status
//   { liveSalaryMin: number|null, liveSalaryMax: number|null }  → set live pricing
//   { applicationId: string, stage: ColumnKey }                 → move candidate stage

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const service = createServiceClient();

  // ── Pipeline stage move ─────────────────────────────────────────────────────
  if (body.applicationId && body.stage) {
    const validStages = ["new", "interviewing", "offers", "accepted", "rejected"];
    if (!validStages.includes(body.stage as string)) {
      return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
    }

    // Fetch application + candidate_id before updating (needed for notification)
    const { data: appRow } = await service
      .from("job_applications")
      .select("candidate_id")
      .eq("id", body.applicationId as string)
      .eq("job_id", id)
      .single();

    const { error } = await service
      .from("job_applications")
      .update({ stage: body.stage })
      .eq("id", body.applicationId as string)
      .eq("job_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fire notification for meaningful stage transitions
    if (appRow?.candidate_id) {
      const stage = body.stage as string;

      // Look up job + employer for notification copy (best-effort)
      const { data: jobRow } = await service
        .from("jobs")
        .select("title, employer_id")
        .eq("id", id)
        .single();

      if (jobRow) {
        const { data: empRow } = await service
          .from("employers")
          .select("company_name")
          .eq("id", jobRow.employer_id)
          .single();

        const jobTitle = jobRow.title;
        const company  = empRow?.company_name ?? "the employer";

        let copy: { title: string; body: string } | null = null;
        let notifType: "interview" | "offer" | "rejection" | null = null;

        if (stage === "interviewing") {
          copy = NOTIF_COPY.movedToInterview(jobTitle, company);
          notifType = "interview";
        } else if (stage === "offers") {
          copy = NOTIF_COPY.offerReceived(jobTitle, company);
          notifType = "offer";
        } else if (stage === "rejected") {
          copy = NOTIF_COPY.applicationRejected(jobTitle, company);
          notifType = "rejection";
        }

        if (copy && notifType) {
          await insertCandidateNotification(
            service, appRow.candidate_id, notifType,
            copy.title, copy.body,
            { jobId: id, applicationId: body.applicationId as string, jobTitle, company },
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  }

  // ── Schedule interview notification ─────────────────────────────────────────
  if (body.applicationId && body.interviewDate && body.interviewTime) {
    const { data: appRow } = await service
      .from("job_applications")
      .select("candidate_id, stage")
      .eq("id", body.applicationId as string)
      .eq("job_id", id)
      .single();

    if (!appRow) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (appRow.stage !== "interviewing") {
      return NextResponse.json({ error: "Candidate is not in the interviewing stage" }, { status: 400 });
    }

    // Persist schedule details on the application row
    await service
      .from("job_applications")
      .update({
        interview_date: body.interviewDate as string,
        interview_time: body.interviewTime as string,
        meeting_link:   (body.meetingLink as string) || null,
      })
      .eq("id", body.applicationId as string)
      .eq("job_id", id);

    const { data: jobRow } = await service
      .from("jobs").select("title, employer_id").eq("id", id).single();

    if (jobRow) {
      const { data: empRow } = await service
        .from("employers").select("company_name").eq("id", jobRow.employer_id).single();

      const copy = NOTIF_COPY.interviewScheduled(
        jobRow.title,
        empRow?.company_name ?? "the employer",
        body.interviewDate as string,
        body.interviewTime as string,
        (body.meetingLink as string) || undefined,
      );

      await insertCandidateNotification(
        service, appRow.candidate_id, "interview",
        copy.title, copy.body,
        {
          jobId:         id,
          jobTitle:      jobRow.title,
          company:       empRow?.company_name ?? "the employer",
          interviewDate: body.interviewDate as string,
          interviewTime: body.interviewTime as string,
          meetingLink:   (body.meetingLink as string) || undefined,
        },
      );
    }

    return NextResponse.json({ success: true });
  }

  // ── Live pricing update ──────────────────────────────────────────────────────
  if ("liveSalaryMin" in body || "liveSalaryMax" in body) {
    const min = body.liveSalaryMin != null ? Number(body.liveSalaryMin) : null;
    const max = body.liveSalaryMax != null ? Number(body.liveSalaryMax) : null;

    if (min !== null && max !== null && min > max) {
      return NextResponse.json({ error: "Minimum salary cannot exceed maximum." }, { status: 400 });
    }

    const { error } = await service
      .from("jobs")
      .update({
        live_salary_min: min,
        live_salary_max: max,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, liveSalaryMin: min, liveSalaryMax: max });
  }

  // ── Status action ────────────────────────────────────────────────────────────
  const actionToStatus: Record<string, string> = {
    approve: "live",
    flag:    "flagged",
    reject:  "rejected",
    reset:   "review",
  };

  const newStatus = actionToStatus[body.action as string];
  if (!newStatus) {
    return NextResponse.json(
      { error: "Invalid action. Use: approve | flag | reject | reset" },
      { status: 400 }
    );
  }

  const { error } = await service
    .from("jobs")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, status: newStatus });
}
