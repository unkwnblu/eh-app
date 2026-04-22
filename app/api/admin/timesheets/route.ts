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

// ─── GET /api/admin/timesheets ────────────────────────────────────────────────
// Returns all shift assignments that have been clocked out, enriched with
// candidate name, job title, and shift schedule for the timesheets monitor.
//
// Query params:
//   ?status=pending|approved|rejected   (omit for all)

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status"); // nullable

  const service = createServiceClient();

  // 1. Fetch clocked-out assignments (clocked_out_at IS NOT NULL)
  let query = service
    .from("shift_assignments")
    .select("id, candidate_id, shift_id, status, assigned_at, clocked_in_at, clocked_out_at, clocked_in_lat, clocked_in_lng, timesheet_status")
    .not("clocked_out_at", "is", null)
    .order("clocked_out_at", { ascending: false });

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("timesheet_status", status);
  }

  const { data: assignments, error: aErr } = await query;
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ timesheets: [], counts: { pending: 0, approved: 0, rejected: 0 } },
      { headers: { "Cache-Control": "no-store" } });
  }

  // 2. Fetch related shifts
  const shiftIds = [...new Set(assignments.map((a) => a.shift_id as string))];
  const { data: shifts } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, break_minutes, department, location, job_id")
    .in("id", shiftIds);

  const shiftMap = new Map((shifts ?? []).map((s) => [s.id as string, s]));

  // 3. Fetch related jobs
  const jobIds = [...new Set((shifts ?? []).map((s) => s.job_id as string))];
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title, employer_id")
    .in("id", jobIds);

  const jobMap = new Map((jobs ?? []).map((j) => [j.id as string, j]));

  // 4. Fetch employer names
  const employerIds = [...new Set((jobs ?? []).map((j) => j.employer_id as string))];
  const { data: employers } = await service
    .from("profiles")
    .select("id, full_name, company_name")
    .in("id", employerIds);

  const employerMap = new Map((employers ?? []).map((e) => [
    e.id as string,
    (e.company_name as string | null) ?? (e.full_name as string | null) ?? "Unknown Employer",
  ]));

  // 5. Fetch candidate names
  const candidateIds = [...new Set(assignments.map((a) => a.candidate_id as string))];
  const { data: profiles } = await service
    .from("profiles")
    .select("id, full_name")
    .in("id", candidateIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) ?? "Unknown"]));

  // 6. Counts for stat cards (always over the full unfiltered set)
  const { data: allAssignments } = await service
    .from("shift_assignments")
    .select("timesheet_status")
    .not("clocked_out_at", "is", null);

  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const a of allAssignments ?? []) {
    const ts = (a.timesheet_status as string) ?? "pending";
    if (ts === "pending")  counts.pending++;
    if (ts === "approved") counts.approved++;
    if (ts === "rejected") counts.rejected++;
  }

  // 7. Build response
  const timesheets = assignments.map((a) => {
    const shift    = shiftMap.get(a.shift_id as string);
    const job      = shift ? jobMap.get(shift.job_id as string) : undefined;
    const employer = job   ? employerMap.get(job.employer_id as string) ?? "Unknown" : "Unknown";

    // Calculate actual duration from clock timestamps
    const clockIn  = a.clocked_in_at  ? new Date(a.clocked_in_at  as string) : null;
    const clockOut = a.clocked_out_at ? new Date(a.clocked_out_at as string) : null;
    const durationMins = clockIn && clockOut
      ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60_000)
      : null;

    return {
      id:               a.id,
      candidateId:      a.candidate_id,
      candidateName:    profileMap.get(a.candidate_id as string) ?? "Unknown",
      shiftId:          a.shift_id,
      jobTitle:         job?.title ?? "Unknown Job",
      employer,
      date:             shift?.date ?? null,
      scheduledStart:   shift?.start_time ?? null,
      scheduledEnd:     shift?.end_time   ?? null,
      breakMinutes:     (shift?.break_minutes as number) ?? 0,
      department:       (shift?.department as string | null) ?? null,
      shiftLocation:    (shift?.location   as string | null) ?? null,
      clockedInAt:      a.clocked_in_at   ?? null,
      clockedOutAt:     a.clocked_out_at  ?? null,
      clockedInLat:     (a.clocked_in_lat  as number | null) ?? null,
      clockedInLng:     (a.clocked_in_lng  as number | null) ?? null,
      durationMins,
      assignmentStatus: a.status,
      timesheetStatus:  (a.timesheet_status as string) ?? "pending",
    };
  });

  return NextResponse.json({ timesheets, counts }, {
    headers: { "Cache-Control": "no-store" },
  });
}

// ─── PATCH /api/admin/timesheets ──────────────────────────────────────────────
// Approve or reject a timesheet entry.
// Body: { assignmentId: string, status: "approved" | "rejected" }

export async function PATCH(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let assignmentId: string;
  let newStatus: string;

  try {
    const body = await request.json() as { assignmentId?: unknown; status?: unknown };
    if (typeof body.assignmentId !== "string" || !body.assignmentId) {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(body.status as string)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }
    assignmentId = body.assignmentId;
    newStatus    = body.status as string;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service
    .from("shift_assignments")
    .update({ timesheet_status: newStatus })
    .eq("id", assignmentId)
    .not("clocked_out_at", "is", null); // safety: only touch clocked-out rows

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
