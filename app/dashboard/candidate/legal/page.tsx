"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocTab = "compliance" | "contracts" | "policies";
type DocStatus = "current" | "review" | "action";

type Doc = {
  id: number;
  title: string;
  description: string;
  status: DocStatus;
  lastUpdated: string;
};

// ─── Document data ──────────────────────────────────────────────────────────────

const COMPLIANCE_DOCS: Doc[] = [
  { id: 1, title: "Enhanced DBS Certificate", description: "Your verified Disclosure and Barring Service certificate on file.", status: "current", lastUpdated: "Jan 2026" },
  { id: 2, title: "Right to Work Confirmation", description: "Proof of your eligibility to work in the UK as verified during registration.", status: "current", lastUpdated: "Dec 2025" },
  { id: 3, title: "Mandatory Training Record", description: "Record of completed training certifications for your primary sector.", status: "review", lastUpdated: "Nov 2025" },
  { id: 4, title: "Vaccination Status Declaration", description: "Your self-declared vaccination status as required for healthcare roles.", status: "action", lastUpdated: "Oct 2025" },
];

const CONTRACT_DOCS: Doc[] = [
  { id: 1, title: "Candidate Registration Agreement", description: "The agreement you accepted upon registering as a candidate on EdgeHarbour.", status: "current", lastUpdated: "Mar 2026" },
  { id: 2, title: "Temporary Worker Terms", description: "Standard terms governing your engagement on temporary and ad-hoc shift roles.", status: "current", lastUpdated: "Jan 2026" },
  { id: 3, title: "Assignment Confirmation — Heritage Care", description: "Signed assignment confirmation for your current placement at Heritage Care Homes.", status: "review", lastUpdated: "Dec 2025" },
];

const POLICY_DOCS: Doc[] = [
  { id: 1, title: "Candidate Privacy Notice", description: "How EdgeHarbour collects, stores, and uses your personal data.", status: "current", lastUpdated: "Feb 2026" },
  { id: 2, title: "Equal Opportunities Policy", description: "Our commitment to fair, non-discriminatory treatment of all candidates.", status: "current", lastUpdated: "Jan 2026" },
  { id: 3, title: "Safeguarding Policy", description: "Responsibilities for safeguarding vulnerable individuals in your placements.", status: "current", lastUpdated: "Feb 2026" },
  { id: 4, title: "Grievance & Whistleblowing Policy", description: "How to raise a concern or complaint about your placement or conduct.", status: "current", lastUpdated: "Nov 2025" },
];

const TABS: { key: DocTab; label: string }[] = [
  { key: "compliance", label: "My Compliance" },
  { key: "contracts", label: "Contracts & Agreements" },
  { key: "policies", label: "Policies" },
];

const DOCS_BY_TAB: Record<DocTab, Doc[]> = {
  compliance: COMPLIANCE_DOCS,
  contracts: CONTRACT_DOCS,
  policies: POLICY_DOCS,
};

const ALL_DOCS = [...COMPLIANCE_DOCS, ...CONTRACT_DOCS, ...POLICY_DOCS];

