"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

type SortKey       = "newest" | "oldest" | "most-applicants" | "most-interviewing";
type StatusFilter  = "all" | "live" | "closed";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare:       "text-teal-600 bg-teal-50",
  Hospitality:      "text-orange-600 bg-orange-50",
  "Customer Care":  "text-purple-600 bg-purple-50",
  "Tech & Data":    "text-blue-600 bg-blue-50",
  Logistics:        "text-amber-600 bg-amber-50",
};

// ─── Metric chip (read-only stat card) ─────────────────────────────────────────

function MetricChip({
  label, value, icon, accent,
}: {
  label: string; value: number; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-gray-100">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-2xl font-black text-brand leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Status filter chip (clickable) ────────────────────────────────────────────

function FilterChip({
  label, count, active, onClick, accent,
}: {
  label: string; count: number; active: boolean; onClick: () => void; accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
        active ? `${accent} shadow-sm` : "bg-white border border-gray-100 text-slate-500 hover:border-gray-200 hover:text-brand"
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
        active ? "bg-white/25" : "bg-gray-100 text-slate-400"
      }`}>
        {count}
      </span>
    </button>
  );
}

// ─── Job row with funnel visualization ─────────────────────────────────────────

function JobRow({ job }: { job: Job }) {
  const sectorStyle = SECTOR_COLOURS[job.sector] ?? "text-slate-500 bg-slate-50";

  // Funnel: each stage as a percentage of total applied
  const total = Math.max(job.applied, 1); // avoid /0
  const interviewPct = Math.round((job.interviewing / total) * 100);
  const offersPct    = Math.round((job.offers       / total) * 100);

  return (
    <Link
      href={`/dashboard/admin/jobs/${job.id}`}
      className="group block bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:shadow-sm hover:border-brand-blue/30 transition-all"
    >
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-brand-blue">{job.initials}</span>
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-brand truncate group-hover:text-brand-blue transition-colors">{job.title}</h3>
            {job.dbStatus === "live" ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Closed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${sectorStyle}`}>{job.sector}</span>
            <span className="text-xs font-semibold text-slate-500 truncate">{job.employer}</span>
            {job.remote && (
              <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded-full">Remote</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
            </span>
            <span>·</span>
            <span>Posted {job.posted}</span>
            {job.salary && (
              <>
                <span>·</span>
                <span>{job.salary}</span>
              </>
            )}
          </div>
        </div>

        {/* Funnel visualization (desktop only) */}
        <div className="hidden lg:block w-[280px] shrink-0">
          {/* Numbers row */}
          <div className="flex items-center justify-between text-xs mb-2">
            <FunnelStat label="Applied"    value={job.applied}      tone="text-brand"      />
            <FunnelStat label="New"        value={job.newCount}     tone="text-amber-600"  />
            <FunnelStat label="Interview"  value={job.interviewing} tone="text-brand-blue" />
            <FunnelStat label="Offers"     value={job.offers}       tone="text-green-600"  />
          </div>
          {/* Stacked progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
            {job.applied === 0 ? (
              <div className="flex-1" />
            ) : (
              <>
                <div className="bg-amber-300 transition-all" style={{ width: `${(job.newCount / total) * 100}%` }} />
                <div className="bg-brand-blue transition-all" style={{ width: `${(job.interviewing / total) * 100}%` }} />
                <div className="bg-green-500 transition-all" style={{ width: `${(job.offers / total) * 100}%` }} />
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            {job.applied === 0 ? (
              "No applicants yet"
            ) : (
              <>
                {interviewPct}% in interview · {offersPct}% offered
              </>
            )}
          </p>
        </div>

        {/* Mobile compact stats */}
        <div className="flex lg:hidden items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-base font-black text-brand leading-none">{job.applied}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Applied</p>
          </div>
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-brand-blue transition-colors shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

function FunnelStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="text-center">
      <p className={`text-base font-black leading-none ${tone}`}>{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </div>
  );
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
          <div className="h-3 w-1/3 bg-gray-100 rounded" />
          <div className="h-2.5 w-2/3 bg-gray-100 rounded" />
        </div>
        <div className="hidden lg:block w-[280px] shrink-0 space-y-2">
          <div className="flex justify-between gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-6 w-12 bg-gray-100 rounded" />)}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminJobPipelinePage() {
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Filters
  const [keyword,      setKeyword]      = useState("");
  const [employer,     setEmployer]     = useState<string>("all");
  const [sector,       setSector]       = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("live");
  const [sortBy,       setSortBy]       = useState<SortKey>("newest");

  // ── Load ──────────────────────────────────────────────────────────────────
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

  // ── Derived options ──────────────────────────────────────────────────────
  const employerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of jobs) map.set(j.employerId, j.employer);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  const sectorOptions = useMemo(() => {
    return [...new Set(jobs.map((j) => j.sector))].filter(Boolean).sort();
  }, [jobs]);

  // Pipeline-relevant jobs only (live or closed — not in moderation)
  const pipelineJobs = useMemo(
    () => jobs.filter((j) => j.dbStatus === "live" || j.dbStatus === "closed"),
    [jobs],
  );

  // ── Counts ───────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:    pipelineJobs.length,
    live:   pipelineJobs.filter((j) => j.dbStatus === "live").length,
    closed: pipelineJobs.filter((j) => j.dbStatus === "closed").length,
  }), [pipelineJobs]);

  // ── Top metrics (live jobs only) ─────────────────────────────────────────
  const totals = useMemo(() => {
    const live = pipelineJobs.filter((j) => j.dbStatus === "live");
    return {
      liveJobs:     live.length,
      applied:      live.reduce((s, j) => s + j.applied, 0),
      interviewing: live.reduce((s, j) => s + j.interviewing, 0),
      offers:       live.reduce((s, j) => s + j.offers, 0),
    };
  }, [pipelineJobs]);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...pipelineJobs];

    if (statusFilter === "live")        list = list.filter((j) => j.dbStatus === "live");
    else if (statusFilter === "closed") list = list.filter((j) => j.dbStatus === "closed");

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      list = list.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.employer.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
      );
    }
    if (employer !== "all") list = list.filter((j) => j.employerId === employer);
    if (sector !== "all")   list = list.filter((j) => j.sector === sector);

    if (sortBy === "newest")            list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortBy === "oldest")            list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sortBy === "most-applicants")   list.sort((a, b) => b.applied - a.applied);
    if (sortBy === "most-interviewing") list.sort((a, b) => b.interviewing - a.interviewing);

    return list;
  }, [pipelineJobs, statusFilter, keyword, employer, sector, sortBy]);

  function clearFilters() {
    setKeyword("");
    setEmployer("all");
    setSector("all");
    setStatusFilter("live");
  }

  const hasActiveFilters = keyword || employer !== "all" || sector !== "all" || statusFilter !== "live";

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Job Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage candidate pipelines across all employer roles — interviews, offers, and rejections.
          </p>
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

      {/* Top metric chips — live-jobs aggregate */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-gsap="fade-up">
        <MetricChip
          label="Live Roles" value={totals.liveJobs} accent="bg-brand-blue/10"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
        />
        <MetricChip
          label="Total Applied" value={totals.applied} accent="bg-amber-50"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <MetricChip
          label="In Interviews" value={totals.interviewing} accent="bg-blue-50"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          }
        />
        <MetricChip
          label="Offers Extended" value={totals.offers} accent="bg-green-50"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Toolbar — search + filters + sort */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 space-y-3" data-gsap="fade-up">
        {/* Top row — search + selects */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-brand-blue/40 focus-within:bg-white transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, employer, or location…"
              className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
            />
            {keyword && (
              <button onClick={() => setKeyword("")} aria-label="Clear search" className="text-slate-300 hover:text-slate-500 shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Employer */}
          <select
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40 max-w-[180px]"
          >
            <option value="all">All Employers</option>
            {employerOptions.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          {/* Sector */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
          >
            <option value="all">All Sectors</option>
            {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
            aria-label="Sort jobs"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="most-applicants">Sort: Most Applicants</option>
            <option value="most-interviewing">Sort: Most Interviewing</option>
          </select>
        </div>

        {/* Bottom row — status filter chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Status:</span>
          <FilterChip label="All"    count={counts.all}    active={statusFilter === "all"}    onClick={() => setStatusFilter("all")}    accent="bg-brand text-white" />
          <FilterChip label="Live"   count={counts.live}   active={statusFilter === "live"}   onClick={() => setStatusFilter("live")}   accent="bg-green-500 text-white" />
          <FilterChip label="Closed" count={counts.closed} active={statusFilter === "closed"} onClick={() => setStatusFilter("closed")} accent="bg-slate-500 text-white" />

          <div className="flex-1" />

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs font-semibold text-brand-blue hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-bold text-brand">
          {loading ? (
            <span className="text-slate-400 font-normal">Loading…</span>
          ) : (
            <>
              {filtered.length} job{filtered.length !== 1 ? "s" : ""}
              <span className="text-slate-400 font-normal ml-1">
                {hasActiveFilters ? "matching your filters" : "in the pipeline"}
              </span>
            </>
          )}
        </p>
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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387" />
              </svg>
            </div>
            <p className="text-sm font-bold text-brand">
              {pipelineJobs.length === 0 ? "No live jobs yet" : "No jobs match your filters"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {pipelineJobs.length === 0
                ? "Approved jobs will appear here automatically once they go live."
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

      {/* Funnel legend (desktop only) — explains the bar colours */}
      {!loading && filtered.length > 0 && (
        <div className="hidden lg:flex items-center justify-end gap-4 px-2 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Funnel:</span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-300" /> New
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-brand-blue" /> Interviewing
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Offered
          </span>
        </div>
      )}
    </main>
  );
}
