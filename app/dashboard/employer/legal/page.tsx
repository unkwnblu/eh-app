"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AccountStatus = "pending" | "active" | "resubmission" | "suspended";
type DocTab = "compliance" | "contracts" | "policies";

type HealthcareComplianceStatus = "not_submitted" | "pending" | "verified" | "rejected";
type ComplianceItem = {
  key: string;
  label: string;
  value: string;
  verificationStatus?: HealthcareComplianceStatus;
};

// ─── Static document data ──────────────────────────────────────────────────────

const COMPLIANCE_DOCS = [
  { id: 1, title: "DBS Check Policy",            description: "Requirements and renewal schedule for enhanced DBS certificates.",                   status: "current" as const, lastUpdated: "Jan 2026" },
  { id: 2, title: "Right to Work Verification",  description: "Procedures for verifying candidate eligibility to work in the UK.",                  status: "current" as const, lastUpdated: "Dec 2025" },
  { id: 3, title: "Manual Handling Training",    description: "Mandatory training requirements for healthcare and logistics roles.",                 status: "review"  as const, lastUpdated: "Nov 2025" },
  { id: 4, title: "GDPR Data Processing",        description: "How candidate and employer data is collected, stored, and processed.",               status: "current" as const, lastUpdated: "Feb 2026" },
];

const CONTRACT_DOCS = [
  { id: 1, title: "Employer Service Agreement",   description: "The master service agreement governing your use of EdgeHarbour.",                   status: "current" as const, lastUpdated: "Mar 2026" },
  { id: 2, title: "Candidate Assignment Terms",   description: "Terms governing the placement of candidates on shift and contract roles.",          status: "current" as const, lastUpdated: "Jan 2026" },
  { id: 3, title: "Temporary Worker Agreement",   description: "Standard agreement template for temporary and ad-hoc placements.",                  status: "review"  as const, lastUpdated: "Dec 2025" },
];

const POLICY_DOCS = [
  { id: 1, title: "Equal Opportunities Policy",  description: "Our commitment to fair, non-discriminatory hiring practices.",                       status: "current" as const, lastUpdated: "Jan 2026" },
  { id: 2, title: "Safeguarding Policy",         description: "Responsibilities and procedures for safeguarding vulnerable individuals.",           status: "current" as const, lastUpdated: "Feb 2026" },
  { id: 3, title: "Whistleblowing Policy",       description: "How to raise concerns about misconduct or legal violations confidentially.",         status: "current" as const, lastUpdated: "Nov 2025" },
  { id: 4, title: "Anti-Bribery & Corruption",   description: "Standards and controls to prevent bribery in recruitment activities.",              status: "review"  as const, lastUpdated: "Oct 2025" },
];

const ALL_DOCS = [...COMPLIANCE_DOCS, ...CONTRACT_DOCS, ...POLICY_DOCS];
const TABS: { key: DocTab; label: string }[] = [
  { key: "compliance", label: "Compliance Documents" },
  { key: "contracts",  label: "Contracts & Agreements" },
  { key: "policies",   label: "Policies" },
];
const DOCS_BY_TAB: Record<DocTab, typeof COMPLIANCE_DOCS> = {
  compliance: COMPLIANCE_DOCS,
  contracts:  CONTRACT_DOCS,
  policies:   POLICY_DOCS,
};

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AccountStatus, { label: string; style: string; dot: string }> = {
  active:       { label: "Verified",         style: "bg-green-50 text-green-700 border-green-100",    dot: "bg-green-500"  },
  pending:      { label: "Pending Review",   style: "bg-blue-50 text-brand-blue border-blue-100",     dot: "bg-brand-blue" },
  resubmission: { label: "Action Required",  style: "bg-amber-50 text-amber-700 border-amber-100",    dot: "bg-amber-400"  },
  suspended:    { label: "Suspended",        style: "bg-red-50 text-red-600 border-red-100",          dot: "bg-red-500"    },
};

