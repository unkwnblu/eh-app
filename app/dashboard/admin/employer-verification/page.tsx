"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardStatus = "pending" | "flagged" | "resubmission" | "verified";

type Item = { key: string; label: string; value: string; verified: boolean };

type Employer = {
  id: string;
  company: string;
  email: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  companyPhone: string;
  companyWebsite: string;
  crn: string;
  registeredAddress: string;
  incorporationDate: string;
  companyStatus: string;
  vatNumber: string;
  industries: string[];
  cqcProviderId: string;
  dbsLevel: string;
  modernSlaveryAct: boolean;
  employerLiabilityInsurance: boolean;
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  joined: string;
  status: CardStatus;
  resubmissionNote: string;
  items: Item[];
};

const INDUSTRIES = ["All Industries", "Healthcare", "Hospitality", "Customer Care", "Tech & Data"];
const STATUSES   = ["All Statuses", "Pending Review", "Flagged", "Re-Submission", "Verified"];

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardStatus, { label: string; style: string; flag?: boolean }> = {
  pending:      { label: "PENDING REVIEW", style: "bg-blue-100 text-brand-blue" },
  flagged:      { label: "FLAGGED",        style: "bg-red-100 text-red-600",    flag: true },
  resubmission: { label: "RE-SUBMISSION",  style: "bg-purple-100 text-purple-600" },
  verified:     { label: "VERIFIED",       style: "bg-green-100 text-green-700" },
};

// ─── Employer card ─────────────────────────────────────────────────────────────

