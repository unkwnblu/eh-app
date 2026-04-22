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

// ─── GET /api/admin/invoices/[invoiceId] ──────────────────────────────────────
// Returns the invoice header + all line items.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { invoiceId } = await params;
  const service = createServiceClient();

  const { data: invoice, error: invErr } = await service
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (invErr || !invoice) {
    return NextResponse.json({ error: invErr?.message ?? "Not found" }, { status: 404 });
  }

  const { data: items } = await service
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("shift_date", { ascending: true });

  return NextResponse.json(
    { invoice, items: items ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// ─── PATCH /api/admin/invoices/[invoiceId] ────────────────────────────────────
// Updates the invoice status: draft → sent → paid.
// Body: { status: "draft" | "sent" | "paid" }

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { invoiceId } = await params;
  let status: string;

  try {
    const body = await request.json() as { status?: unknown };
    if (!["draft", "sent", "paid"].includes(body.status as string)) {
      return NextResponse.json({ error: "status must be draft, sent, or paid" }, { status: 400 });
    }
    status = body.status as string;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── DELETE /api/admin/invoices/[invoiceId] ───────────────────────────────────
// Deletes a draft invoice (only drafts can be deleted).

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { invoiceId } = await params;
  const service = createServiceClient();

  // Safety: only allow deleting draft invoices
  const { data: invoice } = await service
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "draft") {
    return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 400 });
  }

  const { error } = await service.from("invoices").delete().eq("id", invoiceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
