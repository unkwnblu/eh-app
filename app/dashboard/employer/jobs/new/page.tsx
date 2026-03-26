"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTORS = ["Healthcare", "Hospitality", "Customer Care", "Tech & Data", "Logistics"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];
const CERTIFICATIONS = ["Enhanced DBS Check", "Right to Work in UK", "GMC Registration", "NMC Pin", "Manual Handling"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior"];

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/employer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
  { label: "Job Management", href: "/dashboard/employer/jobs", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
  { label: "Shift Management", href: "/dashboard/employer/shifts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "Messaging", href: "/dashboard/employer/messages", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> },
  { label: "Legal", href: "/dashboard/employer/legal", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg> },
  { label: "Settings", href: "/dashboard/employer/settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen flex flex-col bg-white border-r border-gray-100 z-40">
      <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
          <span className="text-brand font-bold text-base tracking-tight leading-none">Edge<span className="text-brand-blue">Harbour</span></span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-brand-blue text-white shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-brand"}`}>
              <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-5 space-y-0.5 border-t border-gray-100 pt-4">
        <Link href="/dashboard/employer/support" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-gray-50 hover:text-brand transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
          Support
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          LogOut
        </button>
      </div>
    </aside>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [sector, setSector] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("Mid-level");
  const [savedTime, setSavedTime] = useState("");

  // Auto-save timestamp simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSavedTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
    }, 30000);
    setSavedTime(`${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`);
    return () => clearInterval(interval);
  }, []);

  function toggleCert(cert: string) {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  }

  return (
    <div className="flex-1 bg-[#F7F8FA]">
      <Sidebar active="Job Management" />

      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search candidates, jobs, or shifts..." className="w-full bg-[#F7F8FA] border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:bg-white transition-colors" />
          </div>
          <button className="w-10 h-10 rounded-xl border border-gray-100 bg-[#F7F8FA] flex items-center justify-center text-slate-400 hover:text-brand transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          </button>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-semibold text-brand leading-none">John Doe</p>
              <p className="text-xs text-slate-400 mt-0.5">Company Name</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 px-8 py-8 pb-28">
          <h1 className="text-2xl font-black text-brand tracking-tight mb-6">Create New Job</h1>

          <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
            {/* Left column */}
            <div className="space-y-5">

              {/* Basic Information */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-brand">Basic Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Support Worker"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Sector / Industry</label>
                      <div className="relative">
                        <select value={sector} onChange={(e) => setSector(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none bg-white">
                          <option value="" disabled>Select Industry</option>
                          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Employment Type</label>
                      <div className="relative">
                        <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none bg-white">
                          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Location</label>
                    <div className="relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Search address or city in UK..."
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Drag-to-expand hint */}
                <div className="flex justify-center mt-6 pt-4 border-t border-gray-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue/40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </div>
              </div>

              {/* Role & Remuneration */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-brand">Role & Remuneration</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left: salary + tips */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Salary Range (Annual)</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
                          <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min" className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors" />
                        </div>
                        <span className="text-slate-300 font-bold shrink-0">—</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
                          <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max" className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors" />
                        </div>
                      </div>
                      {sector === "Healthcare" && (
                        <p className="text-[10px] text-slate-400 mt-1.5">Average for UK Healthcare: £32k – £45k</p>
                      )}
                    </div>

                    {/* Quick tips */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-3">Quick Tips</p>
                      <ul className="space-y-2">
                        {[
                          "Be specific about shift patterns for healthcare roles.",
                          "Highlight perks like the 'NHS Pension' if applicable.",
                        ].map((tip) => (
                          <li key={tip} className="flex items-start gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <span className="text-[11px] text-brand-blue leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: description + responsibilities */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Job Description</label>
                      {/* Mini toolbar */}
                      <div className="flex items-center gap-1 border border-gray-200 rounded-t-xl px-3 py-2 border-b-0 bg-gray-50">
                        {["B", "I"].map((f) => (
                          <button key={f} type="button" className={`w-6 h-6 rounded text-xs font-${f === "B" ? "black" : "normal"} ${f === "I" ? "italic" : ""} text-slate-500 hover:bg-gray-200 transition-colors flex items-center justify-center`}>{f}</button>
                        ))}
                        <button type="button" className="w-6 h-6 rounded text-slate-500 hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        </button>
                        <button type="button" className="ml-auto w-6 h-6 rounded text-slate-400 hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        </button>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the day-to-day life in this role..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-b-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Key Responsibilities</label>
                      <textarea
                        value={responsibilities}
                        onChange={(e) => setResponsibilities(e.target.value)}
                        placeholder="List the 3-5 most critical duties..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Compliance (dark) */}
            <div className="bg-[#0F1C2E] rounded-2xl p-5 text-white sticky top-24">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold">Compliance</h2>
              </div>

              {/* Required Certifications */}
              <div className="mb-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">Required Certifications</p>
                <div className="space-y-2">
                  {CERTIFICATIONS.map((cert) => {
                    const checked = selectedCerts.includes(cert);
                    return (
                      <label key={cert} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => toggleCert(cert)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${checked ? "bg-brand-blue border-brand-blue" : "border-white/20 hover:border-white/40"}`}
                        >
                          {checked && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          )}
                        </div>
                        <span className="text-xs text-white/70 group-hover:text-white transition-colors">{cert}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/10 pt-5 mb-6">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">Experience Level</p>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const active = experienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-brand-blue text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}
                      >
                        {level}
                        {active && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-white/30 leading-relaxed">
                All certifications will be verified via the Edge Harbour compliance engine before shortlist release.
              </p>
            </div>
          </div>
        </main>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-[260px] right-0 z-30 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
            {savedTime ? `Draft automatically saved at ${savedTime}` : "Saving…"}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/employer/jobs" className="border border-gray-200 text-brand text-sm font-semibold rounded-xl px-5 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors">
              Cancel & Discard
            </Link>
            <button className="flex items-center gap-2 bg-brand text-white text-sm font-semibold rounded-xl px-6 py-2.5 hover:bg-brand-blue transition-colors">
              Post Job Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
