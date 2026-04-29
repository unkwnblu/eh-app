import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── GET — load the logged-in candidate's profile ────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const service = createServiceClient();

  // Fetch from candidates table
  const { data: candidate } = await service
    .from("candidates")
    .select("first_name, last_name, phone, nationality, sector, job_types, locations, document_type, document_number, document_expiry, cv_file_name, dbs_file_name, dbs_level, skills, bio")
    .eq("id", user.id)
    .single();

  // Fetch profile status + eh_id
  const { data: profile } = await service
    .from("profiles")
    .select("status, full_name, eh_id")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata as Record<string, string> | null;

  return NextResponse.json({
    fullName:      profile?.full_name ?? meta?.full_name ?? "",
    email:         user.email ?? "",
    phone:         candidate?.phone ?? "",
    bio:           candidate?.bio ?? meta?.bio ?? "",
    nationality:   candidate?.nationality ?? "",
    sector:        candidate?.sector ?? "",
    jobTypes:      candidate?.job_types ?? [],
    locations:     candidate?.locations ?? [],
    skills:         candidate?.skills ?? [],
    documentType:   candidate?.document_type ?? "",
    documentNumber: candidate?.document_number ?? "",
    documentExpiry: candidate?.document_expiry ?? "",
    cvFileName:     candidate?.cv_file_name ?? "",
    dbsFileName:    candidate?.dbs_file_name ?? "",
    dbsLevel:       candidate?.dbs_level ?? "",
    status:         profile?.status ?? "pending",
    ehId:           profile?.eh_id ?? null,
  });
}

// ─── PATCH — save profile changes ────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, phone, bio, skills } = body;

  const service = createServiceClient();
  const errors: string[] = [];

  // 1 — Update auth user_metadata (full_name + bio)
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      bio,
    },
  });
  if (metaError) errors.push(metaError.message);

  // 2 — Update profiles.full_name via trigger-sync, but also force it directly
  const { error: profileError } = await service
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileError) errors.push(profileError.message);

  // 3 — Update candidates table (phone, bio + skills)
  const { error: candidateError } = await service
    .from("candidates")
    .update({ phone, bio: bio ?? "", skills: skills ?? [] })
    .eq("id", user.id);
  if (candidateError) errors.push(candidateError.message);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
