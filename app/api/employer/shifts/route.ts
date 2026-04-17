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
    .select("id, date, start_time, end_time, break_minutes, department, location, staff_needed, hourly_rate, experience_level, required_certifications, status, notes, is_recurring, recurrence_type, recurrence_days, recurrence_end_date")
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
    isRecurring:            (s.is_recurring as boolean) ?? false,
    recurrenceType:         (s.recurrence_type as "daily" | "weekly" | null) ?? null,
    recurrenceDays:         (s.recurrence_days as number[] | null) ?? null,
    recurrenceEndDate:      (s.recurrence_end_date as string | null) ?? null,
    assignments:            assignmentMap[s.id as string] ?? [],
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

// ─── POST — create a shift ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const {
    jobId, date, startTime, endTime,
    department, location, staffNeeded,
    hourlyRate, experienceLevel, requiredCertifications, notes,
    breakMinutes,
    isRecurring, recurrenceType, recurrenceDays, recurrenceEndDate,
  } = body as {
    jobId: string; date: string; startTime: string; endTime: string;
    department?: string; location?: string; staffNeeded?: number;
    hourlyRate?: number | null; experienceLevel?: string;
    requiredCertifications?: string[]; notes?: string;
    breakMinutes?: number;
    isRecurring?: boolean;
    recurrenceType?: "daily" | "weekly";
    recurrenceDays?: number[];
    recurrenceEndDate?: string | null;
  };

  if (!jobId || !date || !startTime || !endTime) {
    return NextResponse.json({ error: "jobId, date, startTime, and endTime are required." }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify job belongs to employer
  const { data: job } = await service
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .eq("employer_id", user.id)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const { data: shift, error } = await service
    .from("shifts")
    .insert({
      job_id:                  jobId,
      employer_id:             user.id,
      date,
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
      recurrence_type:         isRecurring ? (recurrenceType ?? null) : null,
      recurrence_days:         isRecurring && recurrenceType === "weekly" ? (recurrenceDays ?? null) : null,
      recurrence_end_date:     isRecurring ? (recurrenceEndDate ?? null) : null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ shift }, { status: 201 });
}
