import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── GET /api/admin/search?q=<term> ──────────────────────────────────────────
// Accessible to admin and moderator roles.
// Returns up to 4 results each across:
//   candidates  — profiles (role=candidate) matched on full_name / email
//   employers   — employers table + profiles matched on company_name / full_name / email
//   jobs        — jobs table + employer company matched on title / sector / company_name
//   users       — profiles (role=admin|moderator) matched on full_name / email

export async function GET(request: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;

  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ candidates: [], employers: [], jobs: [], users: [] });
  }

  const service = createServiceClient();
  const pattern = `%${q}%`;

  // ── 1. Candidates ─────────────────────────────────────────────────────────
  const { data: candidateRows } = await service
    .from("profiles")
    .select("id, full_name, email, status")
    .eq("role", "candidate")
    .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(4);

  // ── 2. Employers ─────────────────────────────────────────────────────────
  // Search employers by company_name first, then fall back to profile name / email
  const { data: employerCompanyRows } = await service
    .from("employers")
    .select("id, company_name, industry")
    .ilike("company_name", pattern)
    .limit(4);

  const employerIds = new Set((employerCompanyRows ?? []).map((e) => e.id as string));

  // Also search by contact name / email
  const { data: employerProfileRows } = await service
    .from("profiles")
    .select("id, full_name, email, status")
    .eq("role", "employer")
    .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
    .limit(4);

  // Merge — deduplicate by id, prefer company rows
  const allEmployerIds: string[] = [
    ...(employerCompanyRows ?? []).map((e) => e.id as string),
    ...(employerProfileRows ?? []).filter((p) => !employerIds.has(p.id as string)).map((p) => p.id as string),
  ].slice(0, 4);

  // Build a lookup for company names
  const companyMap = new Map((employerCompanyRows ?? []).map((e) => [e.id as string, { company: e.company_name as string, industry: e.industry as string }]));
  const profileMap = new Map([
    ...(employerProfileRows ?? []).map((p) => [p.id as string, { name: p.full_name as string, email: p.email as string, status: p.status as string }]),
  ]);

  // Also fetch any profile data for company-matched rows we don't yet have
  const missingProfileIds = (employerCompanyRows ?? [])
    .map((e) => e.id as string)
    .filter((id) => !profileMap.has(id));

  if (missingProfileIds.length > 0) {
    const { data: extra } = await service
      .from("profiles")
      .select("id, full_name, email, status")
      .in("id", missingProfileIds);
    for (const p of extra ?? []) {
      profileMap.set(p.id as string, { name: p.full_name as string, email: p.email as string, status: p.status as string });
    }
  }

  const employers = allEmployerIds.map((id) => {
    const company = companyMap.get(id);
    const profile = profileMap.get(id);
    return {
      id,
      companyName: company?.company_name ?? company?.company ?? profile?.name ?? "Unknown",
      industry:    company?.industry ?? null,
      contactName: profile?.name ?? null,
      email:       profile?.email ?? null,
      status:      profile?.status ?? "pending",
    };
  });

  // ── 3. Jobs ───────────────────────────────────────────────────────────────
  const { data: jobRows } = await service
    .from("jobs")
    .select(`id, title, sector, status, employer_id, employers!inner(company_name)`)
    .or(`title.ilike.${pattern},sector.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(8);

  // Also try matching on employer company name
  const { data: jobsByCompany } = await service
    .from("jobs")
    .select(`id, title, sector, status, employer_id, employers!inner(company_name)`)
    .filter("employers.company_name", "ilike", pattern)
    .order("created_at", { ascending: false })
    .limit(4);

  const seenJobIds = new Set((jobRows ?? []).map((j) => j.id as string));
  const allJobs = [
    ...(jobRows ?? []),
    ...(jobsByCompany ?? []).filter((j) => !seenJobIds.has(j.id as string)),
  ].slice(0, 4);

  const jobs = allJobs.map((j) => ({
    id:          j.id as string,
    title:       j.title as string,
    sector:      j.sector as string,
    status:      j.status as string,
    companyName: (j.employers as { company_name: string } | null)?.company_name ?? "Unknown",
  }));

  // ── 4. Admin / Moderator users ────────────────────────────────────────────
  // Only accessible to full admins (not moderators)
  let users: { id: string; name: string; email: string; role: string; status: string }[] = [];
  if (role === "admin") {
    const { data: userRows } = await service
      .from("profiles")
      .select("id, full_name, email, role, status")
      .in("role", ["admin", "moderator"])
      .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(4);

    users = (userRows ?? []).map((u) => ({
      id:     u.id as string,
      name:   u.full_name as string ?? u.email as string,
      email:  u.email as string,
      role:   u.role as string,
      status: u.status as string,
    }));
  }

  return NextResponse.json({
    candidates: (candidateRows ?? []).map((c) => ({
      id:     c.id as string,
      name:   c.full_name as string,
      email:  c.email as string,
      status: c.status as string,
    })),
    employers,
    jobs,
    users,
  });
}
