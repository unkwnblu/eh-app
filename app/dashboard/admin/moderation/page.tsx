"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

type ComplianceItem = { label: string; pass: boolean };

type Job = {
  id: string;
  employer: string;
  initials: string;
  title: string;
  sector: string;
  location: string;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  liveSalaryMin: number | null;
  liveSalaryMax: number | null;
  type: string;
  remote: boolean;
  posted: string;
  status: ModerationStatus;
  description: string;
  responsibilities: string;
  flags: string[];
  compliance: number;
  complianceItems: ComplianceItem[];
};

type StatusFilter = "all" | ModerationStatus;
type TabKey       = "compliance" | "description" | "pricing";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<ModerationStatus, { label: string; chipBg: string; chipText: string; dot: string; soft: string }> = {
  pending:  { label: "Pending",  chipBg: "bg-amber-100",  chipText: "text-amber-700",  dot: "bg-amber-400",  soft: "bg-amber-50" },
  approved: { label: "Approved", chipBg: "bg-green-100",  chipText: "text-green-700",  dot: "bg-green-500",  soft: "bg-green-50" },
  flagged:  { label: "Flagged",  chipBg: "bg-orange-100", chipText: "text-orange-700", dot: "bg-orange-500", soft: "bg-orange-50" },
  rejected: { label: "Rejected", chipBg: "bg-red-100",    chipText: "text-red-600",    dot: "bg-red-500",    soft: "bg-red-50" },
};

const SECTOR_COLOUR: Record<string, string> = {
  Healthcare:      "text-teal-600 bg-teal-50",
  Hospitality:     "text-orange-600 bg-orange-50",
  "Customer Care": "text-purple-600 bg-purple-50",
  "Tech & Data":   "text-blue-600 bg-blue-50",
  Logistics:       "text-amber-600 bg-amber-50",
};

