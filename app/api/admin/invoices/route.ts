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

// ─── Shared: build line items from approved timesheets ────────────────────────

async function buildLineItems(
  service: ReturnType<typeof createServiceClient>,
  employerId: string,
  periodStart: string,
  periodEnd:   string,
  defaultRate: number,
) {
  // 1. Fetch approved shift_assignments for this employer in the period
  //    via shifts → jobs → employer chain
  const { data: jobs } = await service
    .from("jobs")
    .select("id, title")
    .eq("employer_id", employerId);

  if (!jobs || jobs.length === 0) return [];

  const jobIds = jobs.map((j) => j.id as string);
  const jobTitleMap = new Map(jobs.map((j) => [j.id as string, j.title as string]));

  const { data: shifts } = await service
    .from("shifts")
    .select("id, date, job_id, hourly_rate")
    .in("job_id", jobIds)
    .gte("date", periodStart)
    .lte("date", periodEnd);

  if (!shifts || shifts.length === 0) return [];

  const shiftIds = shifts.map((s) => s.id as string);
  const shiftMap = new Map(shifts.map((s) => [s.id as string, s]));

  const { data: assignments } = await service
    .from("shift_assignments")
    .select("id, candidate_id, shift_id, clocked_in_at, clocked_out_at")
    .in("shift_id", shiftIds)
    .eq("timesheet_status", "approved")
    .not("clocked_out_at", "is", null);

  if (!assignments || assignments.length === 0) return [];

  // 2. Fetch candidate names
  const candidateIds = [...new Set(assignments.map((a) => a.candidate_id as string))];
  const { data: profiles } = await service
    .from("profiles")
    .select("id, full_name")
    .in("id", candidateIds);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) ?? "Unknown"]));

  // 3. Build line items
  return assignments.map((a) => {
    const shift     = shiftMap.get(a.shift_id as string);
    const jobTitle  = shift ? (jobTitleMap.get(shift.job_id as string) ?? "Unknown Role") : "Unknown Role";
    const clockIn   = new Date(a.clocked_in_at  as string);
    const clockOut  = new Date(a.clocked_out_at as string);
    const hoursWorked = Math.round(((clockOut.getTime() - clockIn.getTime()) / 3_600_000) * 100) / 100;
    const rate       = (shift?.hourly_rate as number | null) ?? defaultRate;
    const amount     = Math.round(hoursWorked * rate * 100) / 100;

    return {
      assignmentId:  a.id as string,
      candidateName: nameMap.get(a.candidate_id as string) ?? "Unknown",
      jobTitle,
      shiftDate:     (shift?.date as string) ?? "",
      hoursWorked,
      hourlyRate:    rate,
      amount,
    };
  }).sort((a, b) => a.shiftDate.localeCompare(b.shiftDate));
}

