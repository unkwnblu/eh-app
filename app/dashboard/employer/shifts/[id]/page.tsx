"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ShiftStatus = "open" | "filled" | "cancelled";

type Assignment = {
  id: string;
  candidateId: string;
  candidateName: string;
  status: "pending" | "confirmed" | "cancelled";
  assignedAt: string;
};

type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  department: string | null;
  location: string | null;
  staffNeeded: number;
  hourlyRate: number | null;
  experienceLevel: string;
  status: ShiftStatus;
  assignments: Assignment[];
  isRecurring: boolean;
  recurrenceType: "daily" | "weekly" | null;
  recurrenceDays: number[] | null;
  recurrenceEndDate: string | null;
};

type JobDetail = {
  id: string;
  title: string;
  sector: string;
  location: string;
  employmentType: string;
  status: string;
};

type FilterTab = "all" | "open" | "filled" | "cancelled";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
}

function hoursWorked(start: string, end: string, breakMins = 0): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + (sm || 0)) - breakMins;
  return Math.max(0, diff / 60);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function recurrenceLabel(shift: Shift): string | null {
  if (!shift.isRecurring) return null;
  if (shift.recurrenceType === "daily") return "Every day";
  if (shift.recurrenceType === "weekly" && shift.recurrenceDays?.length) {
    const sorted = [...shift.recurrenceDays].sort((a, b) => a - b);
    if (sorted.join() === "1,2,3,4,5") return "Mon–Fri";
    if (sorted.join() === "0,1,2,3,4,5,6") return "Every day";
    return sorted.map((d) => DOW[d]).join(", ");
  }
  return "Recurring";
}

