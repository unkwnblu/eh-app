"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
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

type SortKey = "newest" | "oldest" | "priority";

const SECTORS  = ["All Sectors", "Healthcare", "Hospitality", "Customer Care", "Tech & Data"];

// ─── Status / sector visual config ─────────────────────────────────────────────

const STATUS_META: Record<CardStatus, { label: string; chipBg: string; chipText: string; dot: string; soft: string }> = {
  pending:      { label: "Pending",      chipBg: "bg-blue-100",   chipText: "text-brand-blue", dot: "bg-brand-blue", soft: "bg-blue-50" },
  flagged:      { label: "Flagged",      chipBg: "bg-red-100",    chipText: "text-red-600",    dot: "bg-red-500",    soft: "bg-red-50" },
  resubmission: { label: "Resubmission", chipBg: "bg-purple-100", chipText: "text-purple-600", dot: "bg-purple-500", soft: "bg-purple-50" },
  verified:     { label: "Verified",     chipBg: "bg-green-100",  chipText: "text-green-700",  dot: "bg-green-500",  soft: "bg-green-50" },
};

const SECTOR_COLOUR: Record<string, string> = {
  Healthcare:      "text-teal-600 bg-teal-50",
  Hospitality:     "text-orange-600 bg-orange-50",
  "Customer Care": "text-purple-600 bg-purple-50",
  "Tech & Data":   "text-blue-600 bg-blue-50",
};

// ─── Doc icon ──────────────────────────────────────────────────────────────────

function DocIcon({ type, size = 14, className = "text-slate-500" }: { type: Candidate["docIcon"]; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    passport: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
    id:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>,
    license:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
    medical:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
  };
  return <>{icons[type]}</>;
}

// ─── Status filter chip ────────────────────────────────────────────────────────

type StatusFilter = "all" | CardStatus;

function StatusChip({
  label,
  count,
  active,
  onClick,
  accent,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
        active
          ? `${accent} border-transparent shadow-sm`
          : "bg-white border-gray-100 hover:border-gray-200 text-brand"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        active ? "bg-white/20" : accent
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-white/80" : "text-slate-400"}`}>
          {label}
        </p>
        <p className={`text-2xl font-black leading-none mt-0.5 ${active ? "text-white" : "text-brand"}`}>
          {count}
        </p>
      </div>
    </button>
  );
}

// ─── Sidebar list row ──────────────────────────────────────────────────────────

