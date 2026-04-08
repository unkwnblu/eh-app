import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user: error ? null : user };
}

type Row = {
  id: string;
  name: string;
  issuer: string | null;
  file_name: string | null;
  file_path: string | null;
  expiry_date: string | null;
  verified: boolean;
};

function toCamel(r: Row) {
  return {
    id:         r.id,
    name:       r.name,
    issuer:     r.issuer ?? "",
    fileName:   r.file_name ?? "",
    filePath:   r.file_path ?? "",
    expiryDate: r.expiry_date ?? "",
    verified:   r.verified,
  };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_certificates")
    .select("id, name, issuer, file_name, file_path, expiry_date, verified")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ certificates: (data ?? []).map(toCamel) });
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { name, issuer, fileName, filePath, expiryDate } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_certificates")
    .insert({
      candidate_id: user.id,
      name,
      issuer:       issuer ?? null,
      file_name:    fileName ?? null,
      file_path:    filePath ?? null,
      expiry_date:  expiryDate || null,
    })
    .select("id, name, issuer, file_name, file_path, expiry_date, verified")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ certificate: toCamel(data) });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();

  // Best-effort: also remove the storage object
  const { data: row } = await service
    .from("candidate_certificates")
    .select("file_path")
    .eq("id", id)
    .eq("candidate_id", user.id)
    .single();

  if (row?.file_path) {
    await service.storage.from("candidate-documents").remove([row.file_path]);
  }

  const { error } = await service
    .from("candidate_certificates")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