function EmployerCard({
  e, isActive, onReview, onRequestInfo,
}: {
  e: Employer; isActive: boolean; onReview: () => void; onRequestInfo: () => void;
}) {
  const statusCfg = STATUS_CONFIG[e.status];
  const initials  = e.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all ${isActive ? "border-brand-blue shadow-md" : "border-gray-100"}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-black shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand leading-snug">{e.company}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {e.industries.slice(0, 2).map((ind) => (
                <span key={ind} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded-full">{ind}</span>
              ))}
              <span className="text-[11px] text-slate-400">· {e.joined}</span>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCfg.style}`}>
          {statusCfg.flag && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )}
          {statusCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">CRN</p>
          <p className="font-semibold text-brand font-mono">{e.crn}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact</p>
          <p className="font-semibold text-brand truncate">{e.contactName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReview}
          className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-1.5"
        >
          Review &amp; Verify
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <button
          onClick={onRequestInfo}
          className="px-4 py-2.5 border border-amber-300 text-amber-600 text-sm font-semibold rounded-xl hover:bg-amber-50 transition-colors whitespace-nowrap"
        >
          Request Info
        </button>
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  employer, items, onToggleItem, onClose, onApprove, onReject, onRequestInfo, actionLoading,
}: {
  employer: Employer;
  items: Item[];
  onToggleItem: (i: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  actionLoading: boolean;
}) {
  const statusCfg    = STATUS_CONFIG[employer.status];
  const verifiedCount = items.filter((d) => d.verified).length;
  const allVerified   = items.length > 0 && verifiedCount === items.length;
  const initials     = employer.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">

      {/* Company header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Employer Review</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand">{employer.company}</p>
            <p className="text-xs text-slate-400">{employer.industries.join(", ")} · CRN {employer.crn}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCfg.style}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Company info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-gray-100 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Company Status</p>
            <p className="font-semibold text-brand">{employer.companyStatus}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Incorporated</p>
            <p className="font-semibold text-brand">{employer.incorporationDate}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Phone</p>
            <p className="font-semibold text-brand">{employer.companyPhone}</p>
          </div>
          {employer.companyWebsite && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Website</p>
              <a href={employer.companyWebsite.startsWith("http") ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                target="_blank" rel="noopener noreferrer"
                className="font-semibold text-brand-blue hover:underline truncate block">
                {employer.companyWebsite}
              </a>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Registered Address</p>
            <p className="font-semibold text-brand">{employer.registeredAddress}</p>
          </div>
        </div>
      </div>

      {/* Contact person */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-brand mb-3">Contact Person</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Name</p>
            <p className="font-semibold text-brand">{employer.contactName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Title</p>
            <p className="font-semibold text-brand">{employer.contactTitle}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Phone</p>
            <p className="font-semibold text-brand">{employer.contactPhone}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
            <p className="font-semibold text-brand truncate">{employer.email}</p>
          </div>
        </div>
      </div>

      {/* Verifiable items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Registration Details</h3>
          <span className="text-xs text-slate-400">{verifiedCount}/{items.length} verified</span>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No verifiable items submitted.</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, i) => (
              <li key={item.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.verified ? "bg-green-50 border-green-100" : "bg-[#F7F8FA] border-gray-100"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.verified ? "bg-green-100" : "bg-white border border-gray-100"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={item.verified ? "text-green-600" : "text-slate-400"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand font-mono">{item.value}</p>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                </div>
                <button
                  onClick={() => onToggleItem(i)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0 ${
                    item.verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-slate-500 hover:bg-gray-200"
                  }`}
                >
                  {item.verified ? "✓ Verified" : "Mark Verified"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-1.5 bg-green-500 rounded-full transition-all" style={{ width: `${items.length ? (verifiedCount / items.length) * 100 : 0}%` }} />
            </div>
            <span className="text-[11px] font-bold text-slate-500">{verifiedCount}/{items.length}</span>
          </div>
        )}
      </div>

      {/* Billing */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-brand mb-3">Billing</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Contact</p>
            <p className="font-semibold text-brand">{employer.billingName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
            <p className="font-semibold text-brand truncate">{employer.billingEmail}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Address</p>
            <p className="font-semibold text-brand">{employer.billingAddress}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">{verifiedCount} of {items.length} items verified</p>
          {!allVerified && items.length > 0 && (
            <p className="text-[11px] text-amber-600 font-semibold">All items must be verified before approving</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRequestInfo}
            disabled={actionLoading}
            className="flex-1 py-2.5 border border-amber-300 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Info
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={!allVerified || actionLoading}
            className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {actionLoading ? "…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerVerificationPage() {
  const { toast } = useToast();

  const [employers,       setEmployers]       = useState<Employer[]>([]);
  const [itemStates,      setItemStates]      = useState<Record<string, Item[]>>({});
  const [loading,         setLoading]         = useState(true);
  const [reviewing,       setReviewing]       = useState<string | null>(null);
  const [statusFilter,    setStatusFilter]    = useState(STATUSES[0]);
  const [industryFilter,  setIndustryFilter]  = useState(INDUSTRIES[0]);
  const [actionLoading,   setActionLoading]   = useState(false);
  const [requestInfoTarget, setRequestInfoTarget] = useState<string | null>(null);
  const [requestInfoNote,   setRequestInfoNote]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/employer-verification");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const list: Employer[] = data.employers;
      setEmployers(list);
      setItemStates(Object.fromEntries(list.map((e) => [e.id, e.items.map((i) => ({ ...i }))])));
    } catch {
      toast("Failed to load employers", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const pendingCount   = employers.filter((e) => e.status === "pending").length;
  const verifiedCount  = employers.filter((e) => e.status === "verified").length;
  const reviewingEmployer = reviewing !== null ? employers.find((e) => e.id === reviewing) ?? null : null;

  const filtered = employers.filter((e) => {
    const sm =
      statusFilter === STATUSES[0] ||
      (statusFilter === "Pending Review" && e.status === "pending")  ||
      (statusFilter === "Flagged"        && e.status === "flagged")  ||
      (statusFilter === "Re-Submission"  && e.status === "resubmission") ||
      (statusFilter === "Verified"       && e.status === "verified");
    const im =
      industryFilter === INDUSTRIES[0] ||
      e.industries.includes(industryFilter);
    return sm && im;
  });

  function toggleItem(employerId: string, idx: number) {
    setItemStates((prev) => ({
      ...prev,
      [employerId]: prev[employerId].map((item, i) => i === idx ? { ...item, verified: !item.verified } : item),
    }));
  }

  async function approve(id: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/employer-verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "verified" as CardStatus } : e));
      toast("Employer approved & activated", "success");
      setReviewing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to approve employer", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function reject(id: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/employer-verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "flagged" as CardStatus } : e));
      toast("Employer rejected", "success");
      setReviewing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reject employer", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function requestInfo(id: string, note: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/employer-verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "request_info", note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "resubmission" as CardStatus, resubmissionNote: note } : e));
      toast("Request sent — employer notified", "success");
      setRequestInfoTarget(null);
      setReviewing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send request", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />
      <style>{`
        @keyframes panelSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .panel-slide-in { animation: panelSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Employer Verification</h1>
          <p className="text-sm text-slate-400 mt-1">Review and verify employer registrations before they can post jobs.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 px-5 py-3 bg-brand-blue text-white rounded-2xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">Awaiting Review</p>
              <p className="text-2xl font-black leading-none">{pendingCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Verified</p>
              <p className="text-2xl font-black text-brand leading-none">{verifiedCount}</p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 flex items-center gap-3" data-gsap="fade-down">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Filters:</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-slate-600 outline-none cursor-pointer">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-slate-600 outline-none cursor-pointer">
          {INDUSTRIES.map((ind) => <option key={ind}>{ind}</option>)}
        </select>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          Advanced
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* Employer list */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4" data-gsap="fade-up">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-32" />
                      <div className="h-2.5 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-10 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center" data-gsap="fade-up">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand mb-1">No employers to review</p>
              <p className="text-xs text-slate-400">All submissions have been processed.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${reviewingEmployer ? "grid-cols-1" : "md:grid-cols-2"}`} data-gsap="fade-up">
              {filtered.map((e) => (
                <EmployerCard
                  key={e.id}
                  e={e}
                  isActive={reviewing === e.id}
                  onReview={() => setReviewing(e.id)}
                  onRequestInfo={() => { setRequestInfoTarget(e.id); setRequestInfoNote(""); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {reviewingEmployer && (
          <>
            <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setReviewing(null)} />
            <div className="panel-slide-in w-full lg:w-[440px] lg:shrink-0">
              <DetailPanel
                employer={reviewingEmployer}
                items={itemStates[reviewingEmployer.id] ?? []}
                onToggleItem={(i) => toggleItem(reviewingEmployer.id, i)}
                onClose={() => setReviewing(null)}
                onApprove={() => approve(reviewingEmployer.id)}
                onReject={() => reject(reviewingEmployer.id)}
                onRequestInfo={() => { setRequestInfoTarget(reviewingEmployer.id); setRequestInfoNote(""); }}
                actionLoading={actionLoading}
              />
            </div>
          </>
        )}
      </div>

      {/* Request More Info modal */}
      {requestInfoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand">Request More Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The employer&apos;s account will be restricted until resolved.
                </p>
              </div>
              <button
                onClick={() => setRequestInfoTarget(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 font-semibold mb-0.5">What happens next</p>
              <ul className="text-[11px] text-amber-600 space-y-0.5 list-disc list-inside">
                <li>Employer can still log in</li>
                <li>Job posting and account features are locked</li>
                <li>Your message is shown as a banner on their dashboard</li>
                <li>Access is restored when you approve their account</li>
              </ul>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Message to employer <span className="normal-case font-normal text-slate-300">(required)</span>
              </label>
              <textarea
                value={requestInfoNote}
                onChange={(e) => setRequestInfoNote(e.target.value)}
                placeholder="e.g. Please provide a valid CQC Provider ID and proof of Employer's Liability Insurance..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setRequestInfoTarget(null)}
                className="px-4 py-2 border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!requestInfoNote.trim()) return;
                  await requestInfo(requestInfoTarget, requestInfoNote);
                }}
                disabled={!requestInfoNote.trim() || actionLoading}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
