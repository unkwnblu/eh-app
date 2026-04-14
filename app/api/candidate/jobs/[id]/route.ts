import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  // ── Fetch candidate status ────────────────────────────────────────────────
  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  const candidateStatus = (profile?.status ?? "pending") as string;

  // ── Fetch the job ──────────────────────────────────────────────────────────
  const { data: job, error: jobError } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, live_salary_min, live_salary_max,
      description, responsibilities, required_certifications,
      experience_level, status, closes_at, created_at,
      employer_id
    `)
    .eq("id", id)
    .eq("status", "live")
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // ── Fetch employer details ─────────────────────────────────────────────────
  const { data: employer } = await service
    .from("employers")
    .select("company_name, company_website, industries")
    .eq("id", job.employer_id)
    .single();

  // ── Check if candidate has already applied ────────────────────────────────
  const { data: existingApplication } = await service
    .from("job_applications")
    .select("id, stage, applied_at")
    .eq("job_id", id)
    .eq("candidate_id", user.id)
    .maybeSingle();

  const hasApplied = !!existingApplication;

  // ── Fetch similar jobs (same sector, different id, live) ───────────────────
  const { data: similarRaw } = await service
    .from("jobs")
    .select(`
      id, title, salary_min, salary_max, live_salary_min, live_salary_max,
      employer_id
    `)
    .eq("status", "live")
    .eq("sector", job.sector)
    .neq("id", id)
    .limit(3);

  // Fetch employer names for similar jobs
  const similarEmployerIds = [...new Set((similarRaw ?? []).map((j) => j.employer_id))];
  const { data: similarEmployers } = await service
    .from("employers")
    .select("id, company_name")
    .in("id", similarEmployerIds);

  const empMap: Record<string, string> = {};
  for (const e of similarEmployers ?? []) empMap[e.id] = e.company_name ?? "Unknown";

  const similarJobs = (similarRaw ?? []).map((j) => ({
    id:      j.id,
    title:   j.title,
    company: empMap[j.employer_id] ?? "Unknown",
    salary:  formatSalary(j.live_salary_min ?? j.salary_min, j.live_salary_max ?? j.salary_max),
  }));

  // ── Apply live pricing ─────────────────────────────────────────────────────
  const displayMin = job.live_salary_min ?? job.salary_min;
  const displayMax = job.live_salary_max ?? job.salary_max;

  return NextResponse.json({
    candidateStatus,
    hasApplied,
    job: {
      id:                     job.id,
      title:                  job.title,
      company:                employer?.company_name ?? "Unknown Employer",
      companyWebsite:         employer?.company_website ?? null,
      companyIndustries:      employer?.industries ?? [],
      sector:                 job.sector,
      location:               job.location,
      remote:                 job.remote,
      salary:                 formatSalary(displayMin, displayMax),
      type:                   job.employment_type,
      experienceLevel:        job.experience_level ?? null,
      description:            job.description ?? null,
      responsibilities:       job.responsibilities ?? null,
      requiredCertifications: job.required_certifications ?? [],
      closesAt:               job.closes_at ?? null,
      posted:                 relativeTime(job.created_at),
    },
    similarJobs,
  });
}
