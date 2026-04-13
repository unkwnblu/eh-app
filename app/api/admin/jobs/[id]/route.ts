import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") return null;
  return user;
}

// ─── PATCH — update job status ────────────────────────────────────────────────
// Body: { action: "approve" | "flag" | "reject" | "reset" }
// Maps to DB status: live | flagged | rejected | review

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as { action: string };

  const actionToStatus: Record<string, string> = {
    approve: "live",
    flag:    "flagged",
    reject:  "rejected",
    reset:   "review",
  };

  const newStatus = actionToStatus[body.action];
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action. Use: approve | flag | reject | reset" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service
    .from("jobs")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, status: newStatus });
}
