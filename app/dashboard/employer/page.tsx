"use client";

import Link from "next/link";
import Image from "next/image";

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

const APPLICATIONS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    applied: "Applied 2h ago",
    role: "Senior Staff Nurse",
    initials: "SJ",
    color: "bg-rose-100 text-rose-600",
    badges: [
      { label: "RTW VERIFIED", color: "bg-green-50 text-green-700 border-green-200" },
      { label: "DBS PENDING", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "clock" },
    ],
  },
  {
    id: 2,
    name: "Marcus Wright",
    applied: "Applied 5h ago",
    role: "Warehouse Manager",
    initials: "MW",
    color: "bg-blue-100 text-blue-600",
    badges: [
      { label: "RTW EXPIRED", color: "bg-red-50 text-red-700 border-red-200", icon: "warning" },
    ],
  },
  {
    id: 3,
    name: "David Park",
    applied: "Applied Yesterday",
    role: "Logistics Coordinator",
    initials: "DP",
    color: "bg-slate-100 text-slate-600",
    badges: [
      { label: "RTW VERIFIED", color: "bg-green-50 text-green-700 border-green-200" },
      { label: "DBS CLEAR", color: "bg-green-50 text-green-700 border-green-200" },
    ],
  },
];

const ACTIVE_JOBS = [
  {
    id: 1,
    title: "ICU Specialist Nurse",
    company: "Harbour Hospital",
    location: "London",
    daysLeft: 6,
    applicants: 42,
    progress: 72,
  },
  {
    id: 2,
    title: "Fleet Dispatcher",
    company: "Edge Logistics",
    location: "Manchester",
    daysLeft: 2,
    applicants: 128,
    progress: 88,
    urgent: true,
  },
  {
    id: 3,
    title: "Warehouse Supervisor",
    company: "Harbour Central",
    location: "Birmingham",
    daysLeft: 14,
    applicants: 8,
    progress: 22,
  },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen flex flex-col bg-white border-r border-gray-100 z-40">
      {/* Logo */}
      <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
          <span className="text-brand font-bold text-base tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
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

      {/* Bottom */}
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

// ─── Badge icon helpers ────────────────────────────────────────────────────────

function BadgeIcon({ type }: { type?: string }) {
  if (type === "clock") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {

  return (
    <div className="flex-1 bg-[#F7F8FA]">
      <Sidebar active="Dashboard" />

      {/* Main content — offset by sidebar width */}
      <div className="ml-[260px] flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center px-6 gap-4">
          {/* Search */}
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

          {/* Notification bell */}
          <button className="relative w-10 h-10 rounded-xl border border-gray-100 bg-[#F7F8FA] flex items-center justify-center text-slate-400 hover:text-brand transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          {/* User */}
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

          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-[22px] font-bold text-brand tracking-tight">Employer Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">
                Welcome back. Here&apos;s what&apos;s happening in your recruitment pipeline today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand hover:border-brand-blue hover:text-brand-blue transition-colors bg-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Review Compliance
              </button>
              <Link href="/dashboard/employer/jobs/new" className="flex items-center gap-2 bg-brand-blue text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-brand-blue-dark transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Post New Job
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {/* Active Postings */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 rounded-full px-2.5 py-1">
                  +2 this week
                </span>
              </div>
              <p className="text-3xl font-black text-brand">24</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Active Postings</p>
            </div>

            {/* Time to Hire */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
                  -4 days avg.
                </span>
              </div>
              <p className="text-3xl font-black text-brand">18d</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Time to Hire</p>
            </div>

            {/* Offer Acceptance Rate */}
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Offer Acceptance Rate</p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <p className="text-3xl font-black text-brand">92.4%</p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-blue rounded-full" style={{ width: "92.4%" }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Higher than industry average (84%)</p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-[1fr_360px] gap-5">

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-base font-bold text-brand">Recent Applications</h2>
                <Link href="/dashboard/employer/applications" className="text-xs font-semibold text-brand-blue hover:underline">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-6 py-3">Candidate</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Role</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Compliance</th>
                      <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-300 px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {APPLICATIONS.map((app) => (
                      <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        {/* Candidate */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${app.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {app.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-brand">{app.name}</p>
                              <p className="text-[11px] text-slate-400">{app.applied}</p>
                            </div>
                          </div>
                        </td>
                        {/* Role */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">{app.role}</p>
                        </td>
                        {/* Compliance badges */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {app.badges.map((badge) => (
                              <span
                                key={badge.label}
                                className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[10px] font-bold w-fit ${badge.color}`}
                              >
                                <BadgeIcon type={badge.icon} />
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Action */}
                        <td className="px-4 py-4">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-gray-100 hover:text-slate-500 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 6a2 2 0 110-4 2 2 0 010 4zM12 14a2 2 0 110-4 2 2 0 010 4zM12 22a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="text-base font-bold text-brand">Active Jobs</h2>
                <Link href="/dashboard/employer/jobs" className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:underline">
                  Manage
                </Link>
              </div>
              <div className="px-5 py-4 space-y-5">
                {ACTIVE_JOBS.map((job) => (
                  <div key={job.id}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-semibold text-brand truncate">{job.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {job.company} &bull; {job.location}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 shrink-0 ${
                        job.urgent
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}>
                        {job.daysLeft}d left
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-blue"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 text-right">{job.applicants} applicants</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
