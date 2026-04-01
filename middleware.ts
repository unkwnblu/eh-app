import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validates the session (contacts Supabase auth server)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminDashboard = pathname.startsWith("/dashboard/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminLogin = pathname.startsWith("/auth/admin/login");
  const isCandidateDashboard = pathname.startsWith("/dashboard/candidate");
  const isCandidateLogin = pathname.startsWith("/auth/candidate/login");
  const isCandidatePending = pathname === "/auth/candidate/pending";

  const role = user?.app_metadata?.role as string | undefined;
  const isAdminOrModerator = role === "admin" || role === "moderator";

  // Routes that require full admin (not moderator)
  const isAdminOnly =
    pathname.startsWith("/dashboard/admin/users") ||
    pathname.startsWith("/dashboard/admin/settings") ||
    pathname.startsWith("/api/admin");

  // ── Admin / moderator route protection ────────────────────────────────────────
  if (isAdminDashboard || isAdminApi) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/admin/login", request.url));
    }
    if (!isAdminOrModerator) {
      return NextResponse.redirect(new URL("/auth/admin/login", request.url));
    }
    // Moderators cannot access user management, settings, or admin API
    if (role === "moderator" && isAdminOnly) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  // Redirect logged-in admin/moderator away from the admin login page
  if (isAdminLogin && user && isAdminOrModerator) {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }

  // ── Candidate route protection ────────────────────────────────────────────────
  if (isCandidateDashboard) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/candidate/login", request.url));
    }
    // Staff accounts should not access candidate dashboard
    if (isAdminOrModerator) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    // Block pending candidates from accessing the dashboard
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (profile?.status === "pending") {
      return NextResponse.redirect(new URL("/auth/candidate/pending", request.url));
    }
  }

  // Redirect authenticated candidates away from the login page
  if (isCandidateLogin && user && !isAdminOrModerator) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (profile?.status === "pending") {
      return NextResponse.redirect(new URL("/auth/candidate/pending", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/candidate", request.url));
  }

  // Redirect already-verified candidates away from the pending page
  if (isCandidatePending && user && !isAdminOrModerator) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (profile?.status === "active") {
      return NextResponse.redirect(new URL("/dashboard/candidate", request.url));
    }
  }

  // Unauthenticated users should not see the pending page
  if (isCandidatePending && !user) {
    return NextResponse.redirect(new URL("/auth/candidate/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/api/admin/:path*",
    "/auth/admin/:path*",
    "/dashboard/candidate/:path*",
    "/auth/candidate/login",
    "/auth/candidate/pending",
  ],
};
