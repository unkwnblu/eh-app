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

// GET — load the candidate's current share code
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("candidates")
    .select("share_code, share_code_expiry")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    shareCode:   data?.share_code   ?? "",
    expiryDate:  data?.share_code_expiry ?? "",
  });
}

// PUT — save / update the share code
export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { shareCode, expiryDate } = await request.json() as {
    shareCode?: string;
    expiryDate?: string;
  };

  const trimmed = (shareCode ?? "").trim().toUpperCase();
  if (trimmed && !/^[A-Z0-9]{9}$/.test(trimmed)) {
    return NextResponse.json(
      { error: "Share code must be 9 alphanumeric characters." },
      { status: 400 },
    );
  }

  if (expiryDate) {
    const expiry = new Date(expiryDate);
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry <= today) {
      return NextResponse.json(
        { error: "Share code expiry date must be in the future." },
        { status: 400 },
      );
    }
  }

  const service = createServiceClient();
  const { error } = await service
    .from("candidates")
    .update({
      share_code:        trimmed || null,
      share_code_expiry: expiryDate || null,
    })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await setResubmissionIfActive(user.id);

  return NextResponse.json({ success: true });
}
