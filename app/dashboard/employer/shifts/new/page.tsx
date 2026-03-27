"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOB_TITLES = [
  "Healthcare Assistant",
  "Senior Support Worker",
  "ICU Specialist Nurse",
  "Staff Nurse — A&E",
  "Warehouse Operative",
  "Night Shift Driver",
  "Front of House",
];

const CERTIFICATIONS = [
  { id: "dbs", label: "Enhanced DBS Check", description: "Must be valid within last 12 months", defaultChecked: true },
  { id: "training", label: "Mandatory Training", description: "Core health & safety modules", defaultChecked: true },
  { id: "rtw", label: "Right to Work in UK", description: "Passport or biometric permit", defaultChecked: false },
];

type ExperienceLevel = "Junior" | "Mid-Level" | "Senior";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const upper = t.toUpperCase();
  const isPM = upper.includes("PM");
  const isAM = upper.includes("AM");
  const clean = t.replace(/[AaPpMm]/g, "").trim();
  const [hStr, mStr] = clean.split(":");
  let h = parseInt(hStr) || 0;
  const m = parseInt(mStr) || 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PostNewShiftPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00 AM");
  const [endTime, setEndTime] = useState("04:00 PM");
  const [staffCount, setStaffCount] = useState(1);
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("Mid-Level");
  const [certs, setCerts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CERTIFICATIONS.map((c) => [c.id, c.defaultChecked]))
  );
  const [savedAt, setSavedAt] = useState("2m ago");

  // Simulate auto-save timestamp cycling
  useEffect(() => {
    const mins = ["just now", "1m ago", "2m ago", "3m ago"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % mins.length;
      setSavedAt(mins[i]);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const totalHours = useMemo(() => {
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);
    const diff = endMins - startMins;
    return Math.max(0, diff / 60);
  }, [startTime, endTime]);

  function toggleCert(id: string) {
    setCerts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
        <main className="flex-1 px-8 py-8 pb-28 space-y-6">
          {/* Page title */}
          <h1 className="text-[28px] font-black text-brand tracking-tight" data-gsap="fade-down">
            Post New Shift
          </h1>

          {/* ── Basic Information ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7" data-gsap="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-brand">Basic Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 bg-white outline-none focus:border-brand-blue transition-colors pr-10"
                  >
                    <option value="" disabled>Select Job Title</option>
                    {JOB_TITLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Geriatrics, Emergency"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
              <div className="relative mb-3">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Search for a healthcare facility or enter address"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                />
              </div>

              {/* Map placeholder */}
              <div className="w-full h-[100px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden relative">
                {/* Faint map grid lines */}
                <div className="absolute inset-0 opacity-30">
                  {[20, 40, 60, 80].map((pct) => (
                    <div key={`h${pct}`} className="absolute w-full border-t border-gray-300" style={{ top: `${pct}%` }} />
                  ))}
                  {[20, 40, 60, 80].map((pct) => (
                    <div key={`v${pct}`} className="absolute h-full border-l border-gray-300" style={{ left: `${pct}%` }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 z-10">Preview Map</span>
              </div>
            </div>
          </div>

          {/* ── Shift Details ──────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7" data-gsap="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-brand">Shift Details</h2>
            </div>

            {/* Date + times row */}
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date Selector</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>

            {/* Calculated time + staff row */}
            <div className="flex items-center gap-5">
              {/* Calculated time chip */}
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Calculated Time</p>
                    <p className="text-lg font-black text-brand-blue leading-tight">
                      {totalHours % 1 === 0 ? totalHours.toFixed(1) : totalHours.toFixed(1)} Total Hours
                    </p>
                  </div>
                </div>
                <div className="border-l border-blue-200 pl-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Break Time</p>
                  <p className="text-sm font-semibold text-slate-600">30 min included</p>
                </div>
              </div>

              {/* Staff stepper */}
              <div className="shrink-0">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Number of Staff Needed</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setStaffCount((n) => Math.max(1, n - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-brand transition-colors border-r border-gray-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                  <span className="w-16 text-center text-sm font-bold text-brand">{staffCount}</span>
                  <button
                    onClick={() => setStaffCount((n) => n + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-brand transition-colors border-l border-gray-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Pay & Compliance ───────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7" data-gsap="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-brand">Pay & Compliance</h2>
            </div>

            <div className="grid grid-cols-2 gap-10">
              {/* Left: pay + experience */}
              <div className="space-y-6">
                {/* Hourly rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Hourly Rate (£/P)
                  </label>
                  <div className="relative flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-blue transition-colors">
                    <span className="px-3.5 text-sm font-semibold text-slate-500 border-r border-gray-200 bg-gray-50 h-full flex items-center py-2.5">
                      £
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none bg-white"
                    />
                    <span className="px-3.5 text-xs text-slate-400 border-l border-gray-200 bg-gray-50 h-full flex items-center py-2.5">
                      / hour
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    Market average for this role is £14.50 – £16.00
                  </p>
                </div>

                {/* Experience level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Experience Level</label>
                  <div className="flex items-center gap-2">
                    {(["Junior", "Mid-Level", "Senior"] as ExperienceLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setExperience(lvl)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          experience === lvl
                            ? "bg-white border-brand-blue text-brand-blue shadow-sm"
                            : "bg-white border-gray-200 text-slate-400 hover:border-gray-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: certifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-3">Required Certifications</label>
                <div className="space-y-3">
                  {CERTIFICATIONS.map((cert) => (
                    <label
                      key={cert.id}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        onClick={() => toggleCert(cert.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          certs[cert.id]
                            ? "bg-brand-blue border-brand-blue"
                            : "border-gray-300 group-hover:border-brand-blue/50"
                        }`}
                      >
                        {certs[cert.id] && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand leading-none">{cert.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{cert.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Sticky bottom bar ─────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            DRAFT AUTO-SAVED {savedAt.toUpperCase()}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/employer/shifts"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors shadow-sm">
              Post Shift Now
            </button>
          </div>
        </div>
    </>
  );
}
