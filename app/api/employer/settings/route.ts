import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── GET — load current employer settings ─────────────────────────────────────

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

  const { data: employer, error } = await service
    .from("employers")
    .select(
      "email, first_name, last_name, job_title, phone, " +
      "company_name, company_phone, company_website, registered_address, " +
      "vat_number, crn, industries, billing_name, billing_email, billing_address, " +
      "cqc_provider_id, dbs_level, modern_slavery_act, employer_liability_insurance, " +
      "healthcare_compliance_status"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employer });
}

// ─── PATCH — save account or business section ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (user.app_metadata?.role !== "employer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as Record<string, unknown>;
  const { section, ...fields } = body as { section: "account" | "business"; [k: string]: unknown };

  const service = createServiceClient();

  if (section === "account") {
    const { firstName, lastName, jobTitle, phone } = fields as Record<string, string>;
    const { error } = await service
      .from("employers")
      .update({ first_name: firstName, last_name: lastName, job_title: jobTitle, phone })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Keep auth user_metadata in sync
    await supabase.auth.updateUser({
      data: { full_name: `${firstName} ${lastName}`.trim() },
    });
  } else if (section === "business") {
    const {
      companyName, companyPhone, companyWebsite, registeredAddress, vatNumber,
      industries, cqcProviderId, dbsLevel, modernSlaveryAct, employerLiabilityInsurance,
    } = fields as Record<string, string | string[] | boolean>;
    const industryList = (industries ?? []) as string[];

    // Server-side: enforce compliance fields for regulated sectors
    if (industryList.includes("Healthcare")) {
      if (!cqcProviderId) return NextResponse.json({ error: "CQC Provider ID is required for Healthcare." }, { status: 422 });
      if (!dbsLevel)      return NextResponse.json({ error: "DBS level is required for Healthcare." }, { status: 422 });
    }
    if (industryList.includes("Hospitality")) {
      if (!modernSlaveryAct)          return NextResponse.json({ error: "Modern Slavery Act compliance is required for Hospitality." }, { status: 422 });
      if (!employerLiabilityInsurance) return NextResponse.json({ error: "Employer Liability Insurance confirmation is required for Hospitality." }, { status: 422 });
    }

    // Fetch the existing compliance status so we don't regress a verified employer
    const { data: existing } = await service
      .from("employers")
      .select("healthcare_compliance_status, cqc_provider_id, dbs_level")
      .eq("id", user.id)
      .single();

    const prevStatus     = (existing as { healthcare_compliance_status?: string } | null)?.healthcare_compliance_status ?? "not_submitted";
    const prevCqc        = (existing as { cqc_provider_id?: string } | null)?.cqc_provider_id ?? "";
    const prevDbs        = (existing as { dbs_level?: string } | null)?.dbs_level ?? "";
    const healthcareNow  = industryList.includes("Healthcare");

    // Determine next verification status:
    // - Removing Healthcare → clear (not_submitted)
    // - Adding/changing CQC or DBS → pending review
    // - Already verified and fields unchanged → keep verified
    let nextHealthcareStatus: string;
    if (!healthcareNow) {
      nextHealthcareStatus = "not_submitted";
    } else if (
      prevStatus === "verified" &&
      String(cqcProviderId) === prevCqc &&
      String(dbsLevel) === prevDbs
    ) {
      nextHealthcareStatus = "verified";
    } else {
      nextHealthcareStatus = "pending";
    }

    const patch: Record<string, unknown> = {
      company_name:       companyName,
      company_phone:      companyPhone,
      company_website:    companyWebsite,
      registered_address: registeredAddress,
      vat_number:         vatNumber || null,
      industries:         industryList,
      // Always write compliance fields so removing a sector clears them
      cqc_provider_id:              healthcareNow ? cqcProviderId || null : null,
      dbs_level:                    healthcareNow ? dbsLevel       || null : null,
      healthcare_compliance_status: nextHealthcareStatus,
      modern_slavery_act:           industryList.includes("Hospitality") ? Boolean(modernSlaveryAct)           : false,
      employer_liability_insurance: industryList.includes("Hospitality") ? Boolean(employerLiabilityInsurance) : false,
    };

    const { error } = await service
      .from("employers")
      .update(patch)
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
