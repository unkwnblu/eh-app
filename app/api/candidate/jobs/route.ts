import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 2)   return "just now";
  if (mins  < 60)  return `${mins} minutes ago`;
  if (hours < 24)  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days  === 1) return "1 day ago";
  if (days  < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1000) return `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `£${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

// ─── GET — fetch live jobs scoped to the candidate's sector ───────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // 1. Fetch candidate's registered sector + profile status
  const [candidateRes, profileRes] = await Promise.all([
    service.from("candidates").select("sector").eq("id", user.id).single(),
    service.from("profiles").select("status").eq("id", user.id).single(),
  ]);

  if (candidateRes.error || !candidateRes.data) {
    return NextResponse.json({ error: "Candidate profile not found." }, { status: 404 });
  }

  const candidate       = candidateRes.data;
  const candidateStatus = (profileRes.data?.status ?? "pending") as string;
  const sector: string | null = candidate.sector ?? null;

  if (!sector) {
    return NextResponse.json({ jobs: [], sector: null, candidateStatus, total: 0 });
  }

  // 2. Fetch live jobs matching the candidate's sector
  const { data: jobs, error: jobsError } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, live_salary_min, live_salary_max,
      description, required_certifications,
      status, closes_at, created_at,
      employer_id
    `)
    .eq("status", "live")
    .eq("sector", sector)
    .order("created_at", { ascending: false });

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ jobs: [], sector, candidateStatus, total: 0 });
  }

  // 3. Fetch employer company names
  const employerIds = [...new Set(jobs.map((j) => j.employer_id))];
  const { data: employers } = await service
    .from("employers")
    .select("id, company_name")
    .in("id", employerIds);

  const employerMap: Record<string, string> = {};
  for (const e of employers ?? []) {
    employerMap[e.id] = e.company_name ?? "Unknown Employer";
  }

  // 4. Fetch which of these jobs the candidate has already applied to
  const jobIds = jobs.map((j) => j.id);
  const { data: existingApps } = await service
    .from("job_applications")
    .select("job_id")
    .eq("candidate_id", user.id)
    .in("job_id", jobIds);

  const appliedJobIds = new Set((existingApps ?? []).map((a) => a.job_id));

  // 5. Map to response shape — live pricing takes priority over employer pricing
  const mapped = jobs.map((j) => {
    const displayMin = j.live_salary_min ?? j.salary_min;
    const displayMax = j.live_salary_max ?? j.salary_max;

    return {
      id:                     j.id,
      title:                  j.title,
      company:                employerMap[j.employer_id] ?? "Unknown Employer",
      sector:                 j.sector,
      location:               j.location,
      remote:                 j.remote,
      salary:                 formatSalary(displayMin, displayMax),
      salaryMin:              displayMin ?? null,
      salaryMax:              displayMax ?? null,
      hasLivePricing:         j.live_salary_min != null || j.live_salary_max != null,
      type:                   j.employment_type,
      requiredCertifications: j.required_certifications ?? [],
      closesAt:               j.closes_at ?? null,
      posted:                 relativeTime(j.created_at),
      createdAt:              j.created_at,
    };
  });

  return NextResponse.json({ jobs: mapped, sector, candidateStatus, total: mapped.length, appliedJobIds: [...appliedJobIds] });
}
