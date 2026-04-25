import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── GET /api/employer/search?q=<term> ───────────────────────────────────────
// Returns { jobs: [...], shifts: [...] } capped at 5 each.
// Searches jobs by title / sector / location,
// and shift-enabled roles by job title / sector.

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.app_metadata?.role !== "employer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ jobs: [], shifts: [] });
  }

  const service = createServiceClient();
  const pattern = `%${q}%`;

  // ── Jobs (any status) ─────────────────────────────────────────────────────
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title, sector, location, status, employment_type")
    .eq("employer_id", user.id)
    .or(`title.ilike.${pattern},sector.ilike.${pattern},location.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(5);

  // ── Shift-enabled roles (live jobs that have at least one shift) ───────────
  // First find live jobs matching the query
  const { data: shiftJobs } = await service
    .from("jobs")
    .select("id, title, sector")
    .eq("employer_id", user.id)
    .eq("status", "live")
    .or(`title.ilike.${pattern},sector.ilike.${pattern}`)
    .limit(10);

  let shiftResults: { jobId: string; title: string; sector: string; totalShifts: number }[] = [];

  if (shiftJobs && shiftJobs.length > 0) {
    const ids = shiftJobs.map((j) => j.id as string);

    const { data: shiftCounts } = await service
      .from("shifts")
      .select("job_id")
      .in("job_id", ids);

    // Count per job, only include jobs that actually have shifts
    const countMap: Record<string, number> = {};
    for (const s of shiftCounts ?? []) {
      const jid = s.job_id as string;
      countMap[jid] = (countMap[jid] ?? 0) + 1;
    }

    shiftResults = shiftJobs
      .filter((j) => (countMap[j.id as string] ?? 0) > 0)
      .slice(0, 5)
      .map((j) => ({
        jobId:       j.id as string,
        title:       j.title as string,
        sector:      j.sector as string,
        totalShifts: countMap[j.id as string] ?? 0,
      }));
  }

  return NextResponse.json({
    jobs: (jobs ?? []).map((j) => ({
      id:             j.id as string,
      title:          j.title as string,
      sector:         j.sector as string,
      location:       j.location as string,
      status:         j.status as string,
      employmentType: j.employment_type as string,
    })),
    shifts: shiftResults,
  });
}
