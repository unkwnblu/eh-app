"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Share button ──────────────────────────────────────────────────────────────

function toJobSlug(title: string, id: string): string {
  const titlePart = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${titlePart}-${id}`;
}

function ShareButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/jobs/${toJobSlug(jobTitle, jobId)}`;
    if (navigator.share) {
      navigator.share({ title: document.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Share this job"
      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-slate-500 text-sm font-semibold rounded-xl hover:border-brand-blue hover:text-brand-blue transition-colors"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      )}
    </button>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type JobDetail = {
  id: string;
  title: string;
  employerId: string;
  company: string;
  companyWebsite: string | null;
  companyIndustries: string[];
  companyLogoUrl: string | null;
  sector: string;
  location: string;
  remote: boolean;
  salary: string | null;
  type: string;
  experienceLevel: string | null;
  description: string | null;
  responsibilities: string | null;
  requiredCertifications: string[];
  closesAt: string | null;
  posted: string;
};

type SimilarJob = {
  id: string;
  title: string;
  company: string;
  salary: string | null;
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 animate-pulse">
      <div className="h-5 w-28 bg-gray-200 rounded mb-5" />
      <div className="flex flex-col md:flex-row gap-5 items-start">
        <div className="flex-1 space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0,1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            {[0,1,2,3,4,5].map((i) => <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${80 - i * 5}%` }} />)}
          </div>
        </div>
        <div className="w-full md:w-[260px] space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 h-36" />
          <div className="bg-white border border-gray-100 rounded-2xl p-5 h-40" />
        </div>
      </div>
    </main>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [job,             setJob]             = useState<JobDetail | null>(null);
  const [similarJobs,     setSimilarJobs]     = useState<SimilarJob[]>([]);
  const [candidateStatus, setCandidateStatus] = useState<string>("active");
  const [hasApplied,      setHasApplied]      = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);

  // Apply state
  const [applying,     setApplying]     = useState(false);
  const [applyError,   setApplyError]   = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidate/jobs/${id}`);
      if (res.status === 404) { router.replace("/dashboard/candidate/jobs"); return; }
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { job: JobDetail; similarJobs: SimilarJob[]; candidateStatus: string; hasApplied: boolean };
      setJob(data.job);
      setSimilarJobs(data.similarJobs);
      setCandidateStatus(data.candidateStatus ?? "active");
      setHasApplied(data.hasApplied ?? false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  // ── Apply handler ──────────────────────────────────────────────────────────
  async function handleApply() {
    if (!job || applying || hasApplied) return;
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch("/api/candidate/applications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ jobId: job.id }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to apply");
      setHasApplied(true);
      setApplySuccess(true);
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  const isClosingSoon = job?.closesAt
    ? (new Date(job.closesAt).getTime() - Date.now()) < 7 * 86_400_000
    : false;

  // Company initials for the avatar
  const companyInitials = (job?.company ?? "")
    .split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");

  if (loading) return <Skeleton />;

  if (error || !job) return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-bold text-brand">{error ?? "Job not found"}</p>
        <Link href="/dashboard/candidate/jobs" className="text-sm font-semibold text-brand-blue underline">
          Back to listings
        </Link>
      </div>
    </main>
  );

  // Parse responsibilities into a list if it's a block of text
  const responsibilityLines = job.responsibilities
    ? job.responsibilities.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">

        {/* Back */}
        <Link
          href="/dashboard/candidate/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-5"
          data-gsap="fade-down"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Search
        </Link>

        {/* Resubmission banner */}
        {candidateStatus === "resubmission" && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-800">Applications paused — documents under review</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You recently uploaded a document. Once our team verifies it (usually within 24 hours) you&apos;ll be able to apply.{" "}
                <Link href="/dashboard/candidate/legal" className="font-bold underline">View status →</Link>
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5 items-start">

          {/* ── Left: main content ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Hero card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-black text-brand tracking-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {job.location}
                    </span>
                    {job.remote && (
                      <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full text-[11px] font-bold">
                        Remote Friendly
                      </span>
                    )}
                    {isClosingSoon && (
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-[11px] font-bold">
                        Closing Soon
                      </span>
                    )}
                  </div>
                </div>
                {candidateStatus === "resubmission" ? (
                  <div className="shrink-0 flex items-center gap-2">
                    <ShareButton jobId={job.id} jobTitle={job.title} />
                    <div className="text-right">
                      <span className="block px-6 py-2.5 bg-gray-100 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed select-none">
                        Apply Now
                      </span>
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">Docs under review</p>
                    </div>
                  </div>
                ) : hasApplied ? (
                  <div className="shrink-0 flex items-center gap-2">
                    <ShareButton jobId={job.id} jobTitle={job.title} />
                    <div className="text-right">
                      <span className="flex items-center gap-2 px-6 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl select-none">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Applied
                      </span>
                      {applySuccess && (
                        <p className="text-[10px] text-green-600 font-semibold mt-1">Application submitted!</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-2">
                    <ShareButton jobId={job.id} jobTitle={job.title} />
                    <div className="text-right">
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity shadow-sm"
                      >
                        {applying ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Applying…
                          </>
                        ) : "Apply Now"}
                      </button>
                      {applyError && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1 max-w-[180px] text-right">{applyError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Salary",
                    value: job.salary ?? "Not specified",
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>,
                  },
                  {
                    label: "Type",
                    value: job.type,
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
                  },
                  {
                    label: "Closes",
                    value: job.closesAt
                      ? new Date(job.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "Open-ended",
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>,
                  },
                  {
                    label: "Experience",
                    value: job.experienceLevel ?? "Any level",
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    {item.icon}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                      <p className="text-sm font-semibold text-brand mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description + responsibilities */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6" data-gsap="fade-up">

              {job.description && (
                <div>
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                    <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                    Job Description
                  </h2>
                  {job.description.split("\n").filter(Boolean).map((para, i) => (
                    <p key={i} className="text-sm text-slate-500 leading-relaxed mb-3 last:mb-0">{para}</p>
                  ))}
                </div>
              )}

              {responsibilityLines.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                    <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                    Responsibilities
                  </h2>
                  <ul className="space-y-2">
                    {responsibilityLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requiredCertifications.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                    <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
                    Required Certifications
                  </h2>
                  <ul className="space-y-2">
                    {job.requiredCertifications.map((cert, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-500">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!job.description && responsibilityLines.length === 0 && job.requiredCertifications.length === 0 && (
                <p className="text-sm text-slate-400 italic">No additional details provided for this role.</p>
              )}
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="w-full md:w-[260px] md:shrink-0 space-y-4">

            {/* Company card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
              <div className="flex items-center gap-3 mb-4">
                {/* Logo or initials */}
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                  {job.companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.companyLogoUrl} alt={`${job.company} logo`} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-sm font-black text-brand-blue">{companyInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{job.company}</p>
                  {job.companyIndustries.length > 0 && (
                    <p className="text-xs text-slate-400 truncate">{job.companyIndustries.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {/* View Company Profile */}
                <Link
                  href={`/dashboard/candidate/companies/${job.employerId}`}
                  className="w-full bg-brand-blue text-white text-sm font-semibold rounded-xl py-2 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  View Company Profile
                </Link>

                {/* Visit Website */}
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite.startsWith("http") ? job.companyWebsite : `https://${job.companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-gray-200 text-slate-500 text-sm font-semibold rounded-xl py-2 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center gap-1.5"
                  >
                    Visit Website
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Required certifications checklist */}
            {job.requiredCertifications.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <h3 className="text-sm font-bold text-brand">Compliance Checklist</h3>
                </div>
                <div className="space-y-2">
                  {job.requiredCertifications.map((cert) => (
                    <div key={cert} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-600">{cert}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  These certifications are required. Ensure yours are up to date before applying.
                </p>
              </div>
            )}

            {/* Similar roles */}
            {similarJobs.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
                <h3 className="text-sm font-bold text-brand mb-3">Similar Roles</h3>
                <div className="space-y-2">
                  {similarJobs.map((role) => (
                    <Link
                      key={role.id}
                      href={`/dashboard/candidate/jobs/${role.id}`}
                      className="block w-full text-left px-3 py-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <p className="text-sm font-semibold text-brand group-hover:text-brand-blue transition-colors">{role.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {role.company}{role.salary ? ` • ${role.salary}` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posted */}
            <p className="text-center text-xs text-slate-400">Posted {job.posted}</p>
          </div>
        </div>
      </main>
    </>
  );
}
