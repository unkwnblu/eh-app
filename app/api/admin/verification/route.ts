import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function docIconFromType(documentType: string | null): "passport" | "id" | "license" | "medical" {
  const t = (documentType ?? "").toLowerCase();
  if (t.includes("passport"))    return "passport";
  if (t.includes("license"))     return "license";
  if (t.includes("medical"))     return "medical";
  return "id";
}

function mapStatus(profileStatus: string): "pending" | "flagged" | "resubmission" | "verified" {
  if (profileStatus === "active")    return "verified";
  if (profileStatus === "suspended") return "flagged";
  return "pending";
}

// ─── GET — fetch all candidates for verification ──────────────────────────────

export async function GET(request: NextRequest) {
  // Verify caller is admin or moderator
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  // Fetch all candidate profiles joined with their candidates record
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, status, created_at")
    .eq("role", "candidate")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ candidates: [] });
  }

  const ids = profiles.map((p) => p.id);

  const { data: candidateRows, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, sector, document_type, document_number, document_expiry, cv_file_name, dbs_file_name, dbs_level, created_at")
    .in("id", ids);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }

  const candidateMap = new Map((candidateRows ?? []).map((c) => [c.id, c]));

  const candidates = profiles.map((p) => {
    const c = candidateMap.get(p.id);

    // Build documents list from what was submitted
    const docs: { name: string; type: string; verified: boolean }[] = [];
    if (c?.document_type) {
      docs.push({
        name: c.document_number
          ? `${c.document_type} — ${c.document_number}`
          : c.document_type,
        type: c.document_type,
        verified: false,
      });
    }
    if (c?.cv_file_name) {
      docs.push({ name: c.cv_file_name, type: "CV / Resume", verified: false });
    }
    if (c?.dbs_file_name) {
      docs.push({
        name: c.dbs_file_name,
        type: `DBS Certificate${c.dbs_level && c.dbs_level !== "None" ? ` (${c.dbs_level})` : ""}`,
        verified: false,
      });
    }
    if (docs.length === 0) {
      docs.push({ name: "No documents submitted", type: "—", verified: false });
    }

    const createdAt = c?.created_at ?? p.created_at;

    return {
      id:               p.id,
      name:             p.full_name ?? "Unknown",
      sector:           c?.sector   ?? "—",
      joined:           relativeTime(p.created_at),
      status:           mapStatus(p.status),
      docType:          c?.document_type ?? "—",
      docIcon:          docIconFromType(c?.document_type ?? null),
      submissionDate:   formatDate(createdAt),
      docs,
    };
  });

  return NextResponse.json({ candidates });
}

// ─── PATCH — approve or reject a candidate ────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, action } = await request.json() as { id: string; action: "approve" | "reject" };

  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const newStatus = action === "approve" ? "active" : "suspended";

  const { error } = await supabase
    .from("profiles")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
