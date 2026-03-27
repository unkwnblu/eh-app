"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ApplicationRowSkeleton } from "@/components/ui/Skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StageKey = "applied" | "reviewing" | "interview" | "offer";
type StatusLabel = "Interviewing" | "Under Review" | "Decision Pending" | "Applied";

type Application = {
  id: number;
  title: string;
  company: string;
  appliedDate: string;
  currentStage: StageKey;
  status: StatusLabel;
  sector: "healthcare" | "tech" | "marketing" | "retail";
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const STAGES: { key: StageKey; label: string }[] = [
  { key: "applied",   label: "Applied"   },
  { key: "reviewing", label: "Reviewing" },
  { key: "interview", label: "Interview" },
  { key: "offer",     label: "Offer"     },
];

const STAGE_ORDER: StageKey[] = ["applied", "reviewing", "interview", "offer"];

const APPLICATIONS: Application[] = [
  { id: 1, title: "Healthcare Assistant",   company: "Heritage Care Homes",  appliedDate: "Oct 12, 2023", currentStage: "interview", status: "Interviewing",      sector: "healthcare" },
  { id: 2, title: "Junior Data Analyst",    company: "TechFlow Solutions",   appliedDate: "Oct 15, 2023", currentStage: "reviewing", status: "Under Review",      sector: "tech"       },
  { id: 3, title: "Marketing Coordinator",  company: "Pulse Creative Agency",appliedDate: "Oct 05, 2023", currentStage: "offer",     status: "Decision Pending",  sector: "marketing"  },
  { id: 4, title: "Store Supervisor",       company: "Urban Outfitters",     appliedDate: "Sep 28, 2023", currentStage: "applied",   status: "Applied",           sector: "retail"     },
];

const STATUS_STYLES: Record<StatusLabel, string> = {
  "Interviewing":     "bg-blue-100 text-brand-blue",
  "Under Review":     "bg-gray-100 text-slate-500",
  "Decision Pending": "bg-amber-100 text-amber-700",
  "Applied":          "bg-gray-100 text-slate-500",
};

// ─── Sector icon ───────────────────────────────────────────────────────────────

function SectorIcon({ sector }: { sector: Application["sector"] }) {
  const map: Record<Application["sector"], React.ReactNode> = {
    healthcare: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    tech: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    marketing: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
    retail: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  };
  return (
    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
      {map[sector]}
    </div>
  );
}

// ─── Mini timeline ─────────────────────────────────────────────────────────────

function MiniTimeline({ currentStage }: { currentStage: StageKey }) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Application Progress</p>
      <div className="relative flex items-center justify-between">
        {/* Base track */}
        <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gray-200" />
        {/* Filled track */}
        <div
          className="absolute top-[7px] left-0 h-0.5 bg-brand-blue transition-all"
          style={{ width: currentIdx === 0 ? "0%" : `${(currentIdx / (STAGE_ORDER.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={stage.key} className="relative flex flex-col items-center z-10">
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                done   ? "bg-brand-blue border-brand-blue" :
                active ? "bg-brand-blue border-brand-blue" :
                         "bg-white border-gray-200"
              }`} />
              <span className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${
                done || active ? "text-brand" : "text-slate-400"
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Application row ───────────────────────────────────────────────────────────

function ApplicationRow({ app }: { app: Application }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:shadow-sm transition-shadow">
      {/* Left: icon + meta */}
      <div className="flex items-center gap-4 md:w-[230px] md:shrink-0">
        <SectorIcon sector={app.sector} />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-brand leading-snug">{app.title}</h3>
          <p className="text-xs font-semibold text-brand-blue mt-0.5">{app.company}</p>
          <p className="text-xs text-slate-400 mt-0.5">Applied: {app.appliedDate}</p>
        </div>
      </div>

      {/* Mini timeline — desktop */}
      <div className="hidden md:flex flex-1 items-center gap-4 min-w-0">
        <MiniTimeline currentStage={app.currentStage} />
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[app.status]}`}>
          {app.status}
        </span>
      </div>

      {/* Mobile: status + actions row */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[app.status]}`}>
          {app.status}
        </span>
        <button className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
          View Details
        </button>
      </div>

      {/* Desktop: actions */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
          View Details
        </button>
        <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [loading] = useState(false);
  const [error, setError] = useState(false);
  const applications = APPLICATIONS;
  const activeCount = applications.length;

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-5">
      {/* Header */}
      <div data-gsap="fade-down">
        <h1 className="text-[28px] font-black text-brand tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">
          You have{" "}
          <span className="font-bold text-brand-blue">{activeCount} active applications</span>{" "}
          currently in progress.
        </p>
      </div>

      {/* Application rows */}
      <div className="space-y-3" data-gsap="fade-up">
        {loading ? (
          <ApplicationRowSkeleton count={4} />
        ) : error ? (
          <ErrorState message="Unable to load your applications." onRetry={() => setError(false)} />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            }
            title="No applications yet"
            description="Start applying to jobs to track your progress here."
            action={{ label: "Browse Jobs", href: "/dashboard/candidate/jobs" }}
          />
        ) : (
          applications.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))
        )}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2" data-gsap="fade-up">

        {/* Resume Score */}
        <div className="bg-brand-blue rounded-2xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          {/* Decorative sparkle */}
          <div className="absolute bottom-4 right-5 opacity-20">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Resume Score</h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Your profile is 85% optimized for current job market trends.
            </p>
          </div>
          <button className="mt-4 self-start px-4 py-2 bg-white text-brand-blue text-xs font-bold rounded-xl hover:bg-white/90 transition-colors">
            View Tips
          </button>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-brand mb-4">Upcoming Interviews</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">18</span>
            </div>
            <div>
              <p className="text-sm font-bold text-brand">Healthcare Assistant</p>
              <p className="text-xs text-slate-400 mt-0.5">Oct 18, 10:00 AM • Zoom</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-blue-50 rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-brand mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-black text-brand">12</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Jobs Saved</p>
            </div>
            <div>
              <p className="text-3xl font-black text-brand">48</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Profile Views</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
