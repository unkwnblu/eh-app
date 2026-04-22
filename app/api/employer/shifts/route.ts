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

// ─── GET — list roles with shift stats, or job detail + shifts ────────────────

export async function GET(request: NextRequest) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  // ── No jobId → return roles listing with shift stats ─────────────────────
  if (!jobId) {
    const { data: jobs, error: jobsError } = await service
      .from("jobs")
      .select("id, title, sector")
      .eq("employer_id", user.id)
      .eq("status", "live");

    if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 });

    const jobIds = (jobs ?? []).map((j) => j.id as string);

    if (jobIds.length === 0) {
      return NextResponse.json({ roles: [] });
    }

    const { data: shifts, error: shiftsError } = await service
      .from("shifts")
      .select("id, job_id, status")
      .in("job_id", jobIds);

    if (shiftsError) return NextResponse.json({ error: shiftsError.message }, { status: 500 });

    const shiftsByJob: Record<string, { total: number; filled: number }> = {};
    for (const s of shifts ?? []) {
      const jid = s.job_id as string;
      if (!shiftsByJob[jid]) shiftsByJob[jid] = { total: 0, filled: 0 };
      shiftsByJob[jid].total++;
      if (s.status === "filled") shiftsByJob[jid].filled++;
    }

    const roles = (jobs ?? []).map((j) => {
      const stats = shiftsByJob[j.id as string] ?? { total: 0, filled: 0 };
      return {
        jobId:        j.id,
        title:        j.title,
        sector:       j.sector,
        totalShifts:  stats.total,
        filledShifts: stats.filled,
        openShifts:   stats.total - stats.filled,
      };
    });

    return NextResponse.json({ roles });
  }

  // ── jobId provided → return job detail + its shifts with assignments ──────
  const { data: job, error: jobError } = await service
    .from("jobs")
    .select("id, title, sector, location, employment_type, status")
    .eq("id", jobId)
    .eq("employer_id", user.id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: shifts, error: shiftsError } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, break_minutes, department, location, staff_needed, hourly_rate, experience_level, required_certifications, status, notes, is_recurring")
    .eq("job_id", jobId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (shiftsError) return NextResponse.json({ error: shiftsError.message }, { status: 500 });

  const shiftIds = (shifts ?? []).map((s) => s.id as string);

  let assignmentMap: Record<string, {
    id: string;
    candidateId: string;
    candidateName: string;
    status: string;
    assignedAt: string;
  }[]> = {};

  if (shiftIds.length > 0) {
    // Employers only see confirmed assignments — pending/declined are internal
    const { data: assignments } = await service
      .from("shift_assignments")
      .select("id, shift_id, candidate_id, status, assigned_at")
      .in("shift_id", shiftIds)
      .eq("status", "confirmed");

    if (assignments && assignments.length > 0) {
      const candidateIds = [...new Set(assignments.map((a) => a.candidate_id as string))];

      const { data: profiles } = await service
        .from("profiles")
        .select("id, full_name")
        .in("id", candidateIds);

      const nameMap: Record<string, string> = {};
      for (const p of profiles ?? []) {
        nameMap[p.id as string] = (p.full_name as string) || "Unknown";
      }

      for (const a of assignments) {
        const sid = a.shift_id as string;
        if (!assignmentMap[sid]) assignmentMap[sid] = [];
        assignmentMap[sid].push({
          id:            a.id as string,
          candidateId:   a.candidate_id as string,
          candidateName: nameMap[a.candidate_id as string] ?? "Unknown",
          status:        a.status as string,
          assignedAt:    a.assigned_at as string,
        });
      }
    }
  }

  const mappedShifts = (shifts ?? []).map((s) => ({
    id:                     s.id,
    date:                   s.date,
    startTime:              s.start_time,
    endTime:                s.end_time,
    breakMinutes:           (s.break_minutes as number) ?? 0,
    department:             s.department ?? null,
    location:               s.location ?? null,
    staffNeeded:            (s.staff_needed as number) ?? 1,
    hourlyRate:             s.hourly_rate ?? null,
    experienceLevel:        s.experience_level,
    requiredCertifications: s.required_certifications ?? [],
    status:                 s.status,
    notes:                  s.notes ?? null,
    isRecurring:  (s.is_recurring as boolean) ?? false,
    assignments:  assignmentMap[s.id as string] ?? [],
  }));

  return NextResponse.json({
    job: {
      id:             job.id,
      title:          job.title,
      sector:         job.sector,
      location:       job.location,
      employmentType: job.employment_type,
      status:         job.status,
    },
    shifts: mappedShifts,
  });
}

// ─── POST — create a shift (or batch of recurring shifts) ────────────────────
//
// For one-time shifts, send { date: "YYYY-MM-DD", ... }
// For recurring shifts, send { dates: ["YYYY-MM-DD", ...], isRecurring: true, ... }
// Each date becomes its own row in the shifts table so every client (web + Flutter)
// can query individual occurrences without needing expansion logic.

export async function POST(request: NextRequest) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const {
    jobId, date, dates, startTime, endTime,
    department, location, staffNeeded,
    hourlyRate, experienceLevel, requiredCertifications, notes,
    breakMinutes, isRecurring,
  } = body as {
    jobId:       string;
    date?:       string;        // single date (one-time shift)
    dates?:      string[];      // all expanded dates (recurring)
    startTime:   string;
    endTime:     string;
    department?: string;
    location?:   string;
    staffNeeded?: number;
    hourlyRate?:  number | null;
    experienceLevel?: string;
    requiredCertifications?: string[];
    notes?:      string;
    breakMinutes?: number;
    isRecurring?: boolean;
  };

  // Build the list of dates to insert
  const allDates: string[] = isRecurring && dates && dates.length > 0
    ? dates
    : date
      ? [date]
      : [];

  if (!jobId || allDates.length === 0 || !startTime || !endTime) {
    return NextResponse.json(
      { error: "jobId, date(s), startTime, and endTime are required." },
      { status: 400 },
    );
  }

  // Guard: max 500 occurrences per batch
  if (allDates.length > 500) {
    return NextResponse.json({ error: "Too many dates — maximum 500 per batch." }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify job belongs to this employer
  const { data: job } = await service
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("employer_id", user.id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // All rows in a recurring batch share one group ID so the UI can collapse them to one tile
  const groupId = isRecurring && allDates.length > 1
    ? crypto.randomUUID()
    : null;

  // Build one row per date
  const rows = allDates.map((d) => ({
    job_id:                  jobId,
    employer_id:             user.id,
    date:                    d,
    start_time:              startTime,
    end_time:                endTime,
    department:              department ?? null,
    location:                location ?? null,
    staff_needed:            staffNeeded ?? 1,
    break_minutes:           breakMinutes ?? 0,
    hourly_rate:             hourlyRate ?? null,
    experience_level:        experienceLevel ?? "Mid-level",
    required_certifications: requiredCertifications ?? [],
    notes:                   notes ?? null,
    status:                  "open",
    is_recurring:            isRecurring ?? false,
    recurring_group_id:      groupId,
  }));

  const { data: shifts, error } = await service
    .from("shifts")
    .insert(rows)
    .select("id, date");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { shifts, count: shifts?.length ?? 0 },
    { status: 201 },
  );
}
