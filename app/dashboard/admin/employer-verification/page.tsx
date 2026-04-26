"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

type SortKey = "newest" | "oldest" | "priority";
type StatusFilter = "all" | CardStatus;

const INDUSTRIES = ["All Industries", "Healthcare", "Hospitality", "Customer Care", "Tech & Data"];

// ─── Status visual config ──────────────────────────────────────────────────────

const STATUS_META: Record<CardStatus, { label: string; chipBg: string; chipText: string; dot: string; soft: string }> = {
  pending:      { label: "Pending",      chipBg: "bg-blue-100",   chipText: "text-brand-blue", dot: "bg-brand-blue", soft: "bg-blue-50" },
  flagged:      { label: "Flagged",      chipBg: "bg-red-100",    chipText: "text-red-600",    dot: "bg-red-500",    soft: "bg-red-50" },
  resubmission: { label: "Resubmission", chipBg: "bg-purple-100", chipText: "text-purple-600", dot: "bg-purple-500", soft: "bg-purple-50" },
  verified:     { label: "Verified",     chipBg: "bg-green-100",  chipText: "text-green-700",  dot: "bg-green-500",  soft: "bg-green-50" },
};

const INDUSTRY_COLOUR: Record<string, string> = {
  Healthcare:      "text-teal-600 bg-teal-50",
  Hospitality:     "text-orange-600 bg-orange-50",
  "Customer Care": "text-purple-600 bg-purple-50",
  "Tech & Data":   "text-blue-600 bg-blue-50",
};

// ─── Status filter chip ────────────────────────────────────────────────────────

