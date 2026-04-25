import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { toJobSlug } from "@/app/jobs/[slug]/utils";

// ─── Sector styling ───────────────────────────────────────────────────────────

const sectorColors: Record<string, string> = {
  Healthcare:         "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Hospitality:        "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Customer Service": "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "Tech & Data":      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
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
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function isUrgent(closesAt: string | null): boolean {
  if (!closesAt) return false;
  return (new Date(closesAt).getTime() - Date.now()) < 3 * 86_400_000;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-full px-2 py-0.5">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      RTW Verified
    </span>
  );
}

function SectorIcon({ sector }: { sector: string }) {
  const cls = `${sectorColors[sector]?.split(" ")[1] ?? "text-slate-500"}`;
  if (sector === "Healthcare") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
  if (sector === "Hospitality") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 13.5v5.25m-6-5.25v5.25M3 13.5h18M3 18.75h18" />
    </svg>
  );
  if (sector === "Tech & Data") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
  // Customer Service / default
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

type JobRow = {
  id: string;
  title: string;
  sector: string;
  employment_type: string;
  location: string;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  live_salary_min: number | null;
  live_salary_max: number | null;
  closes_at: string | null;
  created_at: string;
  employer_id: string;
  company: string;
};

async function fetchLatestJobs(): Promise<JobRow[]> {
  try {
    const service = createServiceClient();

    const { data: jobs } = await service
      .from("jobs")
      .select(
        "id, title, sector, employment_type, location, remote, salary_min, salary_max, live_salary_min, live_salary_max, closes_at, created_at, employer_id"
      )
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!jobs?.length) return [];

    const employerIds = [...new Set(jobs.map((j) => j.employer_id))];
    const { data: employers } = await service
      .from("employers")
      .select("id, company_name")
      .in("id", employerIds);

    const employerMap = new Map(
      (employers ?? []).map((e) => [e.id, e.company_name])
    );

    return jobs.map((job) => ({
      ...job,
      company: employerMap.get(job.employer_id) ?? "Employer",
    }));
  } catch {
    return [];
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default async function JobPostings() {
  const jobs = await fetchLatestJobs();

  return (
    <section className="w-full bg-gray-soft dark:bg-[#0B1222] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="mb-12">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Live Opportunities
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand dark:text-white leading-tight">
            Latest job postings.
          </h2>
        </div>

        {/* Job cards or empty state */}
        {jobs.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Skeleton placeholders while empty */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111827] border border-gray-border dark:border-white/10 rounded-2xl p-6 flex flex-col gap-3 opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gray-border dark:bg-white/10 animate-pulse" />
                  <div className="w-20 h-5 rounded-full bg-gray-border dark:bg-white/10 animate-pulse" />
                </div>
                <div className="w-3/4 h-4 rounded bg-gray-border dark:bg-white/10 animate-pulse" />
                <div className="w-1/2 h-3 rounded bg-gray-border dark:bg-white/10 animate-pulse" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 rounded-full bg-gray-border dark:bg-white/10 animate-pulse" />
                  <div className="w-16 h-5 rounded-full bg-gray-border dark:bg-white/10 animate-pulse" />
                </div>
                <div className="pt-4 border-t border-gray-border dark:border-white/10 flex justify-between">
                  <div className="w-24 h-4 rounded bg-gray-border dark:bg-white/10 animate-pulse" />
                  <div className="w-12 h-3 rounded bg-gray-border dark:bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const displayMin = job.live_salary_min ?? job.salary_min;
              const displayMax = job.live_salary_max ?? job.salary_max;
              const salary     = formatSalary(displayMin, displayMax);
              const urgent     = isUrgent(job.closes_at);
              const slug       = toJobSlug(job.title, job.id);

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${slug}`}
                  data-gsap="stagger-item"
                  className="group bg-white dark:bg-[#111827] border border-gray-border dark:border-white/10 rounded-2xl p-6 hover:border-brand-blue/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${sectorColors[job.sector] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        <SectorIcon sector={job.sector} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {urgent && (
                          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-full px-2 py-0.5">
                            Closing soon
                          </span>
                        )}
                        <VerifiedBadge />
                      </div>
                    </div>

                    {/* Title & company */}
                    <h3 className="text-sm font-bold text-brand dark:text-white group-hover:text-brand-blue transition-colors leading-snug mb-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{job.company}</p>

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-1 ${sectorColors[job.sector] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {job.sector}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-1">
                        {job.employment_type}
                      </span>
                      {job.remote && (
                        <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-1">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="pt-4 border-t border-gray-border dark:border-white/10 flex items-center justify-between">
                    <div>
                      {salary ? (
                        <p className="text-sm font-bold text-brand dark:text-white">{salary}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Salary on application</p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-[10px]">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px]">{relativeTime(job.created_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA strip */}
        <div data-gsap="fade-up" className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand rounded-2xl px-8 py-6">
          <div>
            <p className="text-white font-bold text-base">Looking for something specific?</p>
            <p className="text-white/60 text-sm mt-0.5">
              Browse live roles across all UK sectors — new positions added daily.
            </p>
          </div>
          <Link
            href="/jobs"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-brand font-semibold text-sm rounded-full px-6 py-3 hover:bg-gray-soft transition-colors"
          >
            View All Jobs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