function effectiveStatus(shift: Shift): ShiftStatus {
  if (shift.status === "cancelled") return "cancelled";
  const confirmed = shift.assignments.filter((a) => a.status === "confirmed").length;
  return confirmed > 0 && confirmed >= (shift.staffNeeded || 1) ? "filled" : "open";
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, icon, progress,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent: "blue" | "green" | "amber" | "slate";
  icon: React.ReactNode;
  progress?: number;
}) {
  const accentBg = {
    blue:  "bg-brand-blue/10 text-brand-blue",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-gray-100 text-slate-500",
  }[accent];
  const barColor = {
    blue: "bg-brand-blue", green: "bg-green-400", amber: "bg-amber-400", slate: "bg-slate-300",
  }[accent];
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 min-h-[124px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accentBg}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-brand leading-none">{value}</span>
      </div>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
      {typeof progress === "number" && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <main className="flex-1 px-8 py-8 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-7 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-80 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[124px] bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="bg-gray-200 rounded-2xl h-[400px]" />
    </main>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ManageShiftsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => { document.title = "Manage Shifts | Edge Harbour"; }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/shifts?jobId=${id}`);
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? "Failed to load");
      }
      const data = await res.json() as { job: JobDetail; shifts: Shift[] };
      setJob(data.job);
      setShifts(data.shifts ?? []);
      if (data.job?.title) document.title = `${data.job.title} | Edge Harbour`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function patchStatus(shiftId: string, next: ShiftStatus, prev: ShiftStatus, label: string) {
    setActioningId(shiftId);
    setOpenMenuId(null);
    setShifts((p) => p.map((s) => s.id === shiftId ? { ...s, status: next } : s));
    try {
      const res = await fetch(`/api/employer/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast(`Shift ${label}.`, next === "cancelled" ? "info" : "success");
    } catch {
      setShifts((p) => p.map((s) => s.id === shiftId ? { ...s, status: prev } : s));
      toast(`Failed to ${label.toLowerCase()} shift.`, "error");
    } finally {
      setActioningId(null);
    }
  }

  async function deleteShift(shiftId: string) {
    setActioningId(shiftId);
    setOpenMenuId(null);
    setShifts((p) => p.filter((s) => s.id !== shiftId));
    try {
      const res = await fetch(`/api/employer/shifts/${shiftId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Shift deleted.", "info");
    } catch {
      fetchData();
      toast("Failed to delete shift.", "error");
    } finally {
      setActioningId(null);
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { open: 0, filled: 0, cancelled: 0 };
    let totalStaffNeeded = 0;
    let confirmed = 0;
    for (const s of shifts) {
      const eff = effectiveStatus(s);
      counts[eff]++;
      totalStaffNeeded += s.staffNeeded;
      confirmed += s.assignments.filter((a) => a.status === "confirmed").length;
    }
    const active = shifts.length - counts.cancelled;
    const fillRate = active > 0 ? Math.round((counts.filled / active) * 100) : 0;
    return { ...counts, totalStaffNeeded, confirmed, fillRate, active };
  }, [shifts]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredShifts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return shifts.filter((s) => {
      if (filter !== "all" && effectiveStatus(s) !== filter) return false;
      if (term) {
        const hay = [s.department, s.location, formatDate(s.date)].join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [shifts, filter, search]);

  if (loading) return <><GsapAnimations /><PageSkeleton /></>;

  if (error || !job) {
    return (
      <>
        <GsapAnimations />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">{error ?? "Job not found"}</p>
          <div className="flex gap-3">
            <button onClick={fetchData} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors">Try again</button>
            <Link href="/dashboard/employer/shifts" className="px-4 py-2 border border-gray-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Back to Shifts</Link>
          </div>
        </main>
      </>
    );
  }

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: shifts.length },
    { key: "open",      label: "Open",      count: stats.open },
    { key: "filled",    label: "Filled",    count: stats.filled },
    { key: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-8 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6" data-gsap="fade-down">
          <Link
            href="/dashboard/employer/shifts"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand transition-colors mb-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Shifts
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[26px] font-black text-brand tracking-tight">{job.title}</h1>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  job.status === "live" ? "bg-green-50 text-green-600" : "bg-gray-100 text-slate-400"
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-400 flex-wrap">
                <span>{job.sector}</span>
                <span className="text-slate-300">•</span>
                <span>{job.location}</span>
                <span className="text-slate-300">•</span>
                <span>{job.employmentType}</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-500">{shifts.length} shift{shifts.length !== 1 ? "s" : ""}</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-500">{stats.confirmed}/{stats.totalStaffNeeded} staffed</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.94c.09-.542.56-.94 1.11-.94h1.1c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.78.93l-.15.893c-.09.543-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.929-.398-.165-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Broadcast
              </button>
              <Link
                href={`/dashboard/employer/shifts/new?jobId=${id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Shift
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-gsap="fade-up">
          <StatCard
            label="Fill Rate"
            value={`${stats.fillRate}%`}
            sub={`${stats.filled} of ${stats.active} active shifts filled`}
            accent="green"
            progress={stats.fillRate}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            }
          />
          <StatCard
            label="Coverage"
            value={
              <>
                {stats.confirmed}<span className="text-slate-300 font-light">/</span>
                <span className="text-xl">{stats.totalStaffNeeded}</span>
              </>
            }
            sub="Confirmed staff across all shifts"
            accent="blue"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            label="Open Shifts"
            value={stats.open}
            sub={stats.open === 0 ? "Nothing pending — all set" : `${stats.open} need${stats.open === 1 ? "s" : ""} candidates`}
            accent={stats.open === 0 ? "slate" : "amber"}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Compliance"
            value="All clear"
            sub="No alerts at this time"
            accent="green"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2.5 flex items-center gap-2 mb-4 flex-wrap" data-gsap="fade-up">
          <div className="flex items-center gap-1">
            {TABS.map((t) => {
              const isActive = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-brand-blue text-white"
                      : "text-slate-500 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-slate-400"
                  }`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department, location…"
              className="pl-8 pr-3 py-1.5 bg-[#F7F8FA] border border-transparent focus:border-brand-blue/30 focus:bg-white rounded-xl text-xs text-slate-700 placeholder:text-slate-400 outline-none transition-colors w-[240px]"
            />
          </div>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-gray-50 rounded-xl transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>

        {/* ── Shift table ────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" data-gsap="fade-up">
          {shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-brand">No shifts posted yet</p>
                <p className="text-xs text-slate-400 mt-1">Create your first shift for this role</p>
              </div>
              <Link
                href={`/dashboard/employer/shifts/new?jobId=${id}`}
                className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
              >
                + Post First Shift
              </Link>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500">No shifts match this view</p>
              <button
                onClick={() => { setFilter("all"); setSearch(""); }}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[2.2fr_1.4fr_1.6fr_1.4fr_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-[#FAFBFC]">
                {["Schedule", "Location", "Staffing", "Assigned", "Actions"].map((h) => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {filteredShifts.map((shift) => {
                  const hrs = hoursWorked(shift.startTime, shift.endTime, shift.breakMinutes);
                  const confirmedList = shift.assignments.filter((a) => a.status === "confirmed");
                  const eff = effectiveStatus(shift);
                  const needed = shift.staffNeeded || 1;
                  const pct = Math.min(100, Math.round((confirmedList.length / needed) * 100));
                  const barColor =
                    eff === "cancelled" ? "bg-slate-300" :
                    confirmedList.length >= needed ? "bg-green-400" :
                    confirmedList.length > 0 ? "bg-amber-400" : "bg-gray-200";
                  const isCancelled = eff === "cancelled";

                  return (
                    <div
                      key={shift.id}
                      className={`grid grid-cols-[2.2fr_1.4fr_1.6fr_1.4fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors ${isCancelled ? "opacity-60" : ""}`}
                    >
                      {/* Schedule */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-brand truncate">
                            {shift.isRecurring ? `From ${formatDate(shift.date)}` : formatDate(shift.date)}
                            {shift.department && <span className="text-slate-400 font-medium"> · {shift.department}</span>}
                          </p>
                          {shift.isRecurring && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-full uppercase tracking-wider">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                              {recurrenceLabel(shift)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(shift.startTime)} – {formatTime(shift.endTime)}</span>
                          <span className="text-slate-300">·</span>
                          <span>{hrs % 1 === 0 ? hrs.toFixed(0) : hrs.toFixed(1)} hrs</span>
                          {shift.breakMinutes > 0 && <span className="text-slate-300">({shift.breakMinutes}m break)</span>}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-1.5 text-sm text-slate-500 min-w-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="leading-tight truncate">{shift.location ?? job.location}</span>
                      </div>

                      {/* Staffing — inline progress bar */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${
                            isCancelled ? "text-slate-400" :
                            confirmedList.length >= needed ? "text-green-600" :
                            confirmedList.length > 0 ? "text-amber-600" : "text-slate-500"
                          }`}>
                            {isCancelled ? "Cancelled" : `${confirmedList.length} / ${needed} ${confirmedList.length >= needed ? "Filled" : "Staffed"}`}
                          </span>
                          {!isCancelled && confirmedList.length < needed && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {needed - confirmedList.length} needed
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Assigned avatars */}
                      {confirmedList.length > 0 ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex -space-x-2 shrink-0">
                            {confirmedList.slice(0, 3).map((a) => (
                              <div
                                key={a.id}
                                title={a.candidateName}
                                className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold border-2 border-white"
                              >
                                {a.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 truncate">
                            {confirmedList.length === 1
                              ? confirmedList[0].candidateName
                              : `${confirmedList[0].candidateName.split(" ")[0]} + ${confirmedList.length - 1} more`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Awaiting assignment</span>
                      )}

                      {/* Actions */}
                      <div className="relative">
                        <button
                          disabled={actioningId === shift.id}
                          onClick={() => setOpenMenuId((p) => p === shift.id ? null : shift.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                          aria-label="Shift actions"
                        >
                          {actioningId === shift.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin inline-block" />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {openMenuId === shift.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1.5 z-20 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[170px]">
                              {eff === "cancelled" ? (
                                <button
                                  onClick={() => patchStatus(shift.id, "open", "cancelled", "reopened")}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors text-left"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                  </svg>
                                  Reopen Shift
                                </button>
                              ) : (
                                <button
                                  onClick={() => patchStatus(shift.id, "cancelled", shift.status, "cancelled")}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors text-left"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Cancel Shift
                                </button>
                              )}
                              <button
                                onClick={() => deleteShift(shift.id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors text-left border-t border-gray-50"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Delete Shift
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-[#FAFBFC]">
                <p className="text-xs text-slate-400">
                  Showing <span className="font-bold text-slate-500">{filteredShifts.length}</span> of {shifts.length} shift{shifts.length !== 1 ? "s" : ""}
                </p>
                {filter !== "all" || search ? (
                  <button
                    onClick={() => { setFilter("all"); setSearch(""); }}
                    className="text-xs font-bold text-brand-blue hover:underline"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
