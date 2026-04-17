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

// ─── PATCH — update a shift ───────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const service = createServiceClient();

  // Verify shift belongs to employer
  const { data: existing } = await service
    .from("shifts")
    .select("id")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  const fieldMap: Record<string, string> = {
    status:       "status",
    date:         "date",
    startTime:    "start_time",
    endTime:      "end_time",
    breakMinutes: "break_minutes",
    department:   "department",
    location:     "location",
    staffNeeded:  "staff_needed",
    hourlyRate:   "hourly_rate",
    notes:        "notes",
  };

  const allowed = Object.keys(fieldMap);
  const updates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (allowed.includes(key)) {
      updates[fieldMap[key]] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await service.from("shifts").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove a shift ──────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  const { error } = await service
    .from("shifts")
    .delete()
    .eq("id", id)
    .eq("employer_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
