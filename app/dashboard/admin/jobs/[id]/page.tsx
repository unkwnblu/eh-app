"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ComplianceStatus = "rtw-verified" | "dbs-verified" | "in-pipeline";
type ColumnKey = "new" | "interviewing" | "offers" | "accepted" | "rejected";

type Candidate = {
  id:            string;        // application id
  candidateId:   string;
  name:          string;
  appliedAt:     string;
  compliance:    ComplianceStatus;
  column:        ColumnKey;
  interviewDate: string | null;
  interviewTime: string | null;
  meetingLink:   string | null;
};

type CandidateProfile = {
  id:              string;
  fullName:        string;
  email:           string;
  status:          string;
  joinedAt:        string;
  phone:           string | null;
  nationality:     string | null;
  sector:          string | null;
  jobTypes:        string[];
  locations:       string[];
  bio:             string | null;
  gender:          string | null;
  hasCv:           boolean;
  cvFileName:      string | null;
  cvUrl:           string | null;
  hasDbs:          boolean;
  hasShareCode:    boolean;
  shareCodeExpiry: string | null;
  verifiedDocs:    Record<string, boolean>;
  skills:       string[];
  experiences:  { id: string; title: string; company: string; location: string; startDate: string; endDate: string; current: boolean; description: string; skills: string[]; verified: boolean }[];
  certificates: { id: string; name: string; issuer: string | null; expiryDate: string | null; verified: boolean }[];
  references:   { id: string; fullName: string; jobTitle: string | null; company: string | null; email: string | null; phone: string | null; relationship: string | null }[];
  legalDocs:    { id: string; docType: string; label: string | null; fileName: string; fileUrl: string | null; expiryDate: string | null; uploadedAt: string }[];
  applications: { id: string; stage: string; appliedAt: string; job: { id: string; title: string; location: string; employmentType: string; status: string } | null }[];
};

type JobDetail = {
  id:             string;
  title:          string;
  employer:       string;
  employerId:     string;
  sector:         string;
  employmentType: string;
  location:       string;
  remote:         boolean;
  salaryMin:      number | null;
  salaryMax:      number | null;
  status:           "draft" | "review" | "live" | "closed" | "flagged" | "rejected";
  createdAt:        string;
  closesAt:         string | null;
  candidatesNeeded: number;
};

type ShiftAssignment = {
  id:            string;
  candidateId:   string;
  candidateName: string;
  status:        "pending" | "confirmed" | "declined" | "cancelled";
  assignedAt:    string;
};

type AdminShift = {
  id:           string;
  date:         string;
  startTime:    string;
  endTime:      string;
  breakMinutes: number;
  department:   string | null;
  location:     string | null;
  staffNeeded:  number;
  status:       "open" | "filled" | "cancelled";
  assignments:  ShiftAssignment[];
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "new",          label: "New Applications" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offers",       label: "Offers" },
  { key: "accepted",     label: "Accepted" },
  { key: "rejected",     label: "Rejected" },
];

// ─── Move validation ───────────────────────────────────────────────────────────
// Once a candidate has been moved to interviewing (or beyond), a notification
// has already been sent. Moving back to "new" is not allowed.

