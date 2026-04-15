import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return "1 day ago";
  if (days  < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── GET /api/candidate/notifications ────────────────────────────────────────
// Returns the candidate's 50 most recent notifications + unread count.

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data, error } = await service
    .from("candidate_notifications")
    .select("id, type, title, body, read, metadata, created_at")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const notifications = (data ?? []).map((n) => ({
    id:        n.id as string,
    type:      n.type,
    title:     n.title,
    body:      n.body,
    read:      n.read,
    metadata:  n.metadata ?? null,
    time:      relativeTime(n.created_at),
    createdAt: n.created_at,
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

// ─── PATCH /api/candidate/notifications ──────────────────────────────────────
// Mark as read:
//   { all: true }     → mark every unread notification for this candidate
//   { id: "uuid" }    → mark a single notification

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as { all?: boolean; id?: string };
  const service = createServiceClient();

  if (body.all) {
    const { error } = await service
      .from("candidate_notifications")
      .update({ read: true })
      .eq("candidate_id", user.id)
      .eq("read", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (body.id) {
    const { error } = await service
      .from("candidate_notifications")
      .update({ read: true })
      .eq("id", body.id)
      .eq("candidate_id", user.id); // ensures candidate owns this notification
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: 'Provide either { "all": true } or { "id": "<uuid>" }' },
    { status: 400 },
  );
}
