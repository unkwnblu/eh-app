"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Job = {
  id:             string;
  employer:       string;
  employerId:     string;
  initials:       string;
  title:          string;
  sector:         string;
  location:       string;
  salary:         string | null;
  type:           string;
  remote:         boolean;
  posted:         string;
  createdAt:      string;
  closesAt:       string | null;
  dbStatus:       string;
  applied:        number;
  newCount:       number;
  interviewing:   number;
  offers:         number;
  rejected:       number;
};

type SortKey = "newest" | "oldest" | "most-applicants" | "most-interviewing";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",             label: "Newest First" },
  { key: "oldest",             label: "Oldest First" },
  { key: "most-applicants",    label: "Most Applicants" },
  { key: "most-interviewing",  label: "Most Interviewing" },
];

const STATUS_FILTER_OPTIONS = [
  { key: "all",    label: "All Statuses" },
  { key: "live",   label: "Live Only" },
  { key: "closed", label: "Closed" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare:       "text-teal-600 bg-teal-50",
  Hospitality:      "text-orange-600 bg-orange-50",
  "Customer Care":  "text-purple-600 bg-purple-50",
  "Tech & Data":    "text-blue-600 bg-blue-50",
  Logistics:        "text-amber-600 bg-amber-50",
};

// ─── Job row ───────────────────────────────────────────────────────────────────

function JobRow({ job }: { job: Job }) {
  const sectorStyle = SECTOR_COLOURS[job.sector] ?? "text-slate-500 bg-slate-50";

  return (
    <Link
      href={`/dashboard/admin/jobs/${job.id}`}
      className="block bg-white border border-gray-100 rounded-2xl px-6 py-5 hover:shadow-sm hover:border-brand-blue/30 transition-all"
    >
      <div className="flex items-center gap-5">
        {/* Employer avatar */}
        <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-brand-blue">{job.initials}</span>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sectorStyle}`}>
              {job.sector}
            </span>
            {job.dbStatus === "live" && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Live
              </span>
            )}
            {job.dbStatus === "closed" && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Closed
              </span>
            )}
            {job.remote && (
              <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-full">Remote</span>
            )}
          </div>
          <h3 className="text-base font-bold text-brand truncate">{job.title}</h3>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">{job.employer}</span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posted {job.posted}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary}
              </span>
            )}
          </div>
        </div>

        {/* Pipeline stats */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-lg font-black text-brand leading-none">{job.applied}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Applied</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-amber-600 leading-none">{job.newCount}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">New</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-brand-blue leading-none">{job.interviewing}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Interview</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-green-600 leading-none">{job.offers}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Offers</p>
          </div>
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-5 w-1/2 bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-100 rounded" />
        </div>
        <div className="hidden md:flex gap-6">
          {[0,1,2,3].map((i) => <div key={i} className="w-10 h-10 bg-gray-100 rounded" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminJobPipelinePage() {
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // Filters
  const [keyword,      setKeyword]      = useState("");
  const [employer,     setEmployer]     = useState<string>("all");
  const [sector,       setSector]       = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("live");
  const [sortBy,       setSortBy]       = useState<SortKey>("newest");
  const [showSort,     setShowSort]     = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  // ─── Load ────────────────────────────────────────────────────────────────────

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

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    }
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSort]);

  // ─── Derived — employer + sector options ─────────────────────────────────────

  const employerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of jobs) map.set(j.employerId, j.employer);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  const sectorOptions = useMemo(() => {
    return [...new Set(jobs.map((j) => j.sector))].filter(Boolean).sort();
  }, [jobs]);

  // ─── Filter + sort ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...jobs];

    // Status filter: default to live + closed only (exclude review/draft/rejected/flagged — those go through moderation)
    if (statusFilter === "live")         list = list.filter((j) => j.dbStatus === "live");
    else if (statusFilter === "closed")  list = list.filter((j) => j.dbStatus === "closed");
    else                                  list = list.filter((j) => j.dbStatus === "live" || j.dbStatus === "closed");

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q)
            || j.employer.toLowerCase().includes(q)
            || j.location.toLowerCase().includes(q),
      );
    }

    if (employer !== "all") list = list.filter((j) => j.employerId === employer);
    if (sector !== "all")   list = list.filter((j) => j.sector === sector);

    if (sortBy === "newest")             list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortBy === "oldest")             list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sortBy === "most-applicants")    list.sort((a, b) => b.applied - a.applied);
    if (sortBy === "most-interviewing")  list.sort((a, b) => b.interviewing - a.interviewing);

    return list;
  }, [jobs, statusFilter, keyword, employer, sector, sortBy]);

  // ─── Stats ───────────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const live = jobs.filter((j) => j.dbStatus === "live");
    return {
      liveJobs:     live.length,
      applied:      live.reduce((s, j) => s + j.applied, 0),
      interviewing: live.reduce((s, j) => s + j.interviewing, 0),
      offers:       live.reduce((s, j) => s + j.offers, 0),
    };
  }, [jobs]);

  function clearFilters() {
    setKeyword("");
    setEmployer("all");
    setSector("all");
    setStatusFilter("live");
  }

  const hasActiveFilters = keyword || employer !== "all" || sector !== "all" || statusFilter !== "live";

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">

        {/* Header */}
        <div data-gsap="fade-down">
          <h1 className="text-[28px] font-black text-brand tracking-tight">Job Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage candidate pipelines across all employer roles — interviews, offers, and rejections.
          </p>
        </div>

        {/* Stat cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-up">
            {[
              { label: "Live Roles",         value: totals.liveJobs,     bg: "bg-brand-blue/10", color: "text-brand-blue", val: "text-brand" },
              { label: "Total Applied",       value: totals.applied,      bg: "bg-green-50",      color: "text-green-500",  val: "text-green-600" },
              { label: "In Interviews",       value: totals.interviewing, bg: "bg-amber-50",      color: "text-amber-500",  val: "text-amber-600" },
              { label: "Offers Extended",     value: totals.offers,       bg: "bg-purple-50",     color: "text-purple-500", val: "text-purple-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={s.color}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className={`text-2xl font-black ${s.val}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center" data-gsap="fade-up">
          {/* Keyword */}
          <div className="flex-1 flex items-center gap-2 lg:border-r lg:border-gray-100 lg:pr-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, employer or location"
              className="text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full bg-transparent"
            />
          </div>

          {/* Employer */}
          <select
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            className="text-sm text-slate-600 bg-transparent outline-none border border-gray-100 rounded-lg px-3 py-2 cursor-pointer hover:border-brand-blue/30 transition-colors"
          >
            <option value="all">All Employers</option>
            {employerOptions.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          {/* Sector */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="text-sm text-slate-600 bg-transparent outline-none border border-gray-100 rounded-lg px-3 py-2 cursor-pointer hover:border-brand-blue/30 transition-colors"
          >
            <option value="all">All Sectors</option>
            {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm text-slate-600 bg-transparent outline-none border border-gray-100 rounded-lg px-3 py-2 cursor-pointer hover:border-brand-blue/30 transition-colors"
          >
            {STATUS_FILTER_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-brand">
            {loading ? (
              <span className="text-slate-400 font-normal text-sm">Loading…</span>
            ) : (
              <>
                {filtered.length > 0 ? filtered.length : "No"} job{filtered.length !== 1 ? "s" : ""}{" "}
                <span className="text-slate-400 font-normal text-sm">
                  {hasActiveFilters ? "match your filters" : "in the pipeline"}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-semibold text-brand-blue underline hover:text-brand transition-colors">
                Clear filters
              </button>
            )}

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSort((s) => !s)}
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                Sort:{" "}
                <span className="font-semibold text-brand-blue">
                  {SORT_OPTIONS.find((o) => o.key === sortBy)?.label}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        sortBy === opt.key ? "text-brand-blue font-semibold bg-blue-50" : "text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3" data-gsap="fade-up">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
          ) : error ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="font-bold text-brand">{error}</p>
              <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand">
                {jobs.length === 0 ? "No live jobs yet" : "No jobs match your filters"}
              </p>
              <p className="text-xs text-slate-400">
                {jobs.length === 0
                  ? "Approved jobs will appear here automatically."
                  : "Try adjusting your filters or clearing them."}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm font-semibold text-brand-blue underline">Clear filters</button>
              )}
            </div>
          ) : (
            filtered.map((job) => <JobRow key={job.id} job={job} />)
          )}
        </div>
      </main>
    </>
  );
}
