"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Job = {
  id: string;
  title: string;
  company: string;
  sector: string;
  location: string;
  remote: boolean;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  hasLivePricing: boolean;
  type: string;
  requiredCertifications: string[];
  closesAt: string | null;
  posted: string;
  createdAt: string;
};

type SortKey = "newest" | "oldest" | "salary-high" | "salary-low";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",      label: "Newest First" },
  { key: "oldest",      label: "Oldest First" },
  { key: "salary-high", label: "Salary: High to Low" },
  { key: "salary-low",  label: "Salary: Low to High" },
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];

// ─── Sector icon ───────────────────────────────────────────────────────────────

function SectorIcon({ sector }: { sector: string }) {
  const s = sector.toLowerCase();

  if (s.includes("health")) return (
    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    </div>
  );
  if (s.includes("hospital")) return (
    <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75C21 20.496 20.496 21 19.875 21H4.125A1.125 1.125 0 013 19.875v-6.75z" />
      </svg>
    </div>
  );
  if (s.includes("customer") || s.includes("care")) return (
    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    </div>
  );
  if (s.includes("logistic") || s.includes("transport")) return (
    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    </div>
  );
  // Tech & Data (default)
  return (
    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    </div>
  );
}

// ─── Compliance tag ────────────────────────────────────────────────────────────

