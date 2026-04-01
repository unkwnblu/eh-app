import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── PATCH /api/admin/users/[id] — suspend | restore ──────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = (await request.json()) as { action: "suspend" | "restore" };

  if (action !== "suspend" && action !== "restore") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const service = createServiceClient();

  if (action === "suspend") {
    // Ban for 100 years — effectively permanent until restored
    await service.auth.admin.updateUserById(id, { ban_duration: "876000h" });
    await service
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", id);
  } else {
    await service.auth.admin.updateUserById(id, { ban_duration: "none" });
    await service.from("profiles").update({ status: "active" }).eq("id", id);
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE /api/admin/users/[id] ─────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
