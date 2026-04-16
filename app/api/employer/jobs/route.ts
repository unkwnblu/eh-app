import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard helper ────────────────────────────────────────────────────────

async function getEmployer() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "employer") return null;
  return user;
}

// ─── GET — list jobs for the logged-in employer ───────────────────────────────

export async function GET() {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: jobs, error } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, status, created_at, closes_at
    `)
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Note: applicant pipeline is managed by Edge Harbour admins — employers no
  // longer receive per-job applied/interviewing counts.
  const mapped = (jobs ?? []).map((j) => ({
    id:             j.id,
    title:          j.title,
    sector:         j.sector,
    employmentType: j.employment_type,
    location:       j.location,
    remote:         j.remote,
    salaryMin:      j.salary_min,
    salaryMax:      j.salary_max,
    status:         j.status as "draft" | "review" | "live" | "closed",
    createdAt:      j.created_at,
    closesAt:       j.closes_at ?? null,
  }));

  return NextResponse.json({ jobs: mapped });
}

// ─── POST — create a new job ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;

  const {
    title, sector, employmentType, location, remote,
    salaryMin, salaryMax, description, responsibilities,
    requiredCertifications, experienceLevel, closesAt,
  } = body as {
    title: string; sector: string; employmentType: string;
    location: string; remote: boolean;
    salaryMin?: number; salaryMax?: number;
    description?: string; responsibilities?: string;
    requiredCertifications?: string[]; experienceLevel?: string;
    closesAt?: string;
  };

  if (!title?.trim() || !sector?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "Title, sector and location are required." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: job, error } = await service
    .from("jobs")
    .insert({
      employer_id:              user.id,
      title:                    title.trim(),
      sector,
      employment_type:          employmentType ?? "Full-time",
      location:                 location.trim(),
      remote:                   remote ?? false,
      salary_min:               salaryMin   ?? null,
      salary_max:               salaryMax   ?? null,
      description:              description ?? null,
      responsibilities:         responsibilities ?? null,
      required_certifications:  requiredCertifications ?? [],
      experience_level:         experienceLevel ?? "Mid-level",
      closes_at:                closesAt ?? null,
      status:                   (body as Record<string, unknown>).status === "draft" ? "draft" : "review",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ job }, { status: 201 });
}
