import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { createServiceClient } from "@/lib/supabase/service";
import { toJobSlug } from "./[slug]/utils";

// ─── Metadata ─────────────────────────────────────────────────────────────────

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

export const metadata: Metadata = {
  title: "Browse Live Jobs – Healthcare, Hospitality, Tech & More",
  description:
    "Browse live, compliance-verified job opportunities across the UK. Healthcare, Hospitality, Customer Service, and Tech roles — posted by approved Edge Harbour employers.",
  keywords: [
    "jobs UK",
    "healthcare jobs UK",
    "hospitality jobs UK",
    "tech jobs UK",
    "customer service jobs UK",
    "live job vacancies UK",
    "Edge Harbour jobs",
    "compliance jobs UK",
  ],
  openGraph: {
    title: "Browse Live Jobs – Edge Harbour",
    description:
      "Browse compliance-verified UK job opportunities across Healthcare, Hospitality, Customer Service, and Tech.",
    url: "/jobs",
    type: "website",
  },
  twitter: {
    title: "Browse Live Jobs – Edge Harbour",
    description:
      "Compliance-verified UK job opportunities across Healthcare, Hospitality, Customer Service, and Tech.",
  },
  alternates: { canonical: "/jobs" },
  robots: { index: true, follow: true },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type JobListing = {
  id: string;
  title: string;
  company: string;
  sector: string;
  location: string;
  remote: boolean;
  type: string;
  salary: string | null;
  posted: string;
  slug: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTORS = ["Healthcare", "Hospitality", "Customer Service", "Tech & Data"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];

const SECTOR_ICONS: Record<string, string> = {
  Healthcare: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  Hospitality: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.254 1.837 2.445V21M3 19.125v-1.557c0-1.191.767-2.285 1.837-2.445A48.507 48.507 0 016 15.12",
  "Customer Service": "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  "Tech & Data": "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
};

async function fetchJobs(sector?: string, type?: string): Promise<JobListing[]> {
  const service = createServiceClient();

  let query = service
    .from("jobs")
    .select("id, title, sector, employment_type, location, remote, salary_min, salary_max, live_salary_min, live_salary_max, created_at, employer_id")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(50);

  if (sector) query = query.eq("sector", sector);
  if (type) query = query.eq("employment_type", type);

  const { data: jobs } = await query;
  if (!jobs?.length) return [];

  const employerIds = [...new Set(jobs.map((j) => j.employer_id))];
  const { data: employers } = await service
    .from("employers")
    .select("id, company_name")
    .in("id", employerIds);

  const employerMap = new Map((employers ?? []).map((e) => [e.id, e.company_name]));

  return jobs.map((job) => {
    const displayMin = job.live_salary_min ?? job.salary_min;
    const displayMax = job.live_salary_max ?? job.salary_max;
    return {
      id: job.id,
      title: job.title,
      company: employerMap.get(job.employer_id) ?? "Employer",
      sector: job.sector,
      location: job.location,
      remote: job.remote,
      type: job.employment_type,
      salary: formatSalary(displayMin, displayMax),
      posted: relativeTime(job.created_at),
      slug: toJobSlug(job.title, job.id),
    };
  });
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: JobListing }) {
  const initials = job.company
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group bg-white dark:bg-[#111827] border border-gray-border dark:border-white/10 rounded-2xl p-5 hover:border-brand-blue/40 hover:shadow-md transition-all flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Company avatar */}
        <div className="w-10 h-10 rounded-xl bg-brand/5 dark:bg-white/10 border border-gray-border dark:border-white/10 flex items-center justify-center text-brand dark:text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-brand dark:text-white group-hover:text-brand-blue transition-colors leading-snug truncate">
            {job.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{job.company}</p>
        </div>

        {/* Sector icon */}
        <div className="w-8 h-8 rounded-lg bg-brand-blue/8 flex items-center justify-center text-brand-blue flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d={SECTOR_ICONS[job.sector] ?? SECTOR_ICONS["Tech & Data"]} />
          </svg>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-brand-blue/8 text-brand-blue rounded-full px-2 py-0.5">
          {job.sector}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-soft dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5 border border-gray-border dark:border-white/10">
          {job.type}
        </span>
        {job.remote && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5">
            Remote
          </span>
        )}
      </div>

      {/* Location + salary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 min-w-0">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="truncate">{job.location}</span>
        </div>
        {job.salary && (
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap flex-shrink-0">
            {job.salary}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-border dark:border-white/10 pt-3 mt-auto">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{job.posted}</span>
        <span className="text-[10px] font-semibold text-brand-blue group-hover:underline">
          View role →
        </span>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; type?: string }>;
}) {
  const { sector, type } = await searchParams;
  const jobs = await fetchJobs(sector, type);

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        {/* Page header */}
        <div className="bg-gray-soft dark:bg-[#0B1222] border-b border-gray-border dark:border-white/10 py-14">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div data-gsap="fade-up" className="max-w-2xl">
              <p className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-3">
                Live Roles
              </p>
              <h1 className="text-brand dark:text-white font-black text-4xl lg:text-5xl tracking-tight mb-4">
                Browse open positions.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                Every role is posted by an approved UK employer.{" "}
                <Link href="/auth/candidate/register" className="text-brand-blue hover:underline font-semibold">
                  Register free
                </Link>{" "}
                to apply with your verified profile.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-border dark:border-white/10 bg-white dark:bg-[#111827]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
            <form method="GET" className="flex flex-wrap items-center gap-3">
              {/* Sector filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Sector:
                </span>
                <Link
                  href={type ? `/jobs?type=${type}` : "/jobs"}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    !sector
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-gray-border dark:border-white/10 hover:border-brand-blue/40"
                  }`}
                >
                  All
                </Link>
                {SECTORS.map((s) => (
                  <Link
                    key={s}
                    href={`/jobs?sector=${encodeURIComponent(s)}${type ? `&type=${encodeURIComponent(type)}` : ""}`}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      sector === s
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-gray-border dark:border-white/10 hover:border-brand-blue/40"
                    }`}
                  >
                    {s}
                  </Link>
                ))}
              </div>

              <div className="w-px h-5 bg-gray-border dark:bg-white/10 hidden sm:block" />

              {/* Type filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Type:
                </span>
                <Link
                  href={sector ? `/jobs?sector=${encodeURIComponent(sector)}` : "/jobs"}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    !type
                      ? "bg-brand text-white border-brand"
                      : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-gray-border dark:border-white/10 hover:border-brand-blue/40"
                  }`}
                >
                  All
                </Link>
                {JOB_TYPES.map((t) => (
                  <Link
                    key={t}
                    href={`/jobs?${sector ? `sector=${encodeURIComponent(sector)}&` : ""}type=${encodeURIComponent(t)}`}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      type === t
                        ? "bg-brand text-white border-brand"
                        : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-gray-border dark:border-white/10 hover:border-brand-blue/40"
                    }`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Job listings */}
        <div className="flex-1 bg-gray-soft dark:bg-[#0B1222]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            {jobs.length === 0 ? (
              <div data-gsap="fade-up" className="text-center py-24">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/8 flex items-center justify-center text-brand-blue mx-auto mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-brand dark:text-white font-bold text-lg mb-2">
                  No roles match those filters
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Try a different sector or job type, or{" "}
                  <Link href="/jobs" className="text-brand-blue hover:underline">
                    view all roles
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <p data-gsap="fade-up" className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                  {jobs.length} {jobs.length === 1 ? "role" : "roles"} available
                  {sector ? ` in ${sector}` : ""}
                  {type ? ` · ${type}` : ""}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <div key={job.id} data-gsap="stagger-item">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Register CTA banner */}
        <div className="bg-brand-blue py-10">
          <div
            data-gsap="fade-up"
            className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div>
              <p className="text-white font-bold text-lg">Ready to apply?</p>
              <p className="text-white/70 text-sm mt-1">
                Register free to apply with your verified profile — no CV required.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/auth/candidate/register"
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold text-sm rounded-full px-6 py-3 hover:bg-white/90 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Register Free
              </Link>
              <Link
                href="/auth/candidate/login"
                className="text-white/80 hover:text-white text-sm font-semibold transition-colors"
              >
                Already registered? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
