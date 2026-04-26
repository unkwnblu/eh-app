import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  if (user.app_metadata?.role !== "employer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  // Profile: account status + resubmission note
  const { data: profile } = await service
    .from("profiles")
    .select("status, resubmission_note")
    .eq("id", user.id)
    .single();

  // Employer: compliance fields
  const { data: employerRaw, error } = await service
    .from("employers")
    .select(
      "crn, vat_number, cqc_provider_id, dbs_level, " +
      "modern_slavery_act, employer_liability_insurance, industries, " +
      "healthcare_compliance_status"
    )
    .eq("id", user.id)
    .single();

  const employer = employerRaw as {
    crn?: string;
    vat_number?: string;
    cqc_provider_id?: string;
    dbs_level?: string;
    modern_slavery_act?: boolean;
    employer_liability_insurance?: boolean;
    industries?: string[];
    healthcare_compliance_status?: "not_submitted" | "pending" | "verified" | "rejected";
  } | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const healthcareStatus = employer?.healthcare_compliance_status ?? "not_submitted";

  // Build compliance items — same logic as admin verification
  const items: {
    key: string;
    label: string;
    value: string;
    verificationStatus?: "not_submitted" | "pending" | "verified" | "rejected";
  }[] = [];

  if (employer?.crn) {
    items.push({ key: "crn", label: "Company Registration Number", value: employer.crn });
  }
  if (employer?.vat_number) {
    items.push({ key: "vat", label: "VAT Number", value: employer.vat_number });
  }
  if ((employer?.industries ?? []).includes("Healthcare") && employer?.cqc_provider_id) {
    items.push({
      key: "cqc",
      label: "CQC Provider ID",
      value: employer.cqc_provider_id,
      verificationStatus: healthcareStatus,
    });
  }
  if ((employer?.industries ?? []).includes("Healthcare") && employer?.dbs_level) {
    items.push({
      key: "dbs",
      label: "Min. DBS Level Required",
      value: employer.dbs_level,
      verificationStatus: healthcareStatus,
    });
  }
  if ((employer?.industries ?? []).includes("Hospitality")) {
    items.push({
      key: "modern_slavery",
      label: "Modern Slavery Act Compliance",
      value: employer?.modern_slavery_act ? "Confirmed" : "Not confirmed",
    });
    items.push({
      key: "employer_liability",
      label: "Employer's Liability Insurance",
      value: employer?.employer_liability_insurance ? "Confirmed" : "Not confirmed",
    });
  }

  return NextResponse.json({
    status:                   profile?.status ?? "pending",
    resubmissionNote:         profile?.resubmission_note ?? null,
    healthcareStatus,
    items,
  });
}
