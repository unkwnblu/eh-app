import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function getEmployer() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "employer") return null;
  return user;
}

// ─── GET — single job with full detail + pipeline candidates ─────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  const { data: job, error: jobError } = await service
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Fetch applications with candidate profile info
  const { data: applications, error: appsError } = await service
    .from("job_applications")
    .select(`
      id, stage, applied_at,
      candidate:profiles!job_applications_candidate_id_fkey (
        id, full_name
      )
    `)
    .eq("job_id", id)
    .order("applied_at", { ascending: true });

  if (appsError) {
    return NextResponse.json({ error: appsError.message }, { status: 500 });
  }

  // Fetch candidate compliance data
  const candidateIds = (applications ?? []).map((a) => (a.candidate as { id: string }).id);
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
    const candidate = a.candidate as { id: string; full_name: string };
    const compliance = complianceMap[candidate.id];
    const rtwVerified = !!compliance?.share_code;
    const dbsVerified = !!compliance?.verified_docs?.dbs;

    return {
      id:           a.id,
      candidateId:  candidate.id,
      name:         candidate.full_name,
      stage:        a.stage as "new" | "interviewing" | "offers" | "rejected",
      appliedAt:    a.applied_at,
      compliance:   rtwVerified ? "rtw-verified" : dbsVerified ? "dbs-verified" : "in-pipeline",
    };
  });

  return NextResponse.json({
    job: {
      id:                     job.id,
      title:                  job.title,
      sector:                 job.sector,
      employmentType:         job.employment_type,
      location:               job.location,
      remote:                 job.remote,
      salaryMin:              job.salary_min,
      salaryMax:              job.salary_max,
      description:            job.description,
      responsibilities:       job.responsibilities,
      requiredCertifications: job.required_certifications,
      experienceLevel:        job.experience_level,
      status:                 job.status,
      createdAt:              job.created_at,
      closesAt:               job.closes_at,
    },
    pipeline,
  });
}

// ─── PATCH — update job fields or status ─────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const service = createServiceClient();

  // Ensure job belongs to this employer
  const { data: existing } = await service
    .from("jobs")
    .select("id")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Handle pipeline stage move
  if (body.applicationId && body.stage) {
    const { error } = await service
      .from("job_applications")
      .update({ stage: body.stage })
      .eq("id", body.applicationId as string)
      .eq("job_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Handle job field/status update
  const allowed = [
    "title", "sector", "employment_type", "location", "remote",
    "salary_min", "salary_max", "description", "responsibilities",
    "required_certifications", "experience_level", "status", "closes_at",
  ];

  const updates: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    employmentType:         "employment_type",
    salaryMin:              "salary_min",
    salaryMax:              "salary_max",
    requiredCertifications: "required_certifications",
    experienceLevel:        "experience_level",
    closesAt:               "closes_at",
  };

  for (const [key, value] of Object.entries(body)) {
    const dbKey = fieldMap[key] ?? key;
    if (allowed.includes(dbKey)) updates[dbKey] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await service.from("jobs").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove a job ────────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  const { error } = await service
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("employer_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