function complianceColor(score: number) {
  if (score >= 85) return { text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500", label: "Pass" };
  if (score >= 65) return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400", label: "Review" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "bg-red-500", label: "Fail" };
}

// ─── Status filter chip ────────────────────────────────────────────────────────

function StatusChip({
  label, count, active, onClick, accent, icon,
}: {
  label: string; count: number; active: boolean; onClick: () => void; accent: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
        active ? `${accent} border-transparent shadow-sm` : "bg-white border-gray-100 hover:border-gray-200 text-brand"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white/20" : accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-white/80" : "text-slate-400"}`}>{label}</p>
        <p className={`text-2xl font-black leading-none mt-0.5 ${active ? "text-white" : "text-brand"}`}>{count}</p>
      </div>
    </button>
  );
}

// ─── List row ──────────────────────────────────────────────────────────────────

function ListRow({ job, isActive, onClick }: { job: Job; isActive: boolean; onClick: () => void }) {
  const meta      = STATUS_META[job.status];
  const sectorClr = SECTOR_COLOUR[job.sector] ?? "text-slate-500 bg-slate-50";
  const c         = complianceColor(job.compliance);

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
        isActive ? "bg-blue-50/60" : "hover:bg-gray-50/80"
      }`}
    >
      {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-blue" />}

      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-black shrink-0">
        {job.initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-brand truncate leading-snug">{job.title}</p>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${meta.chipText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-slate-500 truncate mb-1.5">{job.employer}</p>
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${sectorClr}`}>{job.sector}</span>
          <span className="text-[11px] text-slate-400">· {job.posted}</span>
          {job.flags.length > 0 && (
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              {job.flags.length}
            </span>
          )}
        </div>
        {/* Compliance mini-bar */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${job.compliance}%` }} />
          </div>
          <span className={`text-[10px] font-bold ${c.text}`}>{job.compliance}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Compliance tab content ───────────────────────────────────────────────────

function ComplianceTab({ job }: { job: Job }) {
  const c         = complianceColor(job.compliance);
  const passCount = job.complianceItems.filter((i) => i.pass).length;

  return (
    <div className="space-y-5">
      {/* Score banner */}
      <div className={`${c.bg} border border-current/10 rounded-xl p-5 flex items-center gap-4`}>
        <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0`}>
          <span className={`text-2xl font-black ${c.text}`}>{job.compliance}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${c.text}`}>{c.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{passCount} of {job.complianceItems.length} checks passed</p>
          <div className="mt-2 w-full h-1.5 bg-white/70 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${job.compliance}%` }} />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h4 className="text-sm font-bold text-brand mb-3">Checklist</h4>
        <ul className="space-y-2">
          {job.complianceItems.map((item, i) => (
            <li key={i} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${
              item.pass ? "bg-green-50/50 border-green-100" : "bg-amber-50/50 border-amber-100"
            }`}>
              {item.pass ? (
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </span>
              )}
              <span className={`text-sm ${item.pass ? "text-slate-600" : "text-amber-800 font-medium"}`}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Flags */}
      {job.flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h4 className="text-sm font-bold text-amber-700">Compliance Flags ({job.flags.length})</h4>
          </div>
          <ul className="space-y-1.5">
            {job.flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Description tab content ──────────────────────────────────────────────────

function DescriptionTab({ job }: { job: Job }) {
  return (
    <div className="space-y-5">
      {job.description ? (
        <div>
          <h4 className="text-sm font-bold text-brand mb-2.5">Job Description</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">No description provided.</p>
      )}

      {job.responsibilities && (
        <div>
          <h4 className="text-sm font-bold text-brand mb-2.5">Key Responsibilities</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
        </div>
      )}
    </div>
  );
}

// ─── Pricing tab content ──────────────────────────────────────────────────────

function PricingTab({
  job, onPriceUpdate,
}: {
  job: Job;
  onPriceUpdate: (min: number | null, max: number | null) => Promise<void>;
}) {
  const [liveMin,      setLiveMin]      = useState(job.liveSalaryMin != null ? String(job.liveSalaryMin) : "");
  const [liveMax,      setLiveMax]      = useState(job.liveSalaryMax != null ? String(job.liveSalaryMax) : "");
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSaved,   setPriceSaved]   = useState(false);
  const [priceError,   setPriceError]   = useState("");

  const hasOverride = job.liveSalaryMin != null || job.liveSalaryMax != null;

  async function savePricing() {
    setPriceError("");
    const min = liveMin ? Number(liveMin) : null;
    const max = liveMax ? Number(liveMax) : null;
    if (min !== null && max !== null && min > max) {
      setPriceError("Min cannot exceed max.");
      return;
    }
    setPriceLoading(true);
    try {
      await onPriceUpdate(min, max);
      setPriceSaved(true);
      setTimeout(() => setPriceSaved(false), 2500);
    } catch {
      setPriceError("Failed to save pricing.");
    } finally {
      setPriceLoading(false);
    }
  }

  function clearPricing() {
    setLiveMin("");
    setLiveMax("");
    onPriceUpdate(null, null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-brand">Live Pricing Override</h4>
            {hasOverride && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded-md text-[9px] font-bold text-orange-600 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Override what candidates see — leave blank to use the employer&apos;s rate.</p>
        </div>
      </div>

      {/* Employer's original */}
      {job.salary && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-slate-500">
            Employer set: <span className="font-bold text-brand">{job.salary}</span>
          </span>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Live Min (£/yr)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
            <input
              type="number"
              value={liveMin}
              onChange={(e) => { setLiveMin(e.target.value); setPriceError(""); }}
              placeholder={job.salaryMin ? String(job.salaryMin) : "e.g. 28000"}
              className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Live Max (£/yr)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
            <input
              type="number"
              value={liveMax}
              onChange={(e) => { setLiveMax(e.target.value); setPriceError(""); }}
              placeholder={job.salaryMax ? String(job.salaryMax) : "e.g. 35000"}
              className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            />
          </div>
        </div>
      </div>

      {priceError && <p className="text-xs text-red-500">{priceError}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={savePricing}
          disabled={priceLoading}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-blue disabled:opacity-60 transition-colors"
        >
          {priceLoading ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Saving…
            </>
          ) : priceSaved ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Saved
            </>
          ) : "Save Live Pricing"}
        </button>
        {hasOverride && (
          <button
            onClick={clearPricing}
            className="px-4 py-2 border border-gray-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Clear Override
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  job, onAction, onPriceUpdate, onClose, actionLoading,
}: {
  job: Job;
  onAction: (action: "approve" | "flag" | "reject") => void;
  onPriceUpdate: (min: number | null, max: number | null) => Promise<void>;
  onClose: () => void;
  actionLoading: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("compliance");
  const meta          = STATUS_META[job.status];
  const sectorClr     = SECTOR_COLOUR[job.sector] ?? "text-slate-500 bg-slate-50";
  const c             = complianceColor(job.compliance);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className={`${meta.soft} border-b border-gray-100 relative`}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/60 text-slate-400 transition-colors z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand-blue text-base font-black shrink-0 shadow-sm">
              {job.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.chipBg} ${meta.chipText}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${sectorClr}`}>
                  {job.sector}
                </span>
                {job.remote && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full text-brand-blue bg-brand-blue/10">Remote</span>
                )}
              </div>
              <h2 className="text-lg font-black text-brand tracking-tight leading-snug">{job.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{job.employer} · Posted {job.posted}</p>
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-4 pt-4 border-t border-white/60 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <MetaItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />} label={job.location} />
            <MetaItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} label={job.type} />
            {job.salary && (
              <MetaItem icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} label={job.salary} />
            )}
            <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.bg}`}>
              <span className={`text-xs font-black ${c.text}`}>{job.compliance}%</span>
              <span className={`text-[10px] font-bold ${c.text}`}>{c.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 border-b border-gray-100 bg-white shrink-0">
        <TabButton
          active={tab === "compliance"} onClick={() => setTab("compliance")}
          label="Compliance" badge={job.flags.length > 0 ? job.flags.length : undefined}
          badgeColor="bg-amber-100 text-amber-700"
        />
        <TabButton
          active={tab === "description"} onClick={() => setTab("description")}
          label="Description"
        />
        <TabButton
          active={tab === "pricing"} onClick={() => setTab("pricing")}
          label="Pricing"
          badge={(job.liveSalaryMin != null || job.liveSalaryMax != null) ? "·" : undefined}
          badgeColor="bg-orange-100 text-orange-600"
        />
      </div>

      {/* ── Tab content (scrollable) ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === "compliance"  && <ComplianceTab job={job} />}
        {tab === "description" && <DescriptionTab job={job} />}
        {tab === "pricing"     && <PricingTab job={job} onPriceUpdate={onPriceUpdate} />}
      </div>

      {/* ── Sticky action bar ──────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {job.status !== "rejected" && (
            <button
              onClick={() => onAction("reject")}
              disabled={actionLoading}
              className="flex-1 min-w-[100px] px-4 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          )}
          {job.status !== "flagged" && (
            <button
              onClick={() => onAction("flag")}
              disabled={actionLoading}
              className="flex-1 min-w-[100px] px-4 py-2.5 border border-amber-200 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Flag
            </button>
          )}
          {(job.status === "approved" || job.status === "rejected" || job.status === "flagged") && (
            <button
              onClick={() => onAction("flag")}
              disabled={actionLoading}
              className="flex-1 min-w-[120px] px-4 py-2.5 border border-gray-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          )}
          {job.status !== "approved" && (
            <button
              onClick={() => onAction("approve")}
              disabled={actionLoading}
              className="flex-[2] min-w-[180px] px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Saving…" : "Approve & Make Live"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-600">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
        {icon}
      </svg>
      <span className="font-medium">{label}</span>
    </span>
  );
}

function TabButton({
  active, onClick, label, badge, badgeColor,
}: {
  active: boolean; onClick: () => void; label: string; badge?: number | string; badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-400 hover:text-brand"
      }`}
    >
      {label}
      {badge !== undefined && badge !== "" && (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${badgeColor ?? "bg-slate-100 text-slate-500"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Empty detail state ────────────────────────────────────────────────────────

function EmptyDetailState({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="bg-white border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center py-20 px-6 h-full min-h-[480px]">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-brand mb-1.5">Ready to moderate</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Select a job from the list to review its compliance, description, and pricing before approval.
      </p>
      {pendingCount > 0 && (
        <div className="mt-6 px-4 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
          {pendingCount} job{pendingCount === 1 ? "" : "s"} awaiting review
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobModerationPage() {
  const { toast } = useToast();
  const [jobs,           setJobs]           = useState<Job[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>("pending");
  const [sectorFilter,   setSectorFilter]   = useState("All Sectors");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [actionLoading,  setActionLoading]  = useState(false);

  const SECTORS = ["All Sectors", "Healthcare", "Hospitality", "Customer Care", "Tech & Data", "Logistics"];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/jobs");
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { jobs: Job[] };
      setJobs(data.jobs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Counts
  const counts = useMemo(() => ({
    all:      jobs.length,
    pending:  jobs.filter((j) => j.status === "pending").length,
    approved: jobs.filter((j) => j.status === "approved").length,
    flagged:  jobs.filter((j) => j.status === "flagged").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  }), [jobs]);

  // Filter + sort (always priority: flagged > pending > approved > rejected)
  const visibleJobs = useMemo(() => {
    const STATUS_PRIORITY: Record<ModerationStatus, number> = { flagged: 0, pending: 1, approved: 2, rejected: 3 };
    let list = jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (sectorFilter !== "All Sectors" && j.sector !== sectorFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!j.title.toLowerCase().includes(q) && !j.employer.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
    return list;
  }, [jobs, statusFilter, sectorFilter, searchQuery]);

  const selected = selectedId ? jobs.find((j) => j.id === selectedId) ?? null : null;

  async function handleAction(jobId: string, action: "approve" | "flag" | "reject") {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Action failed");
      toast(`Job ${action === "approve" ? "approved" : action === "flag" ? "flagged" : "rejected"}`, "success");
      await load();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePriceUpdate(jobId: string, min: number | null, max: number | null) {
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liveSalaryMin: min, liveSalaryMax: max }),
    });
    if (!res.ok) throw new Error("Failed to save pricing");
    await load();
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Job Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">Review and approve employer job listings before they go live.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40 shrink-0"
          title="Refresh"
          aria-label="Refresh job list"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Status filter chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-gsap="fade-up">
        <StatusChip
          label="Total" count={counts.all} active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")} accent="bg-brand text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "all" ? "text-white" : "text-brand"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
        />
        <StatusChip
          label="Pending" count={counts.pending} active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")} accent="bg-amber-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "pending" ? "text-white" : "text-amber-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatusChip
          label="Flagged" count={counts.flagged} active={statusFilter === "flagged"}
          onClick={() => setStatusFilter("flagged")} accent="bg-orange-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "flagged" ? "text-white" : "text-orange-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          }
        />
        <StatusChip
          label="Approved" count={counts.approved} active={statusFilter === "approved"}
          onClick={() => setStatusFilter("approved")} accent="bg-green-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "approved" ? "text-white" : "text-green-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatusChip
          label="Rejected" count={counts.rejected} active={statusFilter === "rejected"}
          onClick={() => setStatusFilter("rejected")} accent="bg-red-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "rejected" ? "text-white" : "text-red-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3" data-gsap="fade-up">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-brand-blue/40 focus-within:bg-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title or employer…"
            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="text-slate-300 hover:text-slate-500 shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
        >
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Master-detail */}
      {error ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <p className="font-bold text-brand mb-2">{error}</p>
          <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start" data-gsap="fade-up">

          {/* Left list */}
          <aside className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-340px)] min-h-[480px] sticky top-[88px]">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <p className="text-xs font-bold text-brand">
                {visibleJobs.length} job{visibleJobs.length === 1 ? "" : "s"}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {statusFilter === "all" ? "All" : STATUS_META[statusFilter as ModerationStatus].label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                      <div className="h-1 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                ))
              ) : visibleJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-brand mb-1">All caught up</p>
                  <p className="text-xs text-slate-400">No jobs match the current filters.</p>
                </div>
              ) : (
                visibleJobs.map((j) => (
                  <ListRow
                    key={j.id}
                    job={j}
                    isActive={selectedId === j.id}
                    onClick={() => setSelectedId(selectedId === j.id ? null : j.id)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Right detail */}
          <section className="min-h-[480px]">
            {selected ? (
              <DetailPanel
                key={selected.id}
                job={selected}
                onAction={(action) => handleAction(selected.id, action)}
                onPriceUpdate={(min, max) => handlePriceUpdate(selected.id, min, max)}
                onClose={() => setSelectedId(null)}
                actionLoading={actionLoading}
              />
            ) : (
              <EmptyDetailState pendingCount={counts.pending} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
