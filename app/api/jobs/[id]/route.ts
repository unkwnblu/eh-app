import { NextResponse, type NextRequest } from "next/server";
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
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── GET /api/jobs/[id] — public, no auth required ───────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: job, error } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, live_salary_min, live_salary_max,
      description, responsibilities, required_certifications,
      experience_level, closes_at, created_at, employer_id
    `)
    .eq("id", id)
    .eq("status", "live")
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: employer } = await service
    .from("employers")
    .select("company_name, company_website, industries")
    .eq("id", job.employer_id)
    .single();

  const displayMin = job.live_salary_min ?? job.salary_min;
  const displayMax = job.live_salary_max ?? job.salary_max;

  return NextResponse.json({
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
  });
}
