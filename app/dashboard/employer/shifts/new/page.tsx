"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LiveJob = {
  id: string;
  title: string;
  sector: string;
};

type RepeatType = "daily" | "weekly";

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

/** Generate all dates (YYYY-MM-DD) between startDate and endDate matching the pattern */
function generateRecurringDates(
  startDate: string,
  endDate: string,
  repeatType: RepeatType,
  weekDays: number[],   // 0=Sun … 6=Sat
): string[] {
  if (!startDate || !endDate) return [];
  const dates: string[] = [];
  const end = new Date(endDate + "T00:00:00");
  const cur = new Date(startDate + "T00:00:00");
  // Guard against huge ranges
  let safety = 0;
  while (cur <= end && safety < 500) {
    const dow = cur.getDay();
    if (repeatType === "daily" || (repeatType === "weekly" && weekDays.includes(dow))) {
      dates.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
    safety++;
  }
  return dates;
}

const DAYS = [
  { label: "Mon", dow: 1 },
  { label: "Tue", dow: 2 },
  { label: "Wed", dow: 3 },
  { label: "Thu", dow: 4 },
  { label: "Fri", dow: 5 },
  { label: "Sat", dow: 6 },
  { label: "Sun", dow: 0 },
];

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

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Form state ────────────────────────────────────────────────────────────
  const preSelectedJobId = searchParams.get("jobId") ?? "";
  const [selectedJobId, setSelectedJobId] = useState(preSelectedJobId);
  const [department,    setDepartment]    = useState("");
  const [location,      setLocation]      = useState("");
  const [date,          setDate]          = useState("");
  const [startTime,     setStartTime]     = useState("08:00");
  const [endTime,       setEndTime]       = useState("16:00");
  const [breakMins,     setBreakMins]     = useState(30);
  const [staffCount,    setStaffCount]    = useState(1);
  const [saving,        setSaving]        = useState(false);

  // ── Recurring state ───────────────────────────────────────────────────────
  const [recurring,    setRecurring]    = useState(false);
  const [repeatType,   setRepeatType]   = useState<RepeatType>("weekly");
  const [weekDays,     setWeekDays]     = useState<number[]>([]);
  const [endDate,      setEndDate]      = useState("");

  // ── Geocoding / map preview ───────────────────────────────────────────────
  type Suggestion = { display_name: string; lat: string; lon: string };
  const [coords,          setCoords]          = useState<{ lat: number; lon: number } | null>(null);
  const [geocoding,       setGeocoding]       = useState(false);
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!location.trim() || location.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = await res.json() as Suggestion[];
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        // Auto-set coords to first result so map updates as you type
        if (data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      } catch {
        // silently ignore network errors
      } finally {
        setGeocoding(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [location]);

  // Pre-select job if URL param is present
  useEffect(() => {
    if (preSelectedJobId && jobs.some((j) => j.id === preSelectedJobId)) {
      setSelectedJobId(preSelectedJobId);
    }
  }, [preSelectedJobId, jobs]);

  const totalHours = useMemo(() => {
    const diff = timeToMinutes(endTime) - timeToMinutes(startTime) - breakMins;
    return Math.max(0, diff / 60);
  }, [startTime, endTime, breakMins]);

  // Preview dates for recurring — default end date to 3 months from start if not set
  const recurringDates = useMemo(() => {
    if (!recurring || !date) return [];
    if (repeatType === "weekly" && weekDays.length === 0) return [];
    const resolvedEnd = endDate || (() => {
      const d = new Date(date + "T00:00:00");
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().slice(0, 10);
    })();
    return generateRecurringDates(date, resolvedEnd, repeatType, weekDays);
  }, [recurring, date, endDate, repeatType, weekDays]);

  function toggleWeekDay(dow: number) {
    setWeekDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
    );
  }

  async function handleSubmit() {
    if (!selectedJobId) { toast("Please select a job.", "error"); return; }
    if (!date)           { toast("Please select a start date.", "error"); return; }
    if (!startTime)      { toast("Please enter a start time.", "error"); return; }
    if (!endTime)        { toast("Please enter an end time.", "error"); return; }

    if (recurring) {
      if (repeatType === "weekly" && weekDays.length === 0) { toast("Select at least one day of the week.", "error"); return; }
      if (recurringDates.length === 0)                      { toast("No shifts would be created in this date range.", "error"); return; }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/employer/shifts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId:              selectedJobId,
          date,                               // start date (or the single date for one-time)
          startTime:          startTime.length === 5 ? startTime + ":00" : startTime,
          endTime:            endTime.length === 5 ? endTime + ":00" : endTime,
          department:         department.trim() || null,
          location:           location.trim() || null,
          staffNeeded:        staffCount,
          breakMinutes:       breakMins,
          isRecurring:        recurring,
          recurrenceType:     recurring ? repeatType : undefined,
          recurrenceDays:     recurring && repeatType === "weekly" ? weekDays : undefined,
          recurrenceEndDate:  recurring && endDate ? endDate : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Failed to post shift");
      }

      toast(recurring ? "Recurring shift posted successfully" : "Shift posted successfully", "success");
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
        <h1 className="text-[28px] font-black text-brand tracking-tight" data-gsap="fade-down">
          Post New Shift
        </h1>

        {/* ── Basic Information ─────────────────────────────────────────────── */}
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
                    <option key={j.id} value={j.id}>{j.title} — {j.sector}</option>
                  ))}
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              {!loadingJobs && jobs.length === 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  No live jobs.{" "}
                  <Link href="/dashboard/employer/jobs" className="text-brand-blue font-semibold hover:underline">Post a job first</Link>
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
              {/* Pin icon or spinner */}
              {geocoding ? (
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin w-3.5 h-3.5 text-brand-blue" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              )}
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); if (!e.target.value.trim()) setCoords(null); }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search for a healthcare facility or enter address"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => {
                        setLocation(s.display_name);
                        setCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-xs text-slate-600 leading-snug line-clamp-2">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map preview */}
            <div className="w-full h-[180px] rounded-xl border border-gray-200 overflow-hidden relative">
              {coords ? (
                <>
                  <iframe
                    key={`${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.012},${coords.lat - 0.008},${coords.lon + 0.012},${coords.lat + 0.008}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                    className="w-full h-full"
                    title="Location preview"
                    style={{ border: 0 }}
                  />
                  {/* Interaction blocker — prevents clicking/panning inside the iframe */}
                  <div className="absolute inset-0" style={{ cursor: "default" }} />
                  {/* Attribution */}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=15/${coords.lat}/${coords.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-1 right-1.5 text-[9px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded hover:underline z-10"
                  >
                    © OpenStreetMap
                  </a>
                </>
              ) : (
                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {geocoding ? "Searching…" : "Enter a location to preview map"}
                  </span>
                </div>
              )}
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
                {recurring ? "Start Date" : "Date"} <span className="text-red-400">*</span>
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

          {/* Break time */}
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

          {/* Summary + staff */}
          <div className="flex items-center gap-5">
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Paid Hours</p>
                  <p className="text-lg font-black text-brand-blue leading-tight">{totalHours.toFixed(1)} hrs</p>
                </div>
              </div>
              <div className="border-l border-blue-200 pl-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Shift Duration</p>
                <p className="text-sm font-semibold text-slate-600">
                  {(Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime)) / 60).toFixed(1)} hrs total
                </p>
              </div>
              {breakMins > 0 && (
                <div className="border-l border-blue-200 pl-6">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Break</p>
                  <p className="text-sm font-semibold text-slate-600">{breakMins} min unpaid</p>
                </div>
              )}
            </div>
            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Number of Staff Needed</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setStaffCount((n) => Math.max(1, n - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-brand transition-colors border-r border-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                </button>
                <span className="w-16 text-center text-sm font-bold text-brand">{staffCount}</span>
                <button type="button" onClick={() => setStaffCount((n) => n + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-brand transition-colors border-l border-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Schedule / Recurrence ─────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-7" data-gsap="fade-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-brand">Schedule</h2>
                <p className="text-xs text-slate-400 mt-0.5">Post a one-time or recurring shift pattern</p>
              </div>
            </div>

            {/* One-time / Recurring toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setRecurring(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  !recurring ? "bg-white text-brand shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setRecurring(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  recurring ? "bg-white text-brand shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Recurring
              </button>
            </div>
          </div>

          {!recurring ? (
            <div className="flex items-center gap-3 py-2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              <span className="text-sm">This shift will be posted for the single date selected above.</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Repeat type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Repeat</label>
                <div className="flex items-center gap-2">
                  {(["daily", "weekly"] as RepeatType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRepeatType(type)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                        repeatType === type
                          ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                          : "bg-white text-slate-500 border-gray-200 hover:border-brand-blue/40"
                      }`}
                    >
                      {type === "daily" ? "Every day" : "Specific days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day picker (weekly only) */}
              {repeatType === "weekly" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Days of the week</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {DAYS.map(({ label, dow }) => (
                      <button
                        key={dow}
                        type="button"
                        onClick={() => toggleWeekDay(dow)}
                        className={`w-12 h-12 rounded-xl text-xs font-bold border transition-all ${
                          weekDays.includes(dow)
                            ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                            : "bg-white text-slate-500 border-gray-200 hover:border-brand-blue/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* End date */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    End Date <span className="text-slate-400 font-normal">(optional — defaults to 3 months)</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={date || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-brand-blue transition-colors"
                  />
                </div>

                {/* Preview count */}
                <div className="flex items-end pb-0.5">
                  {recurringDates.length > 0 ? (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-3 w-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <div>
                        <p className="text-sm font-black text-green-700">{recurringDates.length} shift{recurringDates.length !== 1 ? "s" : ""} will be created</p>
                        <p className="text-[10px] text-green-600">
                          {recurringDates[0]} → {recurringDates[recurringDates.length - 1]}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 w-full text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-xs">
                        {!date
                          ? "Set a start date above to preview"
                          : repeatType === "weekly" && weekDays.length === 0
                          ? "Select at least one day"
                          : "No shifts in this range"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming dates preview (first 5) */}
              {recurringDates.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Upcoming shifts preview</p>
                  <div className="flex flex-wrap gap-2">
                    {recurringDates.slice(0, 8).map((d) => (
                      <span key={d} className="px-3 py-1 bg-blue-50 text-brand-blue text-xs font-semibold rounded-lg">
                        {new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    ))}
                    {recurringDates.length > 8 && (
                      <span className="px-3 py-1 bg-gray-100 text-slate-400 text-xs font-semibold rounded-lg">
                        +{recurringDates.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Sticky bottom bar ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          {saving ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-brand-blue" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              <span className="text-brand-blue">
                {recurring && recurringDates.length > 1 ? `POSTING ${recurringDates.length} SHIFTS…` : "POSTING SHIFT…"}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400" />
              {recurring && recurringDates.length > 0
                ? `READY — ${recurringDates.length} SHIFT${recurringDates.length !== 1 ? "S" : ""} TO POST`
                : "READY TO POST"}
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
            {recurring && recurringDates.length > 1
              ? `Post ${recurringDates.length} Shifts`
              : "Post Shift Now"}
          </button>
        </div>
      </div>
    </>
  );
}
