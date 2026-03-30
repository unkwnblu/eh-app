"use client";

import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────

const APPLICATION_STEPS = [
  { key: "applied",   label: "Applied",   date: "Sep 20",  done: true,  current: false, note: null },
  { key: "reviewing", label: "Reviewing", date: "Sep 24",  done: true,  current: false, note: null },
  { key: "interview", label: "Interview", date: "Oct 1",   done: false, current: true,  note: "Upcoming: Oct 1" },
  { key: "offer",     label: "Offer",     date: "Pending", done: false, current: false, note: null },
];

const OVERVIEW_STATS = [
  {
    label: "Total Applied",
    value: 24,
    bg: "bg-blue-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
      </svg>
    ),
  },
  {
    label: "Under Review",
    value: 8,
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
    value: 3,
    bg: "bg-green-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

const RECOMMENDED_JOBS = [
  {
    id: 1,
    title: "Product Designer",
    company: "Stellar Global",
    location: "San Francisco",
    tags: ["Remote", "Full-time", "Figma"],
    salary: "$120k – $150k",
    postedAgo: "2 days ago",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "UX Researcher",
    company: "Lumina Systems",
    location: "Austin, TX",
    tags: ["Hybrid", "Full-time", "UserTesting"],
    salary: "$110k – $135k",
    postedAgo: "5 hours ago",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
  },
];

// ─── Application timeline ──────────────────────────────────────────────────────

function ApplicationTimeline() {
  const total = APPLICATION_STEPS.length;
  const doneCount = APPLICATION_STEPS.filter((s) => s.done).length;

  return (
    <div className="relative flex items-start justify-between pt-2 pb-4">
      {/* Base track */}
      <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-200" />
      {/* Filled track */}
      <div
        className="absolute top-[18px] left-0 h-0.5 bg-brand-blue"
        style={{ width: `${(doneCount / (total - 1)) * 100}%` }}
      />

      {APPLICATION_STEPS.map((step) => (
        <div
          key={step.key}
          className="relative flex flex-col items-center z-10"
          style={{ width: `${100 / total}%` }}
        >
          <div
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
              step.done
                ? "bg-brand-blue border-brand-blue"
                : step.current
                ? "bg-white border-brand-blue shadow-md shadow-brand-blue/20"
                : "bg-white border-gray-200"
            }`}
          >
            {step.done ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : step.current ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </div>

          <p className={`mt-2 text-xs font-bold text-center ${step.current ? "text-brand-blue" : step.done ? "text-brand" : "text-slate-400"}`}>
            {step.label}
          </p>
          {step.note ? (
            <p className="text-[10px] font-semibold text-brand-blue mt-0.5">{step.note}</p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-0.5">{step.date}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: typeof RECOMMENDED_JOBS[number] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          {job.icon}
        </div>
        <button className="p-1.5 text-slate-300 hover:text-brand-blue transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </div>

      <div>
        <h3 className="text-sm font-bold text-brand">{job.title}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{job.company} • {job.location}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-slate-500 text-[11px] font-medium rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm font-bold text-brand">{job.salary}</span>
        <span className="text-xs text-slate-400">{job.postedAgo}</span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateDashboardPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
      {/* Welcome header */}
      <div className="mb-6" data-gsap="fade-down">
        <h1 className="text-[28px] font-black text-brand tracking-tight">Welcome back, Alex!</h1>
        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-500">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          You have{" "}
          <span className="font-bold text-brand-blue">2 interviews</span>{" "}
          scheduled for this week.
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Latest Application Status */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-brand">Latest Application Status</h2>
              <Link href="/dashboard/candidate/applications" className="text-sm font-semibold text-brand-blue hover:underline">
                Senior Product Designer @ TechFlow
              </Link>
            </div>
            <ApplicationTimeline />
          </div>

          {/* Jobs for You */}
          <div data-gsap="fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-brand">Jobs for You</h2>
              <Link href="/dashboard/candidate/jobs" className="text-sm font-semibold text-brand-blue hover:underline">
                View All Recommendations
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RECOMMENDED_JOBS.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Applications Overview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
            <h2 className="text-base font-bold text-brand mb-4">Applications Overview</h2>
            <div className="space-y-2">
              {OVERVIEW_STATS.map((stat) => (
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

          {/* Interview Readiness */}
          <div className="bg-brand-blue rounded-2xl p-6 flex flex-col gap-4" data-gsap="fade-up">
            <h2 className="text-base font-bold text-white">Interview Readiness</h2>

            {/* Circular progress */}
            <div className="flex justify-center my-1">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * 0.15}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">85%</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-white">Profile Completeness</p>
              <p className="text-xs text-white/60 mt-0.5">Add a case study to reach 100%</p>
            </div>

            <button className="w-full bg-white text-brand-blue text-sm font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors">
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
