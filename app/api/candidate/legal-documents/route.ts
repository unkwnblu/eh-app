import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { setResubmissionIfActive } from "@/lib/supabase/setResubmission";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user: error ? null : user };
}

type Row = {
  id: string;
  doc_type: string;
  label: string | null;
  file_name: string;
  file_path: string;
  expiry_date: string | null;
  uploaded_at: string;
};

function toCamel(r: Row) {
  return {
    id:         r.id,
    docType:    r.doc_type,
    label:      r.label ?? "",
    fileName:   r.file_name,
    filePath:   r.file_path,
    expiryDate: r.expiry_date ?? "",
    uploadedAt: r.uploaded_at,
  };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_legal_documents")
    .select("id, doc_type, label, file_name, file_path, expiry_date, uploaded_at")
    .eq("candidate_id", user.id)
    .order("uploaded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: (data ?? []).map(toCamel) });
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { docType, label, fileName, filePath, expiryDate } = body;

  if (!docType || !fileName || !filePath) {
    return NextResponse.json({ error: "docType, fileName, and filePath are required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_legal_documents")
    .insert({
      candidate_id: user.id,
      doc_type:     docType,
      label:        label ?? null,
      file_name:    fileName,
      file_path:    filePath,
      expiry_date:  expiryDate || null,
    })
    .select("id, doc_type, label, file_name, file_path, expiry_date, uploaded_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await setResubmissionIfActive(user.id);

  return NextResponse.json({ document: toCamel(data) });
}

// ─── PATCH — update label/expiry ─────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { id, label, expiryDate } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service
    .from("candidate_legal_documents")
    .update({
      label:       label ?? null,
      expiry_date: expiryDate || null,
    })
    .eq("id", id)
    .eq("candidate_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();

  // Best-effort: remove storage object
  const { data: row } = await service
    .from("candidate_legal_documents")
    .select("file_path")
    .eq("id", id)
    .eq("candidate_id", user.id)
    .single();

  if (row?.file_path) {
    await service.storage.from("candidate-documents").remove([row.file_path]);
  }

  const { error } = await service
    .from("candidate_legal_documents")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