// ─── GET /api/admin/invoices ──────────────────────────────────────────────────
// ?preview=true&employerId=&from=&to=&defaultRate=   → preview line items
// (no params)                                         → list all invoices

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const service = createServiceClient();

  // ── Employers mode (for invoice-generation modal dropdown) ───────────────
  if (searchParams.get("mode") === "employers") {
    // 1. Get all employer profile IDs
    const { data: profiles } = await service
      .from("profiles")
      .select("id")
      .eq("role", "employer");

    const empIds = (profiles ?? []).map((p) => p.id as string);

    if (empIds.length === 0) {
      return NextResponse.json({ employers: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    // 2. Fetch company names from the employers table
    const { data: employerRows } = await service
      .from("employers")
      .select("id, company_name, first_name, last_name")
      .in("id", empIds);

    const employers = (employerRows ?? [])
      .map((e) => ({
        id:   e.id as string,
        name: (e.company_name as string | null)
          ?? (`${(e.first_name as string | null) ?? ""} ${(e.last_name as string | null) ?? ""}`.trim() || "Unknown Employer"),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ employers }, { headers: { "Cache-Control": "no-store" } });
  }

  // ── Preview mode ─────────────────────────────────────────────────────────
  if (searchParams.get("preview") === "true") {
    const employerId  = searchParams.get("employerId") ?? "";
    const from        = searchParams.get("from")        ?? "";
    const to          = searchParams.get("to")          ?? "";
    const defaultRate = parseFloat(searchParams.get("defaultRate") ?? "0") || 0;

    if (!employerId || !from || !to) {
      return NextResponse.json({ error: "employerId, from, and to are required" }, { status: 400 });
    }

    const items = await buildLineItems(service, employerId, from, to, defaultRate);
    const subtotal = Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100;

    return NextResponse.json({ items, subtotal }, { headers: { "Cache-Control": "no-store" } });
  }

  // ── List invoices ─────────────────────────────────────────────────────────
  const { data: invoices, error } = await service
    .from("invoices")
    .select("id, invoice_number, employer_id, employer_name, period_start, period_end, status, subtotal, vat_rate, vat_amount, total_amount, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invoices: invoices ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

// ─── POST /api/admin/invoices ─────────────────────────────────────────────────
// Creates an invoice from all approved timesheets for an employer in a period.
// Body: { employerId, periodStart, periodEnd, defaultRate?, vatRate?, notes? }

export async function POST(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: {
    employerId:  string;
    periodStart: string;
    periodEnd:   string;
    defaultRate?: number;
    vatRate?:     number;
    notes?:       string;
  };

  try {
    body = await request.json();
    if (!body.employerId || !body.periodStart || !body.periodEnd) {
      return NextResponse.json({ error: "employerId, periodStart, and periodEnd are required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { employerId, periodStart, periodEnd, defaultRate = 0, vatRate = 20, notes } = body;
  const service = createServiceClient();

  // 1. Fetch employer name from the employers table (company_name lives there)
  const { data: employer } = await service
    .from("employers")
    .select("company_name, first_name, last_name")
    .eq("id", employerId)
    .single();

  const employerName =
    (employer?.company_name as string | null) ??
    (`${(employer?.first_name as string | null) ?? ""} ${(employer?.last_name as string | null) ?? ""}`.trim() || "Unknown Employer");

  // 2. Build line items
  const items = await buildLineItems(service, employerId, periodStart, periodEnd, defaultRate);
  if (items.length === 0) {
    return NextResponse.json({ error: "No approved timesheets found for this employer and period." }, { status: 400 });
  }

  // 3. Calculate totals
  const subtotal  = Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
  const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
  const total     = Math.round((subtotal + vatAmount) * 100) / 100;

  // 4. Generate invoice number: INV-YYYYMM-NNN
  const now     = new Date();
  const ym      = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { count } = await service
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .like("invoice_number", `INV-${ym}-%`);

  const seq           = String((count ?? 0) + 1).padStart(3, "0");
  const invoiceNumber = `INV-${ym}-${seq}`;

  // 5. Insert invoice
  const { data: invoice, error: invErr } = await service
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      employer_id:    employerId,
      employer_name:  employerName,
      period_start:   periodStart,
      period_end:     periodEnd,
      status:         "draft",
      subtotal,
      vat_rate:       vatRate,
      vat_amount:     vatAmount,
      total_amount:   total,
      notes:          notes ?? null,
      created_by_id:  admin.id,
    })
    .select("id")
    .single();

  if (invErr || !invoice) {
    return NextResponse.json({ error: invErr?.message ?? "Failed to create invoice" }, { status: 500 });
  }

  // 6. Insert line items
  const lineRows = items.map((item) => ({
    invoice_id:    invoice.id,
    assignment_id: item.assignmentId,
    candidate_name: item.candidateName,
    job_title:     item.jobTitle,
    shift_date:    item.shiftDate,
    hours_worked:  item.hoursWorked,
    hourly_rate:   item.hourlyRate,
    amount:        item.amount,
  }));

  const { error: itemErr } = await service.from("invoice_items").insert(lineRows);
  if (itemErr) {
    // Roll back the invoice header if items fail
    await service.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: itemErr.message }, { status: 500 });
  }

  return NextResponse.json({ invoiceId: invoice.id, invoiceNumber }, { status: 201 });
}
