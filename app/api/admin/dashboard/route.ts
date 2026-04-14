import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────

export async function GET() {
  // Auth guard — admin or moderator only
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  // ── Run all queries in parallel ────────────────────────────────────────────
  const [
    activeJobsRes,
    pendingVerifRes,
    activeEmployersRes,
    totalCandidatesRes,
    verifQueueRes,
    moderationQueueRes,
    adminUsersRes,
  ] = await Promise.all([
    // 1. Active jobs count
    service.from("jobs").select("id", { count: "exact", head: true }).eq("status", "live"),

    // 2. Pending verifications count
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "candidate")
      .in("status", ["pending", "resubmission"]),

    // 3. Active employers count
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "employer")
      .eq("status", "active"),

    // 4. Total candidates count
    service
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "candidate"),

    // 5. Verification queue — latest 4 pending/resubmission candidates
    service
      .from("profiles")
      .select("id, full_name, status, created_at")
      .eq("role", "candidate")
      .in("status", ["pending", "resubmission"])
      .order("created_at", { ascending: false })
      .limit(4),

    // 6. Moderation queue — latest 4 review-status jobs with employer_id
    service
      .from("jobs")
      .select("id, title, employer_id, created_at")
      .eq("status", "review")
      .order("created_at", { ascending: false })
      .limit(4),

    // 7. Admin / moderator users
    service
      .from("profiles")
      .select("id, full_name, role, status, email")
      .in("role", ["admin", "moderator"])
      .order("created_at", { ascending: false }),
  ]);

  // ── Enrich verification queue with sector + doc counts ─────────────────────
  const verifIds = (verifQueueRes.data ?? []).map((p) => p.id);

  const [candidateRowsRes, legalCountsRes] = await Promise.all([
    verifIds.length > 0
      ? service.from("candidates").select("id, sector, cv_file_path, dbs_file_path").in("id", verifIds)
      : Promise.resolve({ data: [], error: null }),
    verifIds.length > 0
      ? service
          .from("candidate_legal_documents")
          .select("candidate_id")
          .in("candidate_id", verifIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const candidateMap = new Map((candidateRowsRes.data ?? []).map((c) => [c.id, c]));

  // Count legal docs per candidate
  const legalCountMap: Record<string, number> = {};
  for (const row of legalCountsRes.data ?? []) {
    legalCountMap[row.candidate_id] = (legalCountMap[row.candidate_id] ?? 0) + 1;
  }

  const verificationQueue = (verifQueueRes.data ?? []).map((p) => {
    const cand = candidateMap.get(p.id);
    // Count all uploaded docs: cv + dbs + legal
    let docCount = 0;
    if (cand?.cv_file_path)  docCount++;
    if (cand?.dbs_file_path) docCount++;
    docCount += legalCountMap[p.id] ?? 0;

    return {
      id:     p.id,
      name:   p.full_name ?? "Unknown",
      sector: cand?.sector ?? "—",
      files:  docCount,
      status: p.status,
    };
  });

  // ── Enrich moderation queue with employer company names ────────────────────
  const employerIds = [...new Set((moderationQueueRes.data ?? []).map((j) => j.employer_id))];
  const { data: employers } = employerIds.length > 0
    ? await service.from("employers").select("id, company_name").in("id", employerIds)
    : { data: [] };

  const empMap: Record<string, string> = {};
  for (const e of employers ?? []) empMap[e.id] = e.company_name ?? "Unknown Employer";

  const moderationQueue = (moderationQueueRes.data ?? []).map((j) => ({
    id:       j.id,
    title:    j.title,
    employer: empMap[j.employer_id] ?? "Unknown Employer",
    posted:   relativeTime(j.created_at),
  }));

  // ── Build admin users list ─────────────────────────────────────────────────
  const adminUsers = (adminUsersRes.data ?? []).map((u) => ({
    id:     u.id,
    name:   u.full_name ?? u.email ?? "Unknown",
    role:   u.role === "admin" ? "Administrator" : "Moderator",
    avatar: initials(u.full_name ?? u.email ?? "?"),
    status: (u.status ?? "active") as "active" | "suspended",
    email:  u.email ?? "",
  }));

  return NextResponse.json({
    stats: {
      activeJobs:            activeJobsRes.count    ?? 0,
      pendingVerifications:  pendingVerifRes.count   ?? 0,
      registeredEmployers:   activeEmployersRes.count ?? 0,
      totalCandidates:       totalCandidatesRes.count ?? 0,
    },
    verificationQueue,
    moderationQueue,
    adminUsers,
  });
}
