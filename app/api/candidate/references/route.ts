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
  full_name: string;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
};

function toCamel(r: Row) {
  return {
    id:           r.id,
    fullName:     r.full_name,
    jobTitle:     r.job_title ?? "",
    company:      r.company ?? "",
    email:        r.email ?? "",
    phone:        r.phone ?? "",
    relationship: r.relationship ?? "",
  };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_references")
    .select("id, full_name, job_title, company, email, phone, relationship")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ references: (data ?? []).map(toCamel) });
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { fullName, jobTitle, company, email, phone, relationship } = body;

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidate_references")
    .insert({
      candidate_id: user.id,
      full_name:    fullName,
      job_title:    jobTitle ?? null,
      company:      company ?? null,
      email:        email ?? null,
      phone:        phone ?? null,
      relationship: relationship ?? null,
    })
    .select("id, full_name, job_title, company, email, phone, relationship")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reference: toCamel(data) });
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { id, fullName, jobTitle, company, email, phone, relationship } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service
    .from("candidate_references")
    .update({
      full_name:    fullName,
      job_title:    jobTitle ?? null,
      company:      company ?? null,
      email:        email ?? null,
      phone:        phone ?? null,
      relationship: relationship ?? null,
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
  const { error } = await service
    .from("candidate_references")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
