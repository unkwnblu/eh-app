import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { setResubmissionIfActive } from "@/lib/supabase/setResubmission";

const VALID_LEVELS = ["None", "Basic", "Standard", "Enhanced", "Enhanced with Barred Lists"];

async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// GET — return current DBS level + filename + path
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidates")
    .select("dbs_level, dbs_file_name, dbs_file_path")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    level:    data?.dbs_level     ?? "",
    fileName: data?.dbs_file_name ?? "",
    filePath: data?.dbs_file_path ?? "",
  });
}

// PUT — save DBS level and (optionally) freshly uploaded file metadata
export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { level, fileName, filePath } = await request.json() as {
    level?:    string;
    fileName?: string;
    filePath?: string;
  };

  if (level && !VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid DBS level." }, { status: 400 });
  }

  const service = createServiceClient();

  // If a new file path is provided, remove the old object so we don't accumulate orphans
  if (filePath) {
    const { data: existing } = await service
      .from("candidates")
      .select("dbs_file_path")
      .eq("id", user.id)
      .single();
    if (existing?.dbs_file_path && existing.dbs_file_path !== filePath) {
      await service.storage.from("candidate-documents").remove([existing.dbs_file_path]);
    }
  }

  const update: Record<string, string | null> = {};
  if (level !== undefined)    update.dbs_level     = level || null;
  if (fileName !== undefined) update.dbs_file_name = fileName || null;
  if (filePath !== undefined) update.dbs_file_path = filePath || null;

  const { error } = await service
    .from("candidates")
    .update(update)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // A new file upload (not just a level change) requires re-verification
  if (filePath) await setResubmissionIfActive(user.id);

  return NextResponse.json({ success: true });
}

// DELETE — remove the DBS file (keeps the level)
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data: existing } = await service
    .from("candidates")
    .select("dbs_file_path")
    .eq("id", user.id)
    .single();

  if (existing?.dbs_file_path) {
    await service.storage.from("candidate-documents").remove([existing.dbs_file_path]);
  }

  const { error } = await service
    .from("candidates")
    .update({ dbs_file_name: null, dbs_file_path: null })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
