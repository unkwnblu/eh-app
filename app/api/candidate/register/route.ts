import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "candidate-documents";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadFile(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  category: "cv" | "dbs" | "legal" | "passport" | "visa",
  file: File,
) {
  const path = `${userId}/registration/${category}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(`Failed to upload ${category}: ${error.message}`);
  return path;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "Missing payload." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    nationality,
    documentType,
    documentNumber,
    documentExpiry,
    shareCode,
    sector,
    jobTypes,
    locations,
    cvFileName,
    dbsLevel,
    dbsFileName,
  } = body as Record<string, string | string[] | undefined>;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const cvFile       = formData.get("cvFile");
  const dbsFile      = formData.get("dbsFile");
  const passportFile = formData.get("passportFile");
  const visaFile     = formData.get("visaFile");

  const supabase = createServiceClient();

  // 1 — Create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email as string,
    password: password as string,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;
  const uploadedPaths: string[] = [];

  // Helper to roll back everything if anything below fails
  const rollback = async (msg: string, status = 500) => {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    }
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: msg }, { status });
  };

  // 2 — Upload files (if provided)
  let cvPath:       string | null = null;
  let dbsPath:      string | null = null;
  let passportPath: string | null = null;
  let visaPath:     string | null = null;

  try {
    if (cvFile instanceof File && cvFile.size > 0) {
      cvPath = await uploadFile(supabase, userId, "cv", cvFile);
      uploadedPaths.push(cvPath);
    }
    if (dbsFile instanceof File && dbsFile.size > 0) {
      dbsPath = await uploadFile(supabase, userId, "dbs", dbsFile);
      uploadedPaths.push(dbsPath);
    }
    if (passportFile instanceof File && passportFile.size > 0) {
      passportPath = await uploadFile(supabase, userId, "passport", passportFile);
      uploadedPaths.push(passportPath);
    }
    if (visaFile instanceof File && visaFile.size > 0) {
      visaPath = await uploadFile(supabase, userId, "visa", visaFile);
      uploadedPaths.push(visaPath);
    }
  } catch (err) {
    return rollback(err instanceof Error ? err.message : "Upload failed");
  }

  // 3 — Insert full candidate record
  const { error: candidateError } = await supabase.from("candidates").insert({
    id: userId,
    email,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    phone: phone ?? null,
    date_of_birth: dateOfBirth || null,
    gender: gender ?? null,
    nationality: nationality ?? null,
    document_type: documentType ?? null,
    document_number: documentNumber ?? null,
    document_expiry: documentExpiry || null,
    share_code: typeof shareCode === "string" && shareCode.trim() ? shareCode.trim().toUpperCase() : null,
    share_code_expiry: documentType === "Share Code (eVisa)" && documentExpiry ? documentExpiry : null,
    sector: sector ?? null,
    job_types: jobTypes ?? [],
    locations: locations ?? [],
    cv_file_name: cvFileName ?? null,
    cv_file_path: cvPath,
    dbs_level: dbsLevel ?? null,
    dbs_file_name: dbsFileName ?? null,
    dbs_file_path: dbsPath,
    consent_privacy: true,
    consent_terms: true,
  });

  if (candidateError) {
    return rollback(candidateError.message);
  }

  // 4 — Insert any RTW file uploads into candidate_legal_documents
  const legalRows: Array<Record<string, unknown>> = [];

  if (passportPath && passportFile instanceof File) {
    legalRows.push({
      candidate_id: userId,
      doc_type: "passport",
      label: documentType === "UK Passport" ? "UK Passport" : "Passport",
      file_name: passportFile.name,
      file_path: passportPath,
      expiry_date: null,
    });
  }
  if (visaPath && visaFile instanceof File) {
    const isBrp = documentType === "Biometric Residence Permit (BRP)";
    legalRows.push({
      candidate_id: userId,
      doc_type: isBrp ? "brp" : "ukvi_visa",
      label: isBrp ? "Biometric Residence Permit" : "Visa",
      file_name: visaFile.name,
      file_path: visaPath,
      expiry_date: documentExpiry || null,
    });
  }

  if (legalRows.length > 0) {
    const { error: legalError } = await supabase
      .from("candidate_legal_documents")
      .insert(legalRows);
    if (legalError) {
      // Non-fatal — file is in storage and candidate row exists. Log + continue.
      console.error("Failed to insert candidate_legal_documents rows:", legalError);
    }
  }

  // 5 — Set profile status to pending until an admin verifies the account.
  await supabase
    .from("profiles")
    .update({ status: "pending" })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
