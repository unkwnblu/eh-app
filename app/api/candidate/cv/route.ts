import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { setResubmissionIfActive } from "@/lib/supabase/setResubmission";

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// GET — return current CV filename + path
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidates")
    .select("cv_file_name, cv_file_path")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    fileName: data?.cv_file_name ?? "",
    filePath: data?.cv_file_path ?? "",
  });
}

// PUT — save metadata for a freshly uploaded CV (file is uploaded client-side)
export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { fileName, filePath } = await request.json() as {
    fileName?: string;
    filePath?: string;
  };

  if (!fileName || !filePath) {
    return NextResponse.json({ error: "fileName and filePath are required." }, { status: 400 });
  }

  const service = createServiceClient();

  // If there's an existing CV, remove the old object so we don't accumulate orphans
  const { data: existing } = await service
    .from("candidates")
    .select("cv_file_path")
    .eq("id", user.id)
    .single();

  if (existing?.cv_file_path && existing.cv_file_path !== filePath) {
    await service.storage.from("candidate-documents").remove([existing.cv_file_path]);
  }

  const { error } = await service
    .from("candidates")
    .update({ cv_file_name: fileName, cv_file_path: filePath })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await setResubmissionIfActive(user.id);

  return NextResponse.json({ success: true });
}

// DELETE — remove CV from storage + clear metadata
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data: existing } = await service
    .from("candidates")
    .select("cv_file_path")
    .eq("id", user.id)
    .single();

  if (existing?.cv_file_path) {
    await service.storage.from("candidate-documents").remove([existing.cv_file_path]);
  }

  const { error } = await service
    .from("candidates")
    .update({ cv_file_name: null, cv_file_path: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
