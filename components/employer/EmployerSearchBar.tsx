"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobResult = {
  id: string;
  title: string;
  sector: string;
  location: string;
  status: string;
  employmentType: string;
};

type ShiftResult = {
  jobId: string;
  title: string;
  sector: string;
  totalShifts: number;
};

type SearchResults = {
  jobs: JobResult[];
  shifts: ShiftResult[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; dot: string }> = {
  live:    { label: "Live",         dot: "bg-green-500" },
  review:  { label: "Under Review", dot: "bg-amber-400" },
  draft:   { label: "Draft",        dot: "bg-slate-300" },
  closed:  { label: "Closed",       dot: "bg-slate-300" },
};

const SECTOR_COLOUR: Record<string, string> = {
  Healthcare:      "text-teal-600",
  Hospitality:     "text-orange-600",
  "Customer Care": "text-purple-600",
  "Tech & Data":   "text-blue-600",
  Logistics:       "text-amber-600",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmployerSearchBar() {
  const router = useRouter();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1); // keyboard-selected index

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const debounced    = useDebounce(query, 320);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetch_ = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`/api/employer/search?q=${encodeURIComponent(q)}`);
      const data = await res.json() as SearchResults;
      setResults(data);
      setOpen(true);
      setActive(-1);
    } catch {
      /* silent — search is best-effort */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(debounced); }, [debounced, fetch_]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Build flat list of results for keyboard nav ───────────────────────────
  const allResults: { href: string; label: string }[] = [
    ...(results?.jobs   ?? []).map((j) => ({ href: `/dashboard/employer/jobs/${j.id}/edit`,  label: j.title })),
    ...(results?.shifts ?? []).map((s) => ({ href: `/dashboard/employer/shifts/${s.jobId}`,  label: s.title })),
  ];
  const totalCount = allResults.length;

  // ── Keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, totalCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      router.push(allResults[active].href);
      setOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  const hasResults = (results?.jobs.length ?? 0) + (results?.shifts.length ?? 0) > 0;
  const isEmpty    = results !== null && !hasResults && query.length >= 2;

  // Flat index offset for shift results keyboard selection
  const shiftOffset = results?.jobs.length ?? 0;

  return (
    <div ref={containerRef} className="relative flex-1 hidden md:block">
      {/* Input */}
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a2332] rounded-xl px-4 py-2.5 border border-gray-100 dark:border-[#1e293b] focus-within:border-brand-blue/50 focus-within:ring-1 focus-within:ring-brand-blue/20 transition-all">
        {loading ? (
          <svg className="animate-spin shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" className="text-slate-400" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search jobs or shifts…"
          autoComplete="off"
          aria-label="Search employer dashboard"
          className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && hasResults) setOpen(true); }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setOpen(false); inputRef.current?.focus(); }}
            aria-label="Clear search"
            className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-gray-100 dark:border-[#1e293b] overflow-hidden z-50 max-h-[420px] overflow-y-auto">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try a different job title, sector, or location.</p>
            </div>
          )}

          {/* Job results */}
          {(results?.jobs.length ?? 0) > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Jobs
                </span>
              </div>
              {results!.jobs.map((job, i) => {
                const meta    = STATUS_META[job.status] ?? STATUS_META.draft;
                const secClr  = SECTOR_COLOUR[job.sector] ?? "text-slate-500";
                const isActive = active === i;
                return (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/dashboard/employer/jobs/${job.id}/edit`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{job.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold ${secClr}`}>{job.sector}</span>
                        <span className="text-slate-300 dark:text-white/20">·</span>
                        <span className="text-[10px] text-slate-400">{job.location}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Shifts results */}
          {(results?.shifts.length ?? 0) > 0 && (
            <div className={results!.jobs.length > 0 ? "border-t border-gray-50 dark:border-white/5" : ""}>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Shifts
                </span>
              </div>
              {results!.shifts.map((shift, i) => {
                const isActive = active === shiftOffset + i;
                const secClr  = SECTOR_COLOUR[shift.sector] ?? "text-slate-500";
                return (
                  <button
                    key={shift.jobId}
                    onClick={() => navigate(`/dashboard/employer/shifts/${shift.jobId}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-800/20 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{shift.title}</p>
                      <span className={`text-[10px] font-bold ${secClr}`}>{shift.sector}</span>
                    </div>

                    {/* Shift count badge */}
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-800/20 rounded-full px-2 py-0.5 shrink-0">
                      {shift.totalShifts} shift{shift.totalShifts !== 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          {hasResults && (
            <div className="px-4 py-2.5 border-t border-gray-50 dark:border-white/5 flex items-center gap-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[9px] font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[9px] font-mono">↵</kbd>
                open
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[9px] font-mono">esc</kbd>
                close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
