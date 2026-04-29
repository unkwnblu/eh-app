"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocStatus = "verified" | "pending" | "missing";

type RecentApp = {
  id: string;
  candidateId: string;
  candidateName: string;
  initials: string;
  appliedAt: string;
  jobTitle: string;
  compliance: {
    rtwStatus: DocStatus;
    dbsStatus: DocStatus;
    suspended: boolean;
  };
};

type ActiveJob = {
  id: string;
  title: string;
  location: string;
  applicants: number;
  progress: number;
  daysLeft: number | null;
  urgent: boolean;
};

type DashboardData = {
  companyName: string;
  stats: {
    activeJobs: number;
    newThisWeek: number;
    avgTimeToHire: number | null;
    totalApplicants: number;
    offerRate: number | null;
  };
  recentApplications: RecentApp[];
  activeJobs: ActiveJob[];
};

// ─── Compliance badges ─────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-teal-100 text-teal-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
  "bg-green-100 text-green-600",
];

function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function DocBadge({ label, status }: { label: string; status: DocStatus }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold w-fit bg-green-50 text-green-700 border-green-200">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      {label} VERIFIED
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold w-fit bg-amber-50 text-amber-700 border-amber-200">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {label} PENDING
    </span>
  );
  // missing — only show for RTW since DBS isn't always required
  return (
    <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold w-fit bg-red-50 text-red-600 border-red-200">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      {label} MISSING
    </span>
  );
}

function ComplianceBadges({ compliance }: { compliance: RecentApp["compliance"] }) {
  if (compliance.suspended) return (
    <span className="inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold w-fit bg-red-50 text-red-600 border-red-200">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
      ACCOUNT FLAGGED
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      <DocBadge label="RTW" status={compliance.rtwStatus} />
      {/* Only show DBS badge if a doc was submitted (missing DBS isn't always required) */}
      {compliance.dbsStatus !== "missing" && (
        <DocBadge label="DBS" status={compliance.dbsStatus} />
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {
  useEffect(() => { document.title = "Dashboard | Edge Harbour"; }, []);

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/dashboard");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json() as DashboardData);
    } catch {
      // silently fail — keep previous data if any
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data?.stats;

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">

        {/* Page header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 lg:mb-8" data-gsap="fade-down">
          <div>
            <h1 className="text-[22px] font-bold text-brand tracking-tight">Employer Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back{data?.companyName ? `, ${data.companyName}` : ""}. Here&apos;s what&apos;s happening in your recruitment pipeline today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/employer/jobs" className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand hover:border-brand-blue hover:text-brand-blue transition-colors bg-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Review Compliance
            </Link>
            <Link href="/dashboard/employer/jobs/new" className="flex items-center gap-2 bg-brand-blue text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-brand-blue-dark transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 lg:mb-8" data-gsap="fade-up">

          {/* Active Postings */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              {loading ? (
                <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
              ) : s && s.newThisWeek > 0 ? (
                <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                  +{s.newThisWeek} this week
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                  {s?.totalApplicants ?? 0} applicants
                </span>
              )}
            </div>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mb-2" />
            ) : (
              <p className="text-3xl font-black text-brand">{s?.activeJobs ?? 0}</p>
            )}
            <p className="text-xs text-slate-400 mt-1 font-medium">Active Postings</p>
          </div>

          {/* Time to Hire */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
                avg. to hire
              </span>
            </div>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse mb-2" />
            ) : (
              <p className="text-3xl font-black text-brand">
                {s?.avgTimeToHire != null ? `${s.avgTimeToHire}d` : "—"}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1 font-medium">Time to Hire</p>
          </div>

          {/* Offer Acceptance Rate */}
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Offer Acceptance Rate</p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            ) : (
              <>
                <p className="text-3xl font-black text-brand">
                  {s?.offerRate != null ? `${s.offerRate}%` : "—"}
                </p>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full transition-all duration-700" style={{ width: `${s?.offerRate ?? 0}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {s?.offerRate != null ? "Based on accepted vs rejected offers" : "No offers processed yet"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-100" data-gsap="fade-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-brand">Recent Applications</h2>
              <Link href="/dashboard/employer/jobs" className="text-xs font-semibold text-brand-blue hover:underline">
                View All
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-slate-200 rounded" />
                      <div className="h-2.5 w-20 bg-slate-100 rounded" />
                    </div>
                    <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (data?.recentApplications ?? []).length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-400">No applications yet. Post a job to get started.</p>
                <Link href="/dashboard/employer/jobs/new" className="inline-block mt-3 px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-6 py-3">Candidate</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Role</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Compliance</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentApplications ?? []).map((app) => (
                      <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${avatarColor(app.candidateName)} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {app.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-brand">{app.candidateName}</p>
                              <p className="text-[11px] text-slate-400">{app.appliedAt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">{app.jobTitle}</p>
                        </td>
                        <td className="px-4 py-4">
                          <ComplianceBadges compliance={app.compliance} />
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/dashboard/employer/jobs`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-gray-100 hover:text-slate-500 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 6a2 2 0 110-4 2 2 0 010 4zM12 14a2 2 0 110-4 2 2 0 010 4zM12 22a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-2xl border border-gray-100" data-gsap="fade-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-brand">Active Jobs</h2>
              <Link href="/dashboard/employer/jobs" className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:underline">
                Manage
              </Link>
            </div>
            {loading ? (
              <div className="px-5 py-4 space-y-5">
                {[1,2,3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 w-36 bg-slate-200 rounded mb-2" />
                    <div className="h-1.5 bg-slate-100 rounded-full mb-1.5" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded ml-auto" />
                  </div>
                ))}
              </div>
            ) : (data?.activeJobs ?? []).length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-400">No active job postings.</p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-5">
                {(data?.activeJobs ?? []).map((job) => (
                  <Link key={job.id} href={`/dashboard/employer/jobs/${job.id}`} className="block group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-semibold text-brand truncate group-hover:text-brand-blue transition-colors">{job.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{job.location}</p>
                      </div>
                      {job.daysLeft !== null && (
                        <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 shrink-0 ${
                          job.urgent
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}>
                          {job.daysLeft}d left
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-blue transition-all duration-700" style={{ width: `${job.progress}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 text-right">{job.applicants} applicant{job.applicants !== 1 ? "s" : ""}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
