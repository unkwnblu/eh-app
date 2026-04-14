"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

type ComplianceItem = { label: string; pass: boolean };

type Job = {
  id: string;
  employer: string;
  initials: string;
  title: string;
  sector: string;
  location: string;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  liveSalaryMin: number | null;
  liveSalaryMax: number | null;
  type: string;
  remote: boolean;
  posted: string;
  status: ModerationStatus;
  description: string;
  responsibilities: string;
  flags: string[];
  compliance: number;
  complianceItems: ComplianceItem[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ModerationStatus, string> = {
  pending:  "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-500",
  flagged:  "bg-orange-50 text-orange-600",
};

const STATUS_DOT: Record<ModerationStatus, string> = {
  pending:  "bg-amber-400",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  flagged:  "bg-orange-500",
};

function complianceColor(score: number) {
  if (score >= 85) return { text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" };
  if (score >= 65) return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "bg-red-500" };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start animate-pulse">
      {/* List skeleton */}
      <div className="w-full lg:w-[340px] lg:shrink-0 space-y-3">
        <div className="bg-white border border-gray-100 rounded-xl p-1 flex gap-1 h-9" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-0.5 bg-gray-100 rounded-full mt-2" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="flex gap-1">
                {[0, 1, 2].map((j) => <div key={j} className="w-7 h-7 rounded-lg bg-gray-100" />)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Detail skeleton */}
      <div className="flex-1 space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="h-24 bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-6 w-20 bg-gray-100 rounded-lg" />)}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-1.5 bg-gray-100 rounded-full" />
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-5 bg-gray-100 rounded w-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm font-bold text-brand mb-1">
        {filter === "all" ? "No jobs posted yet" : `No ${filter} jobs`}
      </p>
      <p className="text-xs text-slate-400">
        {filter === "pending"
          ? "All caught up — no jobs awaiting review."
          : "Jobs will appear here once employers post them."}
      </p>
    </div>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  job,
  onAction,
  onPriceUpdate,
  actionLoading,
}: {
  job: Job;
  onAction: (action: "approve" | "flag" | "reject") => void;
  onPriceUpdate: (min: number | null, max: number | null) => Promise<void>;
  actionLoading: boolean;
}) {
  const [expanded,     setExpanded]     = useState(false);
  const [liveMin,      setLiveMin]      = useState(job.liveSalaryMin != null ? String(job.liveSalaryMin) : "");
  const [liveMax,      setLiveMax]      = useState(job.liveSalaryMax != null ? String(job.liveSalaryMax) : "");
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSaved,   setPriceSaved]   = useState(false);
  const [priceError,   setPriceError]   = useState("");

  const hasOverride = job.liveSalaryMin != null || job.liveSalaryMax != null;

  async function savePricing() {
    setPriceError("");
    const min = liveMin ? Number(liveMin) : null;
    const max = liveMax ? Number(liveMax) : null;
    if (min !== null && max !== null && min > max) {
      setPriceError("Min cannot exceed max.");
      return;
    }
    setPriceLoading(true);
    try {
      await onPriceUpdate(min, max);
      setPriceSaved(true);
      setTimeout(() => setPriceSaved(false), 2500);
    } catch {
      setPriceError("Failed to save pricing.");
    } finally {
      setPriceLoading(false);
    }
  }

  function clearPricing() {
    setLiveMin("");
    setLiveMax("");
    onPriceUpdate(null, null);
  }

  const c = complianceColor(job.compliance);
  const passCount = job.complianceItems.filter((i) => i.pass).length;

  return (
    <div className="flex-1 space-y-4 min-w-0">

      {/* Banner + header */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-blue/80 to-brand-blue relative flex items-end px-6 pb-3">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.08) 10px, rgba(255,255,255,.08) 11px)" }}
          />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-black">
              {job.initials}
            </div>
            <div>
              <p className="text-white text-xs font-semibold opacity-80">{job.employer}</p>
              <p className="text-white text-[11px] opacity-60">{job.sector}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-brand">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-1 bg-[#F7F8FA] text-brand text-[11px] font-semibold rounded-lg">{job.type}</span>
                {job.remote && (
                  <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[11px] font-semibold rounded-lg">Remote Friendly</span>
                )}
                {job.salary && (
                  <span className="px-2.5 py-1 bg-[#F7F8FA] text-brand text-[11px] font-semibold rounded-lg flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/></svg>
                    {job.salary}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-[#F7F8FA] text-slate-500 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  {job.location}
                </span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${STATUS_STYLES[job.status]}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[job.status]}`} />
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Analysis */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Compliance Analysis</h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.bg}`}>
            <span className={`text-sm font-black ${c.text}`}>{job.compliance}%</span>
            <span className={`text-[10px] font-semibold ${c.text}`}>
              {job.compliance >= 85 ? "Pass" : job.compliance >= 65 ? "Review" : "Fail"}
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
          <div className={`h-1.5 rounded-full transition-all ${c.bar}`} style={{ width: `${job.compliance}%` }} />
        </div>
        <ul className="space-y-2">
          {job.complianceItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              {item.pass ? (
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </span>
              )}
              <span className={item.pass ? "text-slate-600" : "text-amber-700 font-medium"}>{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-400 mt-3">{passCount} of {job.complianceItems.length} checks passed</p>
      </div>

      {/* Live Pricing Override */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand">Live Pricing</h3>
              <p className="text-[11px] text-slate-400">Override what candidates see — leave blank to use employer&apos;s rate</p>
            </div>
          </div>
          {hasOverride && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-lg text-[10px] font-bold text-orange-600 uppercase tracking-wide shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Override Active
            </span>
          )}
        </div>

        {/* Employer's original salary — read-only reference */}
        {job.salary && (
          <div className="mt-4 mb-4 flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[11px] text-slate-500">
              Employer set: <span className="font-semibold text-brand">{job.salary}</span>
            </span>
          </div>
        )}

        {/* Live pricing inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Live Min (£/yr)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
              <input
                type="number"
                value={liveMin}
                onChange={(e) => { setLiveMin(e.target.value); setPriceError(""); }}
                placeholder={job.salaryMin ? String(job.salaryMin) : "e.g. 28000"}
                className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Live Max (£/yr)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
              <input
                type="number"
                value={liveMax}
                onChange={(e) => { setLiveMax(e.target.value); setPriceError(""); }}
                placeholder={job.salaryMax ? String(job.salaryMax) : "e.g. 35000"}
                className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              />
            </div>
          </div>
        </div>

        {priceError && (
          <p className="text-xs text-red-500 mt-2">{priceError}</p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={savePricing}
            disabled={priceLoading}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-blue disabled:opacity-60 transition-colors"
          >
            {priceLoading ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Saving…
              </>
            ) : priceSaved ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Saved
              </>
            ) : (
              "Save Live Pricing"
            )}
          </button>
          {hasOverride && (
            <button
              onClick={clearPricing}
              className="px-4 py-2 border border-gray-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Clear Override
            </button>
          )}
        </div>
      </div>

      {/* Flags */}
      {job.flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-sm font-bold text-amber-700">Compliance Flags</h3>
          </div>
          <ul className="space-y-1.5">
            {job.flags.map((flag, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Job Description */}
      {job.description && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-brand mb-3">Job Description</h3>
          <p className={`text-sm text-slate-500 leading-relaxed ${!expanded ? "line-clamp-4" : ""}`}>
            {job.description}
          </p>
          {job.description.length > 200 && (
            <button onClick={() => setExpanded((v) => !v)} className="text-xs font-semibold text-brand-blue mt-2 hover:underline">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-brand mb-3">Key Responsibilities</h3>
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        {job.status !== "approved" && (
          <button
            onClick={() => onAction("approve")}
            disabled={actionLoading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors mb-3"
          >
            {actionLoading ? "Saving…" : "Approve & Make Live"}
          </button>
        )}
        <div className="flex gap-2">
          {job.status !== "flagged" && (
            <button
              onClick={() => onAction("flag")}
              disabled={actionLoading}
              className="flex-1 py-2.5 border border-gray-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              Flag for Review
            </button>
          )}
          {job.status !== "rejected" && (
            <button
              onClick={() => onAction("reject")}
              disabled={actionLoading}
              className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 disabled:opacity-60 transition-colors"
            >
              Reject
            </button>
          )}
          {(job.status === "approved" || job.status === "rejected" || job.status === "flagged") && (
            <button
              onClick={() => onAction("flag")}
              disabled={actionLoading}
              className="flex-1 py-2.5 border border-gray-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              Reset to Pending
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-3">Posted {job.posted}</p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobModerationPage() {
  const [jobs,          setJobs]          = useState<Job[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [selected,      setSelected]      = useState<Job | null>(null);
  const [filter,        setFilter]        = useState<"all" | ModerationStatus>("pending");
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/jobs");
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { jobs: Job[] };
      setJobs(data.jobs);
      // Keep selected in sync (or default to first pending)
      setSelected((prev) => {
        if (prev) {
          return data.jobs.find((j) => j.id === prev.id) ?? data.jobs[0] ?? null;
        }
        return data.jobs.find((j) => j.status === "pending") ?? data.jobs[0] ?? null;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Action ────────────────────────────────────────────────────────────────

  async function handleAction(jobId: string, action: "approve" | "flag" | "reject") {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Action failed");
      await load(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filtered     = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const pendingCount = jobs.filter((j) => j.status === "pending").length;

  const counts: Record<string, number> = {
    all:      jobs.length,
    pending:  jobs.filter((j) => j.status === "pending").length,
    approved: jobs.filter((j) => j.status === "approved").length,
    flagged:  jobs.filter((j) => j.status === "flagged").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6" data-gsap="fade-down">
          <div>
            <h1 className="text-[28px] font-black text-brand tracking-tight">Job Moderation</h1>
            <p className="text-sm text-slate-400 mt-1">Review and approve employer job listings before they go live.</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {pendingCount > 0 && (
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-xl">
                {pendingCount} Pending
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-bold text-brand mb-2">{error}</p>
            <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 items-start" data-gsap="fade-up">

            {/* ── Left: list ── */}
            <div className="w-full lg:w-[340px] lg:shrink-0 space-y-3">

              {/* Filter tabs */}
              <div className="bg-white border border-gray-100 rounded-xl p-1 flex gap-1" role="tablist">
                {(["all", "pending", "approved", "flagged", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={filter === f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-colors relative ${
                      filter === f ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-gray-50"
                    }`}
                  >
                    {f}
                    {counts[f] > 0 && filter !== f && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center
                        ${f === "pending" ? "bg-amber-400 text-white" : f === "flagged" ? "bg-orange-400 text-white" : "bg-gray-200 text-slate-500"}`}>
                        {counts[f]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Job cards */}
              {filtered.length === 0 ? (
                <EmptyState filter={filter} />
              ) : (
                filtered.map((job) => {
                  const c = complianceColor(job.compliance);
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelected(job)}
                      className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-sm cursor-pointer ${
                        selected?.id === job.id ? "border-brand-blue shadow-sm" : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue text-xs font-black flex items-center justify-center shrink-0">
                          {job.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <p className="text-sm font-bold text-brand leading-snug truncate">{job.title}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_STYLES[job.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[job.status]}`} />
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-brand-blue truncate">{job.employer}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400">{job.sector}</span>
                            <span className="text-slate-300 text-[10px]">·</span>
                            <span className="text-[10px] text-slate-400">{job.posted}</span>
                            {job.flags.length > 0 && (
                              <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-amber-500 font-semibold">
                                  {job.flags.length} flag{job.flags.length > 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compliance + quick actions */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-1 rounded-full ${c.bar}`} style={{ width: `${job.compliance}%` }} />
                          </div>
                          <span className={`text-[11px] font-bold ${c.text}`}>{job.compliance}%</span>
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleAction(job.id, "approve")}
                            title="Approve"
                            disabled={actionLoading || job.status === "approved"}
                            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          </button>
                          <button
                            onClick={() => handleAction(job.id, "flag")}
                            title="Flag for review"
                            disabled={actionLoading || job.status === "flagged"}
                            className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                          </button>
                          <button
                            onClick={() => handleAction(job.id, "reject")}
                            title="Reject"
                            disabled={actionLoading || job.status === "rejected"}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Right: detail panel ── */}
            {selected ? (
              <DetailPanel
                key={selected.id}
                job={selected}
                onAction={(action) => handleAction(selected.id, action)}
                onPriceUpdate={async (min, max) => {
                  const res = await fetch(`/api/admin/jobs/${selected.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ liveSalaryMin: min, liveSalaryMax: max }),
                  });
                  if (!res.ok) throw new Error("Failed to save pricing");
                  await load(); // keep list in sync
                }}
                actionLoading={actionLoading}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center py-24 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">Select a job to review</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
