"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Constants ─────────────────────────────────────────────────────────────────


// ─── Types ─────────────────────────────────────────────────────────────────────

type LiveJob = {
  id: string;
  title: string;
  sector: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const upper = t.toUpperCase();
  const isPM = upper.includes("PM");
  const isAM = upper.includes("AM");
  const clean = t.replace(/[AaPpMm\s]/g, "").trim();
  const [hStr, mStr] = clean.split(":");
  let h = parseInt(hStr) || 0;
  const m = parseInt(mStr) || 0;
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PostNewShiftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/employer/jobs");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { jobs: (LiveJob & { status: string })[] };
      setJobs((data.jobs ?? []).filter((j) => j.status === "live"));
    } catch {
      toast("Could not load jobs.", "error");
    } finally {
      setLoadingJobs(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── Form state ────────────────────────────────────────────────────────────
  const preSelectedJobId = searchParams.get("jobId") ?? "";
  const [selectedJobId, setSelectedJobId] = useState(preSelectedJobId);
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [breakMins, setBreakMins] = useState(30);
  const [staffCount, setStaffCount] = useState(1);
  const [saving, setSaving] = useState(false);

  // Pre-select job if URL param is present and jobs have loaded
  useEffect(() => {
    if (preSelectedJobId && jobs.some((j) => j.id === preSelectedJobId)) {
      setSelectedJobId(preSelectedJobId);
    }
  }, [preSelectedJobId, jobs]);

  const totalHours = useMemo(() => {
    const startMins = timeToMinutes(startTime);
    const endMins   = timeToMinutes(endTime);
    const diff      = endMins - startMins - breakMins;
    return Math.max(0, diff / 60);
  }, [startTime, endTime, breakMins]);

  async function handleSubmit() {
    if (!selectedJobId) { toast("Please select a job.", "error"); return; }
    if (!date)           { toast("Please select a date.", "error"); return; }
    if (!startTime)      { toast("Please enter a start time.", "error"); return; }
    if (!endTime)        { toast("Please enter an end time.", "error"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/employer/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId:        selectedJobId,
          date,
          startTime:    startTime.length === 5 ? startTime + ":00" : startTime,
          endTime:      endTime.length === 5 ? endTime + ":00" : endTime,
          department:   department.trim() || null,
          location:     location.trim() || null,
          staffNeeded:  staffCount,
          breakMinutes: breakMins,
        }),
      });

      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Failed to post shift");
      }

      toast("Shift posted successfully", "success");
      router.push(`/dashboard/employer/shifts/${selectedJobId}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to post shift", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-8 py-8 pb-28 space-y-6">
        {/* Page title */}
        <h1
          className="text-[28px] font-black text-brand tracking-tight"
          data-gsap="fade-down"
        >
          Post New Shift
        </h1>

        {/* ── Basic Information ───────────────────────────────────────────── */}
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
            {/* Job selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Job <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={loadingJobs}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 bg-white outline-none focus:border-brand-blue transition-colors pr-10 disabled:opacity-50"
                >
                  <option value="" disabled>
                    {loadingJobs ? "Loading jobs…" : "Select a live job"}
                  </option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.sector}
                    </option>
                  ))}
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              {!loadingJobs && jobs.length === 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  No live jobs.{" "}
                  <Link href="/dashboard/employer/jobs" className="text-brand-blue font-semibold hover:underline">
                    Post a job first
                  </Link>
                </p>
              )}
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

        {/* ── Shift Details ─────────────────────────────────────────────────── */}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Start Time <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                End Time <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Break time selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Break Time</label>
            <div className="flex items-center gap-2">
              {([0, 15, 30, 45, 60] as const).map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setBreakMins(mins)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    breakMins === mins
                      ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                      : "bg-white text-slate-500 border-gray-200 hover:border-brand-blue/40"
                  }`}
                >
                  {mins === 0 ? "No break" : `${mins} min`}
                </button>
              ))}
            </div>
          </div>

          {/* Summary + staff row */}
          <div className="flex items-center gap-5">
            {/* Calculated time chip */}
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Paid Hours</p>
                  <p className="text-lg font-black text-brand-blue leading-tight">
                    {totalHours.toFixed(1)} hrs
                  </p>
                </div>
              </div>
              <div className="border-l border-blue-200 pl-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Shift Duration</p>
                <p className="text-sm font-semibold text-slate-600">
                  {(() => {
                    const raw = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
                    return `${(raw / 60).toFixed(1)} hrs total`;
                  })()}
                </p>
              </div>
              {breakMins > 0 && (
                <div className="border-l border-blue-200 pl-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Break</p>
                  <p className="text-sm font-semibold text-slate-600">{breakMins} min unpaid</p>
                </div>
              )}
            </div>

            {/* Staff stepper */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Number of Staff Needed</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setStaffCount((n) => Math.max(1, n - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-brand transition-colors border-r border-gray-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="w-16 text-center text-sm font-bold text-brand">{staffCount}</span>
                <button
                  type="button"
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

      </main>

      {/* ── Sticky bottom bar ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          {saving ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-brand-blue" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              <span className="text-brand-blue">POSTING SHIFT…</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              READY TO POST
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={selectedJobId ? `/dashboard/employer/shifts/${selectedJobId}` : "/dashboard/employer/shifts"}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors shadow-sm disabled:opacity-60"
          >
            Post Shift Now
          </button>
        </div>
      </div>
    </>
  );
}
