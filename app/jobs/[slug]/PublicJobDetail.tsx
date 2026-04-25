"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { toJobSlug } from "./utils";
import type { PublicJob } from "./page";

// ─── Share Button ──────────────────────────────────────────────────────────────

function ShareButton({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    return `${window.location.origin}/jobs/${toJobSlug(jobTitle, jobId)}`;
  }

  function handleShare() {
    const url = getShareUrl();
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
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-brand-blue hover:text-brand-blue transition-colors"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PublicJobDetail({ job }: { job: PublicJob }) {
  // Resolved after mount to avoid SSR/client hydration mismatch
  const [siteOrigin, setSiteOrigin] = useState("");
  useEffect(() => { setSiteOrigin(window.location.origin); }, []);

  const isClosingSoon = job.closesAt
    ? (new Date(job.closesAt).getTime() - Date.now()) < 7 * 86_400_000
    : false;

  const isExpired = job.closesAt
    ? new Date(job.closesAt).getTime() < Date.now()
    : false;

  const companyInitials = job.company
    .split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");

  const responsibilityLines = job.responsibilities
    ? job.responsibilities.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  const applyUrl    = `/dashboard/candidate/jobs/${job.id}`;
  const slugUrl     = siteOrigin ? `${siteOrigin}/jobs/${toJobSlug(job.title, job.id)}` : "";
  const linkedInUrl = slugUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(slugUrl)}`
    : "#";
  const whatsAppUrl = slugUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company} – ${slugUrl}`)}`
    : "#";

  return (
    <>
      <GsapAnimations />
      <Navbar />

      <main id="main-content" className="flex-1 bg-[#F7F8FA] min-h-screen">

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5" data-gsap="fade-up">

              {/* Company avatar + title */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black text-brand-blue">{companyInitials}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-brand tracking-tight leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
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
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Posted {job.posted}
                    </span>
                    {job.remote && (
                      <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full text-[11px] font-bold">
                        Remote Friendly
                      </span>
                    )}
                    {isExpired ? (
                      <span className="px-2.5 py-0.5 bg-gray-100 text-slate-400 border border-gray-200 rounded-full text-[11px] font-bold">
                        Position Closed
                      </span>
                    ) : isClosingSoon && (
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full text-[11px] font-bold">
                        Closing Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <ShareButton jobTitle={job.title} jobId={job.id} />
                {isExpired ? (
                  <span className="px-6 py-2.5 bg-gray-100 text-slate-400 text-sm font-bold rounded-xl cursor-not-allowed select-none">
                    Closed
                  </span>
                ) : (
                  <Link
                    href={applyUrl}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Apply Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-5" data-gsap="fade-up">
              {[
                {
                  label: "Salary",
                  value: job.salary ?? "Not specified",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                    </svg>
                  ),
                },
                {
                  label: "Job Type",
                  value: job.type,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  ),
                },
                {
                  label: "Closes",
                  value: job.closesAt
                    ? new Date(job.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "Open-ended",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  ),
                },
                {
                  label: "Experience",
                  value: job.experienceLevel ?? "Any level",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
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
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* ── Left: full description ──────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-5">

              {job.description && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                    Job Description
                  </h2>
                  <div className="space-y-3">
                    {job.description.split("\n").filter(Boolean).map((para, i) => (
                      <p key={i} className="text-sm text-slate-500 leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {responsibilityLines.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                    Responsibilities
                  </h2>
                  <ul className="space-y-2.5">
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
                <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
                  <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
                    Required Certifications
                  </h2>
                  <ul className="space-y-2.5">
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
            </div>

            {/* ── Right: sidebar ──────────────────────────────────────────── */}
            <div className="w-full md:w-[260px] space-y-4" data-gsap="fade-up">

              {/* Apply card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Ready to apply?</p>
                {isExpired ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-400 font-semibold">This position is closed.</p>
                  </div>
                ) : (
                  <>
                    <Link
                      href={applyUrl}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Apply Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed">
                      You&apos;ll need an Edge Harbour account to apply. It&apos;s free and takes 2 minutes.
                    </p>
                  </>
                )}
              </div>

              {/* Share card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Share this role</p>
                <ShareButton jobTitle={job.title} jobId={job.id} />
                <div className="mt-3 flex gap-2">
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-bold rounded-xl hover:bg-[#0A66C2]/20 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#25D366]/10 text-[#25D366] text-xs font-bold rounded-xl hover:bg-[#25D366]/20 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* About the company */}
              {(job.companyWebsite || job.companyIndustries.length > 0) && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">About {job.company}</p>
                  {job.companyIndustries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.companyIndustries.map((ind) => (
                        <span key={ind} className="px-2.5 py-1 bg-gray-100 text-slate-600 text-[11px] font-semibold rounded-full">
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.companyWebsite && (
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-brand-blue font-semibold hover:underline"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      Visit website
                    </a>
                  )}
                </div>
              )}

              {/* Platform trust badge */}
              <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <p className="text-xs font-bold text-brand-blue">Compliance-first hiring</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  All roles on Edge Harbour are posted by verified employers. Every candidate is pre-screened before applying.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
