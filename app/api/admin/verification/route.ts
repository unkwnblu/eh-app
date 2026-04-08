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
  if (profileStatus === "active")        return "verified";
  if (profileStatus === "suspended")     return "flagged";
  if (profileStatus === "resubmission")  return "resubmission";
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
    .select("id, sector, document_type, document_number, document_expiry, share_code, share_code_expiry, cv_file_name, cv_file_path, dbs_file_name, dbs_file_path, dbs_level, created_at, verified_docs")
    .in("id", ids);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }

  const candidateMap = new Map((candidateRows ?? []).map((c) => [c.id, c]));

  // Fetch all legal documents for these candidates so admins can verify RTW uploads
  const { data: legalRows } = await supabase
    .from("candidate_legal_documents")
    .select("id, candidate_id, doc_type, label, file_name, file_path")
    .in("candidate_id", ids);

  const legalByCandidate = new Map<string, typeof legalRows>();
  for (const row of legalRows ?? []) {
    const list = legalByCandidate.get(row.candidate_id) ?? [];
    list.push(row);
    legalByCandidate.set(row.candidate_id, list);
  }

  // Sign URLs in batch — collect every path first, sign once
  const signUrl = async (path: string | null | undefined): Promise<string | undefined> => {
    if (!path) return undefined;
    const { data } = await supabase.storage
      .from("candidate-documents")
      .createSignedUrl(path, 60 * 30); // 30 minutes
    return data?.signedUrl;
  };

  const candidates = await Promise.all(profiles.map(async (p) => {
    const c = candidateMap.get(p.id);

    // Build documents list from what was submitted
    const vd: Record<string, boolean> = (c?.verified_docs as Record<string, boolean> | null) ?? {};
    const docs: { key: string; name: string; type: string; verified: boolean; url?: string; meta?: { code: string; expiry?: string } }[] = [];
    const candidateLegalDocs = legalByCandidate.get(p.id) ?? [];

    // Share code — stored directly on the candidate row
    if (c?.share_code) {
      docs.push({
        key: "share_code",
        name: "Share Code (eVisa)",
        type: "Share Code (eVisa)",
        verified: vd["share_code"] ?? false,
        meta: { code: c.share_code, expiry: c.share_code_expiry ?? undefined },
      });
    }

    // Non-file RTW metadata row (e.g. BRP number with no upload yet)
    const isFileBasedRtw =
      c?.document_type &&
      c.document_type !== "Share Code (eVisa)" &&
      candidateLegalDocs.some((l) =>
        ["passport", "brp", "ukvi_visa"].includes(l.doc_type),
      );

    if (c?.document_type && c.document_type !== "Share Code (eVisa)" && !isFileBasedRtw) {
      const docName = c.document_number
        ? `${c.document_type} — ${c.document_number}`
        : c.document_type;
      docs.push({ key: "doc_meta", name: docName, type: c.document_type, verified: vd["doc_meta"] ?? false });
    }

    if (c?.cv_file_name) {
      docs.push({
        key: "cv",
        name: c.cv_file_name,
        type: "CV / Resume",
        verified: vd["cv"] ?? false,
        url: await signUrl(c.cv_file_path),
      });
    }
    if (c?.dbs_file_name) {
      docs.push({
        key: "dbs",
        name: c.dbs_file_name,
        type: `DBS Certificate${c.dbs_level && c.dbs_level !== "None" ? ` (${c.dbs_level})` : ""}`,
        verified: vd["dbs"] ?? false,
        url: await signUrl(c.dbs_file_path),
      });
    }
    for (const legal of candidateLegalDocs) {
      const key = `legal_${legal.id}`;
      docs.push({
        key,
        name: legal.file_name,
        type: legal.label || legal.doc_type || "Legal Document",
        verified: vd[key] ?? false,
        url: await signUrl(legal.file_path),
      });
    }
    if (docs.length === 0) {
      docs.push({ key: "none", name: "No documents submitted", type: "—", verified: false });
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
  }));

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

  const body = await request.json() as {
    id: string;
    action: "approve" | "reject" | "request_info" | "toggle_doc";
    note?: string;
    docKey?: string;
    verified?: boolean;
  };

  const { id, action } = body;

  if (!id || !["approve", "reject", "request_info", "toggle_doc"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Toggle a single document's verified state ─────────────────────────────
  if (action === "toggle_doc") {
    const { docKey, verified } = body;
    if (!docKey || typeof verified !== "boolean") {
      return NextResponse.json({ error: "Missing docKey or verified" }, { status: 400 });
    }

    // Fetch current verified_docs, merge, and save
    const { data: candidate } = await supabase
      .from("candidates")
      .select("verified_docs")
      .eq("id", id)
      .single();

    const current: Record<string, boolean> = (candidate?.verified_docs as Record<string, boolean> | null) ?? {};
    const updated = { ...current, [docKey]: verified };

    const { error } = await supabase
      .from("candidates")
      .update({ verified_docs: updated })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ── Approve / reject / request_info ──────────────────────────────────────
  const newStatus =
    action === "approve"      ? "active"       :
    action === "reject"       ? "suspended"    :
    /* request_info */          "resubmission";

  const updatePayload: Record<string, string | null> = { status: newStatus };
  if (action === "request_info") {
    updatePayload.resubmission_note = body.note?.trim() || null;
  } else {
    updatePayload.resubmission_note = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
