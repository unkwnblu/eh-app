"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployerData {
  company_name: string;
  company_website: string | null;
  registered_address: string | null;
  incorporation_date: string | null;
  industries: string[];
  cqc_provider_id: string | null;
  dbs_level: string | null;
  modern_slavery_act: boolean;
  employer_liability_insurance: boolean;
  healthcare_compliance_status: string;
}

interface Job {
  id: string;
  title: string;
  location: string | null;
  status: "draft" | "review" | "live" | "closed";
  closesAt: string | null;
  hiredCount: number;
  applicantsCount: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function cityFromAddress(address: string | null): string {
  if (!address) return "—";
  // Return text up to the first comma or newline, trimmed
  return address.split(/[,\n]/)[0].trim();
}

function yearFromDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? null : String(year);
}

function daysLeft(closesAt: string | null): number | null {
  if (!closesAt) return null;
  const diff = new Date(closesAt).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function StatIcon({ type }: { type: string }) {
  if (type === "briefcase") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
  if (type === "users") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
  if (type === "inbox") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function statusChip(status: string) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Verified
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-50 text-slate-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
      Not Set
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EmployerProfilePage() {
  const [employer, setEmployer]   = useState<EmployerData | null>(null);
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [ehId, setEhId]           = useState<string | null>(null);
  const [verified, setVerified]   = useState(false);
  const [logoUrl, setLogoUrl]     = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    document.title = "Company Profile | Edge Harbour";

    Promise.all([
      fetch("/api/employer/settings").then((r) => r.ok ? r.json() : null),
      fetch("/api/employer/jobs").then((r) => r.ok ? r.json() : null),
      fetch("/api/employer/logo").then((r) => r.ok ? r.json() : null),
    ]).then(([settingsData, jobsData, logoData]) => {
      if (settingsData) {
        setEmployer(settingsData.employer as EmployerData);
        setEhId(settingsData.ehId ?? null);
        setVerified(settingsData.verificationStatus === "verified");
      }
      if (jobsData?.jobs) {
        setJobs(jobsData.jobs as Job[]);
      }
      if (logoData?.url) {
        setLogoUrl(logoData.url);
      }
    }).finally(() => setLoading(false));
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const name       = employer?.company_name ?? "—";
  const initials   = employer ? getInitials(employer.company_name) : "—";
  const industry   = employer?.industries?.length ? employer.industries.join(" & ") : null;
  const location   = cityFromAddress(employer?.registered_address ?? null);
  const website    = employer?.company_website ?? null;
  const foundedYear = yearFromDate(employer?.incorporation_date ?? null);

  const liveJobs       = jobs.filter((j) => j.status === "live");
  const activeListings = liveJobs.length;
  const totalHires     = jobs.reduce((s, j) => s + j.hiredCount, 0);
  const totalApplicants = jobs.reduce((s, j) => s + j.applicantsCount, 0);

  // Top 3 live jobs by closest closing date
  const topJobs = [...liveJobs]
    .sort((a, b) => {
      if (!a.closesAt) return 1;
      if (!b.closesAt) return -1;
      return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
    })
    .slice(0, 3);

  // Build compliance items from real data
  const complianceItems: { label: string; subtext: string; status: string }[] = [];
  if (employer) {
    const industries = employer.industries ?? [];
    if (industries.includes("Healthcare")) {
      const hcs = employer.healthcare_compliance_status;
      const hcsStatus = hcs === "verified" ? "verified" : hcs === "pending" ? "pending" : "not_set";
      complianceItems.push({
        label:   "CQC Provider ID",
        subtext: employer.cqc_provider_id ? `ID: ${employer.cqc_provider_id}` : "Not submitted",
        status:  hcsStatus,
      });
      complianceItems.push({
        label:   "DBS Level",
        subtext: employer.dbs_level ? `Level: ${employer.dbs_level}` : "Not submitted",
        status:  hcsStatus,
      });
    }
    if (industries.includes("Hospitality")) {
      complianceItems.push({
        label:   "Modern Slavery Act",
        subtext: employer.modern_slavery_act ? "Policy confirmed" : "Not confirmed",
        status:  employer.modern_slavery_act ? "verified" : "pending",
      });
      complianceItems.push({
        label:   "Employer Liability Insurance",
        subtext: employer.employer_liability_insurance ? "Insurance confirmed" : "Not confirmed",
        status:  employer.employer_liability_insurance ? "verified" : "pending",
      });
    }
  }

  const stats = [
    { label: "Active Listings",    value: String(activeListings),  icon: "briefcase" },
    { label: "Total Hires",        value: String(totalHires),       icon: "users"     },
    { label: "Total Applications", value: String(totalApplicants),  icon: "inbox"     },
    { label: "Open Roles",         value: String(liveJobs.length),  icon: "shield"    },
  ];

  // ── Skeleton helper ──────────────────────────────────────────────────────────
  const Bone = ({ className }: { className: string }) => (
    <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
  );

  return (
    <main className="flex-1 px-8 py-8">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-center justify-between mb-6" data-gsap="fade-down">
        <div>
          {loading ? (
            <>
              <Bone className="h-8 w-48 mb-2" />
              <Bone className="h-4 w-64 bg-gray-100" />
            </>
          ) : (
            <>
              <h1 className="text-[28px] font-black text-brand tracking-tight">Company Profile</h1>
              <p className="text-sm text-slate-400 mt-1">How candidates see your organisation</p>
            </>
          )}
        </div>
        <Link
          href="/dashboard/employer/settings"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          Edit Profile
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6" data-gsap="fade-up">
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center text-brand text-2xl font-black shrink-0 border border-gray-100 overflow-hidden">
            {loading
              ? <Bone className="w-full h-full rounded-2xl" />
              : logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logoUrl} alt="Company logo" className="w-full h-full object-contain" />
              : initials
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <>
                <Bone className="h-6 w-48 mb-2" />
                <Bone className="h-3 w-32 bg-gray-100 mb-3" />
                <div className="flex gap-3">
                  <Bone className="h-3 w-20 bg-gray-100" />
                  <Bone className="h-3 w-24 bg-gray-100" />
                  <Bone className="h-3 w-20 bg-gray-100" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-black text-brand">{name}</h2>
                  {verified && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wide rounded-full">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified Employer
                    </span>
                  )}
                </div>

                {ehId && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">{ehId}</span>
                  </div>
                )}

                {industry && (
                  <p className="text-sm font-semibold text-slate-500 mb-3">{industry}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {location && location !== "—" && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {location}
                    </span>
                  )}
                  {website && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                      </svg>
                      {website.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                  {foundedYear && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Founded {foundedYear}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6" data-gsap="fade-up">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <StatIcon type={stat.icon} />
            </div>
            <div>
              {loading
                ? <Bone className="h-6 w-10 mb-1" />
                : <p className="text-xl font-black text-brand leading-none">{stat.value}</p>
              }
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active listings */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-brand">Active Job Listings</h3>
              <Link href="/dashboard/employer/jobs" className="text-xs font-semibold text-brand-blue hover:underline">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Bone className="h-4 w-40 mb-1.5" />
                      <Bone className="h-3 w-28 bg-gray-100" />
                    </div>
                    <Bone className="h-6 w-14 bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : topJobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 font-medium">No active job listings</p>
                <Link href="/dashboard/employer/jobs" className="text-xs text-brand-blue font-semibold hover:underline mt-1 inline-block">
                  Create your first job →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topJobs.map((job) => {
                  const dl = daysLeft(job.closesAt);
                  return (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-brand">{job.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.location ?? "—"}
                          {job.applicantsCount > 0 && ` · ${job.applicantsCount} applicant${job.applicantsCount !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <div className="text-right">
                        {dl !== null ? (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${dl <= 3 ? "bg-red-50 text-red-600" : "bg-brand-blue/10 text-brand-blue"}`}>
                            {dl <= 0 ? "Closing today" : `${dl}d left`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-slate-400">
                            No deadline
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Compliance */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Compliance Status</h3>

            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <Bone className="h-3 w-32 mb-1.5" />
                      <Bone className="h-2.5 w-20 bg-gray-100" />
                    </div>
                    <Bone className="h-5 w-16 bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : complianceItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 leading-relaxed">
                  No compliance requirements for your current industries.
                </p>
                <Link href="/dashboard/employer/settings" className="text-xs font-semibold text-brand-blue hover:underline mt-2 inline-block">
                  Update industries →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {complianceItems.map((doc) => (
                  <div key={doc.label} className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">{doc.label}</p>
                      <p className="text-[11px] text-slate-400">{doc.subtext}</p>
                    </div>
                    {statusChip(doc.status)}
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/dashboard/employer/settings"
              className="block w-full mt-4 text-center text-xs font-semibold text-brand-blue hover:underline"
            >
              Manage documents →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