function isValidMove(from: ColumnKey, to: ColumnKey): boolean {
  if (from === to) return true;
  if (from === "accepted") return false;   // accepted cards are permanently locked
  if (to === "accepted")   return false;   // admin cannot manually accept on behalf of candidates
  // Cannot move backwards — notification already sent for each forward transition
  if (to === "new"          && from !== "new")                               return false;
  if (to === "interviewing" && (from === "offers"   || from === "rejected")) return false;
  if (to === "offers"       && from === "rejected")                          return false;
  return true;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function relativeTime(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function statusColor(status: JobDetail["status"]): string {
  switch (status) {
    case "live":     return "text-green-600";
    case "review":   return "text-amber-600";
    case "flagged":  return "text-orange-600";
    case "rejected": return "text-red-500";
    case "closed":   return "text-slate-400";
    default:         return "text-slate-400";
  }
}

function statusDot(status: JobDetail["status"]): string {
  switch (status) {
    case "live":     return "bg-green-500";
    case "review":   return "bg-amber-400";
    case "flagged":  return "bg-orange-500";
    case "rejected": return "bg-red-500";
    case "closed":   return "bg-slate-300";
    default:         return "bg-slate-300";
  }
}

// ─── Compliance badge ──────────────────────────────────────────────────────────

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  if (status === "rtw-verified") return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">RTW Verified</span>
    </div>
  );
  if (status === "dbs-verified") return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-blue shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-blue">DBS Verified</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">In Pipeline</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonPipeline() {
  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-gray-200 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-gray-100 rounded-lg" />
            <div className="h-4 w-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-3">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-8 w-10 bg-gray-200 rounded" />
            <div className="h-0.5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 flex-1 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col w-[300px] shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="w-5 h-5 rounded-full bg-gray-200" />
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-3 space-y-3 min-h-[400px]">
              {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                <div key={j} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-8 bg-gray-50 rounded-lg border border-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ─── Candidate profile modal ───────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMonthYear(val: string | null | undefined): string {
  if (!val) return "";
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, m] = val.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }
  return val;
}

// ─── Candidate Modal ──────────────────────────────────────────────────────────

type ModalTab = "overview" | "experience" | "documents" | "references" | "history";

function CandidateModal({ candidateId, onClose }: { candidateId: string; onClose: () => void }) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tab,     setTab]     = useState<ModalTab>("overview");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/candidates/${candidateId}`)
      .then((r) => r.json())
      .then((data: { candidate?: CandidateProfile; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setProfile(data.candidate ?? null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const initials = profile?.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  const STAGE_COLORS: Record<string, string> = {
    new:          "bg-blue-50 text-brand-blue",
    interviewing: "bg-purple-50 text-purple-600",
    offers:       "bg-amber-50 text-amber-600",
    accepted:     "bg-green-50 text-green-600",
    rejected:     "bg-red-50 text-red-500",
  };

  const TABS: { key: ModalTab; label: string }[] = profile ? [
    { key: "overview",   label: "Overview" },
    { key: "experience", label: `Experience (${profile.experiences.length})` },
    { key: "documents",  label: `Documents (${profile.certificates.length + profile.legalDocs.length})` },
    { key: "references", label: `References (${profile.references.length})` },
    { key: "history",    label: `History (${profile.applications.length})` },
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-brand">Candidate Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-20">
            <span className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center py-20 text-center px-6">
            <div>
              <p className="font-semibold text-brand mb-1">Failed to load profile</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && profile && (
          <>
            {/* Identity strip */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black text-base shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-brand">{profile.fullName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${profile.status === "active" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {profile.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{profile.email}{profile.phone ? ` · ${profile.phone}` : ""}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profile.sector && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-semibold">{profile.sector}</span>}
                  {profile.locations?.length > 0 && <span className="text-[11px] text-slate-400">{profile.locations[0]}</span>}
                </div>
              </div>
              {/* Doc status badges */}
              <div className="flex flex-col gap-1 shrink-0">
                {profile.cvUrl ? (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    View CV
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-slate-400">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    No CV
                  </span>
                )}
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${profile.hasDbs ? "bg-green-50 text-green-600" : "bg-gray-100 text-slate-400"}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  DBS
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${profile.hasShareCode ? "bg-green-50 text-green-600" : "bg-gray-100 text-slate-400"}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                  RTW
                </span>
              </div>
            </div>

            {/* Tabs — scrollable on small screens */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-gray-100 shrink-0 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-3 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* ── Overview ── */}
              {tab === "overview" && (
                <>
                  {/* Bio */}
                  {profile.bio && (
                    <div className="bg-[#F7F8FA] rounded-xl p-4">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bio</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-blue-50 text-brand-blue text-[11px] font-semibold rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Gender",      value: profile.gender },
                      { label: "Nationality", value: profile.nationality },
                      { label: "Job Types",   value: profile.jobTypes?.join(", ") || null },
                      { label: "Joined",      value: new Date(profile.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                    ].map(({ label, value }) => value ? (
                      <div key={label} className="bg-[#F7F8FA] rounded-xl p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                        <p className="text-xs font-semibold text-brand">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                </>
              )}

              {/* ── Experience ── */}
              {tab === "experience" && (
                <>
                  {profile.experiences.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">No experience added yet.</div>
                  )}
                  <div className="space-y-3">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id} className={`rounded-xl border p-4 ${exp.verified ? "bg-green-50 border-green-100" : "bg-[#F7F8FA] border-gray-100"}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand">{exp.title}</p>
                            <p className="text-[11px] text-brand-blue font-semibold">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {exp.verified && (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Verified</span>
                            )}
                            {exp.current && (
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-brand-blue rounded-full">Current</span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">
                          {fmtMonthYear(exp.startDate)}{exp.startDate ? " — " : ""}{exp.current ? "Present" : fmtMonthYear(exp.endDate)}
                        </p>
                        {exp.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{exp.description}</p>
                        )}
                        {exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.skills.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] font-medium text-slate-500 rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Documents ── */}
              {tab === "documents" && (
                <>
                  {/* CV download */}
                  {profile.hasCv && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">CV</p>
                      {profile.cvUrl ? (
                        <a
                          href={profile.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-blue">{profile.cvFileName ?? "Curriculum Vitae"}</p>
                            <p className="text-[10px] text-brand-blue/60">Click to open in new tab</p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl border bg-[#F7F8FA] border-gray-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <p className="text-xs text-slate-500">{profile.cvFileName ?? "CV on file"}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certificates */}
                  {profile.certificates.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Certificates</p>
                      <div className="space-y-2">
                        {profile.certificates.map((cert) => (
                          <div key={cert.id} className={`flex items-center gap-3 p-3 rounded-xl border ${cert.verified ? "bg-green-50 border-green-100" : "bg-[#F7F8FA] border-gray-100"}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cert.verified ? "text-green-600" : "text-slate-400"}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-brand">{cert.name}</p>
                              <p className="text-[10px] text-slate-400">{[cert.issuer, cert.expiryDate ? `Expires ${new Date(cert.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : null].filter(Boolean).join(" · ")}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cert.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-slate-500"}`}>
                              {cert.verified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal docs */}
                  {profile.legalDocs.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Legal Documents</p>
                      <div className="space-y-2">
                        {profile.legalDocs.map((doc) => (
                          doc.fileUrl ? (
                            <a
                              key={doc.id}
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl border bg-[#F7F8FA] border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-brand">{doc.label ?? doc.docType}</p>
                                <p className="text-[10px] text-slate-400">{doc.fileName}{doc.expiryDate ? ` · Expires ${new Date(doc.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}</p>
                              </div>
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-brand-blue rounded-full">{doc.docType}</span>
                            </a>
                          ) : (
                            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border bg-[#F7F8FA] border-gray-100">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-brand">{doc.label ?? doc.docType}</p>
                                <p className="text-[10px] text-slate-400">{doc.fileName}{doc.expiryDate ? ` · Expires ${new Date(doc.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}</p>
                              </div>
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-brand-blue rounded-full">{doc.docType}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {!profile.hasCv && profile.certificates.length === 0 && profile.legalDocs.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">No documents uploaded yet.</div>
                  )}
                </>
              )}

              {/* ── References ── */}
              {tab === "references" && (
                <>
                  {profile.references.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">No references added yet.</div>
                  )}
                  <div className="space-y-3">
                    {profile.references.map((ref) => (
                      <div key={ref.id} className="bg-[#F7F8FA] rounded-xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[11px] font-black shrink-0">
                          {ref.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-brand">{ref.fullName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{[ref.jobTitle, ref.company].filter(Boolean).join(" · ")}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {ref.email && (
                              <a href={`mailto:${ref.email}`} className="flex items-center gap-1 text-[11px] text-brand-blue hover:underline">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                {ref.email}
                              </a>
                            )}
                            {ref.phone && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                {ref.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {ref.relationship && (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full shrink-0">{ref.relationship}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── History ── */}
              {tab === "history" && (
                <div className="space-y-2">
                  {profile.applications.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">No applications yet.</div>
                  )}
                  {profile.applications.map((app) => (
                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl border bg-[#F7F8FA] border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-brand truncate">{app.job?.title ?? "Unknown Job"}</p>
                        <p className="text-[10px] text-slate-400">{app.job?.location} · {app.job?.employmentType} · Applied {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STAGE_COLORS[app.stage] ?? "bg-gray-100 text-slate-500"}`}>
                        {app.stage}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Interview scheduled badge (with expandable detail) ───────────────────────

function InterviewScheduledBadge({
  date, time, meetingLink, onEdit,
}: {
  date: string;
  time: string | null;
  meetingLink: string | null;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);

  const prettyDate = (() => {
    try {
      return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
    } catch { return date; }
  })();

  return (
    <div className="mt-2.5">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="w-full flex items-center justify-between gap-2 py-1.5 px-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-[11px] font-bold rounded-lg transition-colors border border-green-100"
      >
        <span className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Interview Scheduled
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="mt-1.5 bg-green-50 border border-green-100 rounded-lg p-2.5 space-y-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-[11px] text-green-800">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="font-semibold">{prettyDate}</span>
            {time && <><span className="text-green-600">·</span><span className="font-semibold">{time}</span></>}
          </div>
          {meetingLink && (
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-brand-blue hover:underline truncate"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              {meetingLink}
            </a>
          )}
          <button
            onClick={onEdit}
            className="text-[10px] font-semibold text-green-700 hover:underline"
          >
            Edit schedule →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sortable candidate card ───────────────────────────────────────────────────

function CandidateCard({ candidate, now, isDragging = false, onClick, onScheduleInterview }: {
  candidate: Candidate;
  now: number;
  isDragging?: boolean;
  onClick?: () => void;
  onScheduleInterview?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  const initials = candidate.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl p-4 select-none ${isDragging ? "shadow-2xl rotate-1 border-brand-blue/30" : "border-gray-100 shadow-sm hover:border-brand-blue/40 hover:shadow-md transition-all"}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-[3px] pt-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          {[0, 1].map((r) => (
            <div key={r} className="flex gap-[3px]">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1 h-1 rounded-full bg-slate-300" />
              ))}
            </div>
          ))}
        </div>

        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-brand-blue">{initials}</span>
        </div>

        <button
          onClick={onClick}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-bold text-brand truncate">{candidate.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Applied {relativeTime(candidate.appliedAt, now)}</p>
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <ComplianceBadge status={candidate.compliance} />
        {onClick && (
          <button
            onClick={onClick}
            className="text-[10px] font-semibold text-brand-blue hover:underline shrink-0"
          >
            View profile →
          </button>
        )}
      </div>
      {candidate.column === "interviewing" && onScheduleInterview && (
        candidate.interviewDate ? (
          <InterviewScheduledBadge
            date={candidate.interviewDate}
            time={candidate.interviewTime}
            meetingLink={candidate.meetingLink}
            onEdit={() => onScheduleInterview()}
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onScheduleInterview(); }}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg transition-colors border border-purple-100"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Schedule Interview
          </button>
        )
      )}
    </div>
  );
}

// ─── Schedule Interview Modal ─────────────────────────────────────────────────

function ScheduleInterviewModal({
  applicationId,
  jobId,
  candidateName,
  existingDate,
  existingTime,
  existingLink,
  onClose,
  onSent,
}: {
  applicationId: string;
  jobId:         string;
  candidateName: string;
  existingDate?: string | null;
  existingTime?: string | null;
  existingLink?: string | null;
  onClose: () => void;
  onSent:  () => void;
}) {
  const [date,        setDate]        = useState(existingDate ?? "");
  const [time,        setTime]        = useState(existingTime ?? "");
  const [meetingLink, setMeetingLink] = useState(existingLink ?? "");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) { setError("Date and time are required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ applicationId, interviewDate: date, interviewTime: time, meetingLink: meetingLink || undefined }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      onSent();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // Format the date nicely for preview
  const prettyDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-brand">Schedule Interview</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">For {candidateName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-brand mb-1.5">
              Date of Interview <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-brand mb-1.5">
              Time of Interview <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          {/* Meeting link */}
          <div>
            <label className="block text-xs font-semibold text-brand mb-1.5">Meeting Link <span className="text-slate-400 font-normal">(optional)</span></label>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>
          </div>

          {/* Preview */}
          {prettyDate && time && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-1">Notification Preview</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interview scheduled for <strong>{prettyDate}</strong> at <strong>{time}</strong>
                {meetingLink && <> · <a href={meetingLink} className="text-brand-blue underline">Meeting link</a></>}
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand border border-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
            >
              {saving ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              {saving ? "Sending…" : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Droppable column ──────────────────────────────────────────────────────────

function KanbanColumn({ col, candidates, isOver, isLocked, now, onCardClick, onScheduleInterview, acceptedCount, candidatesNeeded }: {
  col: { key: ColumnKey; label: string };
  candidates: Candidate[];
  isOver: boolean;
  isLocked: boolean;
  now: number;
  onCardClick: (candidateId: string) => void;
  onScheduleInterview: (applicationId: string, candidateName: string) => void;
  acceptedCount?: number;
  candidatesNeeded?: number;
}) {
  const isRejected = col.key === "rejected";
  const isAccepted = col.key === "accepted";
  const isFull     = isAccepted && acceptedCount !== undefined && candidatesNeeded !== undefined && acceptedCount >= candidatesNeeded;
  const { setNodeRef } = useDroppable({ id: col.key, disabled: isLocked });

  return (
    <div className={`flex flex-col w-[300px] shrink-0 transition-opacity ${isLocked && !isAccepted ? "opacity-40" : "opacity-100"}`}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className={`text-sm font-bold ${isRejected ? "text-red-500" : isAccepted ? "text-green-600" : "text-brand"}`}>{col.label}</h3>
        <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center ${isRejected ? "bg-red-400" : isAccepted ? "bg-green-500" : "bg-brand"}`}>
          {candidates.length}
        </span>
        {isFull && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Full
          </span>
        )}
        {isAccepted && !isFull && (
          <span className="flex items-center gap-1 ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Locked
          </span>
        )}
        {isLocked && !isAccepted && (
          <span className="flex items-center gap-1 ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Locked
          </span>
        )}
      </div>
      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-2xl p-3 space-y-3 min-h-[400px] transition-colors ${
            isAccepted
              ? "bg-green-50/60 border-2 border-dashed border-green-200 cursor-not-allowed"
              : isLocked
                ? "bg-slate-100/60 border-2 border-dashed border-slate-200 cursor-not-allowed"
                : isOver
                  ? isRejected ? "bg-red-100 ring-2 ring-red-200" : "bg-brand-blue/8 ring-2 ring-brand-blue/20"
                  : isRejected ? "bg-red-50/70" : "bg-[#F0F2F5]"
          }`}
        >
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              now={now}
              onClick={() => onCardClick(c.candidateId)}
              onScheduleInterview={col.key === "interviewing" ? () => onScheduleInterview(c.id, c.name) : undefined}
            />
          ))}
          {candidates.length === 0 && !isLocked && (
            <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-300 font-medium">Drop here</p>
            </div>
          )}
          {candidates.length === 0 && isAccepted && (
            <div className="flex flex-col items-center justify-center h-24 gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <p className="text-xs text-green-300 font-medium">Candidates accept via notifications</p>
            </div>
          )}
          {candidates.length === 0 && isLocked && !isAccepted && (
            <div className="flex flex-col items-center justify-center h-24 gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-xs text-slate-300 font-medium">Cannot move back here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Assign Shift Modal ────────────────────────────────────────────────────────

type AssignShiftModalProps = {
  shift:      AdminShift;
  jobId:      string;
  candidates: Candidate[];
  onClose:    () => void;
  onAssigned: () => void;
};

function AssignShiftModal({ shift, jobId: _jobId, candidates, onClose, onAssigned }: AssignShiftModalProps) {
  const [selectedId, setSelectedId] = useState("");
  const [assigning,  setAssigning]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const alreadyAssigned = new Set(
    shift.assignments
      .filter((a) => a.status !== "declined" && a.status !== "cancelled")
      .map((a) => a.candidateId)
  );
  const available = candidates.filter((c) => !alreadyAssigned.has(c.candidateId));

  async function assign() {
    if (!selectedId) { setError("Please select a candidate"); return; }
    setAssigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/shifts/${shift.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: selectedId }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to assign");
      }
      onAssigned();
    } catch (e) {
      setError((e as Error).message);
      setAssigning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-brand">Assign Candidate to Shift</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Shift summary */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-brand-blue font-semibold">
          {new Date(shift.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          {" · "}{shift.startTime.slice(0,5)} – {shift.endTime.slice(0,5)}
          {shift.department && ` · ${shift.department}`}
        </div>
        {/* Candidate picker */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 mb-2">Select Candidate</label>
          {available.length === 0 ? (
            <p className="text-xs text-slate-400 italic">All pipeline candidates are already assigned to this shift.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand outline-none focus:border-brand-blue appearance-none bg-white"
              >
                <option value="" disabled>Select a candidate…</option>
                {(["accepted","interviewing","offers","new"] as ColumnKey[]).map((stage) => {
                  const group = available.filter((c) => c.column === stage);
                  if (group.length === 0) return null;
                  return (
                    <optgroup key={stage} label={stage.charAt(0).toUpperCase() + stage.slice(1)}>
                      {group.map((c) => (
                        <option key={c.candidateId} value={c.candidateId}>{c.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-semibold mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-slate-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={assign}
            disabled={assigning || available.length === 0}
            className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
          >
            {assigning ? "Assigning…" : "Assign & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminJobPipelineDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [job,        setJob]        = useState<JobDetail | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [overColumn,  setOverColumn]  = useState<ColumnKey | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  // State-tracked origin column so locked columns react visually during drag
  const [dragFromCol, setDragFromCol] = useState<ColumnKey | null>(null);

  // Candidate profile modal
  const [modalCandidateId, setModalCandidateId] = useState<string | null>(null);

  // Shifts tab
  type PageView = "pipeline" | "shifts";
  const [pageView,      setPageView]      = useState<PageView>("pipeline");
  const [shifts,        setShifts]        = useState<AdminShift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [assigningTo,   setAssigningTo]   = useState<AdminShift | null>(null);
  const [rescinding,    setRescinding]    = useState<string | null>(null); // assignmentId being rescinded

  // Schedule interview modal
  const [scheduleFor, setScheduleFor] = useState<{
    applicationId: string;
    candidateName: string;
    existingDate:  string | null;
    existingTime:  string | null;
    existingLink:  string | null;
  } | null>(null);

  // Track the column a card was in when dragging STARTED — onDragOver mutates
  // the candidate's column in state optimistically, so by the time onDragEnd
  // fires, candidate.column is already the new column. We need the original.
  const dragOriginRef = useRef<ColumnKey | null>(null);

  // Stable "now" for relative time display
  const [now] = useState(() => Date.now());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to load job");
      }
      const data = await res.json() as {
        job: JobDetail;
        pipeline: Array<{
          id:            string;
          candidateId:   string;
          name:          string;
          stage:         ColumnKey;
          appliedAt:     string;
          compliance:    ComplianceStatus;
          interviewDate: string | null;
          interviewTime: string | null;
          meetingLink:   string | null;
        }>;
      };
      setJob(data.job);
      setCandidates(
        data.pipeline.map((p) => ({
          id:            p.id,
          candidateId:   p.candidateId,
          name:          p.name,
          appliedAt:     p.appliedAt,
          compliance:    p.compliance,
          column:        p.stage,
          interviewDate: p.interviewDate,
          interviewTime: p.interviewTime,
          meetingLink:   p.meetingLink,
        }))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadShifts = useCallback(async () => {
    setLoadingShifts(true);
    try {
      const res = await fetch(`/api/admin/shifts?jobId=${id}`);
      if (!res.ok) throw new Error("Failed to load shifts");
      const data = await res.json() as { shifts: AdminShift[] };
      setShifts(data.shifts ?? []);
    } catch {
      // silent — user can retry by switching tabs
    } finally {
      setLoadingShifts(false);
    }
  }, [id]);

  useEffect(() => {
    if (pageView === "shifts") loadShifts();
  }, [pageView, loadShifts]);

  async function rescindAssignment(shiftId: string, assignmentId: string) {
    setRescinding(assignmentId);
    // Optimistic update — mark as cancelled immediately
    setShifts((prev) => prev.map((s) =>
      s.id !== shiftId ? s : {
        ...s,
        assignments: s.assignments.map((a) =>
          a.id !== assignmentId ? a : { ...a, status: "cancelled" as const }
        ),
      }
    ));
    try {
      const res = await fetch(`/api/admin/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to rescind");
      }
    } catch {
      // Revert optimistic update on failure
      loadShifts();
    } finally {
      setRescinding(null);
    }
  }

  // ─── Drag helpers ────────────────────────────────────────────────────────────

  const activeCandidate = candidates.find((c) => c.id === activeId) ?? null;

  function getColumn(overId: string): ColumnKey | null {
    if (COLUMNS.some((col) => col.key === overId)) return overId as ColumnKey;
    return candidates.find((c) => c.id === overId)?.column ?? null;
  }

  function onDragStart({ active }: DragStartEvent) {
    const applicationId = active.id as string;
    const originCol = candidates.find((c) => c.id === applicationId)?.column ?? null;
    setActiveId(applicationId);
    setDragFromCol(originCol);
    setSaveError(null);
    // Snapshot the card's current column before any onDragOver mutations
    dragOriginRef.current = originCol;
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const overCol   = getColumn(over.id as string);
    setOverColumn(overCol);
    const activeCol = getColumn(active.id as string);
    if (!overCol || activeCol === overCol) return;
    // Block optimistic visual move if the transition is not allowed
    if (dragOriginRef.current && !isValidMove(dragOriginRef.current, overCol)) return;
    // Optimistic UI update — move the card to the hovered column immediately
    setCandidates((prev) =>
      prev.map((c) => c.id === active.id ? { ...c, column: overCol } : c)
    );
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumn(null);
    setDragFromCol(null);

    const originalCol = dragOriginRef.current;
    dragOriginRef.current = null;

    if (!over) {
      // Dropped outside — revert to original column
      if (originalCol) {
        setCandidates((prev) =>
          prev.map((c) => c.id === active.id ? { ...c, column: originalCol } : c)
        );
      }
      return;
    }

    const overCol = getColumn(over.id as string);
    if (!overCol) return;

    // Compare against the ORIGINAL column captured at drag start,
    // not candidate.column (which onDragOver already mutated)
    if (!originalCol || originalCol === overCol) return;

    // Hard-guard: reject the move if it violates the forward-only rule
    if (!isValidMove(originalCol, overCol)) {
      setCandidates((prev) =>
        prev.map((c) => c.id === active.id ? { ...c, column: originalCol } : c)
      );
      return;
    }

    // State is already updated optimistically — persist to server
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ applicationId: active.id, stage: overCol }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }
    } catch (err) {
      // Revert optimistic update on failure
      setSaveError((err as Error).message);
      setCandidates((prev) =>
        prev.map((c) => c.id === active.id ? { ...c, column: originalCol } : c)
      );
    } finally {
      setSaving(false);
    }
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  const totalApplied   = candidates.length;
  const newCount       = candidates.filter((c) => c.column === "new").length;
  const interviewCount = candidates.filter((c) => c.column === "interviewing").length;
  const acceptedCount  = candidates.filter((c) => c.column === "accepted").length;
  const offersCount    = candidates.filter((c) => c.column === "offers").length;

  const stats = [
    { label: "Total Applied", value: totalApplied },
    { label: "New",           value: newCount },
    { label: "Interviewing",  value: interviewCount },
  ];

  const lastUpdated = candidates.length > 0
    ? relativeTime(candidates.reduce((latest, c) =>
        c.appliedAt > latest ? c.appliedAt : latest,
        candidates[0].appliedAt
      ), now)
    : "—";

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <SkeletonPipeline />;

  if (error) return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-bold text-brand">{error}</p>
        <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
      </div>
    </main>
  );

  if (!job) return null;

  return (
    <>
      <GsapAnimations />
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col">

        {/* Header */}
        <div data-gsap="fade-down" className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <Link
              href="/dashboard/admin/jobs"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-blue mb-3 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Pipeline
            </Link>

            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-black text-brand tracking-tight">{job.title}</h1>
              <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${statusColor(job.status)}`}>
                <span className={`w-2 h-2 rounded-full ${statusDot(job.status)}`} />
                {job.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-sm text-slate-600 font-semibold">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                {job.employer}
              </span>
              <span className="text-slate-200">·</span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {job.location}{job.remote ? " · Remote" : ""}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.employmentType}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {job.candidatesNeeded} {job.candidatesNeeded === 1 ? "candidate" : "candidates"} needed
              </span>
              {job.closesAt && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Closes {new Date(job.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => pageView === "shifts" ? loadShifts() : load()}
            disabled={pageView === "shifts" ? loadingShifts : loading}
            title={pageView === "shifts" ? "Refresh shifts" : "Refresh pipeline"}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40 shrink-0 self-start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={(pageView === "shifts" ? loadingShifts : loading) ? "animate-spin" : ""}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 border-b border-gray-100 mb-6" data-gsap="fade-down">
          {([
            { key: "pipeline", label: "Candidate Pipeline" },
            { key: "shifts",   label: "Shift Management" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setPageView(t.key)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                pageView === t.key
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Save feedback */}
        {pageView === "pipeline" && saving && (
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-brand-blue/5 border border-brand-blue/20 rounded-xl w-fit text-xs font-semibold text-brand-blue">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-blue border-t-transparent animate-spin shrink-0" />
            Saving…
          </div>
        )}
        {pageView === "pipeline" && saveError && (
          <div className="flex items-center justify-between mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Failed to save move — change reverted. {saveError}
            </span>
            <button onClick={() => setSaveError(null)} className="ml-4 text-red-400 hover:text-red-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {pageView === "pipeline" && (
          <>
            {/* Stats */}
            <div data-gsap="fade-up" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-brand leading-none">{stat.value}</p>
                  </div>
                  <div className="mt-3 h-0.5 bg-brand-blue/20 rounded-full">
                    <div
                      className="h-full bg-brand-blue rounded-full transition-all"
                      style={{ width: totalApplied > 0 ? `${(stat.value / totalApplied) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}

              {/* Accepted / Candidates Needed */}
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Accepted / Needed</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-brand leading-none">{acceptedCount}</p>
                  <p className="text-sm font-bold text-slate-400 leading-none mb-1">of {job.candidatesNeeded}</p>
                </div>
                <div className="mt-3 h-0.5 bg-green-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: job.candidatesNeeded > 0 ? `${Math.min((acceptedCount / job.candidatesNeeded) * 100, 100)}%` : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* Kanban */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
            >
              <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.key}
                    col={col}
                    candidates={candidates.filter((c) => c.column === col.key)}
                    isOver={overColumn === col.key}
                    isLocked={col.key === "accepted" || (dragFromCol !== null && !isValidMove(dragFromCol, col.key))}
                    now={now}
                    onCardClick={(candidateId) => setModalCandidateId(candidateId)}
                    onScheduleInterview={(applicationId, candidateName) => {
                      const c = candidates.find((x) => x.id === applicationId);
                      setScheduleFor({
                        applicationId,
                        candidateName,
                        existingDate: c?.interviewDate ?? null,
                        existingTime: c?.interviewTime ?? null,
                        existingLink: c?.meetingLink   ?? null,
                      });
                    }}
                    acceptedCount={col.key === "accepted" ? acceptedCount : undefined}
                    candidatesNeeded={col.key === "accepted" ? job.candidatesNeeded : undefined}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activeCandidate && (
                  <CandidateCard candidate={activeCandidate} now={now} isDragging />
                )}
              </DragOverlay>
            </DndContext>
          </>
        )}

        {pageView === "shifts" && (
          <div data-gsap="fade-up">
            {loadingShifts ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : shifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand">No shifts posted yet</p>
                <p className="text-xs text-slate-400">The employer hasn&apos;t created any shifts for this job.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shifts.map((shift) => {
                  const confirmedCount = shift.assignments.filter((a) => a.status === "confirmed").length;
                  const pendingCount   = shift.assignments.filter((a) => a.status === "pending").length;
                  const date = new Date(shift.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
                  const paidHours = Math.max(0, (
                    (() => {
                      const [sh, sm] = shift.startTime.split(":").map(Number);
                      const [eh, em] = shift.endTime.split(":").map(Number);
                      return ((eh * 60 + em) - (sh * 60 + sm) - (shift.breakMinutes ?? 0)) / 60;
                    })()
                  ));
                  return (
                    <div key={shift.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-sm font-bold text-brand">{date} · {shift.department ?? "General"}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              shift.status === "open" ? "bg-blue-50 text-blue-600" :
                              shift.status === "filled" ? "bg-green-50 text-green-600" :
                              "bg-gray-100 text-slate-400"
                            }`}>{shift.status}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {shift.startTime.slice(0,5)} – {shift.endTime.slice(0,5)} · {paidHours.toFixed(1)} paid hrs
                            {shift.breakMinutes > 0 && ` · ${shift.breakMinutes}m break`}
                            {shift.location && ` · ${shift.location}`}
                          </p>
                          {/* Assignments */}
                          {shift.assignments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {shift.assignments.map((a) => (
                                <div key={a.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  a.status === "confirmed" ? "bg-green-50 text-green-700 border border-green-100" :
                                  a.status === "pending"   ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  "bg-gray-50 text-slate-400 border border-gray-100 line-through"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    a.status === "confirmed" ? "bg-green-500" :
                                    a.status === "pending"   ? "bg-amber-400" : "bg-gray-300"
                                  }`} />
                                  {a.candidateName}
                                  <span className="text-[9px] opacity-70 uppercase tracking-wide">{a.status}</span>
                                  {a.status === "pending" && (
                                    <button
                                      title="Rescind shift offer"
                                      disabled={rescinding === a.id}
                                      onClick={() => rescindAssignment(shift.id, a.id)}
                                      className="ml-0.5 p-0.5 rounded hover:bg-amber-200 transition-colors disabled:opacity-40"
                                    >
                                      {rescinding === a.id ? (
                                        <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" /></svg>
                                      ) : (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                      )}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-bold text-brand">{confirmedCount}/{shift.staffNeeded}</p>
                            <p className="text-[10px] text-slate-400">confirmed</p>
                            {pendingCount > 0 && <p className="text-[10px] text-amber-500">{pendingCount} pending</p>}
                          </div>
                          {shift.status !== "cancelled" && confirmedCount < shift.staffNeeded && (
                            <button
                              onClick={() => setAssigningTo(shift)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Candidate profile modal */}
      {modalCandidateId && (
        <CandidateModal
          candidateId={modalCandidateId}
          onClose={() => setModalCandidateId(null)}
        />
      )}

      {/* Schedule interview modal */}
      {scheduleFor && (
        <ScheduleInterviewModal
          applicationId={scheduleFor.applicationId}
          jobId={id}
          candidateName={scheduleFor.candidateName}
          existingDate={scheduleFor.existingDate}
          existingTime={scheduleFor.existingTime}
          existingLink={scheduleFor.existingLink}
          onClose={() => setScheduleFor(null)}
          onSent={() => { setScheduleFor(null); load(); }}
        />
      )}

      {/* Assign shift modal */}
      {assigningTo && (
        <AssignShiftModal
          shift={assigningTo}
          jobId={id}
          candidates={candidates}
          onClose={() => setAssigningTo(null)}
          onAssigned={() => { setAssigningTo(null); loadShifts(); }}
        />
      )}

      {/* Footer status bar */}
      <footer className="border-t border-gray-100 bg-white px-6 py-3 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500" /> RTW Verified
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-blue" /> DBS Verified
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> In Pipeline
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Total Candidates: {String(totalApplied).padStart(2, "0")}</span>
          <span className="text-slate-200">|</span>
          <span>Last Activity: {lastUpdated}</span>
        </div>
      </footer>
    </>
  );
}
