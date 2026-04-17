import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET — fetch all shift assignments for this candidate
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: assignments, error } = await service
    .from("shift_assignments")
    .select("id, status, assigned_at, shift_id")
    .eq("candidate_id", user.id)
    .in("status", ["pending", "confirmed", "declined"])
    .order("assigned_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ shifts: [] });
  }

  const shiftIds = assignments.map((a) => a.shift_id as string);

  const { data: shifts } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, job_id, is_recurring, recurrence_type, recurrence_days, recurrence_end_date, status")
    .in("id", shiftIds);

  const jobIds = [...new Set((shifts ?? []).map((s) => s.job_id as string))];
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title")
    .in("id", jobIds);

  const jobMap: Record<string, string> = {};
  for (const j of jobs ?? []) jobMap[j.id as string] = j.title as string;

  const shiftMap: Record<string, typeof shifts[number]> = {};
  for (const s of shifts ?? []) shiftMap[s.id as string] = s;

  const result = assignments.map((a) => {
    const s = shiftMap[a.shift_id as string];
    if (!s) return null;
    return {
      assignmentId:     a.id,
      status:           a.status,
      assignedAt:       a.assigned_at,
      shiftId:          s.id,
      date:             s.date,
      startTime:        (s.start_time as string).slice(0, 5),
      endTime:          (s.end_time as string).slice(0, 5),
      jobTitle:         jobMap[s.job_id as string] ?? "Unknown Role",
      isRecurring:      (s.is_recurring as boolean) ?? false,
      recurrenceType:   (s.recurrence_type as string | null) ?? null,
      recurrenceDays:   (s.recurrence_days as number[] | null) ?? null,
      recurrenceEndDate:(s.recurrence_end_date as string | null) ?? null,
      shiftStatus:      s.status,
    };
  }).filter(Boolean);

  return NextResponse.json({ shifts: result });
}

// POST — accept or decline a shift assignment
// Body: { assignmentId: string, action: "accept" | "decline" }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { assignmentId, action } = await request.json() as {
    assignmentId?: string;
    action?:       string;
  };

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }
  if (!["accept", "decline"].includes(action ?? "")) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify the assignment belongs to this candidate and is still pending
  const { data: assignment } = await service
    .from("shift_assignments")
    .select("id, shift_id, candidate_id, status")
    .eq("id", assignmentId)
    .eq("candidate_id", user.id)
    .eq("status", "pending")
    .single();

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found or already actioned" },
      { status: 404 },
    );
  }

  // Update assignment status
  const newStatus = action === "accept" ? "confirmed" : "declined";

  const { error: updateError } = await service
    .from("shift_assignments")
    .update({ status: newStatus })
    .eq("id", assignmentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Keep shift status in sync: filled when confirmed count reaches staff_needed, else open
  const { data: shift } = await service
    .from("shifts")
    .select("id, staff_needed, status")
    .eq("id", assignment.shift_id)
    .single();

  if (shift && shift.status !== "cancelled") {
    const { data: confirmedRows } = await service
      .from("shift_assignments")
      .select("id")
      .eq("shift_id", assignment.shift_id)
      .eq("status", "confirmed");

    const confirmedCount = confirmedRows?.length ?? 0;
    const shiftShouldBe  = confirmedCount >= (shift.staff_needed as number) ? "filled" : "open";

    if (shift.status !== shiftShouldBe) {
      await service
        .from("shifts")
        .update({ status: shiftShouldBe })
        .eq("id", assignment.shift_id);
    }
  }

  // Mark the shift notification as read + acted
  // Fetch first so we can merge metadata (JSONB merge not directly available in JS client)
  const { data: notifRows } = await service
    .from("candidate_notifications")
    .select("id, metadata")
    .eq("candidate_id", user.id)
    .eq("type", "shift")
    .contains("metadata", { assignmentId })
    .limit(5);

  for (const row of notifRows ?? []) {
    const merged = {
      ...(row.metadata as Record<string, unknown> ?? {}),
      acted: action === "accept" ? "accepted" : "declined",
    };
    await service
      .from("candidate_notifications")
      .update({ read: true, metadata: merged })
      .eq("id", row.id);
  }

  return NextResponse.json({ success: true });
}
