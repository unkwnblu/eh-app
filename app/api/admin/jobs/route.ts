import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") return null;
  return user;
}

// ─── Compliance checker ───────────────────────────────────────────────────────

type ComplianceItem = { label: string; pass: boolean };

function computeCompliance(job: {
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  location: string | null;
  closes_at: string | null;
  description: string | null;
  responsibilities: string | null;
}): { score: number; items: ComplianceItem[]; flags: string[] } {
  const items: ComplianceItem[] = [
    { label: "Salary range clearly stated",  pass: !!(job.salary_min && job.salary_max) },
    { label: "Employment type specified",     pass: !!job.employment_type },
    { label: "Location clearly stated",       pass: !!job.location?.trim() },
    { label: "Closing date provided",         pass: !!job.closes_at },
    { label: "Job description included",      pass: !!(job.description?.trim()) },
    { label: "Key responsibilities listed",   pass: !!(job.responsibilities?.trim()) },
  ];
  const passed = items.filter((i) => i.pass).length;
  const score  = Math.round((passed / items.length) * 100);
  const flags  = items.filter((i) => !i.pass).map((i) => `${i.label} is missing`);
  return { score, items, flags };
}

// ─── GET — list all jobs with employer + compliance ───────────────────────────

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: jobs, error } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, live_salary_min, live_salary_max,
      description, responsibilities,
      required_certifications, experience_level,
      status, closes_at, created_at,
      employer_id
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ jobs: [] });
  }

  // Fetch employer names for all jobs
  const employerIds = [...new Set(jobs.map((j) => j.employer_id))];
  const { data: employers } = await service
    .from("employers")
    .select("id, company_name")
    .in("id", employerIds);

  const employerMap: Record<string, string> = {};
  for (const e of employers ?? []) {
    employerMap[e.id] = e.company_name ?? "Unknown Employer";
  }

  function initials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  function relativeTime(iso: string) {
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 2)  return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  === 1) return "Yesterday";
    if (days  < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function formatSalary(min: number | null, max: number | null) {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
    if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
    if (min) return `From ${fmt(min)}/yr`;
    return `Up to ${fmt(max!)}/yr`;
  }

  const mapped = jobs.map((j) => {
    const companyName = employerMap[j.employer_id] ?? "Unknown Employer";
    const compliance  = computeCompliance(j);

    // Map DB status → moderation status
    type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";
    const statusMap: Record<string, ModerationStatus> = {
      review:   "pending",
      live:     "approved",
      rejected: "rejected",
      flagged:  "flagged",
      draft:    "pending",
      closed:   "rejected",
    };

    return {
      id:               j.id,
      employer:         companyName,
      initials:         initials(companyName),
      title:            j.title,
      sector:           j.sector,
      location:         j.location,
      salary:           formatSalary(j.salary_min, j.salary_max),
      salaryMin:        j.salary_min,
      salaryMax:        j.salary_max,
      liveSalaryMin:    j.live_salary_min ?? null,
      liveSalaryMax:    j.live_salary_max ?? null,
      type:             j.employment_type,
      remote:           j.remote,
      posted:           relativeTime(j.created_at),
      dbStatus:         j.status,
      status:           statusMap[j.status] ?? "pending",
      description:      j.description ?? "",
      responsibilities: j.responsibilities ?? "",
      flags:            compliance.flags,
      compliance:       compliance.score,
      complianceItems:  compliance.items,
    };
  });

  return NextResponse.json({ jobs: mapped });
}
