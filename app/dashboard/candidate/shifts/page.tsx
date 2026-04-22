"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AssignmentStatus = "pending" | "confirmed" | "declined";

type ShiftAssignment = {
  assignmentId: string;
  status:       AssignmentStatus;
  assignedAt:   string;
  shiftId:      string;
  date:         string;   // YYYY-MM-DD — every occurrence is its own row
  startTime:    string;   // HH:MM
  endTime:      string;   // HH:MM
  jobTitle:     string;
  isRecurring:  boolean;  // true = part of a recurring series (display badge only)
  shiftStatus:  string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Format a JS Date as YYYY-MM-DD using LOCAL date parts (never UTC, avoids BST-off-by-one) */
function localDate(d: Date): string {
  return isoDate(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Return the date(s) for a shift that fall within the given month.
 * Since every occurrence is now its own DB row, each shift has exactly
 * one date — we just check whether it belongs to this month.
 */
function expandShiftDates(s: ShiftAssignment, year: number, month: number): string[] {
  const monthStart = isoDate(year, month, 1);
  const lastDay    = new Date(year, month + 1, 0).getDate();
  const monthEnd   = isoDate(year, month, lastDay);
  return s.date >= monthStart && s.date <= monthEnd ? [s.date] : [];
}

// Status config
const STATUS_CFG: Record<AssignmentStatus, { label: string; dot: string; badge: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-600 border-amber-200" },
  confirmed: { label: "Confirmed", dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  declined:  { label: "Declined",  dot: "bg-slate-300",  badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

// ─── Shift Card ────────────────────────────────────────────────────────────────

function ShiftCard({ s, date }: { s: ShiftAssignment; date: string }) {
  const cfg = STATUS_CFG[s.status];
  const isPast = date < localDate(new Date());
  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all ${isPast ? "opacity-60" : "hover:shadow-md"} ${s.status === "confirmed" ? "border-green-100" : s.status === "pending" ? "border-amber-100" : "border-gray-100"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand truncate">{s.jobTitle}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-semibold">{s.startTime} – {s.endTime}</span>
        </div>
        {s.isRecurring && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-brand-blue rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            <span className="text-[10px] font-bold">Recurring</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateShiftsPage() {
  const today    = new Date();
  const todayISO = localDate(today);

  const [shifts,       setShifts]       = useState<ShiftAssignment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [calYear,      setCalYear]      = useState(today.getFullYear());
  const [calMonth,     setCalMonth]     = useState(today.getMonth());   // 0-based
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO);
  const [view,         setView]         = useState<"month" | "list">("month");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/candidate/shifts");
      const data = await res.json() as { shifts: ShiftAssignment[] };
      setShifts(data.shifts ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Map date → assignments for the current calendar month
  const dateMap = useMemo(() => {
    const map: Record<string, ShiftAssignment[]> = {};
    for (const s of shifts) {
      if (s.status === "declined") continue; // don't show declined on calendar
      const dates = expandShiftDates(s, calYear, calMonth);
      for (const d of dates) {
        if (!map[d]) map[d] = [];
        map[d].push(s);
      }
    }
    return map;
  }, [shifts, calYear, calMonth]);

  // Shifts for the selected date
  const selectedShifts = useMemo(() => {
    if (!selectedDate) return [];
    return (dateMap[selectedDate] ?? []);
  }, [dateMap, selectedDate]);

  // Calendar grid
  const firstDow  = new Date(calYear, calMonth, 1).getDay();  // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  // Monday-first: shift so Mon=0
  const startOffset = (firstDow + 6) % 7;
  const totalCells  = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  // Stats
  const pendingCount   = shifts.filter((s) => s.status === "pending").length;
  const confirmedCount = shifts.filter((s) => s.status === "confirmed").length;

  // All upcoming confirmed shifts (for list view)
  // Every shift (recurring or not) is its own DB row with a specific date.
  // Just filter out declined and sort chronologically.
  const allUpcoming = useMemo(() => {
    return shifts
      .filter((s) => s.status !== "declined")
      .map((s) => ({ date: s.date, shift: s }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts]);

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" data-gsap="fade-down">
          <div>
            <h1 className="text-[28px] font-black text-brand tracking-tight">My Shifts</h1>
            <p className="text-sm text-slate-400 mt-1">Your upcoming and scheduled work shifts.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Stats */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm font-bold text-amber-700">{pendingCount} pending</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm font-bold text-green-700">{confirmedCount} confirmed</span>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView("month")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "month" ? "bg-brand-blue text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                Calendar
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "list" ? "bg-brand-blue text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline -mt-0.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                List
              </button>
            </div>
            <button onClick={load} disabled={loading} className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-96" />
            <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse h-72" />
          </div>
        ) : view === "month" ? (
          /* ── CALENDAR VIEW ── */
          <div className="grid lg:grid-cols-[1fr_320px] gap-5" data-gsap="fade-up">

            {/* Calendar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <h2 className="text-base font-black text-brand">{MONTHS[calMonth]} {calYear}</h2>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>

              {/* Day headers — Mon first */}
              <div className="grid grid-cols-7 mb-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalCells }).map((_, i) => {
                  const dayNum = i - startOffset + 1;
                  if (dayNum < 1 || dayNum > daysInMonth) {
                    return <div key={i} />;
                  }
                  const dateStr  = isoDate(calYear, calMonth, dayNum);
                  const dayShifts = dateMap[dateStr] ?? [];
                  const isToday   = dateStr === todayISO;
                  const isSelected = dateStr === selectedDate;
                  const isPast    = dateStr < todayISO;
                  const hasPending    = dayShifts.some((s) => s.status === "pending");
                  const hasConfirmed  = dayShifts.some((s) => s.status === "confirmed");

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative flex flex-col items-center py-2 px-1 rounded-xl transition-all min-h-[56px] ${
                        isSelected
                          ? "bg-brand-blue shadow-sm"
                          : isToday
                          ? "bg-brand-blue/10 border border-brand-blue/30"
                          : dayShifts.length > 0
                          ? "hover:bg-gray-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-xs font-bold mb-1 ${
                        isSelected ? "text-white" :
                        isToday    ? "text-brand-blue" :
                        isPast     ? "text-slate-300" :
                                     "text-brand"
                      }`}>
                        {dayNum}
                      </span>
                      {/* Shift dots */}
                      {dayShifts.length > 0 && (
                        <div className="flex items-center gap-0.5 flex-wrap justify-center">
                          {hasConfirmed && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-green-300" : "bg-green-500"}`} />}
                          {hasPending   && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-200" : "bg-amber-400"}`} />}
                          {dayShifts.length > 2 && (
                            <span className={`text-[9px] font-bold ml-0.5 ${isSelected ? "text-white/70" : "text-slate-400"}`}>+{dayShifts.length - 2}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-xs text-slate-500">Confirmed</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs text-slate-500">Pending</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-blue/30 border border-brand-blue/40" /><span className="text-xs text-slate-500">Today</span></div>
              </div>
            </div>

            {/* Selected day detail */}
            <div data-gsap="fade-up">
              {selectedDate ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-brand">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    </h3>
                    {selectedDate === todayISO && (
                      <span className="px-2.5 py-0.5 bg-brand-blue text-white text-[10px] font-bold rounded-full">Today</span>
                    )}
                  </div>
                  {selectedShifts.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 mx-auto mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                      </svg>
                      <p className="text-xs text-slate-400">No shifts on this day</p>
                    </div>
                  ) : (
                    selectedShifts.map((s) => (
                      <ShiftCard key={s.assignmentId} s={s} date={selectedDate} />
                    ))
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                  <p className="text-xs text-slate-400">Select a date to view shifts</p>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── LIST VIEW ── */
          <div className="space-y-3" data-gsap="fade-up">
            {allUpcoming.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-200 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                <p className="text-sm font-bold text-brand mb-1">No shifts assigned yet</p>
                <p className="text-xs text-slate-400">Shifts assigned by the admin will appear here.</p>
              </div>
            ) : (
              (() => {
                // Group by month
                const groups: Record<string, { date: string; shift: ShiftAssignment }[]> = {};
                for (const item of allUpcoming) {
                  const key = item.date.slice(0, 7); // YYYY-MM
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(item);
                }
                return Object.entries(groups).map(([key, items]) => {
                  const [y, m] = key.split("-").map(Number);
                  return (
                    <div key={key}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                        {MONTHS[m - 1]} {y}
                      </p>
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <ShiftCard key={`${item.shift.assignmentId}-${i}`} s={item.shift} date={item.date} />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        )}
      </main>
    </>
  );
}
