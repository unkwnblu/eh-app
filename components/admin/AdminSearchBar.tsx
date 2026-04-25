"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateResult = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type EmployerResult = {
  id: string;
  companyName: string;
  industry: string | null;
  contactName: string | null;
  email: string | null;
  status: string;
};

type JobResult = {
  id: string;
  title: string;
  sector: string;
  status: string;
  companyName: string;
};

type UserResult = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type SearchResults = {
  candidates: CandidateResult[];
  employers:  EmployerResult[];
  jobs:       JobResult[];
  users:      UserResult[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  active:       "bg-green-500",
  pending:      "bg-amber-400",
  flagged:      "bg-red-400",
  suspended:    "bg-red-400",
  resubmission: "bg-purple-400",
};

const JOB_STATUS_DOT: Record<string, string> = {
  live:    "bg-green-500",
  review:  "bg-amber-400",
  draft:   "bg-slate-300",
  closed:  "bg-slate-300",
};

const JOB_STATUS_LABEL: Record<string, string> = {
  live:    "Live",
  review:  "In Review",
  draft:   "Draft",
  closed:  "Closed",
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

function statusLabel(s: string) {
  if (s === "active")       return "Verified";
  if (s === "suspended")    return "Flagged";
  if (s === "resubmission") return "Resubmission";
  return "Pending";
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-3 pb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSearchBar() {
  const router = useRouter();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [active,  setActive]  = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const debounced    = useDebounce(query, 320);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const doFetch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      const data = await res.json() as SearchResults;
      setResults(data);
      setOpen(true);
      setActive(-1);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doFetch(debounced); }, [debounced, doFetch]);

  // ── Outside click ─────────────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Flat list for keyboard nav ─────────────────────────────────────────────
  const flat: { href: string }[] = [
    ...(results?.candidates ?? []).map((c) => ({ href: `/dashboard/admin/verification` })),
    ...(results?.employers  ?? []).map((e) => ({ href: `/dashboard/admin/employer-verification` })),
    ...(results?.jobs       ?? []).map((j) => ({ href: `/dashboard/admin/jobs/${j.id}` })),
    ...(results?.users      ?? []).map((u) => ({ href: `/dashboard/admin/users` })),
  ];

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setActive((p) => Math.min(p + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActive((p) => Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); navigate(flat[active].href); }
    else if (e.key === "Escape") setOpen(false);
  }

  const cLen = results?.candidates.length ?? 0;
  const eLen = results?.employers.length  ?? 0;
  const jLen = results?.jobs.length       ?? 0;

  const eOffset = cLen;
  const jOffset = cLen + eLen;
  const uOffset = cLen + eLen + jLen;

  const hasResults = (cLen + eLen + jLen + (results?.users.length ?? 0)) > 0;
  const isEmpty    = results !== null && !hasResults && query.length >= 2;

  return (
    <div ref={containerRef} className="relative flex-1 hidden md:block">
      {/* Input */}
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a2332] rounded-xl px-4 py-2.5 border border-gray-100 dark:border-[#1e293b] focus-within:border-brand-blue/50 focus-within:ring-1 focus-within:ring-brand-blue/20 transition-all">
        {loading ? (
          <svg className="animate-spin shrink-0 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search candidates, employers, jobs…"
          autoComplete="off"
          aria-label="Global admin search"
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-gray-100 dark:border-[#1e293b] overflow-hidden z-50 max-h-[480px] overflow-y-auto">

          {/* Empty */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try a name, email, company, or job title.</p>
            </div>
          )}

          {/* ── Candidates ─────────────────────────────────────────────────── */}
          {cLen > 0 && (
            <div>
              <SectionHeader label="Candidates" />
              {results!.candidates.map((c, i) => {
                const isActive = active === i;
                const dot      = STATUS_DOT[c.status] ?? STATUS_DOT.pending;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate("/dashboard/admin/verification")}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0 text-white text-xs font-bold">
                      {c.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{c.name || "—"}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {statusLabel(c.status)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Employers ──────────────────────────────────────────────────── */}
          {eLen > 0 && (
            <div className={cLen > 0 ? "border-t border-gray-50 dark:border-white/5" : ""}>
              <SectionHeader label="Employers" />
              {results!.employers.map((e, i) => {
                const isActive = active === eOffset + i;
                const dot      = STATUS_DOT[e.status] ?? STATUS_DOT.pending;
                return (
                  <button
                    key={e.id}
                    onClick={() => navigate("/dashboard/admin/employer-verification")}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-800/20 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{e.companyName}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {e.contactName ? `${e.contactName} · ` : ""}{e.industry ?? e.email ?? ""}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {statusLabel(e.status)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Jobs ───────────────────────────────────────────────────────── */}
          {jLen > 0 && (
            <div className={(cLen + eLen) > 0 ? "border-t border-gray-50 dark:border-white/5" : ""}>
              <SectionHeader label="Jobs" />
              {results!.jobs.map((j, i) => {
                const isActive = active === jOffset + i;
                const dot      = JOB_STATUS_DOT[j.status]   ?? "bg-slate-300";
                const label    = JOB_STATUS_LABEL[j.status]  ?? j.status;
                const secClr   = SECTOR_COLOUR[j.sector]      ?? "text-slate-500";
                return (
                  <button
                    key={j.id}
                    onClick={() => navigate(`/dashboard/admin/jobs/${j.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{j.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold ${secClr}`}>{j.sector}</span>
                        <span className="text-slate-300 dark:text-white/20">·</span>
                        <span className="text-[10px] text-slate-400 truncate">{j.companyName}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Admin / Moderator users ─────────────────────────────────────── */}
          {(results?.users.length ?? 0) > 0 && (
            <div className={(cLen + eLen + jLen) > 0 ? "border-t border-gray-50 dark:border-white/5" : ""}>
              <SectionHeader label="System Users" />
              {results!.users.map((u, i) => {
                const isActive = active === uOffset + i;
                const isAdmin  = u.role === "admin";
                return (
                  <button
                    key={u.id}
                    onClick={() => navigate("/dashboard/admin/users")}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isActive ? "bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${isAdmin ? "bg-brand" : "bg-purple-500"}`}>
                      {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand dark:text-white truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdmin ? "bg-brand/10 text-brand" : "bg-purple-50 dark:bg-purple-800/20 text-purple-600"}`}>
                      {isAdmin ? "Admin" : "Moderator"}
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
