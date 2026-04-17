import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return "1d ago";
  return `${days}d ago`;
}

// ─── GET /api/admin/inbox ──────────────────────────────────────────────────────
// Derives live platform-event notifications from DB state.
// Returns items sorted newest-first, each with a stable deterministic ID so the
// client can persist read state in localStorage.

export async function GET() {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  const role = user?.app_metadata?.role;
  if (!user || (role !== "admin" && role !== "moderator")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();

  // ── Run all queries in parallel ────────────────────────────────────────────
  const [
    pendingCandidatesRes,
    resubmissionCandidatesRes,
    pendingEmployersRes,
    pendingJobsRes,
    recentCandidatesRes,
    recentEmployersRes,
  ] = await Promise.all([
    // Candidates awaiting first review
    service
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "candidate")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),

    // Candidates who resubmitted docs
    service
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "candidate")
      .eq("status", "resubmission")
      .order("created_at", { ascending: false })
      .limit(50),

    // Employers awaiting verification
    service
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "employer")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),

    // Jobs pending moderation
    service
      .from("jobs")
      .select("id, title, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),

    // Recently verified candidates (last 5)
    service
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "candidate")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),

    // Recently verified employers (last 5)
    service
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "employer")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingCandidates     = pendingCandidatesRes.data     ?? [];
  const resubCandidates       = resubmissionCandidatesRes.data ?? [];
  const pendingEmployers      = pendingEmployersRes.data       ?? [];
  const pendingJobs           = pendingJobsRes.data            ?? [];
  const recentCandidates      = recentCandidatesRes.data       ?? [];
  const recentEmployers       = recentEmployersRes.data        ?? [];

  type InboxItem = {
    id:    string;
    type:  "verification" | "moderation" | "user" | "system";
    title: string;
    body:  string;
    time:  string;
    href:  string;
    read:  false;   // always false from server — client layers localStorage on top
  };

  const items: InboxItem[] = [];

  // ── Pending candidate verifications ───────────────────────────────────────
  if (pendingCandidates.length > 0) {
    const newest = pendingCandidates[0];
    const count  = pendingCandidates.length;
    items.push({
      id:    `pending-candidates-${count}`,
      type:  "verification",
      title: count === 1
        ? `${newest.full_name ?? "A candidate"} awaiting verification`
        : `${count} candidates awaiting verification`,
      body:  count === 1
        ? "Their profile and documents are ready for review."
        : `${count} new verification submissions require your attention.`,
      time:  relativeTime(newest.created_at as string),
      href:  "/dashboard/admin/verification",
      read:  false,
    });
  }

  // ── Resubmission candidates ───────────────────────────────────────────────
  if (resubCandidates.length > 0) {
    const newest = resubCandidates[0];
    const count  = resubCandidates.length;
    items.push({
      id:    `resubmission-candidates-${count}`,
      type:  "verification",
      title: count === 1
        ? `${newest.full_name ?? "A candidate"} resubmitted documents`
        : `${count} candidates resubmitted documents`,
      body:  "Re-review required — updated documents are ready for inspection.",
      time:  relativeTime(newest.created_at as string),
      href:  "/dashboard/admin/verification",
      read:  false,
    });
  }

  // ── Pending employer verifications ────────────────────────────────────────
  if (pendingEmployers.length > 0) {
    const newest = pendingEmployers[0];
    const count  = pendingEmployers.length;
    items.push({
      id:    `pending-employers-${count}`,
      type:  "verification",
      title: count === 1
        ? `${newest.full_name ?? "An employer"} awaiting verification`
        : `${count} employers awaiting verification`,
      body:  count === 1
        ? "Their company registration details are ready for review."
        : `${count} employer registration submissions need attention.`,
      time:  relativeTime(newest.created_at as string),
      href:  "/dashboard/admin/employer-verification",
      read:  false,
    });
  }

  // ── Jobs pending moderation ───────────────────────────────────────────────
  if (pendingJobs.length > 0) {
    const newest = pendingJobs[0];
    const count  = pendingJobs.length;
    items.push({
      id:    `pending-jobs-${count}`,
      type:  "moderation",
      title: count === 1
        ? `"${newest.title}" pending moderation`
        : `${count} jobs pending moderation`,
      body:  count === 1
        ? "A new job listing has been submitted for review."
        : `${count} job listings are waiting for moderation approval.`,
      time:  relativeTime(newest.created_at as string),
      href:  "/dashboard/admin/moderation",
      read:  false,
    });
  }

  // ── Recently verified candidates (activity feed style) ────────────────────
  for (const c of recentCandidates.slice(0, 2)) {
    items.push({
      id:    `verified-candidate-${c.id}`,
      type:  "user",
      title: `${c.full_name ?? "Candidate"} verified`,
      body:  "Account activated — candidate can now apply to jobs.",
      time:  relativeTime(c.created_at as string),
      href:  "/dashboard/admin/verification",
      read:  false,
    });
  }

  // ── Recently verified employers ───────────────────────────────────────────
  for (const e of recentEmployers.slice(0, 2)) {
    items.push({
      id:    `verified-employer-${e.id}`,
      type:  "user",
      title: `${e.full_name ?? "Employer"} account activated`,
      body:  "Employer is now active and can post jobs.",
      time:  relativeTime(e.created_at as string),
      href:  "/dashboard/admin/employer-verification",
      read:  false,
    });
  }

  // No activity at all
  if (items.length === 0) {
    items.push({
      id:    "all-clear",
      type:  "system",
      title: "All clear",
      body:  "No pending verifications or moderation items.",
      time:  "now",
      href:  "/dashboard/admin",
      read:  false,
    });
  }

  return NextResponse.json({ items });
}
