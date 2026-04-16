import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function getEmployer() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "employer") return null;
  return user;
}

// ─── GET — single job detail (for edit form) ─────────────────────────────────
// Note: applicant pipeline is managed by Edge Harbour admins — employers no
// longer have access to candidate-level data.

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
      candidatesNeeded:       job.candidates_needed ?? 1,
      status:                 job.status,
      createdAt:              job.created_at,
      closesAt:               job.closes_at,
    },
  });
}

// ─── PATCH — update editable job fields ──────────────────────────────────────
// Employers can edit job content (title, salary, description, etc.) but cannot
// move candidates through the pipeline — that belongs to the admin portal.

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

  // Reject any pipeline mutations — admins own the pipeline
  if (body.applicationId || body.stage) {
    return NextResponse.json(
      { error: "Pipeline changes are managed by Edge Harbour administrators." },
      { status: 403 },
    );
  }

  const allowed = [
    "title", "sector", "employment_type", "location", "remote",
    "salary_min", "salary_max", "description", "responsibilities",
    "required_certifications", "experience_level", "status", "closes_at",
    "candidates_needed",
  ];

  const updates: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    employmentType:         "employment_type",
    salaryMin:              "salary_min",
    salaryMax:              "salary_max",
    requiredCertifications: "required_certifications",
    experienceLevel:        "experience_level",
    closesAt:               "closes_at",
    candidatesNeeded:       "candidates_needed",
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
