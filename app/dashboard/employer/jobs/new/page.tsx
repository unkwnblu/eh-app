"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTORS = ["Healthcare", "Hospitality", "Customer Care", "Tech & Data", "Logistics"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];
const CERTIFICATIONS = ["Enhanced DBS Check", "Right to Work in UK", "GMC Registration", "NMC Pin", "Manual Handling"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior"];

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
    <>
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
    </>
  );
}
