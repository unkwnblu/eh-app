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
    .select("id, date, start_time, end_time, job_id, is_recurring, status")
    .in("id", shiftIds);

  const jobIds = [...new Set((shifts ?? []).map((s) => s.job_id as string))];
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title")
    .in("id", jobIds);

  const jobMap: Record<string, string> = {};
  for (const j of jobs ?? []) jobMap[j.id as string] = j.title as string;

  const shiftMap: Record<string, NonNullable<typeof shifts>[number]> = {};
  for (const s of shifts ?? []) shiftMap[s.id as string] = s;

  const result = assignments.map((a) => {
    const s = shiftMap[a.shift_id as string];
    if (!s) return null;
    return {
      assignmentId: a.id,
      status:       a.status,
      assignedAt:   a.assigned_at,
      shiftId:      s.id,
      date:         s.date,
      startTime:    (s.start_time as string).slice(0, 5),
      endTime:      (s.end_time as string).slice(0, 5),
      jobTitle:     jobMap[s.job_id as string] ?? "Unknown Role",
      isRecurring:  (s.is_recurring as boolean) ?? false,
      shiftStatus:  s.status,
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

  const newStatus = action === "accept" ? "confirmed" : "declined";

  // ── 1. Update the actioned assignment ──────────────────────────────────────
  const { error: updateError } = await service
    .from("shift_assignments")
    .update({ status: newStatus })
    .eq("id", assignmentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // ── 2. Check if this shift belongs to a recurring group ───────────────────
  // If it does, apply the same action to all OTHER pending assignments this
  // candidate has in the same group — so one tap accepts/declines the whole run.
  const { data: thisShift } = await service
    .from("shifts")
    .select("id, staff_needed, status, recurring_group_id")
    .eq("id", assignment.shift_id)
    .single();

  const recurringGroupId = thisShift?.recurring_group_id as string | null ?? null;

  // IDs of ALL shifts we need to re-sync (starts with the actioned shift)
  const shiftIdsToSync: string[] = [assignment.shift_id];

  if (recurringGroupId) {
    // Find every shift in the group
    const { data: groupShifts } = await service
      .from("shifts")
      .select("id")
      .eq("recurring_group_id", recurringGroupId);

    const groupShiftIds = (groupShifts ?? []).map((s) => s.id as string);

    // Find all OTHER pending assignments for this candidate in the group
    const { data: siblingAssignments } = await service
      .from("shift_assignments")
      .select("id, shift_id")
      .in("shift_id", groupShiftIds)
      .eq("candidate_id", user.id)
      .eq("status", "pending")
      .neq("id", assignmentId); // exclude the one we already updated

    if (siblingAssignments && siblingAssignments.length > 0) {
      const siblingIds = siblingAssignments.map((a) => a.id as string);

      await service
        .from("shift_assignments")
        .update({ status: newStatus })
        .in("id", siblingIds);

      // Collect sibling shift IDs for status sync below
      for (const a of siblingAssignments) {
        shiftIdsToSync.push(a.shift_id as string);
      }
    }
  }

  // ── 3. Re-sync shift statuses for every affected shift ────────────────────
  for (const shiftId of shiftIdsToSync) {
    const { data: shiftRow } = await service
      .from("shifts")
      .select("id, staff_needed, status")
      .eq("id", shiftId)
      .single();

    if (shiftRow && shiftRow.status !== "cancelled") {
      const { data: confirmedRows } = await service
        .from("shift_assignments")
        .select("id")
        .eq("shift_id", shiftId)
        .eq("status", "confirmed");

      const confirmedCount = confirmedRows?.length ?? 0;
      const shiftShouldBe  = confirmedCount >= (shiftRow.staff_needed as number) ? "filled" : "open";

      if (shiftRow.status !== shiftShouldBe) {
        await service
          .from("shifts")
          .update({ status: shiftShouldBe })
          .eq("id", shiftId);
      }
    }
  }

  // ── 4. Mark the notification(s) as read + acted ──────────────────────────
  const actedValue = action === "accept" ? "accepted" : "declined";

  // Helper: stamp a notification row as acted
  async function stampNotif(id: string, existingMeta: Record<string, unknown>) {
    await service
      .from("candidate_notifications")
      .update({ read: true, metadata: { ...existingMeta, acted: actedValue } })
      .eq("id", id);
  }

  // 4a. Standard single-shift path — find by assignmentId in metadata
  const { data: notifRows } = await service
    .from("candidate_notifications")
    .select("id, metadata")
    .eq("candidate_id", user.id)
    .eq("type", "shift")
    .contains("metadata", { assignmentId })
    .limit(5);

  const stampedIds = new Set<string>();
  for (const row of notifRows ?? []) {
    await stampNotif(row.id as string, row.metadata as Record<string, unknown> ?? {});
    stampedIds.add(row.id as string);
  }

  // 4b. Recurring-group path — the group notification may have assignmentId: ""
  // (created before the fix) or a different assignmentId than the one used here.
  // Find any un-acted shift notifications for this candidate that reference the
  // same recurringGroupId and stamp them too.
  if (recurringGroupId) {
    const { data: groupNotifRows } = await service
      .from("candidate_notifications")
      .select("id, metadata")
      .eq("candidate_id", user.id)
      .eq("type", "shift")
      .contains("metadata", { recurringGroupId })
      .limit(10);

    for (const row of groupNotifRows ?? []) {
      if (stampedIds.has(row.id as string)) continue; // already handled above
      const meta = row.metadata as Record<string, unknown> ?? {};
      if (meta.acted) continue; // already acted on a previous interaction
      await stampNotif(row.id as string, meta);
    }
  }

  return NextResponse.json({
    success: true,
    // Let the client know how many total assignments were actioned
    actioned: shiftIdsToSync.length,
  });
}
