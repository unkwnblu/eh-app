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
      "vat_number, crn, industries, billing_name, billing_email, billing_address"
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
    const { companyName, companyPhone, companyWebsite, registeredAddress, vatNumber, industries } = fields as Record<string, string | string[]>;
    const { error } = await service
      .from("employers")
      .update({
        company_name:       companyName,
        company_phone:      companyPhone,
        company_website:    companyWebsite,
        registered_address: registeredAddress,
        vat_number:         vatNumber || null,
        industries:         industries ?? [],
      })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
