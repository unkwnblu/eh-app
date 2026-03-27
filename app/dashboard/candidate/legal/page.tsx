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

// ─── Data ──────────────────────────────────────────────────────────────────────

const COMPLIANCE_DOCS: Doc[] = [
  {
    id: 1,
    title: "Enhanced DBS Certificate",
    description: "Your verified Disclosure and Barring Service certificate on file with EdgeHarbour.",
    status: "current",
    lastUpdated: "Jan 2026",
  },
  {
    id: 2,
    title: "Right to Work Confirmation",
    description: "Proof of your eligibility to work in the UK as verified during registration.",
    status: "current",
    lastUpdated: "Dec 2025",
  },
  {
    id: 3,
    title: "Mandatory Training Record",
    description: "Record of completed training certifications required for your primary sector.",
    status: "review",
    lastUpdated: "Nov 2025",
  },
  {
    id: 4,
    title: "Vaccination Status Declaration",
    description: "Your self-declared vaccination status as required for healthcare roles.",
    status: "action",
    lastUpdated: "Oct 2025",
  },
];

const CONTRACT_DOCS: Doc[] = [
  {
    id: 1,
    title: "Candidate Registration Agreement",
    description: "The agreement you accepted upon registering as a candidate on EdgeHarbour.",
    status: "current",
    lastUpdated: "Mar 2026",
  },
  {
    id: 2,
    title: "Temporary Worker Terms",
    description: "Standard terms governing your engagement on temporary and ad-hoc shift roles.",
    status: "current",
    lastUpdated: "Jan 2026",
  },
  {
    id: 3,
    title: "Assignment Confirmation — Heritage Care",
    description: "Signed assignment confirmation for your current placement at Heritage Care Homes.",
    status: "review",
    lastUpdated: "Dec 2025",
  },
];

const POLICY_DOCS: Doc[] = [
  {
    id: 1,
    title: "Candidate Privacy Notice",
    description: "How EdgeHarbour collects, stores, and uses your personal data.",
    status: "current",
    lastUpdated: "Feb 2026",
  },
  {
    id: 2,
    title: "Equal Opportunities Policy",
    description: "Our commitment to fair, non-discriminatory treatment of all candidates.",
    status: "current",
    lastUpdated: "Jan 2026",
  },
  {
    id: 3,
    title: "Safeguarding Policy",
    description: "Responsibilities for safeguarding vulnerable individuals in your placements.",
    status: "current",
    lastUpdated: "Feb 2026",
  },
  {
    id: 4,
    title: "Grievance & Whistleblowing Policy",
    description: "How to raise a concern or complaint about your placement or conduct.",
    status: "current",
    lastUpdated: "Nov 2025",
  },
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
  const statusConfig = {
    current: {
      dot: "bg-green-500",
      badge: "bg-green-50 text-green-600",
      label: "Current",
    },
    review: {
      dot: "bg-amber-400",
      badge: "bg-amber-50 text-amber-600",
      label: "Under Review",
    },
    action: {
      dot: "bg-red-500",
      badge: "bg-red-50 text-red-500",
      label: "Action Required",
    },
  }[doc.status];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-bold text-brand">{doc.title}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusConfig.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-snug">{doc.description}</p>
        <p className="text-[10px] text-slate-300 mt-2">Last updated: {doc.lastUpdated}</p>
      </div>

      {/* Actions */}
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

  const docs = DOCS_BY_TAB[tab];
  const currentCount = docs.filter((d) => d.status === "current").length;
  const reviewCount = docs.filter((d) => d.status === "review").length;
  const actionCount = docs.filter((d) => d.status === "action").length;

  const allCurrent = ALL_DOCS.filter((d) => d.status === "current").length;
  const allReview = ALL_DOCS.filter((d) => d.status === "review").length;
  const allAction = ALL_DOCS.filter((d) => d.status === "action").length;

  return (
    <main className="flex-1 px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Legal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Your compliance records, contracts, and the policies that govern your placements.
          </p>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white hover:shadow-sm transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download All
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4" data-gsap="fade-up">
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Documents</p>
            <p className="text-2xl font-black text-brand">{ALL_DOCS.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Up to Date</p>
            <p className="text-2xl font-black text-green-600">{allCurrent}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Under Review</p>
            <p className="text-2xl font-black text-amber-500">{allReview}</p>
          </div>
        </div>

        <div className="bg-white border border-red-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Action Required</p>
            <p className="text-2xl font-black text-red-500">{allAction}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab meta */}
      <div className="flex items-center gap-3" data-gsap="fade-up">
        <span className="text-xs text-slate-400">{docs.length} documents</span>
        <span className="text-slate-200">·</span>
        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{currentCount} current
        </span>
        {reviewCount > 0 && (
          <>
            <span className="text-slate-200">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{reviewCount} under review
            </span>
          </>
        )}
        {actionCount > 0 && (
          <>
            <span className="text-slate-200">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{actionCount} action required
            </span>
          </>
        )}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-gsap="fade-up">
        {docs.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>

    </main>
  );
}
