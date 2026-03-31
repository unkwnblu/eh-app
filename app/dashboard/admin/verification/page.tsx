"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardStatus = "pending" | "flagged" | "resubmission" | "verified";

type Doc = { name: string; type: string; verified: boolean };

type Candidate = {
  id: number;
  name: string;
  sector: string;
  joined: string;
  status: CardStatus;
  docType: string;
  docIcon: "passport" | "id" | "license" | "medical";
  integrityScore: string;
  integrityVariant: "high" | "medium" | "low";
  submissionDate: string;
  docs: Doc[];
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1, name: "Mila Dragić",   sector: "Healthcare",  joined: "2h ago",  status: "pending",
    docType: "Passport (EU)",    docIcon: "passport", integrityScore: "98% Match",      integrityVariant: "high",   submissionDate: "Oct 24, 2023",
    docs: [
      { name: "British_Passport_Mila.pdf",   type: "Passport (EU)",       verified: true  },
      { name: "Enhanced_DBS_Certificate.pdf",type: "DBS Check",            verified: false },
      { name: "Training_Record.pdf",         type: "Mandatory Training",   verified: true  },
      { name: "Reference_Letter.pdf",        type: "Reference",            verified: false },
    ],
  },
  {
    id: 2, name: "Julian Thorne", sector: "Technology",  joined: "5h ago",  status: "pending",
    docType: "National ID",      docIcon: "id",       integrityScore: "82% Match",      integrityVariant: "medium", submissionDate: "Oct 24, 2023",
    docs: [
      { name: "National_ID_Julian.pdf",      type: "National ID",          verified: false },
      { name: "DBS_Certificate.pdf",         type: "DBS Check",            verified: false },
      { name: "Employment_Reference.pdf",    type: "Reference",            verified: true  },
    ],
  },
  {
    id: 3, name: "Sarah Waters",  sector: "Finance",     joined: "1d ago",  status: "flagged",
    docType: "Driver's License", docIcon: "license",  integrityScore: "Low Confidence", integrityVariant: "low",    submissionDate: "Oct 23, 2023",
    docs: [
      { name: "Drivers_License_Sarah.pdf",   type: "Driver's License",     verified: false },
      { name: "DBS_Check.pdf",               type: "DBS Check",            verified: false },
      { name: "Bank_Statement.pdf",          type: "Proof of Address",     verified: false },
    ],
  },
  {
    id: 4, name: "Aiden Miller",  sector: "Technology",  joined: "40m ago", status: "resubmission",
    docType: "Passport (US)",    docIcon: "passport", integrityScore: "91% Match",      integrityVariant: "high",   submissionDate: "Oct 23, 2023",
    docs: [
      { name: "US_Passport_Aiden.pdf",       type: "Passport (US)",        verified: true  },
      { name: "DBS_Certificate_v2.pdf",      type: "DBS Check",            verified: false },
      { name: "Right_To_Work_Visa.pdf",      type: "Right to Work",        verified: true  },
    ],
  },
  {
    id: 5, name: "Elena Rossi",   sector: "Healthcare",  joined: "3d ago",  status: "pending",
    docType: "Medical License",  docIcon: "medical",  integrityScore: "87% Match",      integrityVariant: "medium", submissionDate: "Oct 24, 2023",
    docs: [
      { name: "Medical_License_Elena.pdf",   type: "Medical License",      verified: false },
      { name: "NMC_Registration.pdf",        type: "NMC Registration",     verified: true  },
      { name: "Enhanced_DBS.pdf",            type: "DBS Check",            verified: false },
    ],
  },
  {
    id: 6, name: "Marcus Chen",   sector: "Technology",  joined: "2d ago",  status: "pending",
    docType: "Global Passport",  docIcon: "passport", integrityScore: "95% Match",      integrityVariant: "high",   submissionDate: "Oct 23, 2023",
    docs: [
      { name: "Global_Passport_Marcus.pdf",  type: "Global Passport",      verified: true  },
      { name: "DBS_Certificate.pdf",         type: "DBS Check",            verified: false },
      { name: "Proof_Of_Address.pdf",        type: "Proof of Address",     verified: true  },
    ],
  },
];

