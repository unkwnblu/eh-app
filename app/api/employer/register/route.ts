import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;

  const {
    email,
    password,
    companyName,
    crn,
    registeredAddress,
    incorporationDate,
    companyStatus,
    companyPhone,
    companyWebsite,
    vatNumber,
    firstName,
    lastName,
    jobTitle,
    phone,
    industries,
    cqcProviderId,
    dbsLevel,
    modernSlaveryAct,
    employerLiabilityInsurance,
    billingName,
    billingEmail,
    billingAddress,
    checkEmployerLiability,
    checkRiskAssessment,
    checkBusinessCredit,
    checkGdpr,
    checkTerms,
  } = body as Record<string, string | string[] | boolean | undefined>;

  if (!email || !password || !companyName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // 1 — Create auth user with employer role
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email as string,
    password: password as string,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    },
    app_metadata: {
      role: "employer",
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // 2 — Insert employer record
  const { error: employerError } = await supabase.from("employers").insert({
    id:                           userId,
    email,
    company_name:                 companyName,
    crn,
    registered_address:           registeredAddress,
    incorporation_date:           incorporationDate || null,
    company_status:               companyStatus,
    company_phone:                companyPhone,
    company_website:              companyWebsite,
    vat_number:                   vatNumber || null,
    first_name:                   firstName,
    last_name:                    lastName,
    job_title:                    jobTitle,
    phone,
    industries:                   industries ?? [],
    cqc_provider_id:              cqcProviderId || null,
    dbs_level:                    dbsLevel || null,
    modern_slavery_act:           modernSlaveryAct ?? false,
    employer_liability_insurance: employerLiabilityInsurance ?? false,
    billing_name:                 billingName,
    billing_email:                billingEmail,
    billing_address:              billingAddress,
    consent_employer_liability:   checkEmployerLiability ?? false,
    consent_risk_assessment:      checkRiskAssessment ?? false,
    consent_business_credit:      checkBusinessCredit ?? false,
    consent_gdpr:                 checkGdpr ?? false,
    consent_terms:                checkTerms ?? false,
  });

  if (employerError) {
    // Roll back auth user
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: employerError.message }, { status: 500 });
  }

  // 3 — Set profile to pending and role to employer
  await supabase
    .from("profiles")
    .update({ status: "pending", role: "employer" })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
