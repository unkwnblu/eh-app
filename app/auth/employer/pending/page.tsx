"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "../login/actions";

export default function EmployerPendingPage() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left: Content panel ── */}
      <div className="flex-1 overflow-y-auto flex flex-col px-8 py-12 bg-white dark:bg-[#111827] lg:max-w-[55%]">
        <div className="w-full max-w-md mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand dark:text-slate-100 font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-brand dark:text-slate-100 font-black text-4xl leading-tight tracking-tight mb-2">
              UNDER <span className="text-brand-blue">REVIEW.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your employer account has been submitted and is currently being reviewed by the Edge Harbour compliance team.
            </p>
          </div>

          {/* Status card */}
          <div className="bg-[#F7F8FA] dark:bg-[#1e293b] border border-gray-100 dark:border-white/10 rounded-2xl p-5 space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Pending Verification</span>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Company registration verified against Companies House" },
                { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Compliance documents checked" },
                { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Account activated and dashboard unlocked" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${i === 0 ? "bg-green-100" : i === 1 ? "bg-amber-100" : "bg-gray-100"}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={i === 0 ? "text-green-600" : i === 1 ? "text-amber-500" : "text-slate-300"}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                  <p className={`text-xs leading-relaxed ${i === 2 ? "text-slate-300 dark:text-slate-600" : "text-slate-600 dark:text-slate-400"}`}>{step.label}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-gray-200 dark:border-white/10">
              Verification typically takes <span className="font-semibold text-slate-500 dark:text-slate-400">1–2 business days</span>. You&apos;ll receive an email once your account is approved.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="mailto:support@edgeharbour.co.uk"
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-full hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Support
            </a>
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="w-full py-3 text-slate-400 dark:text-slate-500 text-sm font-medium hover:text-brand transition-colors disabled:opacity-50"
            >
              {isPending ? "Signing out…" : "← Sign out"}
            </button>
          </div>

        </div>
      </div>

      {/* ── Right: Branded panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-navy">
        <style>{`
          @keyframes orb-a {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(50px, -70px) scale(1.12); }
            66%       { transform: translate(-35px, 45px) scale(0.94); }
          }
          @keyframes orb-b {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(-55px, 35px) scale(1.08); }
            66%       { transform: translate(45px, -50px) scale(1.15); }
          }
          @keyframes orb-c {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(30px, 60px) scale(1.1); }
          }
          @keyframes panel-fade-up {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ticker-scroll {
            0%   { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.3; transform: scale(0.7); }
          }
        `}</style>

        {/* Orbs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-blue/30 blur-[100px]" style={{ animation: "orb-a 14s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-indigo-500/20 blur-[90px]" style={{ animation: "orb-b 18s ease-in-out infinite" }} />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] rounded-full bg-sky-500/20 blur-[80px]" style={{ animation: "orb-c 10s ease-in-out infinite" }} />

        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Top-right pill */}
        <div className="relative flex justify-end p-8">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <span className="text-white/50 text-xs">Need help?</span>
            <a href="mailto:support@edgeharbour.co.uk" className="text-white text-xs font-bold tracking-wider uppercase hover:text-brand-blue transition-colors">
              Contact Us →
            </a>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 gap-8">

          {/* Headline */}
          <div style={{ animation: "panel-fade-up 0.7s ease 0.1s both" }}>
            <p className="text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Edge Harbour Employer Portal
            </p>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-[1.05] tracking-tight">
              YOUR PIPELINE<br />
              IS READY<br />
              AND <span className="text-brand-blue">WAITING.</span>
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Once approved, you&apos;ll have instant access to verified candidates, live roles, and a compliance dashboard built around your hiring needs.
            </p>
          </div>

          {/* Live ticker */}
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm" style={{ animation: "panel-fade-up 0.7s ease 0.25s both" }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }} />
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Live Verification Feed</span>
            </div>
            <div className="overflow-hidden" style={{ height: "152px" }}>
              <div className="flex flex-col" style={{ animation: "ticker-scroll 10s linear infinite" }}>
                {[
                  { initials: "SR", color: "bg-indigo-400", name: "Sarah R.",  role: "ICU Nurse · Healthcare",      badge: "RTW Verified",  badgeColor: "text-green-400",  badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "TC", color: "bg-sky-500",    name: "Tom C.",    role: "Head Chef · Hospitality",     badge: "DBS Checked",   badgeColor: "text-sky-300",    badgeBg: "bg-sky-500/15 border-sky-300/25" },
                  { initials: "AK", color: "bg-violet-400", name: "Aisha K.",  role: "Data Analyst · Tech",         badge: "Refs Verified", badgeColor: "text-violet-300", badgeBg: "bg-violet-500/15 border-violet-300/25" },
                  { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre",    badge: "RTW Verified",  badgeColor: "text-green-400",  badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "SR", color: "bg-indigo-400", name: "Sarah R.",  role: "ICU Nurse · Healthcare",      badge: "RTW Verified",  badgeColor: "text-green-400",  badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "TC", color: "bg-sky-500",    name: "Tom C.",    role: "Head Chef · Hospitality",     badge: "DBS Checked",   badgeColor: "text-sky-300",    badgeBg: "bg-sky-500/15 border-sky-300/25" },
                  { initials: "AK", color: "bg-violet-400", name: "Aisha K.",  role: "Data Analyst · Tech",         badge: "Refs Verified", badgeColor: "text-violet-300", badgeBg: "bg-violet-500/15 border-violet-300/25" },
                  { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre",    badge: "RTW Verified",  badgeColor: "text-green-400",  badgeBg: "bg-green-500/15 border-green-400/25" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
                    <div className={`w-7 h-7 rounded-lg ${c.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{c.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{c.role}</p>
                    </div>
                    <div className={`flex items-center gap-1 border rounded-full px-2 py-0.5 shrink-0 ${c.badgeBg}`}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={c.badgeColor}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={`text-[9px] font-semibold ${c.badgeColor}`}>{c.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2" style={{ animation: "panel-fade-up 0.7s ease 0.4s both" }}>
            {[
              { value: "200+", label: "UK Employers" },
              { value: "4 days", label: "Avg. hire" },
              { value: "100%", label: "RTW verified" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl px-3 py-3 text-center">
                <p className="text-brand-blue font-black text-lg leading-none">{s.value}</p>
                <p className="text-white/35 text-[9px] uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative p-8 pt-0">
          <p className="text-white/20 text-xs">
            Trusted by 200+ UK firms already hiring smarter with Edge Harbour
          </p>
        </div>
      </div>
    </div>
  );
}
