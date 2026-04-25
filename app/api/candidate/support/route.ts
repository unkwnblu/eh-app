import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── POST /api/candidate/support ─────────────────────────────────────────────
// Body: { subject: string; message: string }

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: { subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Fetch candidate name for context
  const { data: profile } = await service
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { error } = await service
    .from("support_messages")
    .insert({
      candidate_id: user.id,
      candidate_name: profile?.full_name ?? null,
      candidate_email: profile?.email ?? user.email,
      subject,
      message,
      status: "open",
    });

  if (error) {
    console.error("[support] insert error:", error.message);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
