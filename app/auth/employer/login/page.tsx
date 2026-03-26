"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function EmployerLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // auth logic goes here
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left: Form panel ── */}
      <div className="flex-1 overflow-y-auto flex flex-col px-8 py-12 bg-white lg:max-w-[55%]">
        <div className="w-full max-w-md mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
              WELCOME <span className="text-brand-blue">BACK.</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Sign in to your employer dashboard to manage your hiring pipeline.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.co.uk"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link
                  href="/auth/employer/forgot-password"
                  className="text-[10px] text-brand-blue hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  className="w-full border border-gray-border rounded-xl px-4 py-3 pr-11 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-brand text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue transition-colors mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-border" />
            <span className="text-[10px] text-slate-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-border" />
          </div>

          {/* Footer links */}
          <div className="space-y-3 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/employer" className="text-brand-blue font-medium hover:underline">
                Register as Employer
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link href="/login" className="hover:text-brand-blue transition-colors">
                ← Back to sign in options
              </Link>
            </p>
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
            <span className="text-white/50 text-xs">New to Edge Harbour?</span>
            <Link href="/auth/employer" className="text-white text-xs font-bold tracking-wider uppercase hover:text-brand-blue transition-colors">
              Register →
            </Link>
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
              Verified candidates, live roles, and a compliance dashboard built
              around your hiring needs.
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
                  { initials: "SR", color: "bg-indigo-400", name: "Sarah R.", role: "ICU Nurse · Healthcare",       badge: "RTW Verified",  badgeColor: "text-green-400",   badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "TC", color: "bg-sky-500",    name: "Tom C.",   role: "Head Chef · Hospitality",      badge: "DBS Checked",   badgeColor: "text-sky-300",     badgeBg: "bg-sky-500/15 border-sky-300/25" },
                  { initials: "AK", color: "bg-violet-400", name: "Aisha K.", role: "Data Analyst · Tech",          badge: "Refs Verified", badgeColor: "text-violet-300",  badgeBg: "bg-violet-500/15 border-violet-300/25" },
                  { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre",   badge: "RTW Verified",  badgeColor: "text-green-400",   badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "SR", color: "bg-indigo-400", name: "Sarah R.", role: "ICU Nurse · Healthcare",       badge: "RTW Verified",  badgeColor: "text-green-400",   badgeBg: "bg-green-500/15 border-green-400/25" },
                  { initials: "TC", color: "bg-sky-500",    name: "Tom C.",   role: "Head Chef · Hospitality",      badge: "DBS Checked",   badgeColor: "text-sky-300",     badgeBg: "bg-sky-500/15 border-sky-300/25" },
                  { initials: "AK", color: "bg-violet-400", name: "Aisha K.", role: "Data Analyst · Tech",          badge: "Refs Verified", badgeColor: "text-violet-300",  badgeBg: "bg-violet-500/15 border-violet-300/25" },
                  { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre",   badge: "RTW Verified",  badgeColor: "text-green-400",   badgeBg: "bg-green-500/15 border-green-400/25" },
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
