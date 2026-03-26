"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard/employer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Job Management",
    href: "/dashboard/employer/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "Shift Management",
    href: "/dashboard/employer/shifts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Messaging",
    href: "/dashboard/employer/messages",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    label: "Legal",
    href: "/dashboard/employer/legal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/employer/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

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

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen flex flex-col bg-white border-r border-gray-100 z-40">
      <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
          <span className="text-brand font-bold text-base tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-500 hover:bg-gray-50 hover:text-brand"
              }`}
            >
              <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-0.5 border-t border-gray-100 pt-4">
        <Link
          href="/dashboard/employer/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-gray-50 hover:text-brand transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Support
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          LogOut
        </button>
      </div>
    </aside>
  );
}

// ─── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
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
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-gray-100 hover:text-slate-500 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors">
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

  const counts = {
    live: JOBS.filter((j) => j.status === "live").length,
    review: JOBS.filter((j) => j.status === "review").length,
    closed: JOBS.filter((j) => j.status === "closed").length,
  };

  const visible = JOBS.filter((j) => j.status === activeTab);

  return (
    <div className="flex-1 bg-[#F7F8FA]">
      <Sidebar active="Job Management" />

      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="flex-1 relative">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search candidates, jobs, or shifts..."
              className="w-full bg-[#F7F8FA] border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
            />
          </div>
          <button className="relative w-10 h-10 rounded-xl border border-gray-100 bg-[#F7F8FA] flex items-center justify-center text-slate-400 hover:text-brand transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-brand leading-none">John Doe</p>
              <p className="text-xs text-slate-400 mt-0.5">Company Name</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
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
          <div className="flex items-center gap-1 border-b border-gray-100 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
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
            {visible.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
