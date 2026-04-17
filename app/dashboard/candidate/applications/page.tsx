"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DbStage = "new" | "interviewing" | "offers" | "accepted" | "rejected";

type Application = {
  id:           string;
  jobId:        string;
  title:        string;
  company:      string;
  sector:       string;
  stage:        DbStage;
  appliedDate:  string;
  appliedAt:    string;
  lastActivity: string;
};

type Stats = {
  total:        number;
  active:       number;
  interviewing: number;
  offers:       number;
};

// ─── Stage config ─────────────────────────────────────────────────────────────
// Maps DB stages → timeline position and display

type TimelineStep = { key: string; label: string };

const TIMELINE: TimelineStep[] = [
  { key: "applied",     label: "Applied"   },
  { key: "reviewing",   label: "Reviewing" },
  { key: "interview",   label: "Interview" },
  { key: "offer",       label: "Offer"     },
];

// DB stage → timeline index (0-based)
const STAGE_TO_IDX: Record<DbStage, number> = {
  new:          0,
  interviewing: 2,
  offers:       3,
  accepted:     4, // all steps complete
  rejected:     -1, // handled separately
};

const STAGE_STATUS: Record<DbStage, { label: string; style: string }> = {
  new:          { label: "Applied",          style: "bg-gray-100 text-slate-500"        },
  interviewing: { label: "Interviewing",     style: "bg-blue-100 text-brand-blue"       },
  offers:       { label: "Decision Pending", style: "bg-amber-100 text-amber-700"       },
  accepted:     { label: "Offer Accepted",   style: "bg-green-100 text-green-700"       },
  rejected:     { label: "Not Progressed",   style: "bg-red-50 text-red-500"            },
};

// ─── Sector icon ───────────────────────────────────────────────────────────────

function SectorIcon({ sector }: { sector: string }) {
  const s = sector.toLowerCase();

  if (s.includes("health") || s.includes("care")) return (
    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    </div>
  );
  if (s.includes("hospital")) return (
    <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75C21 20.496 20.496 21 19.875 21H4.125A1.125 1.125 0 013 19.875v-6.75z" />
      </svg>
    </div>
  );
  if (s.includes("tech") || s.includes("data") || s.includes("software")) return (
    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    </div>
  );
  if (s.includes("logistic") || s.includes("transport")) return (
    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    </div>
  );
  // Default
  return (
    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    </div>
  );
}

// ─── Mini timeline ─────────────────────────────────────────────────────────────

