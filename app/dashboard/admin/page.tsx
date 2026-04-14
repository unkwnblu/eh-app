"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
  activeJobs:           number;
  pendingVerifications: number;
  registeredEmployers:  number;
  totalCandidates:      number;
}

interface VerifQueueRow {
  id:     string;
  name:   string;
  sector: string;
  files:  number;
  status: string;
}

interface ModerationRow {
  id:       string;
  title:    string;
  employer: string;
  posted:   string;
}

interface AdminUser {
  id:     string;
  name:   string;
  role:   string;
  avatar: string;
  status: "active" | "suspended";
  email:  string;
}

interface DashboardData {
  stats:             DashboardStats;
  verificationQueue: VerifQueueRow[];
  moderationQueue:   ModerationRow[];
  adminUsers:        AdminUser[];
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, badge, badgeVariant, trend, loading,
}: {
  label:          string;
  value:          string | number;
  badge?:         string;
  badgeVariant?:  "urgent" | "live" | "positive";
  trend?:         string;
  loading?:       boolean;
}) {
  const badgeStyles = {
    urgent:   "bg-amber-100 text-amber-700",
    live:     "bg-green-100 text-green-700",
    positive: "bg-blue-50 text-brand-blue",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5" data-gsap="fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        {badge && badgeVariant && (
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${badgeStyles[badgeVariant]}`}>
            {badge}
          </span>
        )}
        {trend && (
          <span className="text-xs font-bold text-green-600">{trend}</span>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {loading ? (
        <div className="h-9 w-20 mt-1 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <p className="text-3xl font-black text-brand mt-1">{value.toLocaleString()}</p>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Track optimistic removes from moderation queue after approve/reject
  const [removedJobIds, setRemovedJobIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json() as DashboardData;
      setData(json);
      setRemovedJobIds(new Set()); // clear on full refresh
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Job moderation quick actions ───────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  async function handleJobAction(jobId: string, action: "approve" | "reject") {
    setActionLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      });
      if (res.ok) {
        // Optimistically remove from queue
        setRemovedJobIds((prev) => new Set([...prev, jobId]));
        // Also update the stat count
        setData((prev) =>
          prev
            ? {
                ...prev,
                stats: {
                  ...prev.stats,
                  activeJobs:
                    action === "approve"
                      ? prev.stats.activeJobs + 1
                      : prev.stats.activeJobs,
                },
              }
            : prev
        );
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  }

  const stats             = data?.stats;
  const verificationQueue = data?.verificationQueue ?? [];
  const moderationQueue   = (data?.moderationQueue ?? []).filter((j) => !removedJobIds.has(j.id));
  const adminUsers        = data?.adminUsers ?? [];

  // ── Error state ────────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-center justify-between" data-gsap="fade-down">
        <div>
          <h1 className="text-xl font-black text-brand">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform overview and activity summary</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={loading ? "animate-spin" : ""}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-down">
        <StatCard
          label="Total Active Jobs"
          value={stats?.activeJobs ?? 0}
          trend={stats ? undefined : undefined}
          loading={loading}
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications ?? 0}
          badge={stats && stats.pendingVerifications > 0 ? "Urgent" : undefined}
          badgeVariant="urgent"
          loading={loading}
        />
        <StatCard
          label="Registered Employers"
          value={stats?.registeredEmployers ?? 0}
          badge="Live"
          badgeVariant="live"
          loading={loading}
        />
        <StatCard
          label="Total Candidates"
          value={stats?.totalCandidates ?? 0}
          loading={loading}
        />
      </div>

      {/* Main row: Verification + Moderation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Candidate Verification Tagging */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Candidate Verification Tagging</h2>
            </div>
            <Link href="/dashboard/admin/verification" className="text-xs font-semibold text-brand-blue hover:underline">
              View All
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2 px-2">
          <div className="min-w-[420px]">

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_100px] gap-3 px-3 py-3">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j} className="h-6 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : verificationQueue.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-brand">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No candidates awaiting verification.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_1fr_80px_100px] gap-3 px-3 mb-2">
                {["Candidate Name", "Target Sector", "Docs", "Action"].map((h) => (
                  <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</p>
                ))}
              </div>
              <div className="space-y-2">
                {verificationQueue.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_80px_100px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue text-[10px] font-bold shrink-0">
                        {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-brand truncate">{row.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{row.sector}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-brand-blue text-[11px] font-bold rounded-lg w-fit">
                      {row.files} Files
                    </span>
                    <Link
                      href={`/dashboard/admin/verification/${row.id}`}
                      className="px-3 py-1.5 bg-brand-blue text-white text-[11px] font-bold rounded-lg hover:bg-brand-blue-dark transition-colors text-center"
                    >
                      Review &amp; Tag
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          </div>{/* min-w */}
          </div>{/* overflow-x-auto */}
        </div>

        {/* Job Moderation Queue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Job Moderation Queue</h2>
            </div>
            {!loading && moderationQueue.length > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded-lg">
                {moderationQueue.length} Pending
              </span>
            )}
            {!loading && moderationQueue.length === 0 && (
              <Link href="/dashboard/admin/moderation" className="text-xs font-semibold text-brand-blue hover:underline">
                View All
              </Link>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2 px-2">
          <div className="min-w-[400px]">

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 px-3 py-3">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j} className="h-6 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          ) : moderationQueue.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-brand">Queue is clear!</p>
              <p className="text-xs text-slate-400 mt-1">No jobs awaiting moderation.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 px-3 mb-2">
                {["Employer Name", "Job Title", "Posted", "Actions"].map((h) => (
                  <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</p>
                ))}
              </div>
              <div className="space-y-1">
                {moderationQueue.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-semibold text-brand truncate">{row.employer}</span>
                    <span className="text-sm text-slate-500 truncate">{row.title}</span>
                    <span className="text-xs text-slate-400">{row.posted}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleJobAction(row.id, "approve")}
                        disabled={actionLoading[row.id]}
                        className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {actionLoading[row.id] ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleJobAction(row.id, "reject")}
                        disabled={actionLoading[row.id]}
                        className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          </div>{/* min-w */}
          </div>{/* overflow-x-auto */}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-brand">User Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage administrative access and system level permissions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/admin/users/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Create New User Profile
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Manage All Roles
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No admin users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {adminUsers.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  u.status === "suspended" ? "border-red-100 bg-red-50/40" : "border-gray-100 bg-gray-50/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  u.status === "suspended" ? "bg-red-100 text-red-500" : "bg-brand-blue/10 text-brand-blue"
                }`}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{u.name}</p>
                  <p className={`text-xs mt-0.5 font-medium truncate ${u.status === "suspended" ? "text-red-500" : "text-slate-400"}`}>
                    {u.role}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {u.status === "suspended" ? (
                    <>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="Restore">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/dashboard/admin/users/${u.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-slate-400 transition-colors"
                        title="Edit"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 text-slate-400 transition-colors" title="Suspend">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
