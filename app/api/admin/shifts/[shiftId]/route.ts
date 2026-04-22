import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { insertCandidateNotification } from "@/lib/notifications/candidate";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── POST /api/admin/shifts/[shiftId] ────────────────────────────────────────
// Assigns a candidate to a shift, then sends them a notification.
// Body: { candidateId: string }

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { shiftId } = await params;

  // Parse + validate body
  let candidateId: string;
  try {
    const body = await request.json();
    if (!body?.candidateId || typeof body.candidateId !== "string") {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }
    candidateId = body.candidateId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createServiceClient();

  // 1. Validate shift exists
  const { data: shift, error: shiftError } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, job_id, is_recurring, recurrence_type, recurrence_days, recurrence_end_date")
    .eq("id", shiftId)
    .single();

  if (shiftError || !shift) {
    return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  }

  // 2. Check if any assignment already exists for this shift+candidate
  const { data: existing, error: existingError } = await service
    .from("shift_assignments")
    .select("id, status")
    .eq("shift_id", shiftId)
    .eq("candidate_id", candidateId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  // Block re-assignment if already active
  if (existing && (existing.status === "pending" || existing.status === "confirmed")) {
    return NextResponse.json(
      { error: "Candidate is already assigned to this shift" },
      { status: 409 },
    );
  }

  let newAssignment: { id: string; status: string };

  if (existing) {
    // Previous row exists (cancelled / declined) — reuse it to respect the unique constraint
    const { data: updated, error: updateError } = await service
      .from("shift_assignments")
      .update({ status: "pending", assigned_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, status")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message ?? "Failed to reassign" },
        { status: 500 },
      );
    }
    newAssignment = updated as { id: string; status: string };
  } else {
    // 3. Fresh insert
    const { data: inserted, error: insertError } = await service
      .from("shift_assignments")
      .insert({
        shift_id:     shiftId,
        candidate_id: candidateId,
        status:       "pending",
      })
      .select("id, status")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create assignment" },
        { status: 500 },
      );
    }
    newAssignment = inserted as { id: string; status: string };
  }

  // 4. Fetch job title for notification copy
  const { data: job } = await service
    .from("jobs")
    .select("id, title")
    .eq("id", shift.job_id)
    .single();

  const jobTitle    = job?.title ?? "Unknown Job";
  const jobId       = shift.job_id;
  const startFmt    = (shift.start_time as string).slice(0, 5);
  const endFmt      = (shift.end_time as string).slice(0, 5);
  const isRecurring = shift.is_recurring as boolean;

  // Build human-readable schedule description
  // Extract values before the nested function so TypeScript can narrow them
  // independently of the outer `shift` variable (which it can't narrow in closures).
  const recurrenceType = shift.recurrence_type as string | null;
  const recurrenceDays = shift.recurrence_days as number[] | null;
  const DOW_NAMES      = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function recurrenceDesc(): string {
    const type = recurrenceType;
    const days = recurrenceDays;
    if (type === "daily") return "every day";
    if (type === "weekly" && days?.length) {
      const sorted = [...days].sort((a, b) => a - b);
      if (sorted.join() === "1,2,3,4,5") return "every weekday (Mon–Fri)";
      if (sorted.join() === "0,1,2,3,4,5,6") return "every day";
      return "every " + sorted.map((d) => DOW_NAMES[d]).join(", ");
    }
    return "on a recurring basis";
  }

  const endDateNote = shift.recurrence_end_date
    ? ` until ${shift.recurrence_end_date}`
    : "";

  const notifTitle = isRecurring ? "Recurring Shift Assigned" : "Shift Assigned";
  const notifBody  = isRecurring
    ? `You have been assigned a recurring shift for **${jobTitle}** — ${recurrenceDesc()} from **${startFmt}** to **${endFmt}**, starting ${shift.date}${endDateNote}. Please confirm your availability.`
    : `You have been assigned a shift for **${jobTitle}** on **${shift.date}** from **${startFmt}** to **${endFmt}**. Please confirm your availability.`;

  // 5. Send notification (fire-and-forget)
  await insertCandidateNotification(
    service,
    candidateId,
    "shift",
    notifTitle,
    notifBody,
    {
      shiftId,
      assignmentId: newAssignment.id,
      jobId,
      jobTitle,
      date:        shift.date,
      startTime:   shift.start_time,
      endTime:     shift.end_time,
      isRecurring: String(isRecurring),
    },
  );

  return NextResponse.json({
    success:    true,
    assignment: {
      id:     newAssignment.id,
      status: newAssignment.status,
    },
  });
}

// ─── PATCH /api/admin/shifts/[shiftId] ───────────────────────────────────────
// Cancels an assignment (pending → rescinded, confirmed → removed).
// Body: { assignmentId: string }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { shiftId } = await params;

  let assignmentId: string;
  try {
    const body = await request.json();
    if (!body?.assignmentId || typeof body.assignmentId !== "string") {
      return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
    }
    assignmentId = body.assignmentId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createServiceClient();

  // Validate the assignment belongs to this shift and is still pending
  const { data: assignment, error: fetchError } = await service
    .from("shift_assignments")
    .select("id, status, candidate_id")
    .eq("id", assignmentId)
    .eq("shift_id", shiftId)
    .single();

  if (fetchError || !assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  // Allow cancelling both pending and confirmed assignments.
  // Already-cancelled assignments are a no-op.
  if (assignment.status === "cancelled") {
    return NextResponse.json({ error: "Assignment is already cancelled" }, { status: 409 });
  }

  const { error: updateError } = await service
    .from("shift_assignments")
    .update({ status: "cancelled" })
    .eq("id", assignmentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Re-sync shift status: rescinding a pending assignment may reopen a filled shift
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

  // Mark the candidate's shift notification as read so they know it was withdrawn
  const { data: notifRows } = await service
    .from("candidate_notifications")
    .select("id, metadata")
    .eq("candidate_id", assignment.candidate_id)
    .eq("type", "shift")
    .contains("metadata", { assignmentId });

  for (const row of notifRows ?? []) {
    const merged = {
      ...(row.metadata as Record<string, unknown> ?? {}),
      acted: "rescinded",
    };
    await service
      .from("candidate_notifications")
      .update({ read: true, metadata: merged })
      .eq("id", row.id);
  }

  return NextResponse.json({ success: true });
}
