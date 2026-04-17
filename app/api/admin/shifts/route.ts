import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── GET /api/admin/shifts?jobId=<id> ────────────────────────────────────────
// Returns all shifts for a job, each with its pending/confirmed assignments
// (including the candidate's full name).

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId query parameter is required" }, { status: 400 });
  }

  const service = createServiceClient();

  // 1. Fetch all shifts for the job
  const { data: shifts, error: shiftsError } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, break_minutes, department, location, staff_needed, status")
    .eq("job_id", jobId)
    .order("date", { ascending: true });

  if (shiftsError) {
    return NextResponse.json({ error: shiftsError.message }, { status: 500 });
  }

  if (!shifts || shifts.length === 0) {
    return NextResponse.json({ shifts: [] });
  }

  const shiftIds = shifts.map((s) => s.id);

  // 2. Fetch all active assignments for those shifts
  const { data: assignments, error: assignmentsError } = await service
    .from("shift_assignments")
    .select("id, shift_id, candidate_id, status, assigned_at")
    .in("shift_id", shiftIds)
    .in("status", ["pending", "confirmed"]);

  if (assignmentsError) {
    return NextResponse.json({ error: assignmentsError.message }, { status: 500 });
  }

  // 3. Look up candidate names for all assignments
  const candidateIds = [...new Set((assignments ?? []).map((a) => a.candidate_id))];

  const nameMap: Record<string, string> = {};
  if (candidateIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("id, full_name")
      .in("id", candidateIds);

    for (const p of profiles ?? []) {
      nameMap[p.id] = p.full_name ?? "Unknown Candidate";
    }
  }

  // 4. Group assignments by shift_id
  type AssignmentRow = {
    id: string;
    candidateId: string;
    candidateName: string;
    status: string;
    assignedAt: string;
  };

  const assignmentsByShift: Record<string, AssignmentRow[]> = {};
  for (const a of assignments ?? []) {
    if (!assignmentsByShift[a.shift_id]) assignmentsByShift[a.shift_id] = [];
    assignmentsByShift[a.shift_id].push({
      id:            a.id,
      candidateId:   a.candidate_id,
      candidateName: nameMap[a.candidate_id] ?? "Unknown Candidate",
      status:        a.status,
      assignedAt:    a.assigned_at,
    });
  }

  // 5. Build response
  const mapped = shifts.map((s) => ({
    id:           s.id,
    date:         s.date,
    startTime:    s.start_time,
    endTime:      s.end_time,
    breakMinutes: s.break_minutes,
    department:   s.department,
    location:     s.location,
    staffNeeded:  s.staff_needed,
    status:       s.status,
    assignments:  assignmentsByShift[s.id] ?? [],
  }));

  return NextResponse.json({ shifts: mapped });
}
