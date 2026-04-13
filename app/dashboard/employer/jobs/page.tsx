"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmployerJobCardSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type JobStatus = "draft" | "review" | "live" | "closed";
type TabKey    = "live" | "review" | "closed";

type Job = {
  id:             string;
  title:          string;
  sector:         string;
  employmentType: string;
  location:       string;
  remote:         boolean;
  salaryMin:      number | null;
  salaryMax:      number | null;
  status:         JobStatus;
  createdAt:      string;
  closesAt:       string | null;
  applied:        number;
  interviewing:   number;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "live",   label: "Live Postings" },
  { key: "review", label: "Under Review"  },
  { key: "closed", label: "Closed"        },
];

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare:    "text-teal-600",
  Hospitality:   "text-orange-600",
  "Customer Care": "text-purple-600",
  "Tech & Data": "text-blue-600",
  Logistics:     "text-amber-600",
};

function fmtSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function relativeTime(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job, onDelete }: { job: Job; onDelete: (id: string) => void }) {
  const sectorColour = SECTOR_COLOURS[job.sector] ?? "text-slate-500";
  const salary       = fmtSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-6 hover:shadow-sm transition-shadow">
      {/* Left: meta + title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${sectorColour}`}>
            {job.sector}
          </span>
          {job.status === "live" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Live
            </span>
          )}
          {job.status === "review" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Under Review
            </span>
          )}
          {job.status === "closed" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />Closed
            </span>
          )}
          {job.remote && (
            <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-full">Remote</span>
          )}
        </div>
        <h3 className="text-base font-bold text-brand truncate">{job.title}</h3>
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {job.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Posted {relativeTime(job.createdAt)}
          </span>
          {salary && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {salary}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 shrink-0">
        <div className="text-center">
          <p className="text-xl font-black text-brand leading-none">{job.applied}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Applied</p>
        </div>
        {job.status !== "closed" && (
          <div className="text-center">
            <p className="text-xl font-black text-brand-blue leading-none">{job.interviewing}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Interviewing</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {job.status === "live" && (
          <Link
            href={`/dashboard/employer/jobs/${job.id}`}
            className="bg-brand-blue text-white text-xs font-semibold rounded-xl px-4 py-2 hover:bg-brand-blue-dark transition-colors"
          >
            View Pipeline
          </Link>
        )}
        <Link
          href={`/dashboard/employer/jobs/${job.id}/edit`}
          aria-label="Edit job"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-gray-100 hover:text-slate-500 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </Link>
        <button
          aria-label="Delete job"
          onClick={() => onDelete(job.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [jobs,      setJobs]      = useState<Job[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res  = await fetch("/api/employer/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(data.jobs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/employer/jobs/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setJobs((prev) => prev.filter((j) => j.id !== confirmId));
      toast("Job removed successfully", "success");
    } catch {
      toast("Failed to remove job", "error");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  // Map DB statuses to tabs
  const tabJobs = jobs.filter((j) => {
    if (activeTab === "live")   return j.status === "live";
    if (activeTab === "review") return j.status === "review" || j.status === "draft";
    return j.status === "closed";
  });

  const counts = {
    live:   jobs.filter((j) => j.status === "live").length,
    review: jobs.filter((j) => j.status === "review" || j.status === "draft").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  const totalApplied      = jobs.filter((j) => j.status === "live").reduce((s, j) => s + j.applied, 0);
  const totalInterviewing = jobs.filter((j) => j.status === "live").reduce((s, j) => s + j.interviewing, 0);

  return (
    <>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
        <GsapAnimations />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
          <div>
            <h1 className="text-[28px] font-black text-brand tracking-tight">Job Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and monitor your active career opportunities.</p>
          </div>
          <Link
            href="/dashboard/employer/jobs/new"
            className="flex items-center gap-2 bg-brand-blue text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-brand-blue-dark transition-colors self-start"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Stat cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-up">
            {[
              { label: "Live Postings",  value: counts.live,         icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />, bg: "bg-brand-blue/10", color: "text-brand-blue", val: "text-brand" },
              { label: "Under Review",   value: counts.review,       icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />, bg: "bg-amber-50", color: "text-amber-500", val: "text-amber-600" },
              { label: "Total Applied",  value: totalApplied,        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />, bg: "bg-green-50", color: "text-green-500", val: "text-green-600" },
              { label: "Interviewing",   value: totalInterviewing,   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.181 0-2.35-.009-3.519-.027a2.125 2.125 0 01-.857-.242m6.876-6.221a2.125 2.125 0 00-.857-.242 48.716 48.716 0 00-6.366-.195c-1.091 0-1.979.879-1.979 1.97v4.286c0 .952.54 1.755 1.337 2.082" />, bg: "bg-brand-blue/10", color: "text-brand-blue", val: "text-brand-blue" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={s.color}>
                    {s.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className={`text-2xl font-black ${s.val}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div role="tablist" className="flex items-center gap-1 border-b border-gray-100" data-gsap="fade-down">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-400 hover:text-brand"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                activeTab === tab.key ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-3" data-gsap="fade-up">
          {loading ? (
            <EmployerJobCardSkeleton count={5} />
          ) : error ? (
            <ErrorState message="Unable to load job postings." onRetry={load} />
          ) : tabJobs.length === 0 ? (
            <EmptyState
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              }
              title="No jobs in this category"
              description={activeTab === "live" ? "Post a new job to start attracting candidates." : "Nothing here yet."}
              action={activeTab === "live" ? { label: "Post New Job", href: "/dashboard/employer/jobs/new" } : undefined}
            />
          ) : (
            tabJobs.map((job) => (
              <JobCard key={job.id} job={job} onDelete={setConfirmId} />
            ))
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmId !== null}
        title="Remove this job?"
        description="This job posting will be permanently removed. All applications and pipeline data will be lost."
        confirmLabel={deleting ? "Removing…" : "Remove Job"}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