function CertTag({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
      {label}
    </span>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({
  job, blocked, applied, applying, onApply, now,
}: {
  job:      Job;
  blocked:  boolean;
  applied:  boolean;
  applying: boolean;
  onApply:  () => void;
  now:      number;
}) {
  const isClosingSoon = job.closesAt
    ? (new Date(job.closesAt).getTime() - now) < 7 * 86_400_000
    : false;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <SectorIcon sector={job.sector} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-brand">{job.title}</h3>
              <p className="text-sm font-semibold text-brand-blue mt-0.5">{job.company}</p>
            </div>
            {isClosingSoon && (
              <span className="shrink-0 px-2.5 py-1 bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wide rounded-lg border border-red-100">
                Closing Soon
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
              {job.remote && <span className="ml-1 px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-semibold rounded">Remote</span>}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                </svg>
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.type}
            </span>
          </div>

          {/* Certification tags */}
          {job.requiredCertifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.requiredCertifications.map((cert) => (
                <CertTag key={cert} label={cert} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-xs text-slate-400">Posted {job.posted}</span>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/candidate/jobs/${job.id}`}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-brand transition-colors"
          >
            View Details
          </Link>
          {blocked ? (
            <span
              title="Your documents are under review. You'll be able to apply once verified."
              className="px-5 py-2 bg-gray-100 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed select-none"
            >
              Apply Now
            </span>
          ) : applied ? (
            <span className="flex items-center gap-1.5 px-5 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl select-none">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Applied
            </span>
          ) : (
            <button
              onClick={onApply}
              disabled={applying}
              className="flex items-center gap-1.5 px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {applying ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Applying…
                </>
              ) : "Apply Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="flex gap-3 mt-2">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-100 rounded-xl" />
          <div className="h-8 w-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function JobListingsPage() {
  const [allJobs,          setAllJobs]          = useState<Job[]>([]);
  const [sector,           setSector]           = useState<string | null>(null);
  const [candidateStatus,  setCandidateStatus]  = useState<string>("active");
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);

  // Track applied jobs and the one currently being submitted
  const [appliedJobIds,  setAppliedJobIds]  = useState<Set<string>>(new Set());
  const [applyingJobId,  setApplyingJobId]  = useState<string | null>(null);
  const [applyError,     setApplyError]     = useState<string | null>(null);

  // Ref for sort dropdown click-outside
  const sortRef = useRef<HTMLDivElement>(null);

  // Filters
  const [keyword,     setKeyword]     = useState("");
  const [location,    setLocation]    = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [remoteOnly,  setRemoteOnly]  = useState(false);
  const [sortBy,      setSortBy]      = useState<SortKey>("newest");
  const [showSort,    setShowSort]    = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);

  // ─── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/candidate/jobs");
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { jobs: Job[]; sector: string | null; candidateStatus: string; appliedJobIds?: string[] };
      setAllJobs(data.jobs);
      setSector(data.sector);
      setCandidateStatus(data.candidateStatus ?? "active");
      setAppliedJobIds(new Set(data.appliedJobIds ?? []));
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

  // ─── Apply handler ───────────────────────────────────────────────────────────

  async function handleApply(jobId: string) {
    if (applyingJobId || appliedJobIds.has(jobId)) return;
    setApplyingJobId(jobId);
    setApplyError(null);
    try {
      const res = await fetch("/api/candidate/applications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setAppliedJobIds((prev) => new Set([...prev, jobId]));
      } else {
        const body = await res.json().catch(() => ({}));
        setApplyError((body as { error?: string }).error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setApplyError("Network error. Please check your connection and try again.");
    } finally {
      setApplyingJobId(null);
    }
  }

  // ─── Filter + sort ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allJobs];

    // Keyword (title or company)
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
      );
    }

    // Location
    if (location.trim()) {
      const q = location.toLowerCase();
      list = list.filter((j) => j.location.toLowerCase().includes(q));
    }

    // Employment type
    if (activeTypes.size > 0) {
      list = list.filter((j) => activeTypes.has(j.type));
    }

    // Remote only
    if (remoteOnly) {
      list = list.filter((j) => j.remote);
    }

    // Sort
    if (sortBy === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sortBy === "oldest") list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sortBy === "salary-high" || sortBy === "salary-low") {
      const salaryVal = (j: Job) => j.salaryMax ?? j.salaryMin ?? 0;
      list.sort((a, b) =>
        sortBy === "salary-high" ? salaryVal(b) - salaryVal(a) : salaryVal(a) - salaryVal(b),
      );
    }

    return list;
  }, [allJobs, keyword, location, activeTypes, remoteOnly, sortBy]);

  // Pagination
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleType(t: string) {
    setPage(1);
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  function clearFilters() {
    setKeyword("");
    setLocation("");
    setActiveTypes(new Set());
    setRemoteOnly(false);
    setPage(1);
  }

  const hasActiveFilters = keyword || location || activeTypes.size > 0 || remoteOnly;

  // Stable timestamp for "closing soon" badge — refreshes when jobs load
  const [now] = useState(() => Date.now());

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-5">

        {/* Header */}
        <div data-gsap="fade-down">
          <h1 className="text-[26px] font-black text-brand tracking-tight">
            {sector ? `${sector} Jobs` : "Job Listings"}
          </h1>
          {sector && (
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Showing roles matched to your registered sector
            </p>
          )}
        </div>

        {/* Resubmission banner */}
        {candidateStatus === "resubmission" && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4" data-gsap="fade-down">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">Documents Under Review</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                You recently uploaded a document that requires verification. You can browse jobs but <strong>applying is paused</strong> until our team completes the review — usually within 24 hours.
              </p>
            </div>
            <Link
              href="/dashboard/candidate/legal"
              className="shrink-0 text-xs font-bold text-amber-700 underline hover:text-amber-900 transition-colors"
            >
              View Status
            </Link>
          </div>
        )}

        {/* Pending banner */}
        {candidateStatus === "pending" && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4" data-gsap="fade-down">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-800">Account Pending Verification</p>
              <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                Your account is being reviewed by our team. You can browse jobs, but <strong>applying is unavailable</strong> until your profile is verified — usually within 24 hours.
              </p>
            </div>
            <Link
              href="/dashboard/candidate/legal"
              className="shrink-0 text-xs font-bold text-blue-700 underline hover:text-blue-900 transition-colors"
            >
              View Status
            </Link>
          </div>
        )}

        {/* Apply error toast */}
        {applyError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3" data-gsap="fade-down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700 flex-1">{applyError}</p>
            <button onClick={() => setApplyError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search bar */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3" data-gsap="fade-down">
          <div className="flex-1 flex items-center gap-3 sm:border-r sm:border-gray-100 sm:pr-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="Job title or company name"
              className="text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full bg-transparent"
            />
          </div>
          <div className="flex items-center gap-3 sm:pl-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1); }}
              placeholder="Location"
              className="text-sm text-slate-600 placeholder:text-slate-400 outline-none bg-transparent w-full sm:w-36"
            />
          </div>
        </div>

        {/* Body: filters + results */}
        <div className="flex flex-col md:flex-row gap-5 items-start">

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 self-start"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
          </button>

          {/* Filters panel */}
          <div
            className={`w-full md:w-[220px] md:shrink-0 bg-white border border-gray-100 rounded-2xl p-5 space-y-6 ${showFilters ? "block" : "hidden"} md:block`}
            data-gsap="fade-up"
          >
            {/* Sector badge */}
            {sector && (
              <div className="px-3 py-2.5 bg-brand-blue/8 border border-brand-blue/20 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-0.5">Your Sector</p>
                <p className="text-sm font-bold text-brand">{sector}</p>
              </div>
            )}

            {/* Employment type */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Employment Type</p>
              <div className="space-y-2.5">
                {EMPLOYMENT_TYPES.map((t) => {
                  const checked = activeTypes.has(t);
                  return (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleType(t)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          checked ? "bg-brand-blue border-brand-blue" : "border-gray-300 group-hover:border-brand-blue/50"
                        }`}
                      >
                        {checked && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-slate-600">{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Remote toggle */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Work Pattern</p>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => { setRemoteOnly((v) => !v); setPage(1); }}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                    remoteOnly ? "bg-brand-blue border-brand-blue" : "border-gray-300 group-hover:border-brand-blue/50"
                  }`}
                >
                  {remoteOnly && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-slate-600">Remote only</span>
              </label>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full border border-brand-blue text-brand-blue text-sm font-semibold rounded-xl py-2 hover:bg-blue-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 space-y-4 min-w-0" data-gsap="fade-up">

            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-brand">
                {loading ? (
                  <span className="text-slate-400 font-normal text-sm">Loading…</span>
                ) : (
                  <>
                    {filtered.length > 0 ? filtered.length : "No"} job{filtered.length !== 1 ? "s" : ""}{" "}
                    <span className="text-slate-400 font-normal text-sm">
                      {hasActiveFilters ? "match your filters" : "available"}
                    </span>
                  </>
                )}
              </p>

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
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setShowSort(false); setPage(1); }}
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

            {/* Cards */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand">
                  {allJobs.length === 0
                    ? `No live ${sector ?? ""} roles at the moment`
                    : "No jobs match your filters"}
                </p>
                <p className="text-xs text-slate-400">
                  {allJobs.length === 0
                    ? "New roles are added regularly — check back soon."
                    : "Try adjusting your search or clearing filters."}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm font-semibold text-brand-blue underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              paginated.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  blocked={candidateStatus !== "active"}
                  applied={appliedJobIds.has(job.id)}
                  applying={applyingJobId === job.id}
                  onApply={() => handleApply(job.id)}
                  now={now}
                />
              ))
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {(() => {
                  const maxVisible = 5;
                  let start = Math.max(1, page - Math.floor(maxVisible / 2));
                  const end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

                  const pages: React.ReactNode[] = [];

                  if (start > 1) {
                    pages.push(
                      <button key={1} onClick={() => setPage(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-slate-500 hover:bg-gray-100 transition-colors">1</button>
                    );
                    if (start > 2) pages.push(<span key="start-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                  }

                  for (let p = start; p <= end; p++) {
                    pages.push(
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                          page === p ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) pages.push(<span key="end-dots" className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>);
                    pages.push(
                      <button key={totalPages} onClick={() => setPage(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-slate-500 hover:bg-gray-100 transition-colors">{totalPages}</button>
                    );
                  }

                  return pages;
                })()}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
