"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardStatus = "pending" | "flagged" | "resubmission" | "verified";

type Doc = { key: string; name: string; type: string; verified: boolean; url?: string; meta?: { code: string; expiry?: string } };

type Candidate = {
  id: string;
  name: string;
  sector: string;
  joined: string;
  status: CardStatus;
  docType: string;
  docIcon: "passport" | "id" | "license" | "medical";
  submissionDate: string;
  docs: Doc[];
};


const SECTORS  = ["All Sectors", "Healthcare", "Hospitality", "Customer Care", "Tech & Data"];
const STATUSES = ["All Statuses",  "Pending Review", "Flagged", "Re-Submission", "Verified"];

// ─── Status badge config ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardStatus, { label: string; style: string; flag?: boolean }> = {
  pending:      { label: "PENDING REVIEW", style: "bg-blue-100 text-brand-blue" },
  flagged:      { label: "FLAGGED",        style: "bg-red-100 text-red-600",    flag: true },
  resubmission: { label: "RE-SUBMISSION",  style: "bg-purple-100 text-purple-600" },
  verified:     { label: "VERIFIED",       style: "bg-green-100 text-green-700" },
};

// ─── Doc icon ──────────────────────────────────────────────────────────────────

function DocIcon({ type, size = 14 }: { type: Candidate["docIcon"]; size?: number }) {
  const cls = `text-slate-500`;
  const icons: Record<string, React.ReactNode> = {
    passport: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
    id:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>,
    license:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
    medical:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
  };
  return <>{icons[type]}</>;
}


