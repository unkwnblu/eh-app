import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") return null;
  return user;
}

// ─── PATCH ────────────────────────────────────────────────────────────────────
// Two shapes:
//   { action: "approve" | "flag" | "reject" | "reset" }  → update status
//   { liveSalaryMin: number|null, liveSalaryMax: number|null }  → set live pricing

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const service = createServiceClient();

  // ── Live pricing update ──────────────────────────────────────────────────────
  if ("liveSalaryMin" in body || "liveSalaryMax" in body) {
    const min = body.liveSalaryMin != null ? Number(body.liveSalaryMin) : null;
    const max = body.liveSalaryMax != null ? Number(body.liveSalaryMax) : null;

    if (min !== null && max !== null && min > max) {
      return NextResponse.json({ error: "Minimum salary cannot exceed maximum." }, { status: 400 });
    }

    const { error } = await service
      .from("jobs")
      .update({
        live_salary_min: min,
        live_salary_max: max,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, liveSalaryMin: min, liveSalaryMax: max });
  }

  // ── Status action ────────────────────────────────────────────────────────────
  const actionToStatus: Record<string, string> = {
    approve: "live",
    flag:    "flagged",
    reject:  "rejected",
    reset:   "review",
  };

  const newStatus = actionToStatus[body.action as string];
  if (!newStatus) {
    return NextResponse.json(
      { error: "Invalid action. Use: approve | flag | reject | reset" },
      { status: 400 }
    );
  }

  const { error } = await service
    .from("jobs")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, status: newStatus });
}
