"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  website: string | null;
  address: string | null;
  incorporationDate: string | null;
  industries: string[];
  logoUrl: string | null;
  isVerified: boolean;
}

interface Job {
  id: string;
  title: string;
  sector: string;
  employmentType: string;
  location: string;
  salary: string | null;
  daysLeft: number | null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 animate-pulse">
      <div className="h-5 w-28 bg-gray-200 rounded mb-5" />
      <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-5">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="flex gap-3">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[0,1,2,3].map((i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl h-20" />)}
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/candidate/companies/${id}`);
      if (res.status === 404) { router.replace("/dashboard/candidate/jobs"); return; }
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? "Failed to load");
      const data = await res.json() as { company: Company; jobs: Job[] };
      setCompany(data.company);
      setJobs(data.jobs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (company) document.title = `${company.name} | Edge Harbour`;
  }, [company]);

  if (loading) return <Skeleton />;

  if (error || !company) return (
    <main className="flex-1 flex items-center justify-center px-8">
      <div className="text-center space-y-3">
        <p className="font-bold text-brand">{error ?? "Company not found"}</p>
        <Link href="/dashboard/candidate/jobs" className="text-sm font-semibold text-brand-blue underline">
          Back to jobs
        </Link>
      </div>
    </main>
  );

  const initials = company.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const city     = company.address ? company.address.split(/[,\n]/)[0].trim() : null;
  const founded  = company.incorporationDate ? new Date(company.incorporationDate).getFullYear() : null;

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
          Back to Jobs
        </Link>

        {/* Hero card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-5" data-gsap="fade-up">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={`${company.name} logo`} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-black text-brand/50">{initials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-black text-brand">{company.name}</h1>
                {company.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wide rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified Employer
                  </span>
                )}
              </div>

              {company.industries.length > 0 && (
                <p className="text-sm font-semibold text-slate-500 mb-2">{company.industries.join(" & ")}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                {city && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {city}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-brand-blue transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
                    </svg>
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {founded && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Founded {founded}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active jobs */}
        <div data-gsap="fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-brand">
              Open Positions
              {jobs.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-slate-400">({jobs.length})</span>
              )}
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-500">No open positions right now</p>
              <p className="text-xs text-slate-400 mt-1">Check back later or browse other companies.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/candidate/jobs/${job.id}`}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-blue/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand group-hover:text-brand-blue transition-colors truncate">{job.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{job.sector} · {job.employmentType}</p>
                    </div>
                    {job.daysLeft !== null && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        job.daysLeft <= 3 ? "bg-red-50 text-red-600" : "bg-brand-blue/10 text-brand-blue"
                      }`}>
                        {job.daysLeft <= 0 ? "Closing today" : `${job.daysLeft}d left`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                        </svg>
                        {job.salary}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