function StatusChip({
  label, count, active, onClick, accent, icon,
}: {
  label: string; count: number; active: boolean; onClick: () => void; accent: string; icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
        active ? `${accent} border-transparent shadow-sm` : "bg-white border-gray-100 hover:border-gray-200 text-brand"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white/20" : accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-white/80" : "text-slate-400"}`}>{label}</p>
        <p className={`text-2xl font-black leading-none mt-0.5 ${active ? "text-white" : "text-brand"}`}>{count}</p>
      </div>
    </button>
  );
}

// ─── List row ──────────────────────────────────────────────────────────────────

function ListRow({
  employer, isActive, onClick,
}: {
  employer: Employer; isActive: boolean; onClick: () => void;
}) {
  const meta     = STATUS_META[employer.status];
  const initials = employer.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const primary  = employer.industries[0];
  const indClr   = primary ? INDUSTRY_COLOUR[primary] ?? "text-slate-500 bg-slate-50" : "text-slate-500 bg-slate-50";

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
        isActive ? "bg-blue-50/60" : "hover:bg-gray-50/80"
      }`}
    >
      {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-blue" />}

      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-black shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-brand truncate">{employer.company}</p>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${meta.chipText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          {primary && (
            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${indClr}`}>{primary}</span>
          )}
          {employer.industries.length > 1 && (
            <span className="text-[10px] text-slate-400">+{employer.industries.length - 1}</span>
          )}
          <span className="text-[11px] text-slate-400">· {employer.joined}</span>
        </div>
        <p className="text-[11px] text-slate-500 truncate font-mono">CRN {employer.crn}</p>
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
  const meta          = STATUS_META[employer.status];
  const initials      = employer.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const verifiedCount = items.filter((d) => d.verified).length;
  const allVerified   = items.length > 0 && verifiedCount === items.length;
  const progressPct   = items.length === 0 ? 0 : Math.round((verifiedCount / items.length) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className={`px-6 py-5 ${meta.soft} border-b border-gray-100 relative`}>
        <button
          onClick={onClose}
          aria-label="Close review panel"
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/60 text-slate-400 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand-blue text-base font-black shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.chipBg} ${meta.chipText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              {employer.industries.slice(0, 2).map((ind) => {
                const c = INDUSTRY_COLOUR[ind] ?? "text-slate-500 bg-slate-50";
                return <span key={ind} className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${c}`}>{ind}</span>;
              })}
            </div>
            <h2 className="text-lg font-black text-brand tracking-tight truncate">{employer.company}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">CRN {employer.crn} · Joined {employer.joined}</p>
          </div>
        </div>

        {/* Progress strip */}
        <div className="mt-4 pt-4 border-t border-white/60">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Verification Progress</p>
            <p className="text-[11px] font-bold text-brand">{verifiedCount} / {items.length} items</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${allVerified ? "bg-green-500" : "bg-brand-blue"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Body (scrollable) ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Verifiable items — primary content */}
        <section>
          <h3 className="text-sm font-bold text-brand mb-3">Registration Details</h3>
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-gray-50 rounded-xl">No verifiable items submitted.</p>
          ) : (
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li
                  key={item.key}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    item.verified ? "bg-green-50/50 border-green-100" : "bg-gray-50/60 border-gray-100"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.verified ? "bg-green-100" : "bg-white border border-gray-100"
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={item.verified ? "text-green-600" : "text-slate-400"}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="text-sm font-bold text-brand font-mono truncate">{item.value}</p>
                  </div>
                  <button
                    onClick={() => onToggleItem(i)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors shrink-0 ${
                      item.verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-white border border-gray-200 text-slate-500 hover:bg-gray-100"
                    }`}
                  >
                    {item.verified ? "✓ Verified" : "Mark Verified"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Company info + Contact + Billing — 2-column grid */}
        <section className="grid sm:grid-cols-2 gap-4">
          {/* Company */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Company</h4>
            <InfoRow label="Status" value={employer.companyStatus} />
            <InfoRow label="Incorporated" value={employer.incorporationDate} />
            <InfoRow label="Phone" value={employer.companyPhone} />
            {employer.companyWebsite && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Website</p>
                <a
                  href={employer.companyWebsite.startsWith("http") ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-blue hover:underline truncate block"
                >
                  {employer.companyWebsite}
                </a>
              </div>
            )}
            <InfoRow label="Registered Address" value={employer.registeredAddress} fullWidth />
          </div>

          {/* Contact + Billing stacked */}
          <div className="space-y-4">
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact Person</h4>
              <InfoRow label="Name" value={employer.contactName} />
              <InfoRow label="Title" value={employer.contactTitle} />
              <InfoRow label="Phone" value={employer.contactPhone} />
              <InfoRow label="Email" value={employer.email} />
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Billing</h4>
              <InfoRow label="Contact" value={employer.billingName} />
              <InfoRow label="Email" value={employer.billingEmail} />
              <InfoRow label="Address" value={employer.billingAddress} fullWidth />
            </div>
          </div>
        </section>

        {/* Resubmission note (when present) */}
        {employer.status === "resubmission" && employer.resubmissionNote && (
          <section className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1.5">Last Resubmission Note</h4>
            <p className="text-xs text-purple-700 leading-relaxed">{employer.resubmissionNote}</p>
          </section>
        )}
      </div>

      {/* ── Sticky action bar ──────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
        {!allVerified && items.length > 0 && (
          <p className="text-[11px] text-amber-600 font-semibold mb-3 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            All items must be verified before approving
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRequestInfo}
            disabled={actionLoading}
            className="flex-1 min-w-[120px] px-4 py-2.5 border border-amber-200 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Info
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex-1 min-w-[100px] px-4 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading || !allVerified}
            title={!allVerified ? "Mark all items as verified first" : undefined}
            className="flex-[2] min-w-[180px] px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-brand-blue-dark"
          >
            {actionLoading ? "Saving…" : "Approve & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Small info row helper
function InfoRow({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "" : ""}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-brand break-words">{value || "—"}</p>
    </div>
  );
}

// ─── Empty detail state ────────────────────────────────────────────────────────

function EmptyDetailState({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="bg-white border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center py-20 px-6 h-full min-h-[480px]">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-brand mb-1.5">Ready to review</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Select an employer from the list to inspect their company information and verify registration items.
      </p>
      {pendingCount > 0 && (
        <div className="mt-6 px-4 py-2 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
          {pendingCount} employer{pendingCount === 1 ? "" : "s"} awaiting review
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerVerificationPage() {
  const { toast } = useToast();

  useEffect(() => { document.title = "Employer Verification | Edge Harbour Admin"; }, []);

  const [employers,        setEmployers]        = useState<Employer[]>([]);
  const [itemStates,       setItemStates]       = useState<Record<string, Item[]>>({});
  const [loading,          setLoading]          = useState(true);
  const [reviewing,        setReviewing]        = useState<string | null>(null);
  const [statusFilter,     setStatusFilter]     = useState<StatusFilter>("all");
  const [industryFilter,   setIndustryFilter]   = useState(INDUSTRIES[0]);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [sortKey,          setSortKey]          = useState<SortKey>("priority");
  const [actionLoading,    setActionLoading]    = useState(false);
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

  // ── Counts ───────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:          employers.length,
    pending:      employers.filter((e) => e.status === "pending").length,
    flagged:      employers.filter((e) => e.status === "flagged").length,
    resubmission: employers.filter((e) => e.status === "resubmission").length,
    verified:     employers.filter((e) => e.status === "verified").length,
  }), [employers]);

  const pendingCount = counts.pending + counts.flagged + counts.resubmission;

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const visibleEmployers = useMemo(() => {
    const STATUS_PRIORITY: Record<CardStatus, number> = { flagged: 0, resubmission: 1, pending: 2, verified: 3 };
    let list = employers.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (industryFilter !== INDUSTRIES[0] && !e.industries.includes(industryFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!e.company.toLowerCase().includes(q) && !e.contactName.toLowerCase().includes(q) && !e.crn.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "priority") {
        const diff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (diff !== 0) return diff;
      }
      // Fallback: sort by joined date — note "joined" is a relative string (e.g. "8d ago"),
      // so use array index ordering as a stable proxy. Newest is the order returned by the API.
      return 0;
    });

    return list;
  }, [employers, statusFilter, industryFilter, searchQuery, sortKey]);

  const reviewingEmployer = reviewing !== null ? employers.find((e) => e.id === reviewing) ?? null : null;

  // ── Actions ──────────────────────────────────────────────────────────────
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
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Employer Verification</h1>
          <p className="text-sm text-slate-400 mt-1">Review and verify employer registrations before they can post jobs.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40 shrink-0"
          title="Refresh"
          aria-label="Refresh employer list"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Status filter chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-gsap="fade-up">
        <StatusChip
          label="Total" count={counts.all} active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")} accent="bg-brand text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "all" ? "text-white" : "text-brand"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
        />
        <StatusChip
          label="Pending" count={counts.pending} active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")} accent="bg-brand-blue text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "pending" ? "text-white" : "text-brand-blue"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatusChip
          label="Flagged" count={counts.flagged} active={statusFilter === "flagged"}
          onClick={() => setStatusFilter("flagged")} accent="bg-red-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "flagged" ? "text-white" : "text-red-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          }
        />
        <StatusChip
          label="Resubmission" count={counts.resubmission} active={statusFilter === "resubmission"}
          onClick={() => setStatusFilter("resubmission")} accent="bg-purple-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "resubmission" ? "text-white" : "text-purple-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          }
        />
        <StatusChip
          label="Verified" count={counts.verified} active={statusFilter === "verified"}
          onClick={() => setStatusFilter("verified")} accent="bg-green-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "verified" ? "text-white" : "text-green-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3" data-gsap="fade-up">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-brand-blue/40 focus-within:bg-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, contact, or CRN…"
            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="text-slate-300 hover:text-slate-500 shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
        >
          {INDUSTRIES.map((ind) => <option key={ind}>{ind}</option>)}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
          aria-label="Sort employers"
        >
          <option value="priority">Sort: Priority</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>

      {/* Master-detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start" data-gsap="fade-up">

        {/* Left list */}
        <aside className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-340px)] min-h-[480px] sticky top-[88px]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs font-bold text-brand">
              {visibleEmployers.length} employer{visibleEmployers.length === 1 ? "" : "s"}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {statusFilter === "all" ? "All" : STATUS_META[statusFilter as CardStatus].label}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : visibleEmployers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand mb-1">All caught up</p>
                <p className="text-xs text-slate-400">No employers match the current filters.</p>
              </div>
            ) : (
              visibleEmployers.map((e) => (
                <ListRow
                  key={e.id}
                  employer={e}
                  isActive={reviewing === e.id}
                  onClick={() => setReviewing(reviewing === e.id ? null : e.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right detail */}
        <section className="min-h-[480px]">
          {reviewingEmployer ? (
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
          ) : (
            <EmptyDetailState pendingCount={pendingCount} />
          )}
        </section>
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
