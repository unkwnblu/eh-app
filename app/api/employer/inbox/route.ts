import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  === 1) return "1d ago";
  return `${days}d ago`;
}

// ─── GET /api/employer/inbox ───────────────────────────────────────────────────
// Derives live notification items from DB events relevant to this employer.

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.role !== "employer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const service = createServiceClient();

  // Get employer's job IDs first (needed for filtering applications & shifts)
  const { data: jobRows } = await service
    .from("jobs")
    .select("id, title")
    .eq("employer_id", user.id);

  const jobs    = jobRows ?? [];
  const jobIds  = jobs.map((j) => j.id as string);
  const jobMap  = Object.fromEntries(jobs.map((j) => [j.id as string, j.title as string]));

  type InboxItem = {
    id:    string;
    type:  "application" | "compliance" | "system" | "shift";
    title: string;
    body:  string;
    time:  string;
    read:  false;
  };

  const items: InboxItem[] = [];

  if (jobIds.length === 0) {
    return NextResponse.json({ items, profile: null });
  }

  // ── Parallel queries ────────────────────────────────────────────────────────
  const oneDayAgo   = new Date(Date.now() - 86_400_000).toISOString();
  const threeDayAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
  const sevenDayAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    recentAppsRes,
    acceptedAppsRes,
    interviewAppsRes,
    recentLiveJobsRes,
    confirmedShiftsRes,
  ] = await Promise.all([
    // New applications in last 24h
    service
      .from("job_applications")
      .select("id, job_id, candidate_id, stage, applied_at")
      .in("job_id", jobIds)
      .eq("stage", "new")
      .gte("applied_at", oneDayAgo)
      .order("applied_at", { ascending: false })
      .limit(10),

    // Offers accepted in last 3 days
    service
      .from("job_applications")
      .select("id, job_id, candidate_id, applied_at")
      .in("job_id", jobIds)
      .eq("stage", "accepted")
      .gte("applied_at", threeDayAgo)
      .order("applied_at", { ascending: false })
      .limit(10),

    // Candidates currently at interview stage
    service
      .from("job_applications")
      .select("id, job_id, candidate_id, applied_at")
      .in("job_id", jobIds)
      .eq("stage", "interviewing")
      .order("applied_at", { ascending: false })
      .limit(20),

    // Jobs that went live in last 7 days
    service
      .from("jobs")
      .select("id, title, created_at")
      .eq("employer_id", user.id)
      .eq("status", "live")
      .gte("created_at", sevenDayAgo)
      .order("created_at", { ascending: false })
      .limit(5),

    // Shift assignments confirmed in last 3 days
    service
      .from("shift_assignments")
      .select("id, shift_id, candidate_id, assigned_at")
      .eq("status", "confirmed")
      .gte("assigned_at", threeDayAgo)
      .order("assigned_at", { ascending: false })
      .limit(10),
  ]);

  const recentApps     = recentAppsRes.data     ?? [];
  const acceptedApps   = acceptedAppsRes.data   ?? [];
  const interviewApps  = interviewAppsRes.data  ?? [];
  const recentLiveJobs = recentLiveJobsRes.data ?? [];
  const confirmedShifts = confirmedShiftsRes.data ?? [];

  // Collect candidate IDs we need names for
  const candidateIds = [
    ...new Set([
      ...recentApps.map((a) => a.candidate_id as string),
      ...acceptedApps.map((a) => a.candidate_id as string),
      ...confirmedShifts.map((a) => a.candidate_id as string),
    ]),
  ];

  const profileMap: Record<string, string> = {};
  if (candidateIds.length > 0) {
    const { data: profiles } = await service
      .from("profiles")
      .select("id, full_name")
      .in("id", candidateIds);
    for (const p of profiles ?? []) {
      profileMap[p.id as string] = (p.full_name as string) || "A candidate";
    }
  }

  // Resolve shift → job title for confirmed shifts
  const shiftIds = confirmedShifts.map((s) => s.shift_id as string);
  const shiftJobMap: Record<string, string> = {};
  if (shiftIds.length > 0) {
    const { data: shiftRows } = await service
      .from("shifts")
      .select("id, job_id")
      .in("id", shiftIds);
    for (const s of shiftRows ?? []) {
      shiftJobMap[s.id as string] = jobMap[s.job_id as string] ?? "a shift";
    }
  }

  // ── Build notification items ────────────────────────────────────────────────

  // 1. New applications
  if (recentApps.length > 0) {
    const count   = recentApps.length;
    const newest  = recentApps[0];
    const name    = profileMap[newest.candidate_id as string] ?? "A candidate";
    const jobTitle = jobMap[newest.job_id as string] ?? "one of your roles";
    items.push({
      id:    `new-apps-${count}-${newest.applied_at}`,
      type:  "application",
      title: count === 1
        ? `New application from ${name}`
        : `${count} new applications today`,
      body: count === 1
        ? `${name} applied for ${jobTitle}.`
        : `${count} candidates applied to your roles in the last 24 hours.`,
      time:  relativeTime(newest.applied_at as string),
      read:  false,
    });
  }

  // 2. Accepted offers
  if (acceptedApps.length > 0) {
    const count  = acceptedApps.length;
    const newest = acceptedApps[0];
    const name   = profileMap[newest.candidate_id as string] ?? "A candidate";
    const jobTitle = jobMap[newest.job_id as string] ?? "one of your roles";
    items.push({
      id:    `accepted-${count}-${newest.applied_at}`,
      type:  "application",
      title: count === 1
        ? `${name} accepted your offer`
        : `${count} candidates accepted offers`,
      body: count === 1
        ? `${name} has accepted the offer for ${jobTitle}.`
        : `${count} offer acceptances in the last 3 days.`,
      time:  relativeTime(newest.applied_at as string),
      read:  false,
    });
  }

  // 3. Interviews in progress (aggregate)
  if (interviewApps.length > 0) {
    const count = interviewApps.length;
    items.push({
      id:    `interviews-${count}`,
      type:  "application",
      title: `${count} candidate${count !== 1 ? "s" : ""} at interview stage`,
      body:  `${count} active interview${count !== 1 ? "s" : ""} across your job listings.`,
      time:  relativeTime(interviewApps[0].applied_at as string),
      read:  false,
    });
  }

  // 4. Jobs that just went live
  for (const job of recentLiveJobs.slice(0, 2)) {
    items.push({
      id:    `job-live-${job.id}`,
      type:  "system",
      title: `"${job.title}" is now live`,
      body:  "Your job listing has been approved and is now accepting applications.",
      time:  relativeTime(job.created_at as string),
      read:  false,
    });
  }

  // 5. Confirmed shift assignments
  if (confirmedShifts.length > 0) {
    const count  = confirmedShifts.length;
    const newest = confirmedShifts[0];
    const name   = profileMap[newest.candidate_id as string] ?? "A candidate";
    const title  = shiftJobMap[newest.shift_id as string] ?? "a shift";
    items.push({
      id:    `shifts-confirmed-${count}-${newest.assigned_at}`,
      type:  "shift",
      title: count === 1
        ? `${name} confirmed their shift`
        : `${count} shift confirmations`,
      body: count === 1
        ? `${name} confirmed availability for ${title}.`
        : `${count} candidates confirmed shifts in the last 3 days.`,
      time:  relativeTime(newest.assigned_at as string),
      read:  false,
    });
  }

  // Nothing at all
  if (items.length === 0) {
    items.push({
      id:    "all-quiet",
      type:  "system",
      title: "No new activity",
      body:  "New applications, offers and shift updates will appear here.",
      time:  "now",
      read:  false,
    });
  }

  return NextResponse.json({ items });
}
