import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── DELETE /api/admin/library/[id] ──────────────────────────────────────────
// ?type=faq  → delete from faq_items
// (default)  → delete from library_documents + remove storage file

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();
  const type = request.nextUrl.searchParams.get("type");

  // ── FAQ deletion ───────────────────────────────────────────────────────────
  if (type === "faq") {
    const { error } = await service.from("faq_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Document deletion ──────────────────────────────────────────────────────
  // 1. Fetch the record to get file_path and file_type before deleting
  const { data: doc, error: fetchErr } = await service
    .from("library_documents")
    .select("file_path, file_type")
    .eq("id", id)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // 2. Delete from DB
  const { error: dbErr } = await service
    .from("library_documents")
    .delete()
    .eq("id", id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // 3. Remove from storage (only for uploaded files, not URL-based)
  const ft = doc.file_type as string;
  if (ft !== "video" && ft !== "article") {
    await service.storage.from("library").remove([doc.file_path as string]);
  }

  return NextResponse.json({ success: true });
}

// ─── PATCH /api/admin/library/[id] ───────────────────────────────────────────
// Update document title / description only (no file replacement)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  let body: { title?: string; description?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const service = createServiceClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title)       updates.title       = body.title;
  if (body.description !== undefined) updates.description = body.description;

  const { error } = await service
    .from("library_documents")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
