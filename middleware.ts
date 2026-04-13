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
  const isEmployerDashboard = pathname.startsWith("/dashboard/employer");
  const isEmployerLogin = pathname.startsWith("/auth/employer/login");
  const isEmployerPending = pathname === "/auth/employer/pending";

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

  // Guard the candidate pending page — only actual candidates belong here
  if (isCandidatePending) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/candidate/login", request.url));
    }
    // Non-candidates get bounced to their own portal
    if (isAdminOrModerator) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "employer") {
      return NextResponse.redirect(new URL("/auth/employer/pending", request.url));
    }
    // Verified candidates don't need the pending page
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (profile?.status === "active") {
      return NextResponse.redirect(new URL("/dashboard/candidate", request.url));
    }
  }

  // ── Employer route protection ─────────────────────────────────────────────────
  if (isEmployerDashboard) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/employer/login", request.url));
    }
    // Only employer accounts can access the employer dashboard
    if (role !== "employer") {
      return NextResponse.redirect(new URL("/auth/employer/login", request.url));
    }
    // Block pending/resubmission employers from accessing the dashboard
    const { data: empProfile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (empProfile?.status === "pending" || empProfile?.status === "resubmission") {
      return NextResponse.redirect(new URL("/auth/employer/pending", request.url));
    }
  }

  // Redirect authenticated employers away from the login page
  if (isEmployerLogin && user && role === "employer") {
    const { data: empProfile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (empProfile?.status === "pending" || empProfile?.status === "resubmission") {
      return NextResponse.redirect(new URL("/auth/employer/pending", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/employer", request.url));
  }

  // Guard the employer pending page — only actual employers belong here
  if (isEmployerPending) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/employer/login", request.url));
    }
    // Non-employers get bounced to their own portal
    if (isAdminOrModerator) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "candidate") {
      return NextResponse.redirect(new URL("/auth/candidate/pending", request.url));
    }
    // Active employers don't need the pending page
    const { data: empProfile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (empProfile?.status === "active") {
      return NextResponse.redirect(new URL("/dashboard/employer", request.url));
    }
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
    "/dashboard/employer/:path*",
    "/auth/employer/login",
    "/auth/employer/pending",
  ],
};
