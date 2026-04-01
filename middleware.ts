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

  const role = user?.app_metadata?.role as string | undefined;
  const isAdminOrModerator = role === "admin" || role === "moderator";

  // Routes that require full admin (not moderator)
  const isAdminOnly =
    pathname.startsWith("/dashboard/admin/users") ||
    pathname.startsWith("/dashboard/admin/settings") ||
    pathname.startsWith("/api/admin");

  // Protect admin routes — must be authenticated with admin or moderator role
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

  // Redirect logged-in admin/moderator away from the login page
  if (isAdminLogin && user && isAdminOrModerator) {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/api/admin/:path*",
    "/auth/admin/:path*",
  ],
};
