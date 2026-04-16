"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";
import { RoleCardSkeleton } from "@/components/ui/Skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ShiftRole = {
  jobId: string;
  title: string;
  sector: string;
  totalShifts: number;
  filledShifts: number;
  openShifts: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare:      "text-teal-600",
  Logistics:       "text-amber-600",
  Hospitality:     "text-orange-600",
  "Customer Care": "text-purple-600",
  "Tech & Data":   "text-blue-600",
};

// ─── Role Card ─────────────────────────────────────────────────────────────────

function RoleCard({ role }: { role: ShiftRole }) {
  const sectorColour = SECTOR_COLOURS[role.sector] ?? "text-slate-500";
  const fillPct = role.totalShifts > 0
    ? Math.round((role.filledShifts / role.totalShifts) * 100)
    : 0;

  return (
    <div
      data-gsap="fade-up"
      className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${sectorColour}`}>
            SHIFT-ENABLED
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            LIVE
          </span>
        </div>
        <h3 className="text-base font-bold text-brand">{role.title}</h3>
      </div>

      {/* Shift stats */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Shifts</span>
          <span className="font-bold text-brand-blue">{role.totalShifts}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-full transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{role.filledShifts} filled</span>
          <span>{role.openShifts} remaining</span>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-1 border-t border-gray-100">
        <Link
          href={`/dashboard/employer/shifts/${role.jobId}`}
          className="block w-full text-sm font-semibold text-brand-blue hover:text-brand transition-colors py-1 text-center"
        >
          Manage Shifts
        </Link>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ShiftManagementPage() {
  const [roles, setRoles] = useState<ShiftRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/employer/shifts");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json() as { roles: ShiftRole[] };
      setRoles(data.roles ?? []);
    } catch {
      setError(true);
      toast("Unable to load shift roles.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const totalRoles = roles.length;
  const activeShifts = roles.reduce((sum, r) => sum + r.totalShifts, 0);

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
        {/* Page header */}
        <div
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8"
          data-gsap="fade-down"
        >
          <div>
            <h1 className="text-[28px] font-black text-brand tracking-tight">
              Shift-Enabled Roles
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
              Select a live job posting to configure schedules, manage roster allocations, and
              monitor shift fulfillment rates in real-time.
            </p>
          </div>

          {/* Summary stats + new shift button */}
          <div className="flex items-stretch gap-3 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center min-w-[110px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Total Roles
              </p>
              <p className="text-3xl font-black text-brand">{totalRoles}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center min-w-[130px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Active Shifts
              </p>
              <p className="text-3xl font-black text-brand-blue">{activeShifts}</p>
            </div>
            <Link
              href="/dashboard/employer/shifts/new"
              className="flex items-center gap-2 px-5 bg-brand-blue text-white rounded-2xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Post New Shift
            </Link>
          </div>
        </div>

        {/* Role grid */}
        {loading ? (
          <RoleCardSkeleton count={8} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500">Unable to load shift roles.</p>
            <button
              onClick={fetchRoles}
              className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
            >
              Try again
            </button>
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-brand">No live jobs yet</p>
              <p className="text-sm text-slate-400 mt-1">Post a job to start scheduling shifts</p>
            </div>
            <Link
              href="/dashboard/employer/jobs"
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors"
            >
              Go to Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roles.map((role) => (
              <RoleCard key={role.jobId} role={role} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
