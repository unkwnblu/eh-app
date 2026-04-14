"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DbStage = "new" | "interviewing" | "offers" | "rejected";

interface LatestApp {
  id:        string;
  jobTitle:  string;
  company:   string;
  stage:     DbStage;
  appliedAt: string;
}

interface RecommendedJob {
  id:       string;
  title:    string;
  company:  string;
  location: string;
  remote:   boolean;
  salary:   string | null;
  type:     string;
  posted:   string;
}

interface ProfileCheck {
  label: string;
  done:  boolean;
}

interface DashboardData {
  firstName:        string;
  candidateStatus:  string;
  sector:           string | null;
  stats:            { totalApplied: number; new: number; interviewing: number; offers: number };
  latestApplication: LatestApp | null;
  recommendedJobs:  RecommendedJob[];
  profile:          { completeness: number; checks: ProfileCheck[] };
}

// ─── Timeline steps ───────────────────────────────────────────────────────────

const TIMELINE = [
  { key: "applied",   label: "Applied"   },
  { key: "reviewing", label: "Reviewing" },
  { key: "interview", label: "Interview" },
  { key: "offer",     label: "Offer"     },
];

const STAGE_TO_IDX: Record<string, number> = {
  new: 0, interviewing: 2, offers: 3, rejected: -1,
};

// ─── Application timeline ─────────────────────────────────────────────────────

function ApplicationTimeline({ stage }: { stage: DbStage }) {
  const currentIdx = STAGE_TO_IDX[stage] ?? 0;
  const fillPct    = currentIdx <= 0 ? "0%" : `${(currentIdx / (TIMELINE.length - 1)) * 100}%`;

  return (
    <div className="relative flex items-start justify-between pt-2 pb-4">
      <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-200" />
      <div className="absolute top-[18px] left-0 h-0.5 bg-brand-blue transition-all" style={{ width: fillPct }} />

      {TIMELINE.map((step, idx) => {
        const done   = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} className="relative flex flex-col items-center z-10" style={{ width: `${100 / TIMELINE.length}%` }}>
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              done   ? "bg-brand-blue border-brand-blue" :
              active ? "bg-white border-brand-blue shadow-md shadow-brand-blue/20" :
                       "bg-white border-gray-200"
            }`}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : active ? (
                <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />
              ) : (
                <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
              )}
            </div>
            <p className={`mt-2 text-xs font-bold text-center ${
              active ? "text-brand-blue" : done ? "text-brand" : "text-slate-400"
            }`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sector icon ───────────────────────────────────────────────────────────────

function SectorIcon({ sector }: { sector: string }) {
  const s = sector.toLowerCase();
  if (s.includes("health") || s.includes("care"))
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
    );
  if (s.includes("tech") || s.includes("data") || s.includes("software"))
    return (
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
    );
  if (s.includes("logistic") || s.includes("transport"))
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/candidate/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json() as DashboardData;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Skeleton
  if (loading) {
    return (
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 animate-pulse">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 h-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 h-44" />
              <div className="bg-white border border-gray-100 rounded-2xl p-5 h-44" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 h-52" />
            <div className="bg-brand-blue rounded-2xl p-6 h-64" />
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error || !data) {
    return (
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{error ?? "Something went wrong"}</p>
          <button onClick={load} className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl">Retry</button>
        </div>
      </main>
    );
  }

  const { firstName, candidateStatus, stats, latestApplication, recommendedJobs, profile: profileData } = data;

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">

        {/* Welcome header */}
        <div className="mb-6" data-gsap="fade-down">
          <h1 className="text-[28px] font-black text-brand tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
            {stats.interviewing > 0 ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                You have{" "}
                <span className="font-bold text-brand-blue">{stats.interviewing} interview{stats.interviewing !== 1 ? "s" : ""}</span>{" "}
                in progress.
              </>
            ) : stats.offers > 0 ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                You have{" "}
                <span className="font-bold text-amber-600">{stats.offers} pending offer{stats.offers !== 1 ? "s" : ""}!</span>
              </>
            ) : stats.totalApplied > 0 ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                </svg>
                You have{" "}
                <span className="font-bold text-brand-blue">{stats.totalApplied} application{stats.totalApplied !== 1 ? "s" : ""}</span>{" "}
                in progress.
              </>
            ) : (
              <span className="text-slate-400">Start applying to jobs to track your progress here.</span>
            )}
          </div>

          {/* Resubmission banner */}
          {candidateStatus === "resubmission" && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mt-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-amber-800">Documents under review</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Applications are paused until verification completes.{" "}
                  <Link href="/dashboard/candidate/legal" className="font-bold underline">View status →</Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Latest Application Status */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-brand">Latest Application Status</h2>
                {latestApplication ? (
                  <Link href="/dashboard/candidate/applications" className="text-sm font-semibold text-brand-blue hover:underline truncate ml-4">
                    {latestApplication.jobTitle} @ {latestApplication.company}
                  </Link>
                ) : (
                  <Link href="/dashboard/candidate/jobs" className="text-sm font-semibold text-brand-blue hover:underline">
                    Browse Jobs
                  </Link>
                )}
              </div>

              {latestApplication ? (
                <ApplicationTimeline stage={latestApplication.stage as DbStage} />
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-slate-400">No applications yet. Start applying to see your progress here.</p>
                  <Link href="/dashboard/candidate/jobs" className="inline-block mt-3 px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
                    Find Jobs
                  </Link>
                </div>
              )}
            </div>

            {/* Jobs for You */}
            <div data-gsap="fade-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-brand">Jobs for You</h2>
                <Link href="/dashboard/candidate/jobs" className="text-sm font-semibold text-brand-blue hover:underline">
                  View All
                </Link>
              </div>

              {recommendedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/dashboard/candidate/jobs/${job.id}`}
                      className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <SectorIcon sector={data.sector ?? ""} />
                        {job.remote && (
                          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand">{job.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{job.company} · {job.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-slate-500 text-[11px] font-medium rounded-full">{job.type}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm font-bold text-brand">{job.salary ?? "Competitive"}</span>
                        <span className="text-xs text-slate-400">{job.posted}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                  <p className="text-sm text-slate-400">
                    {data.sector
                      ? `No new ${data.sector} roles at the moment. Check back soon.`
                      : "Select a sector in your profile to see recommended jobs."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Applications Overview */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-brand">Applications Overview</h2>
                <Link href="/dashboard/candidate/applications" className="text-xs font-semibold text-brand-blue hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "Total Applied",
                    value: stats.totalApplied,
                    bg: "bg-blue-50",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Under Review",
                    value: stats.new,
                    bg: "bg-orange-50",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Interviews",
                    value: stats.interviewing,
                    bg: "bg-green-50",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Offers",
                    value: stats.offers,
                    bg: "bg-amber-50",
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    ),
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                    </div>
                    <span className="text-lg font-black text-brand">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="bg-brand-blue rounded-2xl p-6 flex flex-col gap-4" data-gsap="fade-up">
              <h2 className="text-base font-bold text-white">Profile Completeness</h2>

              {/* Circular progress */}
              <div className="flex justify-center my-1">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                    <circle
                      cx="48" cy="48" r="40"
                      fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileData.completeness / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{profileData.completeness}%</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {profileData.checks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    {check.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-300 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 shrink-0" />
                    )}
                    <span className={`text-xs font-medium ${check.done ? "text-white/80 line-through" : "text-white"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>

              {profileData.completeness < 100 && (
                <Link
                  href="/dashboard/candidate/settings"
                  className="w-full bg-white text-brand-blue text-sm font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-center block"
                >
                  Complete Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
