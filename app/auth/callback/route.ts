import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles email confirmation and password-reset links from Supabase.
// Supabase sends the user here with ?code=<pkce_code>&type=<event_type>
// We exchange the code for a session then redirect appropriately.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "signup" | "recovery" | "magiclink" etc.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset — send to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/candidate/reset-password`);
      }
      // Email confirmation — send to candidate dashboard
      return NextResponse.redirect(`${origin}/dashboard/candidate`);
    }
  }

  // Something went wrong — send to a generic error or login page
  return NextResponse.redirect(`${origin}${next}`);
}
