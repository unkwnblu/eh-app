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

// ─── POST /api/admin/shifts/assign-group ─────────────────────────────────────
// Assigns one candidate to multiple shifts in a recurring group in a single
// operation, then sends ONE consolidated notification instead of one per shift.
//
// Body: { shiftIds: string[], candidateId: string }

export async function POST(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let shiftIds: string[];
  let candidateId: string;

  try {
    const body = await request.json() as { shiftIds?: unknown; candidateId?: unknown };
    if (!Array.isArray(body.shiftIds) || body.shiftIds.length === 0) {
      return NextResponse.json({ error: "shiftIds must be a non-empty array" }, { status: 400 });
    }
    if (typeof body.candidateId !== "string" || !body.candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }
    shiftIds    = body.shiftIds as string[];
    candidateId = body.candidateId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (shiftIds.length > 500) {
    return NextResponse.json({ error: "Maximum 500 shifts per bulk assign" }, { status: 400 });
  }

  const service = createServiceClient();

  // 1. Fetch all the shifts (validates they exist + gets metadata for notification)
  const { data: shifts, error: shiftsError } = await service
    .from("shifts")
    .select("id, date, start_time, end_time, job_id, recurring_group_id")
    .in("id", shiftIds);

  if (shiftsError || !shifts || shifts.length === 0) {
    return NextResponse.json({ error: "Shifts not found" }, { status: 404 });
  }

  // 2. Check for existing active assignments (pending or confirmed) so we can skip/reuse
  const { data: existing } = await service
    .from("shift_assignments")
    .select("id, shift_id, status")
    .in("shift_id", shiftIds)
    .eq("candidate_id", candidateId);

  const existingMap = new Map(
    (existing ?? []).map((e) => [e.shift_id as string, e as { id: string; shift_id: string; status: string }])
  );

  // 3. Build insert rows (skip shifts already active for this candidate)
  const toInsert: { shift_id: string; candidate_id: string; status: string }[] = [];
  const toUpdate: { id: string }[] = [];

  for (const shiftId of shiftIds) {
    const ex = existingMap.get(shiftId);
    if (!ex) {
      toInsert.push({ shift_id: shiftId, candidate_id: candidateId, status: "pending" });
    } else if (ex.status === "declined" || ex.status === "cancelled") {
      // Reuse the existing row (preserves unique constraint)
      toUpdate.push({ id: ex.id });
    }
    // If already pending/confirmed — silently skip (not an error)
  }

  // 4. Batch insert new assignments
  const allAssignmentIds: string[] = [];
  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await service
      .from("shift_assignments")
      .insert(toInsert)
      .select("id");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    for (const r of inserted ?? []) allAssignmentIds.push(r.id as string);
  }

  // 5. Re-activate any previous cancelled/declined rows
  if (toUpdate.length > 0) {
    const ids = toUpdate.map((r) => r.id);
    await service
      .from("shift_assignments")
      .update({ status: "pending", assigned_at: new Date().toISOString() })
      .in("id", ids);

    // Also collect reactivated IDs so the notification has a valid assignmentId
    for (const r of toUpdate) allAssignmentIds.push(r.id);
  }

  // 6. Send ONE consolidated notification
  const sorted = [...shifts].sort((a, b) =>
    (a.date as string).localeCompare(b.date as string)
  );
  const firstShift = sorted[0];
  const lastShift  = sorted[sorted.length - 1];

  const { data: job } = await service
    .from("jobs")
    .select("id, title")
    .eq("id", firstShift.job_id)
    .single();

  const jobTitle  = job?.title ?? "Unknown Job";
  const jobId     = firstShift.job_id as string;
  const startFmt  = (firstShift.start_time as string).slice(0, 5);
  const endFmt    = (firstShift.end_time as string).slice(0, 5);
  const count     = shifts.length;

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });

  const notifTitle = "Recurring Shifts Assigned";
  const notifBody  =
    `You have been offered **${count} shift${count !== 1 ? "s" : ""}** for **${jobTitle}** ` +
    `running ${fmtDate(firstShift.date as string)} → ${fmtDate(lastShift.date as string)}, ` +
    `${startFmt}–${endFmt} each day. Please confirm your availability.`;

  await insertCandidateNotification(
    service,
    candidateId,
    "shift",
    notifTitle,
    notifBody,
    {
      jobId,
      jobTitle,
      recurringGroupId: firstShift.recurring_group_id as string ?? null,
      startDate:  firstShift.date  as string,
      endDate:    lastShift.date   as string,
      startTime:  firstShift.start_time as string,
      endTime:    firstShift.end_time   as string,
      shiftCount: String(count),
      // First assignmentId — used by the notifications page to show Accept/Decline buttons.
      // Drawn from both freshly-inserted rows and any reactivated rows so it's never empty.
      assignmentId: allAssignmentIds[0] ?? "",
    },
  );

  return NextResponse.json({
    success:  true,
    assigned: toInsert.length + toUpdate.length,
    skipped:  shiftIds.length - toInsert.length - toUpdate.length,
  });
}