function ListRow({
  candidate,
  isActive,
  isSelected,
  onClick,
  onToggleSelect,
}: {
  candidate: Candidate;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onToggleSelect: () => void;
}) {
  const meta       = STATUS_META[candidate.status];
  const sectorClr  = SECTOR_COLOUR[candidate.sector] ?? "text-slate-500 bg-slate-50";

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
        isActive ? "bg-blue-50/60" : "hover:bg-gray-50/80"
      }`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-blue" />
      )}

      {/* Checkbox — appears on hover or when row is selected */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={`shrink-0 mt-1 ${isSelected ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="rounded accent-brand-blue cursor-pointer"
          aria-label={`Select ${candidate.name}`}
        />
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
        {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-brand truncate">{candidate.name}</p>
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${meta.chipText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${sectorClr}`}>
            {candidate.sector}
          </span>
          <span className="text-[11px] text-slate-400">· {candidate.joined}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
          <DocIcon type={candidate.docIcon} size={11} className="text-slate-400 shrink-0" />
          <span className="truncate">{candidate.docType}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel — single cohesive card ──────────────────────────────────────

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
  const meta          = STATUS_META[candidate.status];
  const sectorClr     = SECTOR_COLOUR[candidate.sector] ?? "text-slate-500 bg-slate-50";
  const verifiedCount = docs.filter((d) => d.verified).length;
  const allVerified   = docs.length > 0 && verifiedCount === docs.length;
  const progressPct   = docs.length === 0 ? 0 : Math.round((verifiedCount / docs.length) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full">
      {/* ── Hero header ──────────────────────────────────────────────────── */}
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
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-brand text-base font-black shrink-0 shadow-sm">
            {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.chipBg} ${meta.chipText}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${sectorClr}`}>
                {candidate.sector}
              </span>
            </div>
            <h2 className="text-lg font-black text-brand tracking-tight truncate">{candidate.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted {candidate.submissionDate} · Joined {candidate.joined}
            </p>
          </div>
        </div>

        {/* Progress strip */}
        <div className="mt-4 pt-4 border-t border-white/60">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Verification Progress
            </p>
            <p className="text-[11px] font-bold text-brand">
              {verifiedCount} / {docs.length} documents
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${allVerified ? "bg-green-500" : "bg-brand-blue"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Documents list ───────────────────────────────────────────────── */}
      <div className="px-6 py-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-brand">Submitted Documents</h3>
          <DocIcon type={candidate.docIcon} size={14} className="text-slate-300" />
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">No documents submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {docs.map((doc, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  doc.verified ? "bg-green-50/50 border-green-100" : "bg-gray-50/60 border-gray-100"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  doc.verified ? "bg-green-100" : "bg-brand-blue/10"
                }`}>
                  {doc.verified ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-400">{doc.type}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${doc.name}`}
                      className="px-3 py-1.5 text-[11px] font-bold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View
                    </a>
                  ) : doc.meta ? (
                    <button
                      type="button"
                      onClick={() => onViewShareCode(doc.meta!)}
                      className="px-3 py-1.5 text-[11px] font-bold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-label={`No file available for ${doc.name}`}
                      className="px-3 py-1.5 text-[11px] font-bold text-slate-300 border border-gray-200 rounded-lg cursor-not-allowed"
                    >
                      View
                    </button>
                  )}
                  <button
                    onClick={() => onToggleDoc(i)}
                    aria-label={doc.verified ? `Mark ${doc.name} as unverified` : `Mark ${doc.name} as verified`}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                      doc.verified ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-white border border-gray-200 text-slate-500 hover:bg-gray-100"
                    }`}
                  >
                    {doc.verified ? "✓ Verified" : "Mark Verified"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky action bar ───────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
        {!allVerified && (
          <p className="text-[11px] text-amber-600 font-semibold mb-3 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            All documents must be verified before approving
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
            title={!allVerified ? "Mark all documents as verified first" : undefined}
            className="flex-[2] min-w-[180px] px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-brand-blue-dark"
          >
            {actionLoading ? "Saving…" : "Approve & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty detail state ────────────────────────────────────────────────────────

function EmptyDetailState({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="bg-white border border-gray-100 border-dashed rounded-2xl flex flex-col items-center justify-center text-center py-20 px-6 h-full min-h-[480px]">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-brand mb-1.5">Ready to review</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Select a candidate from the list to inspect their documents and complete verification.
      </p>
      {pendingCount > 0 && (
        <div className="mt-6 px-4 py-2 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
          {pendingCount} candidate{pendingCount === 1 ? "" : "s"} awaiting review
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateVerificationPage() {
  const { toast } = useToast();

  useEffect(() => { document.title = "Candidate Verification | Edge Harbour Admin"; }, []);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [reviewing, setReviewing]   = useState<string | null>(null);
  const [docStates, setDocStates]   = useState<Record<string, Doc[]>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortKey,      setSortKey]      = useState<SortKey>("priority");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestInfoTarget, setRequestInfoTarget] = useState<string | null>(null);
  const [requestInfoNote, setRequestInfoNote] = useState("");
  const [shareCodeView, setShareCodeView] = useState<{ code: string; expiry?: string } | null>(null);
  const [batchVerifying, setBatchVerifying] = useState(false);

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

  // ── Counts ───────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:          candidates.length,
    pending:      candidates.filter((c) => c.status === "pending").length,
    flagged:      candidates.filter((c) => c.status === "flagged").length,
    resubmission: candidates.filter((c) => c.status === "resubmission").length,
    verified:     candidates.filter((c) => c.status === "verified").length,
  }), [candidates]);

  const pendingCount = counts.pending + counts.flagged + counts.resubmission;

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const visibleCandidates = useMemo(() => {
    const STATUS_PRIORITY: Record<CardStatus, number> = { flagged: 0, resubmission: 1, pending: 2, verified: 3 };
    let list = candidates.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (sectorFilter !== "All Sectors" && c.sector !== sectorFilter) return false;
      if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "priority") {
        const diff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (diff !== 0) return diff;
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      }
      const ta = new Date(a.submissionDate).getTime();
      const tb = new Date(b.submissionDate).getTime();
      return sortKey === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [candidates, statusFilter, sectorFilter, searchQuery, sortKey]);

  const reviewingCandidate = reviewing !== null ? candidates.find((c) => c.id === reviewing) ?? null : null;

  // ── Actions ──────────────────────────────────────────────────────────────
  async function toggleDoc(candidateId: string, docIdx: number) {
    const doc = docStates[candidateId]?.[docIdx];
    if (!doc) return;
    const newVerified = !doc.verified;
    setDocStates((prev) => ({
      ...prev,
      [candidateId]: prev[candidateId].map((d, i) => i === docIdx ? { ...d, verified: newVerified } : d),
    }));
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
      toast("Candidate notified — account restricted to Legal & Compliance tab", "info");
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

  async function batchVerify() {
    if (selectedRows.length === 0) return;
    setBatchVerifying(true);
    try {
      // Approve each selected candidate sequentially
      for (const id of selectedRows) {
        await fetch("/api/admin/verification", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "approve" }),
        });
      }
      setCandidates((prev) => prev.map((c) => selectedRows.includes(c.id) ? { ...c, status: "verified" as CardStatus } : c));
      toast(`${selectedRows.length} candidate${selectedRows.length === 1 ? "" : "s"} approved`, "success");
      setSelectedRows([]);
    } catch {
      toast("Batch verify failed", "error");
    } finally {
      setBatchVerifying(false);
    }
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    const allIds = visibleCandidates.map((c) => c.id);
    const allSelected = allIds.every((id) => selectedRows.includes(id));
    setSelectedRows(allSelected ? [] : allIds);
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Candidate Verifications</h1>
          <p className="text-sm text-slate-400 mt-1">Identity and document compliance management</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40 shrink-0"
          title="Refresh"
          aria-label="Refresh candidate list"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Status filter chips — also act as stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-gsap="fade-up">
        <StatusChip
          label="Total"
          count={counts.all}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
          accent="bg-brand text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "all" ? "text-white" : "text-brand"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatusChip
          label="Pending"
          count={counts.pending}
          active={statusFilter === "pending"}
          onClick={() => setStatusFilter("pending")}
          accent="bg-brand-blue text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "pending" ? "text-white" : "text-brand-blue"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatusChip
          label="Flagged"
          count={counts.flagged}
          active={statusFilter === "flagged"}
          onClick={() => setStatusFilter("flagged")}
          accent="bg-red-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "flagged" ? "text-white" : "text-red-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          }
        />
        <StatusChip
          label="Resubmission"
          count={counts.resubmission}
          active={statusFilter === "resubmission"}
          onClick={() => setStatusFilter("resubmission")}
          accent="bg-purple-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "resubmission" ? "text-white" : "text-purple-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          }
        />
        <StatusChip
          label="Verified"
          count={counts.verified}
          active={statusFilter === "verified"}
          onClick={() => setStatusFilter("verified")}
          accent="bg-green-500 text-white"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={statusFilter === "verified" ? "text-white" : "text-green-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Toolbar — search, sector, sort, bulk actions */}
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3" data-gsap="fade-up">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-brand-blue/40 focus-within:bg-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name…"
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

        {/* Sector */}
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
        >
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-slate-600 outline-none cursor-pointer focus:border-brand-blue/40"
          aria-label="Sort candidates"
        >
          <option value="priority">Sort: Priority</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>

        {/* Bulk action — surfaces only when something selected */}
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 ml-auto pl-3 border-l border-gray-100">
            <span className="text-xs font-semibold text-slate-500">
              {selectedRows.length} selected
            </span>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={batchVerify}
              disabled={batchVerifying}
              className="px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {batchVerifying ? "Verifying…" : "Batch Verify"}
            </button>
          </div>
        )}
      </div>

      {/* Master-detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start" data-gsap="fade-up">

        {/* Left: candidate list */}
        <aside className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-340px)] min-h-[480px] sticky top-[88px]">
          {/* List header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={visibleCandidates.length > 0 && visibleCandidates.every((c) => selectedRows.includes(c.id))}
                onChange={toggleSelectAll}
                disabled={visibleCandidates.length === 0}
                className="rounded accent-brand-blue cursor-pointer"
                aria-label="Select all visible candidates"
              />
              <p className="text-xs font-bold text-brand">
                {visibleCandidates.length} candidate{visibleCandidates.length === 1 ? "" : "s"}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {statusFilter === "all" ? "All" : STATUS_META[statusFilter as CardStatus].label}
            </span>
          </div>

          {/* List body */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : visibleCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand mb-1">All caught up</p>
                <p className="text-xs text-slate-400">No candidates match the current filters.</p>
              </div>
            ) : (
              visibleCandidates.map((c) => (
                <ListRow
                  key={c.id}
                  candidate={c}
                  isActive={reviewing === c.id}
                  isSelected={selectedRows.includes(c.id)}
                  onClick={() => setReviewing(reviewing === c.id ? null : c.id)}
                  onToggleSelect={() => toggleRow(c.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right: detail panel or empty state */}
        <section className="min-h-[480px]">
          {reviewingCandidate ? (
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
          ) : (
            <EmptyDetailState pendingCount={pendingCount} />
          )}
        </section>
      </div>

      {/* ── Request More Info modal ── */}
      {requestInfoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand">Request More Information</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The candidate&apos;s account will be restricted to the Legal &amp; Compliance tab until resolved.
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
                <li>All tabs except Legal &amp; Compliance are locked</li>
                <li>Your message is shown as a banner on their Legal &amp; Compliance page</li>
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
