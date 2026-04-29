import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  // Fetch employer profile
  const { data: employer, error } = await service
    .from("employers")
    .select(
      "id, company_name, company_website, registered_address, " +
      "incorporation_date, industries, logo_path"
    )
    .eq("id", id)
    .single();

  if (error || !employer) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Check employer is verified (profile status = active)
  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", id)
    .single();

  const isVerified = profile?.status === "active";

  // Generate signed logo URL
  let logoUrl: string | null = null;
  const logoPath = (employer as { logo_path?: string }).logo_path ?? null;
  if (logoPath) {
    const { data: signed } = await service.storage
      .from("employer-documents")
      .createSignedUrl(logoPath, 60 * 60);
    logoUrl = signed?.signedUrl ?? null;
  }

  // Fetch live jobs from this employer
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title, sector, employment_type, location, salary_min, salary_max, live_salary_min, live_salary_max, closes_at, created_at")
    .eq("employer_id", id)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(10);

  function formatSalary(min: number | null, max: number | null): string | null {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
    if (min) return `From ${fmt(min)} / yr`;
    return `Up to ${fmt(max!)} / yr`;
  }

  function daysLeft(closesAt: string | null): number | null {
    if (!closesAt) return null;
    return Math.ceil((new Date(closesAt).getTime() - Date.now()) / 86_400_000);
  }

  const liveJobs = (jobs ?? []).map((j) => ({
    id:             j.id,
    title:          j.title,
    sector:         j.sector,
    employmentType: j.employment_type,
    location:       j.location,
    salary:         formatSalary(j.live_salary_min ?? j.salary_min, j.live_salary_max ?? j.salary_max),
    daysLeft:       daysLeft(j.closes_at),
  }));

  const emp = employer as unknown as {
    id: string;
    company_name?: string;
    company_website?: string;
    registered_address?: string;
    incorporation_date?: string;
    industries?: string[];
    logo_path?: string;
  };

  return NextResponse.json({
    company: {
      id:                emp.id,
      name:              emp.company_name ?? "Unknown",
      website:           emp.company_website ?? null,
      address:           emp.registered_address ?? null,
      incorporationDate: emp.incorporation_date ?? null,
      industries:        emp.industries ?? [],
      logoUrl,
      isVerified,
    },
    jobs: liveJobs,
  });
}
