"use client";

import { useState, useEffect, useCallback } from "react";
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
  department: string | null;
  location: string | null;
  staffNeeded: number;
  hourlyRate: number | null;
  experienceLevel: string;
  status: ShiftStatus;
  assignments: Assignment[];
};

type JobDetail = {
  id: string;
  title: string;
  sector: string;
  location: string;
  employmentType: string;
  status: string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
}

function hoursWorked(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + (sm || 0));
  return Math.max(0, diff / 60);
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShiftStatus }) {
  const styles: Record<ShiftStatus, string> = {
    open:      "bg-blue-50 text-blue-600",
    filled:    "bg-green-50 text-green-600",
    cancelled: "bg-gray-100 text-slate-400",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <main className="flex-1 px-8 py-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
      <div className="flex gap-4 mb-6">
        <div className="flex-1 h-[140px] bg-gray-200 rounded-2xl" />
        <div className="w-[220px] h-[140px] bg-gray-200 rounded-2xl" />
        <div className="w-[220px] h-[140px] bg-gray-200 rounded-2xl" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-200 rounded-2xl h-[320px]" />
        <div className="w-[240px] bg-gray-200 rounded-2xl h-[200px]" />
      </div>
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function cancelShift(shiftId: string) {
    setCancellingId(shiftId);
    // Optimistic update
    setShifts((prev) =>
      prev.map((s) => s.id === shiftId ? { ...s, status: "cancelled" as ShiftStatus } : s)
    );
    try {
      const res = await fetch(`/api/employer/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      toast("Shift cancelled.", "info");
    } catch {
      // Revert
      setShifts((prev) =>
        prev.map((s) => s.id === shiftId ? { ...s, status: "open" as ShiftStatus } : s)
      );
      toast("Failed to cancel shift.", "error");
    } finally {
      setCancellingId(null);
    }
  }

  // ── Derived stats ───────────────────────────────────────────────────────────
  const filledCount = shifts.filter((s) => s.status === "filled").length;
  const fillRate = shifts.length > 0 ? Math.round((filledCount / shifts.length) * 100) : 0;
  const totalStaffNeeded = shifts.reduce((sum, s) => sum + s.staffNeeded, 0);
  const confirmedAssignments = shifts.reduce(
    (sum, s) => sum + s.assignments.filter((a) => a.status === "confirmed").length,
    0
  );

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
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
            >
              Try again
            </button>
            <Link
              href="/dashboard/employer/shifts"
              className="px-4 py-2 border border-gray-200 text-slate-500 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Shifts
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-8 py-8">

        {/* Header row */}
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[26px] font-black text-brand tracking-tight">{job.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              job.status === "live" ? "bg-green-50 text-green-600" : "bg-gray-100 text-slate-400"
            }`}>
              {job.status}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-400">
            <span>{job.sector}</span>
            <span>·</span>
            <span>{job.location}</span>
            <span>·</span>
            <span>{job.employmentType}</span>
          </div>
        </div>

        {/* Top row: hero + stats */}
        <div className="flex gap-4 mb-6" data-gsap="fade-down">
          {/* Hero banner */}
          <div className="relative flex-1 min-h-[140px] bg-brand-blue rounded-2xl px-8 py-6 overflow-hidden flex flex-col justify-between">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
                <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{job.title}</h2>
              <p className="text-sm text-white/70 mt-1">Active Recruitment & Shift Management</p>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Link
                href={`/dashboard/employer/shifts/new?jobId=${id}`}
                className="px-4 py-2 bg-white text-brand-blue rounded-lg text-xs font-bold tracking-wide hover:bg-white/90 transition-colors"
              >
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
            <p className="text-3xl font-black text-brand">{fillRate}%</p>
            <p className="text-xs font-semibold text-slate-400">
              {filledCount} of {shifts.length} shifts filled
            </p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${fillRate}%` }} />
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
            <p className="text-3xl font-black text-brand">
              {confirmedAssignments}
              <span className="text-slate-300 font-light">/</span>
              <span className="text-xl">{totalStaffNeeded}</span>
            </p>
            <p className="text-xs text-slate-400">Confirmed staff coverage</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex -space-x-2">
                {["bg-teal-400", "bg-blue-400", "bg-purple-400"].map((c, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              {confirmedAssignments > 3 && (
                <span className="text-xs font-semibold text-brand-blue ml-1">+{confirmedAssignments - 3}</span>
              )}
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

            {shifts.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
            ) : (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-6 py-3 border-b border-gray-50">
                  {["Shift Schedule", "Location", "Assigned Candidates", "Status", "Actions"].map((h) => (
                    <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {shifts.map((shift) => {
                    const hrs = hoursWorked(shift.startTime, shift.endTime);
                    const confirmedList = shift.assignments.filter((a) => a.status === "confirmed");
                    return (
                      <div
                        key={shift.id}
                        className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Schedule */}
                        <div>
                          <p className="text-sm font-bold text-brand">
                            {formatDate(shift.date)} • {shift.department ?? "General"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(shift.startTime)} – {formatTime(shift.endTime)} ({hrs % 1 === 0 ? hrs.toFixed(0) : hrs.toFixed(1)} hrs)
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-1.5 text-sm text-slate-500">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="leading-tight">{shift.location ?? job.location}</span>
                        </div>

                        {/* Assigned Candidates */}
                        {confirmedList.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {confirmedList.slice(0, 2).map((a) => (
                              <div key={a.id} className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold shrink-0">
                                  {a.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <p className="text-xs font-semibold text-brand leading-none truncate">{a.candidateName}</p>
                              </div>
                            ))}
                            {confirmedList.length > 2 && (
                              <p className="text-[10px] text-slate-400 font-semibold pl-9">
                                +{confirmedList.length - 2} more
                              </p>
                            )}
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

                        {/* Status */}
                        <StatusBadge status={shift.status} />

                        {/* Actions */}
                        {shift.status === "open" ? (
                          <button
                            disabled={cancellingId === shift.id}
                            onClick={() => cancelShift(shift.id)}
                            className="px-4 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            CANCEL
                          </button>
                        ) : (
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-slate-400">
                    Showing {shifts.length} shift{shifts.length !== 1 ? "s" : ""} for{" "}
                    <span className="font-semibold text-slate-500">&apos;{job.title}&apos;</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Compliance Alerts panel */}
          <div className="w-[240px] shrink-0" data-gsap="fade-up">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-brand mb-4">Compliance Alerts</h3>
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-brand">All clear</p>
                <p className="text-[11px] text-slate-400 leading-snug">No compliance alerts at this time.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating add button */}
      <Link
        href={`/dashboard/employer/shifts/new?jobId=${id}`}
        className="fixed bottom-8 right-8 w-12 h-12 bg-brand-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-blue-dark transition-colors z-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </>
  );
}
