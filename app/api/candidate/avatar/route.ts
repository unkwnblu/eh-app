import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// SQL migration (run once in Supabase SQL editor):
// ALTER TABLE candidates
//   ADD COLUMN IF NOT EXISTS avatar_path      TEXT,
//   ADD COLUMN IF NOT EXISTS avatar_file_name TEXT;

// Auth guard — matches the pattern used across all candidate API routes
async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── GET — return signed URL for current avatar ───────────────────────────────

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  // Graceful fallback if migration hasn't been run yet — only select known columns
  const { data, error } = await service
    .from("candidates")
    .select("avatar_path, avatar_file_name")
    .eq("id", user.id)
    .single();

  // If columns don't exist (PGRST204 = column unknown), return null gracefully
  if (error) return NextResponse.json({ url: null, fileName: null });

  const path = (data as { avatar_path?: string } | null)?.avatar_path ?? null;
  if (!path) return NextResponse.json({ url: null, fileName: null });

  const { data: signed } = await service.storage
    .from("candidate-documents")
    .createSignedUrl(path, 60 * 60); // 1-hour URL

  return NextResponse.json({
    url:      signed?.signedUrl ?? null,
    fileName: (data as { avatar_file_name?: string } | null)?.avatar_file_name ?? null,
  });
}

// ─── PUT — save path after client-side upload ─────────────────────────────────

export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json() as { fileName?: string; filePath?: string };
  const { fileName, filePath } = body;

  if (!fileName || !filePath) {
    return NextResponse.json({ error: "fileName and filePath are required." }, { status: 400 });
  }

  // Validate extension
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return NextResponse.json({ error: "Only jpg, png, or webp images are allowed." }, { status: 400 });
  }

  // Validate path belongs to this user (prevent overwriting other users' files)
  if (!filePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  const service = createServiceClient();

  // Remove old avatar from storage to avoid orphans — fail silently if columns missing
  const { data: existing } = await service
    .from("candidates")
    .select("avatar_path")
    .eq("id", user.id)
    .single();

  const oldPath = (existing as { avatar_path?: string } | null)?.avatar_path;
  if (oldPath && oldPath !== filePath) {
    await service.storage.from("candidate-documents").remove([oldPath]);
  }

  // Save to DB
  const { error: dbErr } = await service
    .from("candidates")
    .update({ avatar_path: filePath, avatar_file_name: fileName })
    .eq("id", user.id);

  if (dbErr) {
    // Most likely cause: migration not run yet
    const hint = dbErr.message.includes("avatar")
      ? "Run the SQL migration to add avatar_path and avatar_file_name columns to the candidates table."
      : dbErr.message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  // Return fresh signed URL for immediate display
  const { data: signed } = await service.storage
    .from("candidate-documents")
    .createSignedUrl(filePath, 60 * 60);

  return NextResponse.json({ success: true, url: signed?.signedUrl ?? null });
}

// ─── DELETE — remove avatar from storage + clear columns ─────────────────────

export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: existing } = await service
    .from("candidates")
    .select("avatar_path")
    .eq("id", user.id)
    .single();

  const path = (existing as { avatar_path?: string } | null)?.avatar_path;
  if (path) {
    await service.storage.from("candidate-documents").remove([path]);
  }

  const { error } = await service
    .from("candidates")
    .update({ avatar_path: null, avatar_file_name: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
