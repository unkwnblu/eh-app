"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: { label: string; variant: "default" | "urgent" | "compliance" | "perk" }[];
  postedAgo: string;
  saved: boolean;
  sector: "healthcare" | "hospitality" | "customer" | "logistics" | "tech";
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  {
    id: 1, title: "Senior Care Assistant", company: "Heritage Care Homes",
    location: "London, UK", salary: "£14.50 – £16.00 / hour", type: "Full-time",
    tags: [{ label: "Healthcare", variant: "default" }, { label: "Immediate Start", variant: "urgent" }, { label: "DBS Required", variant: "compliance" }],
    postedAgo: "2 hours ago", saved: false, sector: "healthcare",
  },
  {
    id: 2, title: "Front of House Supervisor", company: "Blue Anchor Dining",
    location: "Manchester, UK", salary: "£28,000 – £32,000 / year", type: "Permanent",
    tags: [{ label: "Hospitality", variant: "default" }, { label: "Management", variant: "default" }],
    postedAgo: "1 day ago", saved: true, sector: "hospitality",
  },
  {
    id: 3, title: "Customer Success Agent", company: "Harbour Tech Solutions",
    location: "Remote", salary: "£24,000 / year", type: "Part-time",
    tags: [{ label: "Customer Service", variant: "default" }, { label: "Remote Work", variant: "default" }, { label: "Bonus Scheme", variant: "perk" }],
    postedAgo: "3 days ago", saved: false, sector: "customer",
  },
  {
    id: 4, title: "Warehouse Team Leader", company: "SwiftMove Logistics",
    location: "Birmingham, UK", salary: "£13.00 – £15.00 / hour", type: "Full-time",
    tags: [{ label: "Logistics", variant: "default" }, { label: "Immediate Start", variant: "urgent" }],
    postedAgo: "4 days ago", saved: false, sector: "logistics",
  },
  {
    id: 5, title: "Staff Nurse — A&E", company: "City General Hospital",
    location: "Bristol, UK", salary: "£32,000 – £38,000 / year", type: "Full-time",
    tags: [{ label: "Healthcare", variant: "default" }, { label: "DBS Required", variant: "compliance" }, { label: "NMC Pin", variant: "compliance" }],
    postedAgo: "5 days ago", saved: false, sector: "healthcare",
  },
  {
    id: 6, title: "Frontend Engineer", company: "Lumina Systems",
    location: "Remote", salary: "£55,000 – £70,000 / year", type: "Contract",
    tags: [{ label: "Tech & Data", variant: "default" }, { label: "Remote Work", variant: "default" }],
    postedAgo: "6 days ago", saved: true, sector: "tech",
  },
];

const SORT_OPTIONS = ["Newest First", "Salary: High to Low", "Salary: Low to High", "Most Relevant"];

// ─── Sector icon ───────────────────────────────────────────────────────────────

function SectorIcon({ sector }: { sector: Job["sector"] }) {
  const map: Record<Job["sector"], { bg: string; icon: React.ReactNode }> = {
    healthcare: {
      bg: "bg-blue-50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    hospitality: {
      bg: "bg-orange-50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-1.5-.75M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75C21 20.496 20.496 21 19.875 21H4.125A1.125 1.125 0 013 19.875v-6.75z" />
        </svg>
      ),
    },
    customer: {
      bg: "bg-purple-50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
    },
    logistics: {
      bg: "bg-amber-50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    tech: {
      bg: "bg-teal-50",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
  };
  const { bg, icon } = map[sector];
  return (
    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
  );
}

// ─── Tag ───────────────────────────────────────────────────────────────────────

function Tag({ label, variant }: { label: string; variant: Job["tags"][number]["variant"] }) {
  const styles = {
    default:    "bg-gray-100 text-slate-500",
    urgent:     "bg-blue-50 text-brand-blue border border-blue-200",
    compliance: "bg-amber-50 text-amber-700 border border-amber-200",
    perk:       "bg-green-50 text-green-700 border border-green-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job, onToggleSave }: { job: Job; onToggleSave: (id: number) => void }) {
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
            <button
              onClick={() => onToggleSave(job.id)}
              className="shrink-0 p-1 transition-colors mt-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={job.saved ? "#e11d48" : "none"} stroke={job.saved ? "#e11d48" : "#cbd5e1"} strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.type}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.tags.map((tag) => (
              <Tag key={tag.label} label={tag.label} variant={tag.variant} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-xs text-slate-400">Posted {job.postedAgo}</span>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/candidate/jobs/${job.id}`} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
            View Details
          </Link>
          <button className="px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobListingsPage() {
  const [jobs, setJobs] = useState(JOBS);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [showSort, setShowSort] = useState(false);
  const [empTypes, setEmpTypes] = useState({ "Full-time": true, "Part-time": false, "Contract": false });
  const [currentPage, setCurrentPage] = useState(1);

  function toggleEmp(key: keyof typeof empTypes) {
    setEmpTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleSave(id: number) {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, saved: !j.saved } : j));
  }

  function clearFilters() {
    setEmpTypes({ "Full-time": false, "Part-time": false, "Contract": false });
    setKeyword("");
    setLocation("");
  }

  const totalPages = 12;

  return (
    <main className="flex-1 px-8 py-8 space-y-5">
      {/* Search bar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-3" data-gsap="fade-down">
        <div className="flex-1 flex items-center gap-3 border-r border-gray-100 pr-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, keywords, or company"
            className="text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full bg-transparent"
          />
        </div>
        <div className="flex items-center gap-3 pl-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="text-sm text-slate-600 placeholder:text-slate-400 outline-none bg-transparent w-36"
          />
        </div>
        <button className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shrink-0">
          Find Jobs
        </button>
      </div>

      {/* Body: filters + results */}
      <div className="flex gap-5 items-start">

        {/* Filters panel */}
        <div className="w-[220px] shrink-0 bg-white border border-gray-100 rounded-2xl p-5 space-y-6" data-gsap="fade-up">
          {/* Employment type */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Employment Type</p>
            <div className="space-y-2.5">
              {(Object.keys(empTypes) as (keyof typeof empTypes)[]).map((key) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleEmp(key)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      empTypes[key] ? "bg-brand-blue border-brand-blue" : "border-gray-300 group-hover:border-brand-blue/50"
                    }`}
                  >
                    {empTypes[key] && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-slate-600">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary range */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Salary Range</p>
            <input
              type="range"
              min={15} max={100} defaultValue={60}
              className="w-full accent-brand-blue"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>£15k</span>
              <span>£100k+</span>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="w-full border border-brand-blue text-brand-blue text-sm font-semibold rounded-xl py-2 hover:bg-blue-50 transition-colors"
          >
            Clear All Filters
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 space-y-4" data-gsap="fade-up">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-brand">
              Search Results{" "}
              <span className="text-slate-400 font-normal text-sm">(128 jobs found)</span>
            </p>
            <div className="relative">
              <button
                onClick={() => setShowSort((s) => !s)}
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                Sort by:{" "}
                <span className="font-semibold text-brand-blue">{sortBy}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt === sortBy ? "text-brand-blue font-semibold bg-blue-50" : "text-slate-600 hover:bg-gray-50"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job cards */}
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onToggleSave={toggleSave} />
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === p ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                currentPage === totalPages ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-gray-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
