"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

type ComplianceItem = { label: string; pass: boolean };

type Job = {
  id: number;
  employer: string;
  initials: string;
  title: string;
  sector: string;
  location: string;
  salary: string;
  type: string;
  remote: boolean;
  posted: string;
  status: ModerationStatus;
  description: string;
  flags: string[];
  compliance: number;
  complianceItems: ComplianceItem[];
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  {
    id: 1, employer: "Global Nexus Corp", initials: "GN", title: "Senior Project Lead", sector: "FinTech",
    location: "London, UK", salary: "£70,000–£90,000/yr", type: "Permanent", remote: false, posted: "2h ago",
    status: "pending", compliance: 98,
    description: "Lead cross-functional teams on high-value fintech product delivery. Manage stakeholder relationships, sprint planning, and delivery milestones. Minimum 8 years experience required. Strong background in agile methodologies and regulated financial environments essential.",
    flags: [],
    complianceItems: [
      { label: "Salary range clearly stated", pass: true },
      { label: "Job type specified", pass: true },
      { label: "Location & remote policy clear", pass: true },
      { label: "No prohibited language detected", pass: true },
      { label: "Contact details absent from body", pass: true },
    ],
  },
  {
    id: 2, employer: "Arcane Dynamics", initials: "AD", title: "Cloud Architect", sector: "Tech",
    location: "Remote", salary: "£85,000–£110,000/yr", type: "Contract", remote: true, posted: "5h ago",
    status: "pending", compliance: 72,
    description: "Design and implement cloud infrastructure on AWS and Azure. Lead architecture reviews and mentor junior engineers. Must hold active AWS Solutions Architect or Azure Expert certifications. Security clearance advantageous.",
    flags: ["Salary not specified clearly"],
    complianceItems: [
      { label: "Salary range clearly stated", pass: false },
      { label: "Job type specified", pass: true },
      { label: "Location & remote policy clear", pass: true },
      { label: "No prohibited language detected", pass: true },
      { label: "Contact details absent from body", pass: true },
    ],
  },
  {
    id: 3, employer: "Swift Logistics", initials: "SL", title: "Operations Manager", sector: "Logistics",
    location: "Birmingham, UK", salary: "£45,000–£55,000/yr", type: "Permanent", remote: false, posted: "Yesterday",
    status: "approved", compliance: 91,
    description: "Manage end-to-end logistics operations for a national distribution network. Oversee fleet scheduling, warehouse teams, and supplier relationships. Experience with TMS software preferred.",
    flags: [],
    complianceItems: [
      { label: "Salary range clearly stated", pass: true },
      { label: "Job type specified", pass: true },
      { label: "Location & remote policy clear", pass: true },
      { label: "No prohibited language detected", pass: true },
      { label: "Contact details absent from body", pass: true },
    ],
  },
  {
    id: 4, employer: "Heritage Care Homes", initials: "HC", title: "Senior Care Assistant", sector: "Healthcare",
    location: "Bristol, UK", salary: "£14.50–£16/hr", type: "Full-time", remote: false, posted: "Yesterday",
    status: "pending", compliance: 45,
    description: "Provide high-quality care to elderly residents in a CQC-rated Outstanding care home. DBS required. Immediate start available. Experience in dementia care preferred.",
    flags: ["Missing compliance requirements", "DBS policy not detailed"],
    complianceItems: [
      { label: "Salary range clearly stated", pass: true },
      { label: "Job type specified", pass: true },
      { label: "Location & remote policy clear", pass: false },
      { label: "No prohibited language detected", pass: false },
      { label: "Contact details absent from body", pass: false },
    ],
  },
  {
    id: 5, employer: "BlueSky Hospitality", initials: "BH", title: "Hotel General Manager", sector: "Hospitality",
    location: "Edinburgh, UK", salary: "£60,000–£75,000/yr", type: "Permanent", remote: false, posted: "2d ago",
    status: "rejected", compliance: 38,
    description: "Oversee all hotel operations including staff management, revenue optimisation, and guest experience delivery. P&L responsibility for a 4-star property. Contact hr@bluesky.com to apply.",
    flags: ["Duplicate listing detected", "Contact details in description"],
    complianceItems: [
      { label: "Salary range clearly stated", pass: true },
      { label: "Job type specified", pass: true },
      { label: "Location & remote policy clear", pass: false },
      { label: "No prohibited language detected", pass: false },
      { label: "Contact details absent from body", pass: false },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ModerationStatus, string> = {
  pending:  "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-500",
  flagged:  "bg-orange-50 text-orange-600",
};

const STATUS_DOT: Record<ModerationStatus, string> = {
  pending:  "bg-amber-400",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  flagged:  "bg-orange-500",
};

function complianceColor(score: number) {
  if (score >= 85) return { text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" };
  if (score >= 65) return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" };
  return { text: "text-red-500", bg: "bg-red-50", bar: "bg-red-500" };
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({
  job,
  status,
  onApprove,
  onFlag,
  onReject,
}: {
  job: Job;
  status: ModerationStatus;
  onApprove: () => void;
  onFlag: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const c = complianceColor(job.compliance);
  const passCount = job.complianceItems.filter((i) => i.pass).length;

  return (
    <div className="flex-1 space-y-4">

      {/* Banner + header */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Banner gradient */}
        <div className="h-24 bg-gradient-to-r from-brand-blue/80 to-brand-blue relative flex items-end px-6 pb-3">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.08) 10px, rgba(255,255,255,.08) 11px)" }}
          />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-black">
              {job.initials}
            </div>
            <div>
              <p className="text-white text-xs font-semibold opacity-80">{job.employer}</p>
              <p className="text-white text-[11px] opacity-60">{job.sector}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-brand">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-1 bg-[#F7F8FA] text-brand text-[11px] font-semibold rounded-lg">{job.type}</span>
                {job.remote && (
                  <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue text-[11px] font-semibold rounded-lg">Remote Friendly</span>
                )}
                <span className="px-2.5 py-1 bg-[#F7F8FA] text-brand text-[11px] font-semibold rounded-lg flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75"/></svg>
                  {job.salary}
                </span>
                <span className="px-2.5 py-1 bg-[#F7F8FA] text-slate-500 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  {job.location}
                </span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${STATUS_STYLES[status]}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Analysis */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand">Compliance Analysis</h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.bg}`}>
            <span className={`text-sm font-black ${c.text}`}>{job.compliance}%</span>
            <span className={`text-[10px] font-semibold ${c.text}`}>{job.compliance >= 85 ? "Pass" : job.compliance >= 65 ? "Review" : "Fail"}</span>
          </div>
        </div>
        {/* Score bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
          <div className={`h-1.5 rounded-full transition-all ${c.bar}`} style={{ width: `${job.compliance}%` }} />
        </div>
        <ul className="space-y-2">
          {job.complianceItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              {item.pass ? (
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </span>
              )}
              <span className={item.pass ? "text-slate-600" : "text-amber-700 font-medium"}>{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-400 mt-3">{passCount} of {job.complianceItems.length} checks passed</p>
      </div>

      {/* Flags */}
      {job.flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h3 className="text-sm font-bold text-amber-700">Moderation Flags</h3>
          </div>
          <ul className="space-y-1.5">
            {job.flags.map((flag, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Job Description */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-brand mb-3">Job Description</h3>
        <p className={`text-sm text-slate-500 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
          {job.description}
        </p>
        <button onClick={() => setExpanded((v) => !v)} className="text-xs font-semibold text-brand-blue mt-2 hover:underline">
          {expanded ? "Show less" : "Read more"}
        </button>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <button
          onClick={onApprove}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors mb-3"
        >
          Approve Posting
        </button>
        <div className="flex gap-2">
          <button
            onClick={onFlag}
            className="flex-1 py-2.5 border border-gray-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Flag for Review
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-3">Posted {job.posted}</p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobModerationPage() {
  const [selected, setSelected] = useState<Job>(JOBS[0]);
  const [filter, setFilter] = useState<"all" | ModerationStatus>("pending");
  const [statuses, setStatuses] = useState<Record<number, ModerationStatus>>(
    Object.fromEntries(JOBS.map((j) => [j.id, j.status]))
  );

  const filtered = filter === "all" ? JOBS : JOBS.filter((j) => statuses[j.id] === filter);
  const pendingCount = Object.values(statuses).filter((s) => s === "pending").length;

  function approve(id: number) { setStatuses((prev) => ({ ...prev, [id]: "approved" })); }
  function flag(id: number)    { setStatuses((prev) => ({ ...prev, [id]: "flagged" })); }
  function reject(id: number)  { setStatuses((prev) => ({ ...prev, [id]: "rejected" })); }

  return (
    <main className="flex-1 px-8 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Job Moderation</h1>
          <p className="text-sm text-slate-400 mt-1">Review and approve employer job listings before they go live.</p>
        </div>
        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-xl">
          {pendingCount} Pending
        </span>
      </div>

      <div className="flex gap-5 items-start">

        {/* Left: list */}
        <div className="w-[340px] shrink-0 space-y-3" data-gsap="fade-up">
          {/* Filter */}
          <div className="bg-white border border-gray-100 rounded-xl p-1 flex gap-1">
            {(["all", "pending", "approved", "flagged", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                  filter === f ? "bg-brand-blue text-white" : "text-slate-500 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.map((job) => {
            const c = complianceColor(job.compliance);
            return (
              <div
                key={job.id}
                onClick={() => setSelected(job)}
                className={`w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-sm cursor-pointer ${
                  selected.id === job.id ? "border-brand-blue shadow-sm" : "border-gray-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar initials */}
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue text-xs font-black flex items-center justify-center shrink-0">
                    {job.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-brand leading-snug truncate">{job.title}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_STYLES[statuses[job.id]]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[statuses[job.id]]}`} />
                        {statuses[job.id].charAt(0).toUpperCase() + statuses[job.id].slice(1)}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-brand-blue">{job.employer}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400">{job.sector}</span>
                      <span className="text-slate-300 text-[10px]">·</span>
                      <span className="text-[10px] text-slate-400">{job.posted}</span>
                      {job.flags.length > 0 && (
                        <>
                          <span className="text-slate-300 text-[10px]">·</span>
                          <span className="text-[10px] text-amber-500 font-semibold">{job.flags.length} flag{job.flags.length > 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compliance score + inline actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-1 rounded-full ${c.bar}`} style={{ width: `${job.compliance}%` }} />
                    </div>
                    <span className={`text-[11px] font-bold ${c.text}`}>{job.compliance}%</span>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => approve(job.id)}
                      title="Approve"
                      className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </button>
                    <button
                      onClick={() => flag(job.id)}
                      title="Flag"
                      className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                    </button>
                    <button
                      onClick={() => reject(job.id)}
                      title="Reject"
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: detail panel */}
        <DetailPanel
          key={selected.id}
          job={selected}
          status={statuses[selected.id]}
          onApprove={() => approve(selected.id)}
          onFlag={() => flag(selected.id)}
          onReject={() => reject(selected.id)}
        />
      </div>
    </main>
  );
}
