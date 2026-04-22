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

// ─── GET /api/admin/library ───────────────────────────────────────────────────
// ?type=faq                  → list all FAQ items
// ?category=training|sop|resource  → list library_documents for that category
// (no params)                → list all library_documents

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const service = createServiceClient();

  // ── FAQ mode ───────────────────────────────────────────────────────────────
  if (searchParams.get("type") === "faq") {
    const { data, error } = await service
      .from("faq_items")
      .select("id, question, answer, category, order")
      .order("category")
      .order("order");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ faqs: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  }

  // ── Documents mode ─────────────────────────────────────────────────────────
  const category = searchParams.get("category");

  let query = service
    .from("library_documents")
    .select("id, title, category, description, file_path, file_type, file_size_mb, created_at")
    .order("created_at", { ascending: false });

  if (category && ["training", "sop", "resource"].includes(category)) {
    query = query.eq("category", category);
  }

  const { data: docs, error: docErr } = await query;
  if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });

  // Generate signed URLs for uploaded files (pdf / other)
  // For video / article, file_path IS the URL — return as-is.
  const documents = await Promise.all(
    (docs ?? []).map(async (doc) => {
      let url: string | null = null;
      const ft = doc.file_type as string;
      const fp = doc.file_path as string;

      if (ft === "video" || ft === "article") {
        url = fp; // stored as direct URL
      } else {
        const { data: signed } = await service.storage
          .from("library")
          .createSignedUrl(fp, 3600);
        url = signed?.signedUrl ?? null;
      }

      return { ...doc, url };
    }),
  );

  return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store" } });
}

// ─── POST /api/admin/library ──────────────────────────────────────────────────
// JSON body with type="faq"  → create FAQ item
// FormData                   → upload document to storage + create DB record

export async function POST(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const contentType = request.headers.get("content-type") ?? "";

  // ── FAQ creation ───────────────────────────────────────────────────────────
  if (contentType.includes("application/json")) {
    let body: { type?: string; question?: string; answer?: string; category?: string; order?: number };
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (body.type !== "faq") {
      return NextResponse.json({ error: "Use multipart/form-data for document uploads" }, { status: 400 });
    }

    if (!body.question || !body.answer) {
      return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
    }

    const { data, error } = await service
      .from("faq_items")
      .insert({
        question: body.question,
        answer:   body.answer,
        category: body.category ?? "general",
        order:    body.order    ?? 0,
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  }

  // ── Document upload ────────────────────────────────────────────────────────
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data or application/json" }, { status: 400 });
  }

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const title       = formData.get("title")       as string | null;
  const category    = formData.get("category")    as string | null;
  const fileType    = formData.get("fileType")    as string | null;
  const description = formData.get("description") as string | null;
  const urlField    = formData.get("url")         as string | null; // for video/article
  const file        = formData.get("file")        as File   | null;

  if (!title || !category || !fileType) {
    return NextResponse.json({ error: "title, category, and fileType are required" }, { status: 400 });
  }

  if (!["training", "sop", "resource"].includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (!["pdf", "video", "article", "other"].includes(fileType)) {
    return NextResponse.json({ error: "Invalid fileType" }, { status: 400 });
  }

  let filePath:   string;
  let fileSizeMb: number | null = null;

  // For video / article — store the URL directly as file_path
  if (fileType === "video" || fileType === "article") {
    if (!urlField) {
      return NextResponse.json({ error: "url is required for video/article types" }, { status: 400 });
    }
    filePath = urlField;
  } else {
    // PDF / other — upload to Supabase Storage
    if (!file) {
      return NextResponse.json({ error: "file is required for pdf/other types" }, { status: 400 });
    }

    const folder = category === "training" ? "trainings" : category === "sop" ? "sops" : "resources";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    filePath = `${folder}/${Date.now()}-${safeName}`;
    fileSizeMb = Math.round((file.size / 1_048_576) * 100) / 100;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageErr } = await service.storage
      .from("library")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (storageErr) return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  // Insert DB record
  const { data: doc, error: dbErr } = await service
    .from("library_documents")
    .insert({
      title,
      category,
      description: description || null,
      file_path:   filePath,
      file_type:   fileType,
      file_size_mb: fileSizeMb,
    })
    .select("id")
    .single();

  if (dbErr) {
    // Roll back storage upload on DB failure
    if (fileType !== "video" && fileType !== "article") {
      await service.storage.from("library").remove([filePath]);
    }
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: doc.id }, { status: 201 });
}
