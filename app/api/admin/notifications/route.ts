import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { broadcastToAllCandidates } from "@/lib/notifications/candidate";

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdminOrModerator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;
  if (!user || (role !== "admin" && role !== "moderator")) return null;
  return user;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── GET /api/admin/notifications ─────────────────────────────────────────────

export async function GET() {
  const user = await requireAdminOrModerator();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const service = createServiceClient();

  const { data, error } = await service
    .from("admin_notifications")
    .select("id, title, message, type, audience, priority, delivery, status, scheduled_at, recipients, read_count, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const notifications = (data ?? []).map((n) => ({
    id:         n.id,
    title:      n.title,
    message:    n.message,
    type:       n.type,
    audience:   n.audience,
    priority:   n.priority,
    delivery:   n.delivery,
    status:     n.status,
    recipients: n.recipients,
    readRate:   n.recipients > 0 ? Math.round((n.read_count / n.recipients) * 100) : null,
    sent:       n.status === "scheduled" && n.scheduled_at
                  ? formatDate(n.scheduled_at)
                  : formatDate(n.created_at),
  }));

  return NextResponse.json({ notifications });
}

// ─── POST /api/admin/notifications ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await requireAdminOrModerator();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json() as {
    title:       string;
    message:     string;
    type:        string;
    audience:    string;
    priority:    string;
    delivery:    string;
    scheduleAt?: string | null;   // ISO string if scheduling, null for "send now"
  };

  const { title, message, type, audience, priority, delivery, scheduleAt } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
  }

  const service = createServiceClient();

  // ── Compute real recipient count from DB ───────────────────────────────────
  let recipientCount = 0;

  if (audience === "All Users") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    recipientCount = count ?? 0;
  } else if (audience === "Candidates") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "candidate")
      .eq("status", "active");
    recipientCount = count ?? 0;
  } else if (audience === "Employers") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "employer")
      .eq("status", "active");
    recipientCount = count ?? 0;
  } else if (audience === "Admins") {
    const { count } = await service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "moderator"]);
    recipientCount = count ?? 0;
  }

  const isSendNow = !scheduleAt;
  const status    = isSendNow ? "delivered" : "scheduled";

  const { data: inserted, error } = await service
    .from("admin_notifications")
    .insert({
      title:        title.trim(),
      message:      message.trim(),
      type,
      audience,
      priority,
      delivery,
      status,
      scheduled_at: scheduleAt ?? null,
      recipients:   recipientCount,
      read_count:   0,
      sent_by:      user.id,
    })
    .select("id, title, message, type, audience, priority, delivery, status, scheduled_at, recipients, read_count, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Fan-out to candidate inboxes when sending now ─────────────────────────
  // Only for "Candidates" or "All Users" audiences, and only for immediate sends.
  if (isSendNow && (audience === "Candidates" || audience === "All Users")) {
    await broadcastToAllCandidates(service, title.trim(), message.trim());
  }

  return NextResponse.json(
    {
      notification: {
        id:         inserted.id,
        title:      inserted.title,
        message:    inserted.message,
        type:       inserted.type,
        audience:   inserted.audience,
        priority:   inserted.priority,
        delivery:   inserted.delivery,
        status:     inserted.status,
        recipients: inserted.recipients,
        readRate:   null,
        sent:       inserted.status === "scheduled" && inserted.scheduled_at
                      ? formatDate(inserted.scheduled_at)
                      : formatDate(inserted.created_at),
      },
    },
    { status: 201 },
  );
}

// ─── DELETE /api/admin/notifications?id=xxx ───────────────────────────────────

export async function DELETE(request: NextRequest) {
  const user = await requireAdminOrModerator();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from("admin_notifications").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
