import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function mapStatus(s: string): "pending" | "flagged" | "resubmission" | "verified" {
  if (s === "active")       return "verified";
  if (s === "suspended")    return "flagged";
  if (s === "resubmission") return "resubmission";
  return "pending";
}

// ─── GET — fetch all employer registrations ───────────────────────────────────

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, status, created_at, resubmission_note")
    .eq("role", "employer")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ employers: [] });
  }

  const ids = profiles.map((p) => p.id);

  const { data: employerRows, error: employersError } = await supabase
    .from("employers")
    .select("*")
    .in("id", ids);

  if (employersError) {
    return NextResponse.json({ error: employersError.message }, { status: 500 });
  }

  const employerMap = new Map((employerRows ?? []).map((e) => [e.id, e]));

  const employers = profiles.map((p) => {
    const e = employerMap.get(p.id);

    // Build verifiable items — key info the admin needs to check
    const items: { key: string; label: string; value: string; verified: boolean }[] = [];

    if (e?.crn) {
      items.push({ key: "crn", label: "Company Registration Number", value: e.crn, verified: false });
    }
    if (e?.company_website) {
      items.push({ key: "website", label: "Company Website", value: e.company_website, verified: false });
    }
    if (e?.vat_number) {
      items.push({ key: "vat", label: "VAT Number", value: e.vat_number, verified: false });
    }
    if ((e?.industries ?? []).includes("Healthcare") && e?.cqc_provider_id) {
      items.push({ key: "cqc", label: "CQC Provider ID", value: e.cqc_provider_id, verified: false });
    }
    if ((e?.industries ?? []).includes("Healthcare") && e?.dbs_level) {
      items.push({ key: "dbs_level", label: "Min. DBS Level Required", value: e.dbs_level, verified: false });
    }
    if ((e?.industries ?? []).includes("Hospitality")) {
      items.push({
        key: "modern_slavery",
        label: "Modern Slavery Act Compliance",
        value: e?.modern_slavery_act ? "Confirmed" : "Not confirmed",
        verified: false,
      });
      items.push({
        key: "employer_liability",
        label: "Employer's Liability Insurance",
        value: e?.employer_liability_insurance ? "Confirmed" : "Not confirmed",
        verified: false,
      });
    }

    return {
      id:               p.id,
      company:          e?.company_name     ?? "Unknown",
      email:            e?.email            ?? p.id,
      contactName:      e ? `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() : "—",
      contactTitle:     e?.job_title        ?? "—",
      contactPhone:     e?.phone            ?? "—",
      companyPhone:     e?.company_phone    ?? "—",
      companyWebsite:   e?.company_website  ?? "",
      crn:              e?.crn              ?? "—",
      registeredAddress: e?.registered_address ?? "—",
      incorporationDate: formatDate(e?.incorporation_date ?? ""),
      companyStatus:    e?.company_status   ?? "—",
      vatNumber:        e?.vat_number       ?? "",
      industries:       e?.industries       ?? [],
      cqcProviderId:    e?.cqc_provider_id  ?? "",
      dbsLevel:         e?.dbs_level        ?? "",
      modernSlaveryAct: e?.modern_slavery_act ?? false,
      employerLiabilityInsurance: e?.employer_liability_insurance ?? false,
      billingName:      e?.billing_name     ?? "—",
      billingEmail:     e?.billing_email    ?? "—",
      billingAddress:   e?.billing_address  ?? "—",
      joined:           relativeTime(p.created_at),
      status:           mapStatus(p.status),
      resubmissionNote: p.resubmission_note ?? "",
      items,
    };
  });

  return NextResponse.json({ employers });
}

// ─── PATCH — approve / reject / request info ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, action, note } = await request.json() as {
    id: string;
    action: "approve" | "reject" | "request_info";
    note?: string;
  };

  if (!id || !["approve", "reject", "request_info"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const newStatus =
    action === "approve"     ? "active"       :
    action === "reject"      ? "suspended"    :
    /* request_info */         "resubmission";

  const payload: Record<string, string | null> = { status: newStatus };
  if (action === "request_info") {
    payload.resubmission_note = note?.trim() || null;
  } else {
    payload.resubmission_note = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
