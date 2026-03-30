"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmployerJobCardSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabKey = "live" | "review" | "closed";

type Job = {
  id: number;
  title: string;
  sector: string;
  location: string;
  postedAgo: string;
  applied: number;
  interviewing: number;
  status: TabKey;
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  { id: 1, title: "Senior Support Worker", sector: "Healthcare", location: "Bristol, UK", postedAgo: "2 days ago", applied: 42, interviewing: 8, status: "live" },
  { id: 2, title: "ICU Specialist Nurse", sector: "Healthcare", location: "London, UK", postedAgo: "4 days ago", applied: 67, interviewing: 12, status: "live" },
  { id: 3, title: "Warehouse Supervisor", sector: "Logistics", location: "Birmingham, UK", postedAgo: "1 day ago", applied: 18, interviewing: 3, status: "live" },
  { id: 4, title: "Fleet Dispatcher", sector: "Logistics", location: "Manchester, UK", postedAgo: "3 days ago", applied: 128, interviewing: 22, status: "live" },
  { id: 5, title: "Customer Care Lead", sector: "Customer Care", location: "Leeds, UK", postedAgo: "5 days ago", applied: 34, interviewing: 6, status: "live" },
  { id: 6, title: "Head Chef", sector: "Hospitality", location: "Edinburgh, UK", postedAgo: "2 days ago", applied: 11, interviewing: 2, status: "live" },
  { id: 7, title: "Data Analyst", sector: "Tech & Data", location: "Remote", postedAgo: "6 days ago", applied: 53, interviewing: 9, status: "live" },
  { id: 8, title: "Hotel Events Manager", sector: "Hospitality", location: "Cardiff, UK", postedAgo: "1 day ago", applied: 7, interviewing: 1, status: "live" },
  { id: 9, title: "Care Home Manager", sector: "Healthcare", location: "Bristol, UK", postedAgo: "7 days ago", applied: 29, interviewing: 5, status: "live" },
  { id: 10, title: "CX Specialist", sector: "Customer Care", location: "Remote", postedAgo: "3 days ago", applied: 44, interviewing: 7, status: "live" },
  { id: 11, title: "Sous Chef", sector: "Hospitality", location: "London, UK", postedAgo: "5 days ago", applied: 22, interviewing: 4, status: "live" },
  { id: 12, title: "Frontend Engineer", sector: "Tech & Data", location: "Remote", postedAgo: "2 days ago", applied: 61, interviewing: 11, status: "live" },
  { id: 13, title: "Night Shift HCA", sector: "Healthcare", location: "Manchester, UK", postedAgo: "10 days ago", applied: 15, interviewing: 0, status: "review" },
  { id: 14, title: "Logistics Coordinator", sector: "Logistics", location: "Leeds, UK", postedAgo: "8 days ago", applied: 38, interviewing: 0, status: "review" },
  { id: 15, title: "Backend Developer", sector: "Tech & Data", location: "Remote", postedAgo: "9 days ago", applied: 72, interviewing: 0, status: "review" },
  { id: 16, title: "Restaurant Manager", sector: "Hospitality", location: "Bristol, UK", postedAgo: "11 days ago", applied: 20, interviewing: 0, status: "review" },
  { id: 17, title: "Contact Centre Agent", sector: "Customer Care", location: "Birmingham, UK", postedAgo: "12 days ago", applied: 55, interviewing: 0, status: "review" },
  { id: 18, title: "Staff Nurse — A&E", sector: "Healthcare", location: "London, UK", postedAgo: "10 days ago", applied: 31, interviewing: 0, status: "review" },
  { id: 19, title: "Warehouse Picker", sector: "Logistics", location: "Cardiff, UK", postedAgo: "8 days ago", applied: 47, interviewing: 0, status: "review" },
  { id: 20, title: "IT Support Engineer", sector: "Tech & Data", location: "Edinburgh, UK", postedAgo: "9 days ago", applied: 26, interviewing: 0, status: "review" },
  { id: 21, title: "F&B Supervisor", sector: "Hospitality", location: "Manchester, UK", postedAgo: "14 days ago", applied: 13, interviewing: 0, status: "review" },
  { id: 22, title: "CX Team Leader", sector: "Customer Care", location: "Remote", postedAgo: "11 days ago", applied: 39, interviewing: 0, status: "review" },
  { id: 23, title: "Care Assistant", sector: "Healthcare", location: "Leeds, UK", postedAgo: "13 days ago", applied: 18, interviewing: 0, status: "review" },
  { id: 24, title: "Route Planner", sector: "Logistics", location: "Bristol, UK", postedAgo: "10 days ago", applied: 9, interviewing: 0, status: "review" },
  { id: 25, title: "Phlebotomist", sector: "Healthcare", location: "London, UK", postedAgo: "30 days ago", applied: 74, interviewing: 0, status: "closed" },
  { id: 26, title: "Senior Data Engineer", sector: "Tech & Data", location: "Remote", postedAgo: "28 days ago", applied: 91, interviewing: 0, status: "closed" },
  { id: 27, title: "Shift Supervisor", sector: "Logistics", location: "Birmingham, UK", postedAgo: "25 days ago", applied: 43, interviewing: 0, status: "closed" },
  { id: 28, title: "Guest Relations Manager", sector: "Hospitality", location: "Edinburgh, UK", postedAgo: "22 days ago", applied: 17, interviewing: 0, status: "closed" },
  { id: 29, title: "CX Analyst", sector: "Customer Care", location: "Remote", postedAgo: "29 days ago", applied: 62, interviewing: 0, status: "closed" },
  { id: 30, title: "Registered Mental Health Nurse", sector: "Healthcare", location: "Cardiff, UK", postedAgo: "31 days ago", applied: 33, interviewing: 0, status: "closed" },
  { id: 31, title: "Delivery Driver Coordinator", sector: "Logistics", location: "Manchester, UK", postedAgo: "27 days ago", applied: 28, interviewing: 0, status: "closed" },
  { id: 32, title: "Cloud Infrastructure Engineer", sector: "Tech & Data", location: "Remote", postedAgo: "24 days ago", applied: 55, interviewing: 0, status: "closed" },
  { id: 33, title: "Bar Manager", sector: "Hospitality", location: "London, UK", postedAgo: "26 days ago", applied: 19, interviewing: 0, status: "closed" },
  { id: 34, title: "Customer Complaints Handler", sector: "Customer Care", location: "Leeds, UK", postedAgo: "30 days ago", applied: 41, interviewing: 0, status: "closed" },
  { id: 35, title: "Domiciliary Carer", sector: "Healthcare", location: "Bristol, UK", postedAgo: "23 days ago", applied: 36, interviewing: 0, status: "closed" },
  { id: 36, title: "Supply Chain Analyst", sector: "Logistics", location: "Birmingham, UK", postedAgo: "28 days ago", applied: 24, interviewing: 0, status: "closed" },
];