function MiniTimeline({ stage }: { stage: DbStage }) {
  if (stage === "rejected") {
    return (
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Application Progress</p>
        <div className="relative flex items-center justify-between opacity-40">
          <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gray-200" />
          {TIMELINE.map((step) => (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div className="w-3.5 h-3.5 rounded-full border-2 bg-white border-gray-200" />
              <span className="mt-1.5 text-[10px] font-medium text-slate-400 whitespace-nowrap">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === "accepted") {
    return (
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Application Progress</p>
        <div className="relative flex items-center justify-between">
          <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-green-500" />
          {TIMELINE.map((step) => (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div className="w-3.5 h-3.5 rounded-full border-2 bg-green-500 border-green-500">
                <svg viewBox="0 0 14 14" fill="none" className="w-full h-full p-0.5">
                  <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="mt-1.5 text-[10px] font-semibold text-green-600 whitespace-nowrap">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentIdx = STAGE_TO_IDX[stage];
  const fillPct    = currentIdx <= 0 ? "0%" : `${(currentIdx / (TIMELINE.length - 1)) * 100}%`;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Application Progress</p>
      <div className="relative flex items-center justify-between">
        {/* Track */}
        <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gray-200" />
        {/* Fill */}
        <div className="absolute top-[7px] left-0 h-0.5 bg-brand-blue transition-all" style={{ width: fillPct }} />

        {TIMELINE.map((step, idx) => {
          const done   = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                done || active ? "bg-brand-blue border-brand-blue" : "bg-white border-gray-200"
              }`}>
                {done && (
                  <svg viewBox="0 0 14 14" fill="none" className="w-full h-full p-0.5">
                    <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${
                done || active ? "text-brand font-semibold" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 animate-pulse">
      <div className="flex items-center gap-4 md:w-[230px] md:shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
      <div className="hidden md:flex flex-1 items-center gap-4">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="w-24 h-6 bg-gray-100 rounded-full" />
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="w-24 h-9 bg-gray-200 rounded-xl" />
        <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Application row ───────────────────────────────────────────────────────────

function ApplicationRow({ app }: { app: Application }) {
  const statusCfg = STAGE_STATUS[app.stage];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:shadow-sm transition-shadow">
      {/* Left: icon + meta */}
      <div className="flex items-center gap-4 md:w-[230px] md:shrink-0">
        <SectorIcon sector={app.sector} />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-brand leading-snug truncate">{app.title}</h3>
          <p className="text-xs font-semibold text-brand-blue mt-0.5 truncate">{app.company}</p>
          <p className="text-xs text-slate-400 mt-0.5">Applied: {app.appliedDate}</p>
        </div>
      </div>

      {/* Timeline — desktop */}
      <div className="hidden md:flex flex-1 items-center gap-4 min-w-0">
        <MiniTimeline stage={app.stage} />
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusCfg.style}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Mobile: status + timeline */}
      <div className="md:hidden space-y-3">
        <MiniTimeline stage={app.stage} />
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.style}`}>
            {statusCfg.label}
          </span>
          <Link
            href={`/dashboard/candidate/jobs/${app.jobId}`}
            className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
          >
            View Job
          </Link>
        </div>
      </div>

      {/* Desktop: actions */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <Link
          href={`/dashboard/candidate/jobs/${app.jobId}`}
          className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
        >
          View Job
        </Link>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "new" | "interviewing" | "offers" | "rejected";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all",          label: "All"           },
  { key: "new",          label: "Applied"        },
  { key: "interviewing", label: "Interviewing"   },
  { key: "offers",       label: "Offers"         },
  { key: "rejected",     label: "Not Progressed" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats,        setStats]        = useState<Stats>({ total: 0, active: 0, interviewing: 0, offers: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [filter,          setFilter]          = useState<FilterKey>("all");
  const [showFilterMenu,  setShowFilterMenu]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/candidate/applications");
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { applications: Application[]; stats: Stats };
      setApplications(data.applications);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.stage === filter);

  // Count per filter tab for badges
  const counts: Record<FilterKey, number> = {
    all:          applications.length,
    new:          applications.filter((a) => a.stage === "new").length,
    interviewing: applications.filter((a) => a.stage === "interviewing").length,
    offers:       applications.filter((a) => a.stage === "offers").length,
    rejected:     applications.filter((a) => a.stage === "rejected").length,
  };

  // Latest interviewing application for the sidebar card
  const latestInterview = applications.find((a) => a.stage === "interviewing");

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
          <div>
            <h1 className="text-[28px] font-black text-brand tracking-tight">My Applications</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? (
                <span className="text-slate-400">Loading your applications…</span>
              ) : stats.active > 0 ? (
                <>
                  You have{" "}
                  <span className="font-bold text-brand-blue">{stats.active} active application{stats.active !== 1 ? "s" : ""}</span>{" "}
                  currently in progress.
                </>
              ) : stats.total > 0 ? (
                <>You have {stats.total} total application{stats.total !== 1 ? "s" : ""}.</>
              ) : (
                "Start applying to jobs to track your progress here."
              )}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 transition-colors disabled:opacity-50 shrink-0"
            title="Refresh"
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className={loading ? "animate-spin" : ""}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>


        {/* Results header: count + filter dropdown */}
        {!loading && applications.length > 0 && (
          <div className="flex items-center justify-between" data-gsap="fade-up">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-brand">{filtered.length}</span> application{filtered.length !== 1 ? "s" : ""}
              {filter !== "all" && <span className="text-slate-400"> · filtered</span>}
            </p>

            {/* Dropdown filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-brand-blue/30 hover:text-brand-blue transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                {FILTER_TABS.find((t) => t.key === filter)?.label ?? "All"}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showFilterMenu ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                  {FILTER_TABS.map((tab) => {
                    const count = counts[tab.key];
                    if (tab.key !== "all" && count === 0) return null;
                    const active = filter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { setFilter(tab.key); setShowFilterMenu(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          active ? "text-brand-blue bg-blue-50 font-semibold" : "text-slate-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                          tab.key === "interviewing" ? "bg-blue-100 text-blue-600" :
                          tab.key === "offers"       ? "bg-amber-100 text-amber-700" :
                          tab.key === "rejected"     ? "bg-red-50 text-red-500" :
                          "bg-gray-100 text-slate-400"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application rows */}
        <div className="space-y-3" data-gsap="fade-up">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : error ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="font-bold text-brand">{error}</p>
              <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand">
                {filter === "all" ? "No applications yet" : `No ${STAGE_STATUS[filter as DbStage]?.label ?? filter} applications`}
              </p>
              <p className="text-xs text-slate-400">
                {filter === "all"
                  ? "Start applying to jobs to track your progress here."
                  : "Switch to a different filter to see other applications."}
              </p>
              {filter === "all" && (
                <Link
                  href="/dashboard/candidate/jobs"
                  className="inline-block mt-1 px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                >
                  Browse Jobs
                </Link>
              )}
            </div>
          ) : (
            filtered.map((app) => <ApplicationRow key={app.id} app={app} />)
          )}
        </div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2" data-gsap="fade-up">

          {/* Stats card */}
          <div className="bg-brand-blue rounded-2xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
            <div className="absolute bottom-4 right-5 opacity-20">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Application Summary</h3>
              <p className="text-xs text-white/70 mt-2 leading-relaxed space-y-0.5">
                {loading ? (
                  <span className="block h-3 bg-white/20 rounded w-3/4 animate-pulse" />
                ) : (
                  <>
                    <span className="block">{stats.total} total · {stats.active} active</span>
                    {stats.interviewing > 0 && <span className="block">{stats.interviewing} at interview stage</span>}
                    {stats.offers > 0 && <span className="block text-amber-200 font-semibold">{stats.offers} offer{stats.offers > 1 ? "s" : ""} pending!</span>}
                  </>
                )}
              </p>
            </div>
            <Link
              href="/dashboard/candidate/jobs"
              className="mt-4 self-start px-4 py-2 bg-white text-brand-blue text-xs font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              Find More Jobs
            </Link>
          </div>

          {/* Interviewing / next step */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-brand mb-4">
              {latestInterview ? "In Interview Stage" : "Next Steps"}
            </h3>
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ) : latestInterview ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{latestInterview.title}</p>
                  <p className="text-xs text-brand-blue font-semibold mt-0.5 truncate">{latestInterview.company}</p>
                  <p className="text-xs text-slate-400 mt-1">Check your email for interview details</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand">No interviews yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Keep applying to increase your chances.</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-blue-50 rounded-2xl p-6 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-brand mb-4">Quick Stats</h3>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-8 bg-blue-100 rounded w-12" />
                    <div className="h-3 bg-blue-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-black text-brand">{stats.total}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Total Applied</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-brand">{stats.active}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Active</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-brand">{stats.interviewing}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Interviewing</p>
                </div>
                <div>
                  <p className={`text-3xl font-black ${stats.offers > 0 ? "text-amber-600" : "text-brand"}`}>{stats.offers}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Offers</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
