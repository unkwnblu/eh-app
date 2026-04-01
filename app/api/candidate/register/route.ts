import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    nationality,
    documentType,
    documentNumber,
    documentExpiry,
    sector,
    jobTypes,
    locations,
    cvFileName,
    dbsLevel,
    dbsFileName,
  } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // 1 — Create the auth user (email_confirm: true skips the confirmation email
  //     so the candidate can log in immediately; set to false if you want email verification)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // 2 — Insert full candidate record (profiles row is already created by the DB trigger)
  const { error: candidateError } = await supabase.from("candidates").insert({
    id: userId,
    email,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    phone: phone ?? null,
    date_of_birth: dateOfBirth || null,
    nationality: nationality ?? null,
    document_type: documentType ?? null,
    document_number: documentNumber ?? null,
    document_expiry: documentExpiry || null,
    sector: sector ?? null,
    job_types: jobTypes ?? [],
    locations: locations ?? [],
    cv_file_name: cvFileName ?? null,
    dbs_level: dbsLevel ?? null,
    dbs_file_name: dbsFileName ?? null,
    consent_privacy: true,
    consent_terms: true,
  });

  if (candidateError) {
    // Roll back the auth user so they aren't left in a broken state
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: candidateError.message }, { status: 500 });
  }

  // 3 — Set profile status to pending until an admin verifies the account.
  //     The trigger creates the profile with status='active' by default, so we override it.
  await supabase
    .from("profiles")
    .update({ status: "pending" })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