const TABS: { key: TabKey; label: string }[] = [
  { key: "live", label: "Live Postings" },
  { key: "review", label: "Under Review" },
  { key: "closed", label: "Closed" },
];

const SECTOR_COLOURS: Record<string, string> = {
  Healthcare: "text-teal-600",
  Logistics: "text-amber-600",
  Hospitality: "text-orange-600",
  "Customer Care": "text-purple-600",
  "Tech & Data": "text-blue-600",
};

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job, onDelete }: { job: Job; onDelete: (id: number) => void }) {
  const sectorColour = SECTOR_COLOURS[job.sector] ?? "text-slate-500";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-6">
      {/* Left: meta + title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${sectorColour}`}>
            {job.sector}
          </span>
          {job.status === "live" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Live
            </span>
          )}
          {job.status === "review" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Under Review
            </span>
          )}
          {job.status === "closed" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
              Closed
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-brand truncate">{job.title}</h3>
        <div className="flex items-center gap-4 mt-1">
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
            Posted {job.postedAgo}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 shrink-0">
        <div className="text-center">
          <p className="text-xl font-black text-brand leading-none">{job.applied}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Applied</p>
        </div>
        {job.status !== "closed" && (
          <div className="text-center">
            <p className="text-xl font-black text-brand-blue leading-none">{job.interviewing}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Interviewing</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {job.status !== "closed" && (
          <Link
            href={`/dashboard/employer/jobs/${job.id}`}
            className="bg-brand-blue text-white text-xs font-semibold rounded-xl px-4 py-2 hover:bg-brand-blue-dark transition-colors"
          >
            View Pipeline
          </Link>
        )}
        <button
          aria-label="Edit job"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-gray-100 hover:text-slate-500 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          aria-label="Delete job"
          onClick={() => onDelete(job.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [loading] = useState(false);
  const [error, setError] = useState(false);
  const [jobs, setJobs] = useState(JOBS);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const { toast } = useToast();

  function handleDelete(id: number) { setConfirmId(id); }
  function confirmDelete() {
    setJobs((prev) => prev.filter((j) => j.id !== confirmId));
    setConfirmId(null);
    toast("Job removed successfully", "success");
  }

  const counts = {
    live: jobs.filter((j) => j.status === "live").length,
    review: jobs.filter((j) => j.status === "review").length,
    closed: jobs.filter((j) => j.status === "closed").length,
  };

  const visible = jobs.filter((j) => j.status === activeTab);
  const isConfirmOpen = confirmId !== null;

  return (
    <>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-brand tracking-tight">Job Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and monitor your active career opportunities.</p>
          </div>
          <Link href="/dashboard/employer/jobs/new" className="flex items-center gap-2 bg-brand-blue text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-brand-blue-dark transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex items-center gap-1 border-b border-gray-100 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-400 hover:text-brand"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                activeTab === tab.key
                  ? "bg-brand-blue text-white"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-3">
          {loading ? (
            <EmployerJobCardSkeleton count={5} />
          ) : error ? (
            <ErrorState message="Unable to load job postings." onRetry={() => setError(false)} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              }
              title="No jobs in this category"
              description="Post a new job to start attracting candidates."
              action={{ label: "Post New Job", href: "/dashboard/employer/jobs/new" }}
            />
          ) : (
            visible.map((job) => (
              <JobCard key={job.id} job={job} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Remove this job?"
        description="This job posting will be permanently removed and candidates will no longer be able to apply."
        confirmLabel="Remove Job"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
