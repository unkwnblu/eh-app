"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RoleCardSkeleton } from "@/components/ui/Skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ShiftRole = {
  id: number;
  title: string;
  sector: string;
  totalShifts: number;
  filled: number;
  remaining: number;
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const SHIFT_ROLES: ShiftRole[] = [
  { id: 1,  title: "Healthcare Assistant", sector: "Healthcare",    totalShifts: 48, filled: 36, remaining: 12 },
  { id: 2,  title: "Healthcare Assistant", sector: "Healthcare",    totalShifts: 48, filled: 36, remaining: 12 },
  { id: 3,  title: "Healthcare Assistant", sector: "Healthcare",    totalShifts: 48, filled: 36, remaining: 12 },
  { id: 4,  title: "Healthcare Assistant", sector: "Healthcare",    totalShifts: 48, filled: 36, remaining: 12 },
  { id: 5,  title: "Support Worker",       sector: "Healthcare",    totalShifts: 30, filled: 22, remaining: 8  },
  { id: 6,  title: "Warehouse Operative",  sector: "Logistics",     totalShifts: 60, filled: 51, remaining: 9  },
  { id: 7,  title: "Night Shift Driver",   sector: "Logistics",     totalShifts: 24, filled: 18, remaining: 6  },
  { id: 8,  title: "Front of House",       sector: "Hospitality",   totalShifts: 36, filled: 30, remaining: 6  },
];

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare:     "text-teal-600",
  Logistics:      "text-amber-600",
  Hospitality:    "text-orange-600",
  "Customer Care":"text-purple-600",
  "Tech & Data":  "text-blue-600",
};

// ─── Role Card ─────────────────────────────────────────────────────────────────

function RoleCard({ role }: { role: ShiftRole }) {
  const sectorColour = SECTOR_COLOURS[role.sector] ?? "text-slate-500";
  const fillPct = Math.round((role.filled / role.totalShifts) * 100);

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
          <span>{role.filled} Filled</span>
          <span>{role.remaining} Remaining</span>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-1 border-t border-gray-100">
        <Link href={`/dashboard/employer/shifts/${role.id}`} className="block w-full text-sm font-semibold text-brand-blue hover:text-brand transition-colors py-1 text-center">
          Manage Shifts
        </Link>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ShiftManagementPage() {
  const [loading] = useState(false);
  const [error, setError] = useState(false);
  const roles = SHIFT_ROLES;
  const totalRoles = roles.length;
  const activeShifts = roles.reduce((sum, r) => sum + r.totalShifts, 0);

  return (
        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="flex items-start justify-between mb-8" data-gsap="fade-down">
            <div>
              <h1 className="text-[28px] font-black text-brand tracking-tight">Shift-Enabled Roles</h1>
              <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
                Select a live job posting to configure schedules, manage roster allocations, and
                monitor shift fulfillment rates in real-time.
              </p>
            </div>

            {/* Summary stats */}
            <div className="flex items-stretch gap-3 shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center min-w-[110px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Roles</p>
                <p className="text-3xl font-black text-brand">{totalRoles}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-center min-w-[130px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Shifts</p>
                <p className="text-3xl font-black text-brand-blue">{activeShifts}</p>
              </div>
            </div>
          </div>

          {/* Role grid */}
          {loading ? (
            <RoleCardSkeleton count={8} />
          ) : error ? (
            <ErrorState message="Unable to load shift roles." onRetry={() => setError(false)} />
          ) : roles.length === 0 ? (
            <EmptyState
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              title="No shift roles yet"
              description="Create a job posting and enable shift scheduling to manage your team's roster here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </main>
  );
}
