"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CardStatus = "pending" | "flagged" | "resubmission" | "verified";

type Doc = { name: string; type: string; verified: boolean };

type Employer = {
  id: number;
  company: string;
  contactName: string;
  industry: string;
  companySize: string;
  regNumber: string;
  submitted: string;
  status: CardStatus;
  primaryDoc: string;
  primaryDocIcon: "incorporation" | "vat" | "insurance" | "id" | "bank";
  verificationScore: string;
  scoreVariant: "high" | "medium" | "low";
  submissionDate: string;
  docs: Doc[];
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_EMPLOYERS: Employer[] = [
  {
    id: 1, company: "Global Nexus Corp", contactName: "Richard Hewitt", industry: "FinTech",
    companySize: "201–500", regNumber: "SC412809", submitted: "3h ago", status: "pending",
    primaryDoc: "Certificate of Incorporation", primaryDocIcon: "incorporation",
    verificationScore: "96% Match", scoreVariant: "high", submissionDate: "Oct 24, 2023",
    docs: [
      { name: "Certificate_of_Incorporation.pdf",   type: "Certificate of Incorporation",  verified: true  },
      { name: "VAT_Registration_GNC.pdf",           type: "VAT Registration",              verified: false },
      { name: "Employer_Liability_Insurance.pdf",   type: "Employer Liability Insurance",  verified: true  },
      { name: "Director_ID_Hewitt.pdf",             type: "Director's ID",                 verified: false },
    ],
  },
  {
    id: 2, company: "Arcane Dynamics Ltd", contactName: "Sophie Pearce", industry: "Technology",
    companySize: "51–200", regNumber: "OC387441", submitted: "6h ago", status: "pending",
    primaryDoc: "VAT Registration", primaryDocIcon: "vat",
    verificationScore: "78% Match", scoreVariant: "medium", submissionDate: "Oct 24, 2023",
    docs: [
      { name: "Certificate_of_Incorporation.pdf",   type: "Certificate of Incorporation",  verified: true  },
      { name: "VAT_Certificate.pdf",                type: "VAT Registration",              verified: false },
      { name: "Bank_Verification_Letter.pdf",       type: "Bank Verification",             verified: false },
    ],
  },
  {
    id: 3, company: "Swift Logistics UK", contactName: "Omar Baig", industry: "Logistics",
    companySize: "501–1000", regNumber: "NI621034", submitted: "1d ago", status: "flagged",
    primaryDoc: "Employer Liability Insurance", primaryDocIcon: "insurance",
    verificationScore: "Low Confidence", scoreVariant: "low", submissionDate: "Oct 23, 2023",
    docs: [
      { name: "Incorporation_Certificate.pdf",      type: "Certificate of Incorporation",  verified: false },
      { name: "EL_Insurance_Policy.pdf",            type: "Employer Liability Insurance",  verified: false },
      { name: "Director_Passport_Baig.pdf",         type: "Director's ID",                 verified: false },
      { name: "Bank_Letter.pdf",                    type: "Bank Verification",             verified: false },
    ],
  },
  {
    id: 4, company: "Heritage Care Group", contactName: "Angela Morris", industry: "Healthcare",
    companySize: "1001+", regNumber: "FC038172", submitted: "45m ago", status: "resubmission",
    primaryDoc: "Director's ID", primaryDocIcon: "id",
    verificationScore: "89% Match", scoreVariant: "high", submissionDate: "Oct 23, 2023",
    docs: [
      { name: "HCG_Incorporation.pdf",              type: "Certificate of Incorporation",  verified: true  },
      { name: "VAT_Registration.pdf",               type: "VAT Registration",              verified: true  },
      { name: "EL_Insurance_2024.pdf",              type: "Employer Liability Insurance",  verified: false },
      { name: "Director_ID_Morris.pdf",             type: "Director's ID",                 verified: false },
    ],
  },
  {
    id: 5, company: "BlueSky Hospitality", contactName: "Daniel Forde", industry: "Hospitality",
    companySize: "51–200", regNumber: "IP294510", submitted: "2d ago", status: "pending",
    primaryDoc: "Bank Verification", primaryDocIcon: "bank",
    verificationScore: "84% Match", scoreVariant: "medium", submissionDate: "Oct 22, 2023",
    docs: [
      { name: "BlueSky_Incorporation.pdf",          type: "Certificate of Incorporation",  verified: true  },
      { name: "VAT_Certificate.pdf",                type: "VAT Registration",              verified: true  },
      { name: "Bank_Verification_Letter.pdf",       type: "Bank Verification",             verified: false },
    ],
  },
  {
    id: 6, company: "Meridian Finance Plc", contactName: "Clara Singh", industry: "Finance",
    companySize: "201–500", regNumber: "CE510872", submitted: "4h ago", status: "pending",
    primaryDoc: "Certificate of Incorporation", primaryDocIcon: "incorporation",
    verificationScore: "93% Match", scoreVariant: "high", submissionDate: "Oct 24, 2023",
    docs: [
      { name: "Meridian_Incorporation.pdf",         type: "Certificate of Incorporation",  verified: true  },
      { name: "VAT_Registration_MF.pdf",            type: "VAT Registration",              verified: false },
      { name: "EL_Insurance_Policy.pdf",            type: "Employer Liability Insurance",  verified: true  },
      { name: "Bank_Verification.pdf",              type: "Bank Verification",             verified: true  },
    ],
  },
];

const INDUSTRIES = ["All Industries", "FinTech", "Technology", "Finance", "Logistics", "Healthcare", "Hospitality"];
const STATUSES   = ["All Statuses", "Pending Review", "Flagged", "Re-Submission", "Verified"];

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardStatus, { label: string; style: string; flag?: boolean }> = {
  pending:      { label: "PENDING REVIEW", style: "bg-blue-100 text-brand-blue" },
  flagged:      { label: "FLAGGED",        style: "bg-red-100 text-red-600",    flag: true },
  resubmission: { label: "RE-SUBMISSION",  style: "bg-purple-100 text-purple-600" },
  verified:     { label: "VERIFIED",       style: "bg-green-100 text-green-700" },
};

// ─── Doc icon ──────────────────────────────────────────────────────────────────

function DocIcon({ type, size = 14 }: { type: Employer["primaryDocIcon"]; size?: number }) {
  const cls = "text-slate-500";
  const icons: Record<string, React.ReactNode> = {
    incorporation: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    vat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    insurance: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    id: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
    bank: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
}

// ─── Verification score ────────────────────────────────────────────────────────

function VerificationScore({ score, variant }: { score: string; variant: Employer["scoreVariant"] }) {
  const styles = {
    high:   { icon: "text-green-500", text: "text-green-600" },
    medium: { icon: "text-slate-400", text: "text-slate-600" },
    low:    { icon: "text-red-500",   text: "text-red-500"   },
  }[variant];
  return (
    <div className="flex items-center gap-1.5">
      {variant === "low" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className={`text-sm font-bold ${styles.text}`}>{score}</span>
    </div>
  );
}

// ─── Employer card ─────────────────────────────────────────────────────────────

function EmployerCard({ e, isActive, onReview }: { e: Employer; isActive: boolean; onReview: () => void }) {
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
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded-full">{e.industry}</span>
              <span className="text-[11px] text-slate-400">· {e.submitted}</span>
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
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Primary Document</p>
          <div className="flex items-center gap-1.5">
            <DocIcon type={e.primaryDocIcon} />
            <span className="text-xs font-semibold text-brand truncate">{e.primaryDoc}</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Verification Score</p>
          <VerificationScore score={e.verificationScore} variant={e.scoreVariant} />
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
        <button className="px-4 py-2.5 border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
          Request Docs
        </button>
      </div>
    </div>
  );
}

// ─── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  employer,
  docs,
  onToggleDoc,
  onClose,
  onApprove,
  onReject,
}: {
  employer: Employer;
  docs: Doc[];
  onToggleDoc: (i: number) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const statusCfg    = STATUS_CONFIG[employer.status];
  const verifiedCount = docs.filter((d) => d.verified).length;
  const initials     = employer.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">

      {/* Company header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Employer Review</h3>
          <button onClick={onClose} aria-label="Close review panel" className="p-1 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand">{employer.company}</p>
            <p className="text-xs text-slate-400">{employer.industry} · Reg. {employer.regNumber}</p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCfg.style}`}>
            {statusCfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact</p>
            <p className="text-xs font-semibold text-brand">{employer.contactName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Company Size</p>
            <p className="text-xs font-semibold text-brand">{employer.companySize} employees</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Primary Doc</p>
            <div className="flex items-center gap-1.5">
              <DocIcon type={employer.primaryDocIcon} size={12} />
              <span className="text-xs font-semibold text-brand">{employer.primaryDoc}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Score</p>
            <VerificationScore score={employer.verificationScore} variant={employer.scoreVariant} />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Submitted Documents</h3>
          <span className="text-xs text-slate-400">{verifiedCount}/{docs.length} verified</span>
        </div>
        <ul className="space-y-2.5">
          {docs.map((doc, i) => (
            <li key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${doc.verified ? "bg-green-50 border-green-100" : "bg-[#F7F8FA] border-gray-100"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${doc.verified ? "bg-green-100" : "bg-white border border-gray-100"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={doc.verified ? "text-green-600" : "text-slate-400"}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand truncate">{doc.name}</p>
                <p className="text-[11px] text-slate-400">{doc.type}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button aria-label={`View ${doc.name}`} className="text-[11px] font-semibold text-brand-blue hover:underline">View</button>
                <button
                  onClick={() => onToggleDoc(i)}
                  aria-label={doc.verified ? `Mark ${doc.name} as unverified` : `Mark ${doc.name} as verified`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    doc.verified ? "bg-green-100 text-green-700" : "bg-white border border-gray-200 text-slate-500 hover:border-green-300 hover:text-green-600"
                  }`}
                >
                  {doc.verified ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Verified
                    </>
                  ) : "Mark Verified"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1.5 bg-green-500 rounded-full transition-all" style={{ width: `${(verifiedCount / docs.length) * 100}%` }} />
          </div>
          <span className="text-[11px] font-bold text-slate-500">{verifiedCount}/{docs.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3">
        <button
          onClick={onReject}
          className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
        >
          Approve &amp; Tag
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EmployerVerificationPage() {
  const [employers, setEmployers] = useState<Employer[]>(INITIAL_EMPLOYERS);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [docStates, setDocStates] = useState<Record<number, Doc[]>>(
    Object.fromEntries(INITIAL_EMPLOYERS.map((e) => [e.id, e.docs.map((d) => ({ ...d }))]))
  );
  const [statusFilter,   setStatusFilter]   = useState(STATUSES[0]);
  const [industryFilter, setIndustryFilter] = useState(INDUSTRIES[0]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const activeEmployer = reviewing !== null ? employers.find((e) => e.id === reviewing) ?? null : null;

  const filtered = employers.filter((e) => {
    const matchStatus   = statusFilter   === STATUSES[0]   || STATUS_CONFIG[e.status].label === statusFilter.toUpperCase().replace("-", "").replace(" ", " ");
    const matchIndustry = industryFilter === INDUSTRIES[0] || e.industry === industryFilter;
    return matchStatus && matchIndustry;
  });

  const pendingCount  = employers.filter((e) => e.status === "pending").length;
  const verifiedToday = employers.filter((e) => e.status === "verified").length;

  function toggleDoc(employerId: number, docIndex: number) {
    setDocStates((prev) => ({
      ...prev,
      [employerId]: prev[employerId].map((d, i) => i === docIndex ? { ...d, verified: !d.verified } : d),
    }));
  }

  function approve(id: number) {
    setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "verified" } : e));
    setReviewing(null);
  }

  function reject(id: number) {
    setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: "flagged" } : e));
    setReviewing(null);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((e) => e.id))
    );
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
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
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wide rounded-xl border border-brand-blue/20">
            {pendingCount} Awaiting Review
          </span>
          <span className="px-3 py-1.5 bg-white border border-gray-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-xl">
            {verifiedToday} Verified Today
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3" data-gsap="fade-down">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-brand font-medium outline-none focus:border-brand-blue transition-colors"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-brand font-medium outline-none focus:border-brand-blue transition-colors"
        >
          {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-slate-600 font-semibold hover:bg-gray-50 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Advanced
        </button>
      </div>

      {/* Card grid + panel */}
      <div className="flex flex-col lg:flex-row gap-5 items-start" data-gsap="fade-up">
        <div className="grid md:grid-cols-2 gap-4 flex-1">
          {filtered.map((e) => (
            <EmployerCard
              key={e.id}
              e={e}
              isActive={reviewing === e.id}
              onReview={() => setReviewing((prev) => prev === e.id ? null : e.id)}
            />
          ))}
        </div>

        {activeEmployer && (
          <div className="panel-slide-in w-[440px] shrink-0">
            <DetailPanel
              key={activeEmployer.id}
              employer={activeEmployer}
              docs={docStates[activeEmployer.id]}
              onToggleDoc={(i) => toggleDoc(activeEmployer.id, i)}
              onClose={() => setReviewing(null)}
              onApprove={() => approve(activeEmployer.id)}
              onReject={() => reject(activeEmployer.id)}
            />
          </div>
        )}
      </div>

      {/* Queue table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" data-gsap="fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-brand">Verification Queue</h2>
          <button
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-blue-dark transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Batch Verify ({selected.size})
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-brand-blue cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Company</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Industry</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Document</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Submitted</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e) => {
                  const statusCfg = STATUS_CONFIG[e.status];
                  const initials  = e.company.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(e.id)}
                          onChange={() => toggleSelect(e.id)}
                          className="w-4 h-4 rounded accent-brand-blue cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-black shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand leading-snug">{e.company}</p>
                            <p className="text-[11px] text-slate-400">{e.contactName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[11px] font-semibold rounded-full">
                          {e.industry}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <DocIcon type={e.primaryDocIcon} size={12} />
                          <span className="text-xs font-medium text-slate-600">{e.primaryDoc}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{e.submissionDate}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.style}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setReviewing((prev) => prev === e.id ? null : e.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
                        >
                          Review
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