const SECTORS  = ["All Sectors",   "Healthcare", "Technology", "Finance", "Logistics", "Hospitality"];
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

// ─── Integrity score ───────────────────────────────────────────────────────────

function IntegrityScore({ score, variant }: { score: string; variant: Candidate["integrityVariant"] }) {
  const styles = { high: { icon: "text-green-500", text: "text-green-600" }, medium: { icon: "text-slate-400", text: "text-slate-600" }, low: { icon: "text-red-500", text: "text-red-500" } }[variant];
  return (
    <div className="flex items-center gap-1.5">
      {variant === "low" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )}
      <span className={`text-sm font-bold ${styles.text}`}>{score}</span>
    </div>
  );
}

// ─── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({ c, isActive, onReview }: { c: Candidate; isActive: boolean; onReview: () => void }) {
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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Document Type</p>
          <div className="flex items-center gap-1.5">
            <DocIcon type={c.docIcon} />
            <span className="text-sm font-semibold text-brand">{c.docType}</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Integrity Score</p>
          <IntegrityScore score={c.integrityScore} variant={c.integrityVariant} />
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
        <button className="px-4 py-2.5 border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
          Request More Info
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
}: {
  candidate: Candidate;
  docs: Doc[];
  onToggleDoc: (i: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
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

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Document</p>
            <div className="flex items-center gap-1.5">
              <DocIcon type={candidate.docIcon} />
              <span className="text-xs font-semibold text-brand">{candidate.docType}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Integrity</p>
            <IntegrityScore score={candidate.integrityScore} variant={candidate.integrityVariant} />
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
                <button aria-label={`View ${doc.name}`} className="px-2.5 py-1 text-[11px] font-semibold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors">
                  View
                </button>
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
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">{verifiedCount} of {docs.length} docs verified</p>
        <div className="flex items-center gap-2">
          <button onClick={onReject} className="px-4 py-2 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">
            Reject
          </button>
          <button onClick={onApprove} className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
            Approve &amp; Tag
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateVerificationPage() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [reviewing, setReviewing]   = useState<number | null>(null);
  const [docStates, setDocStates]   = useState<Record<number, Doc[]>>(
    Object.fromEntries(INITIAL_CANDIDATES.map((c) => [c.id, c.docs.map((d) => ({ ...d }))]))
  );
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const pendingCount  = candidates.filter((c) => ["pending", "flagged", "resubmission"].includes(c.status)).length;
  const verifiedToday = 142;

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

  function toggleDoc(candidateId: number, docIdx: number) {
    setDocStates((prev) => ({
      ...prev,
      [candidateId]: prev[candidateId].map((d, i) => i === docIdx ? { ...d, verified: !d.verified } : d),
    }));
  }

  function approve(id: number) {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "verified" as CardStatus } : c));
    setReviewing(null);
  }

  function reject(id: number) {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status: "flagged" as CardStatus } : c));
    setReviewing(null);
  }

  function toggleRow(id: number) {
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
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Verified Today</p>
              <p className="text-2xl font-black text-brand leading-none">{verifiedToday}</p>
            </div>
          </div>
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
          {cardCandidates.map((c) => (
            <CandidateCard
              key={c.id}
              c={c}
              isActive={reviewing === c.id}
              onReview={() => setReviewing(reviewing === c.id ? null : c.id)}
            />
          ))}
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
                docs={docStates[reviewingCandidate.id]}
                onToggleDoc={(i) => toggleDoc(reviewingCandidate.id, i)}
                onClose={() => setReviewing(null)}
                onApprove={() => approve(reviewingCandidate.id)}
                onReject={() => reject(reviewingCandidate.id)}
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
                      checked={selectedRows.length === candidates.length}
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
    </main>
  );
}