// ─── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({ c, isActive, onReview, onRequestInfo }: { c: Candidate; isActive: boolean; onReview: () => void; onRequestInfo: () => void }) {
  const statusCfg = STATUS_CONFIG[c.status];
  return (
    <div className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all ${isActive ? "border-brand-blue shadow-md" : "border-gray-100"}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
            {c.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand">{c.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-blue-50 text-brand-blue text-[10px] font-semibold rounded-full">{c.sector}</span>
              <span className="text-[11px] text-slate-400">· Joined {c.joined}</span>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCfg.style}`}>
          {statusCfg.flag && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          )}
          {statusCfg.label}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Document Type</p>
        <div className="flex items-center gap-1.5">
          <DocIcon type={c.docIcon} />
          <span className="text-sm font-semibold text-brand">{c.docType}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReview}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
            isActive ? "bg-brand-blue text-white" : "bg-brand-blue text-white hover:bg-brand-blue-dark"
          }`}
        >
          Review &amp; Verify
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRequestInfo(); }}
          className="px-4 py-2.5 border border-amber-200 text-amber-600 text-sm font-semibold rounded-xl hover:bg-amber-50 transition-colors whitespace-nowrap"
        >
          Request Info
        </button>
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  candidate,
  docs,
  onToggleDoc,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  onViewShareCode,
  actionLoading,
}: {
  candidate: Candidate;
  docs: Doc[];
  onToggleDoc: (i: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onViewShareCode: (meta: { code: string; expiry?: string }) => void;
  actionLoading: boolean;
}) {
  const statusCfg = STATUS_CONFIG[candidate.status];
  const verifiedCount = docs.filter((d) => d.verified).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Candidate Review</h3>
          <button onClick={onClose} aria-label="Close review panel" className="p-1 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
            {candidate.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand">{candidate.name}</p>
            <p className="text-xs text-slate-400">{candidate.sector} · Joined {candidate.joined}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCfg.style}`}>
            {statusCfg.label}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Document</p>
          <div className="flex items-center gap-1.5">
            <DocIcon type={candidate.docIcon} />
            <span className="text-xs font-semibold text-brand">{candidate.docType}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Submitted Documents</h3>
          <span className="text-xs text-slate-400">{verifiedCount}/{docs.length} verified</span>
        </div>
        <div className="space-y-2.5">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-400">{doc.type}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${doc.name}`}
                    className="px-2.5 py-1 text-[11px] font-semibold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View
                  </a>
                ) : doc.meta ? (
                  <button
                    type="button"
                    onClick={() => onViewShareCode(doc.meta!)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-label={`No file available for ${doc.name}`}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 border border-gray-200 rounded-lg cursor-not-allowed"
                  >
                    View
                  </button>
                )}
                <button
                  onClick={() => onToggleDoc(i)}
                  aria-label={doc.verified ? `Mark ${doc.name} as unverified` : `Mark ${doc.name} as verified`}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    doc.verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-slate-500 hover:bg-gray-200"
                  }`}
                >
                  {doc.verified ? "✓ Verified" : "Mark Verified"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(() => {
        const allVerified = docs.length > 0 && verifiedCount === docs.length;
        return (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{verifiedCount} of {docs.length} docs verified</p>
              {!allVerified && (
                <p className="text-[11px] text-amber-600 font-semibold">
                  All documents must be verified before approving
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 justify-end flex-wrap">
              <button
                onClick={onRequestInfo}
                disabled={actionLoading}
                className="px-4 py-2 border border-amber-200 text-amber-600 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Info
              </button>
              <button
                onClick={onReject}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={actionLoading || !allVerified}
                title={!allVerified ? "Mark all documents as verified first" : undefined}
                className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-brand-blue-dark"
              >
                {actionLoading ? "Saving…" : "Approve & Activate"}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateVerificationPage() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [reviewing, setReviewing]   = useState<string | null>(null);
  const [docStates, setDocStates]   = useState<Record<string, Doc[]>>({});
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestInfoTarget, setRequestInfoTarget] = useState<string | null>(null);
  const [requestInfoNote, setRequestInfoNote] = useState("");
  const [shareCodeView, setShareCodeView] = useState<{ code: string; expiry?: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verification");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const list: Candidate[] = data.candidates;
      setCandidates(list);
      setDocStates(Object.fromEntries(list.map((c) => [c.id, c.docs.map((d) => ({ ...d }))])));
    } catch {
      toast("Failed to load candidates", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const pendingCount       = candidates.filter((c) => ["pending", "flagged", "resubmission"].includes(c.status)).length;
  const verifiedTodayCount = candidates.filter((c) => c.status === "verified").length;

  const reviewingCandidate = reviewing !== null ? candidates.find((c) => c.id === reviewing) ?? null : null;

  const cardCandidates = candidates.filter((c) => {
    const sm =
      statusFilter === "All Statuses" ||
      (statusFilter === "Pending Review"  && c.status === "pending") ||
      (statusFilter === "Flagged"         && c.status === "flagged") ||
      (statusFilter === "Re-Submission"   && c.status === "resubmission") ||
      (statusFilter === "Verified"        && c.status === "verified");
    const fm = sectorFilter === "All Sectors" || c.sector === sectorFilter;
    return sm && fm;
  });

  async function toggleDoc(candidateId: string, docIdx: number) {
    const doc = docStates[candidateId]?.[docIdx];
    if (!doc) return;
    const newVerified = !doc.verified;

    // Optimistic update
    setDocStates((prev) => ({
      ...prev,
      [candidateId]: prev[candidateId].map((d, i) => i === docIdx ? { ...d, verified: newVerified } : d),
    }));

    // Persist to DB
    await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: candidateId, action: "toggle_doc", docKey: doc.key, verified: newVerified }),
    });
  }

  async function approve(id: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (!res.ok) throw new Error();
      setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "verified" as CardStatus } : c));
      toast("Candidate approved & activated", "success");
      setReviewing(null);
    } catch {
      toast("Failed to approve candidate", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function requestInfo(id: string, note: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "request_info", note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Failed to send request", "error");
        return;
      }
      setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "resubmission" as CardStatus } : c));
      toast("Candidate notified — account restricted to Legal tab", "info");
      setReviewing(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to send request", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function reject(id: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });
      if (!res.ok) throw new Error();
      setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "flagged" as CardStatus } : c));
      toast("Candidate rejected", "info");
      setReviewing(null);
    } catch {
      toast("Failed to reject candidate", "error");
    } finally {
      setActionLoading(false);
    }
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Candidate Verifications</h1>
          <p className="text-sm text-slate-400 mt-1">Identity and document compliance management</p>
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
              <p className="text-2xl font-black text-brand leading-none">{verifiedTodayCount}</p>
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
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-slate-600 outline-none cursor-pointer">
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          Advanced
        </button>
      </div>

      {/* Cards + detail panel */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Card grid — always 2 columns at tablet+ */}
        <div className="grid md:grid-cols-2 gap-4 flex-1" data-gsap="fade-up">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-32" />
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))
          ) : cardCandidates.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand mb-1">No candidates to review</p>
              <p className="text-xs text-slate-400">All submissions have been processed.</p>
            </div>
          ) : (
            cardCandidates.map((c) => (
              <CandidateCard
                key={c.id}
                c={c}
                isActive={reviewing === c.id}
                onReview={() => setReviewing(reviewing === c.id ? null : c.id)}
                onRequestInfo={() => { setRequestInfoTarget(c.id); setRequestInfoNote(""); }}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        {reviewingCandidate && (
          <>
            <style>{`
              @keyframes panelSlideIn {
                from { opacity: 0; transform: translateX(20px); }
                to   { opacity: 1; transform: translateX(0); }
              }
              .panel-slide-in { animation: panelSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
            <div className="panel-slide-in w-full lg:w-[440px] lg:shrink-0">
              <DetailPanel
                candidate={reviewingCandidate}
                docs={docStates[reviewingCandidate.id] ?? []}
                onToggleDoc={(i) => toggleDoc(reviewingCandidate.id, i)}
                onClose={() => setReviewing(null)}
                onApprove={() => approve(reviewingCandidate.id)}
                onReject={() => reject(reviewingCandidate.id)}
                onRequestInfo={() => { setRequestInfoTarget(reviewingCandidate.id); setRequestInfoNote(""); }}
                onViewShareCode={(meta) => setShareCodeView(meta)}
                actionLoading={actionLoading}
              />
            </div>
          </>
        )}
      </div>

      {/* Queue Management */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-brand">Queue Management</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Selected ({selectedRows.length})</span>
            <button disabled={selectedRows.length === 0} className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Batch Verify
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-10 pb-3">
                    <input type="checkbox" className="rounded accent-brand-blue"
                      checked={candidates.length > 0 && selectedRows.length === candidates.length}
                      onChange={(e) => setSelectedRows(e.target.checked ? candidates.map((c) => c.id) : [])} />
                  </th>
                  {["Candidate", "Sector", "Document", "Submission Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 pr-3">
                      <input type="checkbox" className="rounded accent-brand-blue" checked={selectedRows.includes(c.id)} onChange={() => toggleRow(c.id)} />
                    </td>
                    <td className="py-3.5 pr-4"><span className="text-sm font-semibold text-brand">{c.name}</span></td>
                    <td className="py-3.5 pr-4"><span className="px-2.5 py-1 bg-blue-50 text-brand-blue text-[11px] font-semibold rounded-full">{c.sector}</span></td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1.5">
                        <DocIcon type={c.docIcon} />
                        <span className="text-sm text-slate-600">{c.docType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4"><span className="text-sm text-slate-500">{c.submissionDate}</span></td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.status === "verified" ? "text-green-600" : c.status === "flagged" ? "text-red-500" : "text-amber-600"}`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.status === "verified" ? "bg-green-500" : c.status === "flagged" ? "bg-red-500" : "bg-amber-400"}`} />
                        {c.status === "pending" ? "Pending" : c.status === "flagged" ? "Flagged" : c.status === "resubmission" ? "Re-Submission" : "Verified"}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setReviewing(reviewing === c.id ? null : c.id)}
                        aria-label={`Open review panel for ${c.name}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Request More Info modal ── */}
      {requestInfoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand">Request More Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The candidate&apos;s account will be restricted to the Legal tab until resolved.
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
                <li>Candidate can still log in</li>
                <li>All tabs except Legal are locked</li>
                <li>Your message is shown as a banner on their Legal page</li>
                <li>Access is restored when you approve their account</li>
              </ul>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Message to candidate <span className="normal-case font-normal text-slate-300">(required)</span>
              </label>
              <textarea
                value={requestInfoNote}
                onChange={(e) => setRequestInfoNote(e.target.value)}
                rows={4}
                placeholder="e.g. Please upload a clearer photo of your BRP — the document number is not legible."
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
                  setRequestInfoTarget(null);
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

      {/* ── Share Code View modal ── */}
      {shareCodeView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand">Share Code Details</h3>
              <button
                onClick={() => setShareCodeView(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Code display */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Share Code</p>
                <p className="text-2xl font-mono font-black text-brand tracking-widest">{shareCodeView.code}</p>
              </div>
              {shareCodeView.expiry && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Expiry Date</p>
                  <p className="text-sm font-semibold text-brand">
                    {new Date(shareCodeView.expiry).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(shareCodeView.code); }}
                className="flex-1 py-2.5 bg-gray-100 text-brand text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Copy Code
              </button>
              <a
                href="https://www.gov.uk/view-right-to-work"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors text-center"
              >
                Verify on Gov.UK
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
