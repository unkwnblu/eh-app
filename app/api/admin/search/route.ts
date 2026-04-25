import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── GET /api/admin/search?q=<term> ──────────────────────────────────────────
// Accessible to admin and moderator roles.
// Returns up to 4 results each across:
//   candidates — profiles (role=candidate) matched on full_name / email
//   employers  — employers table + profiles matched on company_name / full_name / email
//   jobs       — jobs table + employer company matched on title / sector / company_name
//   users      — profiles (role=admin|moderator) matched on full_name / email

export async function GET(request: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const callerRole = user?.app_metadata?.role;

  if (callerRole !== "admin" && callerRole !== "moderator") {
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
  // Search by company_name
  const { data: employerCompanyRows } = await service
    .from("employers")
    .select("id, company_name, industry")
    .ilike("company_name", pattern)
    .limit(4);

  const byCompanyIds = new Set<string>((employerCompanyRows ?? []).map((e) => String(e.id)));

  // Also search by contact name / email from profiles
  const { data: employerProfileRows } = await service
    .from("profiles")
    .select("id, full_name, email, status")
    .eq("role", "employer")
    .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
    .limit(4);

  // Merged deduped list of employer IDs (max 4)
  const allEmployerIds: string[] = [
    ...(employerCompanyRows ?? []).map((e) => String(e.id)),
    ...(employerProfileRows ?? [])
      .filter((p) => !byCompanyIds.has(String(p.id)))
      .map((p) => String(p.id)),
  ].slice(0, 4);

  // Build lookup maps
  type CompanyEntry = { companyName: string; industry: string | null };
  type ProfileEntry = { name: string; email: string; status: string };

  const companyMap = new Map<string, CompanyEntry>(
    (employerCompanyRows ?? []).map((e) => [
      String(e.id),
      { companyName: String(e.company_name), industry: e.industry ? String(e.industry) : null },
    ]),
  );

  const profileMap = new Map<string, ProfileEntry>(
    (employerProfileRows ?? []).map((p) => [
      String(p.id),
      { name: String(p.full_name ?? ""), email: String(p.email ?? ""), status: String(p.status ?? "pending") },
    ]),
  );

  // Fetch profile rows for any company-matched IDs we don't yet have a profile for
  const missingIds = (employerCompanyRows ?? [])
    .map((e) => String(e.id))
    .filter((id) => !profileMap.has(id));

  if (missingIds.length > 0) {
    const { data: extra } = await service
      .from("profiles")
      .select("id, full_name, email, status")
      .in("id", missingIds);
    for (const p of extra ?? []) {
      profileMap.set(String(p.id), {
        name:   String(p.full_name ?? ""),
        email:  String(p.email ?? ""),
        status: String(p.status ?? "pending"),
      });
    }
  }

  const employers = allEmployerIds.map((id) => {
    const co  = companyMap.get(id);
    const pro = profileMap.get(id);
    return {
      id,
      companyName: co?.companyName ?? pro?.name ?? "Unknown",
      industry:    co?.industry ?? null,
      contactName: pro?.name ?? null,
      email:       pro?.email ?? null,
      status:      pro?.status ?? "pending",
    };
  });

  // ── 3. Jobs ───────────────────────────────────────────────────────────────
  const { data: jobTitleRows } = await service
    .from("jobs")
    .select("id, title, sector, status, employer_id")
    .or(`title.ilike.${pattern},sector.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(6);

  // Jobs by employer company name — join via employers table
  const { data: matchingEmployers } = await service
    .from("employers")
    .select("id")
    .ilike("company_name", pattern)
    .limit(10);

  const matchingEmployerIds = (matchingEmployers ?? []).map((e) => String(e.id));

  let jobsByCompany: Array<{ id: string; title: string; sector: string; status: string; employer_id: string }> = [];
  if (matchingEmployerIds.length > 0) {
    const { data: rows } = await service
      .from("jobs")
      .select("id, title, sector, status, employer_id")
      .in("employer_id", matchingEmployerIds)
      .order("created_at", { ascending: false })
      .limit(4);
    jobsByCompany = (rows ?? []).map((r) => ({
      id: String(r.id), title: String(r.title), sector: String(r.sector),
      status: String(r.status), employer_id: String(r.employer_id),
    }));
  }

  const seenJobIds = new Set((jobTitleRows ?? []).map((j) => String(j.id)));
  const allJobRows = [
    ...(jobTitleRows ?? []).map((j) => ({
      id: String(j.id), title: String(j.title), sector: String(j.sector),
      status: String(j.status), employer_id: String(j.employer_id),
    })),
    ...jobsByCompany.filter((j) => !seenJobIds.has(j.id)),
  ].slice(0, 4);

  // Fetch company names for all jobs
  const jobEmployerIds = [...new Set(allJobRows.map((j) => j.employer_id))];
  const companyNameMap = new Map<string, string>();
  if (jobEmployerIds.length > 0) {
    const { data: empRows } = await service
      .from("employers")
      .select("id, company_name")
      .in("id", jobEmployerIds);
    for (const e of empRows ?? []) {
      companyNameMap.set(String(e.id), String(e.company_name));
    }
  }

  const jobs = allJobRows.map((j) => ({
    id:          j.id,
    title:       j.title,
    sector:      j.sector,
    status:      j.status,
    companyName: companyNameMap.get(j.employer_id) ?? "Unknown",
  }));

  // ── 4. Admin / Moderator users (full admin only) ──────────────────────────
  let users: { id: string; name: string; email: string; role: string; status: string }[] = [];
  if (callerRole === "admin") {
    const { data: userRows } = await service
      .from("profiles")
      .select("id, full_name, email, role, status")
      .in("role", ["admin", "moderator"])
      .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(4);

    users = (userRows ?? []).map((u) => ({
      id:     String(u.id),
      name:   String(u.full_name ?? u.email ?? ""),
      email:  String(u.email ?? ""),
      role:   String(u.role),
      status: String(u.status ?? "active"),
    }));
  }

  return NextResponse.json({
    candidates: (candidateRows ?? []).map((c) => ({
      id:     String(c.id),
      name:   String(c.full_name ?? ""),
      email:  String(c.email ?? ""),
      status: String(c.status ?? "pending"),
    })),
    employers,
    jobs,
    users,
  });
}