// ─── Document card ─────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: Doc }) {
  const cfg = {
    current: { dot: "bg-green-500", badge: "bg-green-50 text-green-600", label: "Current" },
    review:  { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600", label: "Under Review" },
    action:  { dot: "bg-red-500",   badge: "bg-red-50 text-red-500",     label: "Action Required" },
  }[doc.status];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow group">
      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-bold text-brand">{doc.title}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-snug">{doc.description}</p>
        <p className="text-[10px] text-slate-300 mt-2">Last updated: {doc.lastUpdated}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-brand-blue transition-colors" title="View">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-brand-blue transition-colors" title="Download">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateLegalPage() {
  const [tab, setTab] = useState<DocTab>("compliance");
  const [visaExpiry, setVisaExpiry] = useState("11/20/2028");

  const docs = DOCS_BY_TAB[tab];
  const currentCount = docs.filter((d) => d.status === "current").length;
  const reviewCount  = docs.filter((d) => d.status === "review").length;
  const actionCount  = docs.filter((d) => d.status === "action").length;

  const allCurrent = ALL_DOCS.filter((d) => d.status === "current").length;
  const allReview  = ALL_DOCS.filter((d) => d.status === "review").length;
  const allAction  = ALL_DOCS.filter((d) => d.status === "action").length;

  return (
    <main className="flex-1 px-8 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Compliance &amp; Legal</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your right-to-work documentation and sector-specific certifications.</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white hover:shadow-sm transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download All
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4" data-gsap="fade-up">
        {[
          { label: "Total Documents", value: ALL_DOCS.length, colour: "bg-brand-blue/10 text-brand-blue", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />, valColour: "text-brand" },
          { label: "Up to Date",       value: allCurrent,      colour: "bg-green-50 text-green-500",    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, valColour: "text-green-600" },
          { label: "Under Review",     value: allReview,       colour: "bg-amber-50 text-amber-500",    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />, valColour: "text-amber-500" },
          { label: "Action Required",  value: allAction,       colour: "bg-red-50 text-red-500",        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />, valColour: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-white border ${s.label === "Action Required" ? "border-red-100" : "border-gray-100"} rounded-2xl px-6 py-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.colour}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">{s.icon}</svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className={`text-2xl font-black ${s.valColour}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Compliance sections ── */}
      <div className="grid grid-cols-2 gap-5" data-gsap="fade-up">

        {/* Right to Work */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Right to Work</h2>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] font-bold text-green-600">Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Upload zone */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Passport or BRP/Visa Document</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-blue/50 hover:bg-blue-50/30 transition-colors cursor-pointer text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-xs font-medium text-slate-500">Click to upload or drag and drop</p>
                <p className="text-[10px] text-slate-400">PDF, PNG or JPG (max. 10MB)</p>
              </div>
            </div>

            {/* Current document + expiry */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Current Document</p>
                <div className="flex items-center gap-2 bg-[#F7F8FA] rounded-xl px-3 py-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand truncate">British_Passport_J_Wilso...</p>
                    <p className="text-[10px] text-slate-400">Uploaded 12 Oct 2023</p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Visa Expiry Date</p>
                <input
                  type="text"
                  value={visaExpiry}
                  onChange={(e) => setVisaExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  Document expires in 4 years
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Checks */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <h2 className="text-sm font-bold text-brand">Background Checks</h2>
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-bold text-brand">Enhanced DBS</p>
              <p className="text-xs text-slate-400 mt-0.5">Disclosure and Barring Service</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wide shrink-0">
              Under Review
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-xs font-bold text-amber-700">Awaiting Verification</p>
            </div>
            <p className="text-xs text-amber-700/80 leading-relaxed">
              Your Enhanced DBS certificate was submitted on Oct 24th. Our compliance team is currently validating the certificate number with the Update Service.
            </p>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Update Document
          </button>
        </div>

        {/* Sector Certifications */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            <h2 className="text-sm font-bold text-brand">Sector Certifications</h2>
          </div>

          <div className="space-y-3">
            {/* Mandatory Training */}
            <div className="flex items-center gap-3 bg-[#F7F8FA] rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand">Mandatory Training</p>
                <p className="text-xs text-slate-400">Expiry: 15 Mar 2025</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="px-3 py-1.5 border border-gray-200 text-xs font-semibold text-slate-500 rounded-lg hover:bg-gray-50 transition-colors">View</button>
                <button className="px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors">Renew</button>
              </div>
            </div>

            {/* First Aid — expired */}
            <div className="flex items-center gap-3 bg-[#F7F8FA] rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand">First Aid Certificate</p>
                <p className="text-xs text-red-500 font-medium">Expired: 01 Jan 2024</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Upload New
              </button>
            </div>
          </div>
        </div>

        {/* Professional References */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Professional References</h2>
            </div>
            <button className="text-xs font-bold text-brand-blue hover:underline">Add New</button>
          </div>

          <div className="space-y-3">
            {/* Reference 1 — awaiting */}
            <div className="bg-[#F7F8FA] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-brand">Sarah Jenkins</p>
                  <p className="text-xs text-slate-400">Lead Nurse, NHS Trust</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-brand-blue text-[10px] font-bold rounded-lg uppercase tracking-wide shrink-0">
                  Awaiting Response
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-brand-blue rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-[10px] text-slate-400">Last chased: 2 days ago</p>
            </div>

            {/* Reference 2 — completed */}
            <div className="bg-[#F7F8FA] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-brand">Dr. Robert Chen</p>
                  <p className="text-xs text-slate-400">Clinical Director, St. Marys</p>
                </div>
                <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase tracking-wide shrink-0">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] text-green-600 font-medium">Reference received on 18 Oct 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Document library tabs ── */}
      <div className="flex items-center border-b border-gray-200" data-gsap="fade-down">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-1 pb-3 mr-6 text-sm font-semibold border-b-2 transition-all -mb-px ${
              tab === t.key
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3" data-gsap="fade-up">
        <span className="text-xs text-slate-400">{docs.length} documents</span>
        <span className="text-slate-200">·</span>
        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{currentCount} current
        </span>
        {reviewCount > 0 && (
          <><span className="text-slate-200">·</span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{reviewCount} under review
          </span></>
        )}
        {actionCount > 0 && (
          <><span className="text-slate-200">·</span>
          <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{actionCount} action required
          </span></>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-gsap="fade-up">
        {docs.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>

      {/* ── Compliance score banner ── */}
      <div className="bg-brand-blue rounded-2xl px-8 py-5 flex items-center justify-between" data-gsap="fade-up">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-black text-white">Compliance Score: 85%</p>
            <p className="text-sm text-white/70 mt-0.5">Almost ready for placement! Only 1 document remains.</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white text-brand-blue text-sm font-bold rounded-xl hover:bg-white/90 transition-colors shrink-0">
          Submit Final Review
        </button>
      </div>

    </main>
  );
}
