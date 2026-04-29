import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// SQL migration (run once in Supabase SQL editor):
// ALTER TABLE employers
//   ADD COLUMN IF NOT EXISTS logo_path      TEXT,
//   ADD COLUMN IF NOT EXISTS logo_file_name TEXT;

const BUCKET = "employer-documents";

async function getEmployer() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.app_metadata?.role !== "employer") return null;
  return user;
}

/** Ensure the private bucket exists — no-op if it already does. */
async function ensureBucket(service: ReturnType<typeof createServiceClient>) {
  const { data: buckets } = await service.storage.listBuckets();
  const exists = (buckets ?? []).some((b) => b.name === BUCKET);
  if (!exists) {
    await service.storage.createBucket(BUCKET, { public: false });
  }
}

// ─── GET — return signed URL for current logo ────────────────────────────────

export async function GET() {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data, error } = await service
    .from("employers")
    .select("logo_path, logo_file_name")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ url: null, fileName: null });

  const path = (data as { logo_path?: string } | null)?.logo_path ?? null;
  if (!path) return NextResponse.json({ url: null, fileName: null });

  const { data: signed } = await service.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({
    url:      signed?.signedUrl ?? null,
    fileName: (data as { logo_file_name?: string } | null)?.logo_file_name ?? null,
  });
}

// ─── POST — upload logo file (multipart/form-data) ───────────────────────────

export async function POST(request: NextRequest) {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 5 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) {
    return NextResponse.json({ error: "Only jpg, png, webp, or svg images are allowed." }, { status: 400 });
  }

  const service = createServiceClient();

  // Auto-create bucket if it doesn't exist yet
  await ensureBucket(service);

  const path = `${user.id}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Remove old logo to avoid orphans
  const { data: existing } = await service
    .from("employers")
    .select("logo_path")
    .eq("id", user.id)
    .single();

  const oldPath = (existing as { logo_path?: string } | null)?.logo_path;
  if (oldPath && oldPath !== path) {
    await service.storage.from(BUCKET).remove([oldPath]);
  }

  // Upload via service client (bypasses all bucket RLS)
  const { error: uploadErr } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  // Save path to DB
  const { error: dbErr } = await service
    .from("employers")
    .update({ logo_path: path, logo_file_name: file.name })
    .eq("id", user.id);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  // Return fresh signed URL
  const { data: signed } = await service.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({ success: true, url: signed?.signedUrl ?? null });
}

// ─── DELETE — remove logo ─────────────────────────────────────────────────────

export async function DELETE() {
  const user = await getEmployer();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: existing } = await service
    .from("employers")
    .select("logo_path")
    .eq("id", user.id)
    .single();

  const path = (existing as { logo_path?: string } | null)?.logo_path;
  if (path) {
    await service.storage.from(BUCKET).remove([path]);
  }

  await service
    .from("employers")
    .update({ logo_path: null, logo_file_name: null })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
