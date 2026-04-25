import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── GET /api/candidate/settings ─────────────────────────────────────────────

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidates")
    .select("email_notifications, account_privacy")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    emailNotifications: data?.email_notifications ?? true,
    accountPrivacy:     data?.account_privacy     ?? true,
  });
}

// ─── PATCH /api/candidate/settings ───────────────────────────────────────────
// Body: { emailNotifications?: boolean; accountPrivacy?: boolean }

export async function PATCH(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: { emailNotifications?: boolean; accountPrivacy?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, boolean> = {};
  if (typeof body.emailNotifications === "boolean") updates.email_notifications = body.emailNotifications;
  if (typeof body.accountPrivacy     === "boolean") updates.account_privacy     = body.accountPrivacy;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("candidates")
    .update(updates)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
