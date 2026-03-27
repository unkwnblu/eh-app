"use client";

import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ComplianceStatus = "verified" | "renewal" | "na";

type Shift = {
  id: number;
  day: string;
  date: string;
  type: string;
  timeRange: string;
  hours: number;
  location: string;
  candidateName: string | null;
  candidateRole: string | null;
  compliance: ComplianceStatus;
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const SHIFTS: Shift[] = [
  {
    id: 1,
    day: "Tue",
    date: "Oct 24",
    type: "Day Shift",
    timeRange: "08:00 – 16:30",
    hours: 8.5,
    location: "St. Jude Medical Center",
    candidateName: "Sarah Jenkins",
    candidateRole: "CERTIFIED HCA",
    compliance: "verified",
  },
  {
    id: 2,
    day: "Wed",
    date: "Oct 25",
    type: "Night Shift",
    timeRange: "20:00 – 06:00",
    hours: 10,
    location: "Oak Ridge Care Home",
    candidateName: "Marcus Wong",
    candidateRole: "SENIOR HCA",
    compliance: "renewal",
  },
  {
    id: 3,
    day: "Thu",
    date: "Oct 26",
    type: "Morning Shift",
    timeRange: "06:00 – 14:00",
    hours: 8,
    location: "Harbour View Clinic",
    candidateName: null,
    candidateRole: null,
    compliance: "na",
  },
];

const COMPLIANCE_ALERTS = [
  {
    id: 1,
    level: "urgent" as const,
    title: "URGENT RENEWAL",
    body: "DBS Certificate expiring for Marcus Wong in 3 days.",
  },
  {
    id: 2,
    level: "warning" as const,
    title: "TRAINING DUE",
    body: "Manual Handling update needed for 4 candidates.",
  },
];

// ─── Compliance badge ──────────────────────────────────────────────────────────

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        VERIFIED
      </span>
    );
  }
  if (status === "renewal") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        RENEWAL NEEDED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-slate-400 text-xs font-semibold">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
      N/A
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ManageShiftsPage() {
  return (
    <>
        <main className="flex-1 px-8 py-8">
          {/* Top row: hero + stats */}
          <div className="flex gap-4 mb-6" data-gsap="fade-down">
            {/* Hero banner */}
            <div className="relative flex-1 min-h-[140px] bg-brand-blue rounded-2xl px-8 py-6 overflow-hidden flex flex-col justify-between">
              {/* Faint background icon */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
                  <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Healthcare Assistant</h2>
                <p className="text-sm text-white/70 mt-1">Active Recruitment & Shift Management</p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Link href="/dashboard/employer/shifts/new" className="px-4 py-2 bg-white text-brand-blue rounded-lg text-xs font-bold tracking-wide hover:bg-white/90 transition-colors">
                  NEW SHIFT
                </Link>
                <button className="px-4 py-2 border border-white/40 text-white rounded-lg text-xs font-bold tracking-wide hover:bg-white/10 transition-colors">
                  BROADCAST
                </button>
              </div>
            </div>

            {/* Fill Rate */}
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 w-[220px] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fill Rate</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <p className="text-3xl font-black text-brand">94.2%</p>
              <p className="text-xs font-semibold text-green-500">+2.4% from last week</p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-green-400 rounded-full" style={{ width: "94.2%" }} />
              </div>
            </div>

            {/* Coverage */}
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 w-[220px] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Coverage</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-3xl font-black text-brand">18<span className="text-slate-300 font-light">/</span><span className="text-xl">20</span></p>
              <p className="text-xs text-slate-400">Pending approval: <span className="font-semibold text-slate-500">2</span></p>
              {/* Avatar stack */}
              <div className="flex items-center gap-1 mt-1">
                <div className="flex -space-x-2">
                  {["bg-teal-400", "bg-blue-400", "bg-purple-400"].map((c, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-brand-blue ml-1">+15</span>
              </div>
            </div>
          </div>

          {/* Main content row */}
          <div className="flex gap-4">
            {/* Upcoming Shifts table */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden" data-gsap="fade-up">
              {/* Table header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-brand">Upcoming Shifts</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                    </svg>
                    Filters
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-6 py-3 border-b border-gray-50">
                {["Shift Schedule", "Location", "Assigned Candidate", "Compliance Status", "Actions"].map((h) => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {SHIFTS.map((shift) => (
                  <div key={shift.id} className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    {/* Schedule */}
                    <div>
                      <p className="text-sm font-bold text-brand">
                        {shift.day}, {shift.date} • {shift.type}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {shift.timeRange} ({shift.hours} hrs)
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-1.5 text-sm text-slate-500">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="leading-tight">{shift.location}</span>
                    </div>

                    {/* Candidate */}
                    {shift.candidateName ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold shrink-0">
                          {shift.candidateName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand leading-none">{shift.candidateName}</p>
                          <p className="text-[10px] font-bold text-brand-blue mt-0.5">{shift.candidateRole}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-400 italic">Awaiting Assignment</p>
                      </div>
                    )}

                    {/* Compliance */}
                    <ComplianceBadge status={shift.compliance} />

                    {/* Actions */}
                    {shift.compliance === "na" ? (
                      <button className="px-4 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors whitespace-nowrap">
                        QUICK FILL
                      </button>
                    ) : (
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer / pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-slate-400">
                  Showing 1-12 of 48 shifts for <span className="font-semibold text-slate-500">&apos;Healthcare Assistant&apos;</span>
                </p>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        p === 1 ? "bg-brand-blue text-white" : "text-slate-400 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Compliance Alerts panel */}
            <div className="w-[240px] shrink-0" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-brand mb-4">Compliance Alerts</h3>
                <div className="space-y-3">
                  {COMPLIANCE_ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className={`rounded-xl p-3.5 ${
                        alert.level === "urgent" ? "bg-red-50" : "bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {alert.level === "urgent" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                        )}
                        <span
                          className={`text-[10px] font-bold tracking-wide ${
                            alert.level === "urgent" ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{alert.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* Floating add button */}
      <Link href="/dashboard/employer/shifts/new" className="fixed bottom-8 right-8 w-12 h-12 bg-brand-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-blue-dark transition-colors z-50">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </>
  );
}
