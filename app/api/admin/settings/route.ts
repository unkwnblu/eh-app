import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── SQL migration (run once in Supabase SQL editor) ─────────────────────────
//
// CREATE TABLE IF NOT EXISTS platform_settings (
//   id                INTEGER      PRIMARY KEY DEFAULT 1,
//   platform_name     TEXT         NOT NULL DEFAULT 'Edge Harbour',
//   brand_color       TEXT         NOT NULL DEFAULT '#1275E2',
//   nav_style         TEXT         NOT NULL DEFAULT 'side',
//   two_factor        BOOLEAN      NOT NULL DEFAULT TRUE,
//   dbs_rule          BOOLEAN      NOT NULL DEFAULT TRUE,
//   gdpr_rule         BOOLEAN      NOT NULL DEFAULT TRUE,
//   rtw_rule          BOOLEAN      NOT NULL DEFAULT FALSE,
//   session_timeout   TEXT         NOT NULL DEFAULT '4 Hours',
//   password_rotation TEXT         NOT NULL DEFAULT '90 Days',
//   logo_url          TEXT,
//   updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
//   CONSTRAINT single_row CHECK (id = 1)
// );
//
// -- Seed defaults so GET always returns a row:
// INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  platform_name:     "Edge Harbour",
  brand_color:       "#1275E2",
  nav_style:         "side",
  two_factor:        true,
  dbs_rule:          true,
  gdpr_rule:         true,
  rtw_rule:          false,
  session_timeout:   "4 Hours",
  password_rotation: "90 Days",
  logo_url:          null as string | null,
} as const;

// ─── Allowed update fields ─────────────────────────────────────────────────────

const ALLOWED = new Set([
  "platform_name", "brand_color", "nav_style",
  "two_factor", "dbs_rule", "gdpr_rule", "rtw_rule",
  "session_timeout", "password_rotation", "logo_url",
]);

// ─── GET /api/admin/settings ──────────────────────────────────────────────────

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .single();

  // PGRST116 = no rows found — return defaults
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? { ...DEFAULTS, id: 1 });
}

// ─── PATCH /api/admin/settings ────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Whitelist: only allow known fields
  const patch: Record<string, unknown> = {
    id:         1,
    updated_at: new Date().toISOString(),
  };
  for (const [k, v] of Object.entries(body)) {
    if (ALLOWED.has(k)) patch[k] = v;
  }

  if (Object.keys(patch).length === 2) {
    // Only id + updated_at — nothing valid was sent
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("platform_settings")
    .upsert(patch, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, updated_at: patch.updated_at });
}