// ─── Document card ─────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: typeof COMPLIANCE_DOCS[number] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow group">
      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-brand truncate">{doc.title}</h3>
          {doc.status === "current" ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Current
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Under Review
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-snug">{doc.description}</p>
        <p className="text-[10px] text-slate-300 mt-2">Last updated: {doc.lastUpdated}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button aria-label="View document" title="View" className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-brand-blue transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button aria-label="Download document" title="Download" className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-brand-blue transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LegalPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<DocTab>("compliance");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AccountStatus>("active");
  const [resubmissionNote, setResubmissionNote] = useState<string | null>(null);
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [healthcareStatus, setHealthcareStatus] = useState<HealthcareComplianceStatus>("not_submitted");

  const load = useCallback(async () => {
    try {
      const res  = await fetch("/api/employer/legal");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(data.status);
      setResubmissionNote(data.resubmissionNote);
      setItems(data.items);
      setHealthcareStatus(data.healthcareStatus ?? "not_submitted");
    } catch {
      toast("Failed to load compliance data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const docs         = DOCS_BY_TAB[tab];
  const currentCount = docs.filter((d) => d.status === "current").length;
  const reviewCount  = docs.filter((d) => d.status === "review").length;
  const statusCfg    = STATUS_CONFIG[status];

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4" data-gsap="fade-down">
        <div className="flex-1">
          <h1 className="text-[28px] font-black text-brand tracking-tight">Legal &amp; Compliance</h1>
          <p className="text-sm text-slate-400 mt-1">
            Compliance documents, contracts, and policies governing your recruitment activity.
          </p>
        </div>
        <button
          aria-label="Download all documents"
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-white hover:shadow-sm transition-all self-start"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download All
        </button>
      </div>

      {/* Resubmission banner */}
      {!loading && status === "resubmission" && resubmissionNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4" data-gsap="fade-down">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 mb-1">Additional Information Required</p>
            <p className="text-sm text-amber-700 leading-relaxed">{resubmissionNote}</p>
            <p className="text-xs text-amber-600 mt-2">
              Please contact <a href="mailto:support@edgeharbour.co.uk" className="font-semibold underline">support@edgeharbour.co.uk</a> to provide the requested information.
            </p>
          </div>
        </div>
      )}

      {/* Account compliance status + items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand">Account Compliance</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your registration details verified by the Edge Harbour team.</p>
            </div>
          </div>
          {!loading && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusCfg.style}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          )}
        </div>

        {/* Healthcare verification banner — shown only when relevant */}
        {!loading && healthcareStatus === "pending" && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-amber-800">Healthcare compliance pending verification</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Your CQC Provider ID and DBS level have been submitted and are under review by the Edge Harbour team. You&apos;ll be notified once approved.
              </p>
            </div>
          </div>
        )}
        {!loading && healthcareStatus === "rejected" && (
          <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-red-700">Healthcare compliance rejected</p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                Your submission was not accepted. Please go to <a href="/dashboard/employer/settings" className="font-bold underline">Settings → Industries</a> to update your CQC Provider ID or DBS level.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="pt-5 border-t border-gray-100">
            <p className="text-xs text-slate-400 text-center py-4">No compliance items on record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            {items.map((item) => {
              const vs = item.verificationStatus;
              return (
                <div key={item.key} className={`border rounded-xl p-3.5 ${
                  vs === "verified"  ? "bg-green-50 border-green-100" :
                  vs === "pending"   ? "bg-amber-50 border-amber-100" :
                  vs === "rejected"  ? "bg-red-50 border-red-100"     :
                  "bg-[#F7F8FA] border-gray-100"
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    {vs === "verified" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-green-500" />Verified
                      </span>
                    )}
                    {vs === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />Pending
                      </span>
                    )}
                    {vs === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-red-500" />Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand font-mono">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-gsap="fade-up">
        {[
          {
            label: "Total Documents", value: ALL_DOCS.length,
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />,
            iconBg: "bg-brand-blue/10", iconColor: "text-brand-blue", valueColor: "text-brand",
          },
          {
            label: "Up to Date", value: ALL_DOCS.filter((d) => d.status === "current").length,
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
            iconBg: "bg-green-50", iconColor: "text-green-500", valueColor: "text-green-600",
          },
          {
            label: "Under Review", value: ALL_DOCS.filter((d) => d.status === "review").length,
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
            iconBg: "bg-amber-50", iconColor: "text-amber-500", valueColor: "text-amber-500",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={s.iconColor}>
                {s.icon}
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className={`text-2xl font-black ${s.valueColor}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200" role="tablist" data-gsap="fade-down">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
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
