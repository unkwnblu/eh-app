import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
// Query params:
//   role   — filter by role: candidate | employer | admin | moderator
//   status — filter by status: active | suspended
//   search — case-insensitive match on full_name or email

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const roleFilter   = searchParams.get("role")   ?? null;
  const statusFilter = searchParams.get("status") ?? null;
  const searchTerm   = searchParams.get("search") ?? null;

  const service = createServiceClient();

  // ── Primary query: profiles table ───────────────────────────────────────────
  let query = service
    .from("profiles")
    .select("id, email, full_name, role, status, permissions, created_at")
    .order("created_at", { ascending: false });

  if (roleFilter)   query = query.eq("role", roleFilter.toLowerCase());
  if (statusFilter) query = query.eq("status", statusFilter.toLowerCase());
  if (searchTerm) {
    query = query.or(
      `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    );
  }

  const { data: profiles, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Secondary query: auth.users for last_sign_in_at ─────────────────────────
  // Only needed for the login timestamps — fetch once and build a lookup map
  const { data: authData } = await service.auth.admin.listUsers({
    perPage: 1000,
  });
  const authMap = new Map(authData?.users.map((u) => [u.id, u]) ?? []);

  // ── Merge ────────────────────────────────────────────────────────────────────
  const users = (profiles ?? []).map((p) => {
    const authUser = authMap.get(p.id);
    // full_name: prefer profiles, fall back to auth display name, then email prefix
    const fullName =
      (p.full_name && p.full_name.trim() !== "")
        ? p.full_name
        : authUser?.user_metadata?.full_name
          ?? authUser?.email?.split("@")[0]
          ?? "Unknown";
    return {
      id: p.id,
      name: fullName,
      email: p.email ?? authUser?.email ?? "",
      role: capitalize(p.role ?? "candidate"),
      status: (p.status ?? "active") as "active" | "suspended",
      avatar: initials(fullName),
      lastLogin: authUser?.last_sign_in_at
        ? formatDate(authUser.last_sign_in_at)
        : "Never",
      lastLoginTime: authUser?.last_sign_in_at
        ? formatTime(authUser.last_sign_in_at)
        : "",
      permissions: p.permissions ?? [],
    };
  });

  return NextResponse.json({ users });
}

// ─── POST /api/admin/users ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, email, password, role } = body as {
    fullName: string;
    email: string;
    password: string;
    role: string;
  };

  if (!fullName || !email || !password || !role) {
    return NextResponse.json(
      { error: "fullName, email, password, and role are required." },
      { status: 400 }
    );
  }

  // Only admin staff roles can be created here
  const normalizedRole = role.toLowerCase();
  if (!["admin", "moderator"].includes(normalizedRole)) {
    return NextResponse.json(
      { error: "Only admin and moderator accounts can be created here." },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  // Create auth user with password so they can log in immediately
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role: normalizedRole },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Upsert profile (the DB trigger may have already created it)
  await service.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role: normalizedRole,
    status: "active",
    permissions: [],
  });

  return NextResponse.json(
    {
      user: {
        id: data.user.id,
        name: fullName,
        email,
        role: capitalize(normalizedRole),
        status: "active" as const,
        avatar: initials(fullName),
        lastLogin: "Never",
        lastLoginTime: "",
        permissions: [],
      },
    },
    { status: 201 }
  );
}
