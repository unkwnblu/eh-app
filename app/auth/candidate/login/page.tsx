"use client";

import { Suspense } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { candidateLoginSchema, validate, type FieldErrors } from "@/lib/validation";
import { signIn } from "./actions";
import SessionReasonBanner from "@/components/session/SessionReasonBanner";

export default function CandidateLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validate(candidateLoginSchema, form);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("email", form.email);
      fd.append("password", form.password);
      const res = await signIn(fd);
      if (res?.error) setServerError(res.error);
    });
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left: Form panel ── */}
      <div className="flex-1 overflow-y-auto flex flex-col px-8 py-12 bg-white dark:bg-[#111827] lg:max-w-[55%]">
        <div className="w-full max-w-md mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand dark:text-slate-100 font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-brand dark:text-slate-100 font-black text-4xl leading-tight tracking-tight mb-2">
              WELCOME <span className="text-brand-blue">BACK.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Sign in to check your verification status, interview requests, and profile.
            </p>
          </div>

          {/* Session reason banner (idle / expired) */}
          <Suspense fallback={null}>
            <SessionReasonBanner />
          </Suspense>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); if (errors.email) setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-[#1e293b] ${
                  errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-border focus:border-brand-blue focus:ring-brand-blue"
                }`}
              />
              {errors.email && <p role="alert" className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <Link
                  href="/auth/candidate/forgot-password"
                  className="text-[10px] text-brand-blue hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); if (errors.password) setErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-[#1e293b] ${
                    errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-border focus:border-brand-blue focus:ring-brand-blue"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand dark:hover:text-white transition-colors"
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
              {errors.password && <p role="alert" className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-blue text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue-dark transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in…" : "Sign In to My Profile"}
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/candidate/register" className="text-brand-blue font-medium hover:underline">
                Register as Candidate
              </Link>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
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
          @keyframes orb-a-c {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(45px, -65px) scale(1.1); }
            66%       { transform: translate(-30px, 40px) scale(0.95); }
          }
          @keyframes orb-b-c {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(-50px, 30px) scale(1.06); }
            66%       { transform: translate(40px, -45px) scale(1.12); }
          }
          @keyframes orb-c-c {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(25px, 55px) scale(1.08); }
          }
          @keyframes panel-fade-up-c {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes status-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.3; transform: scale(0.7); }
          }
        `}</style>

        {/* Orbs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-blue/25 blur-[100px]" style={{ animation: "orb-a-c 16s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-teal-500/15 blur-[90px]" style={{ animation: "orb-b-c 20s ease-in-out infinite" }} />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/15 blur-[80px]" style={{ animation: "orb-c-c 12s ease-in-out infinite" }} />

        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Top-right pill */}
        <div className="relative flex justify-end p-8">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <span className="text-white/50 text-xs">New to Edge Harbour?</span>
            <Link href="/auth/candidate/register" className="text-white text-xs font-bold tracking-wider uppercase hover:text-brand-blue transition-colors">
              Register →
            </Link>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 gap-8">

          {/* Headline */}
          <div style={{ animation: "panel-fade-up-c 0.7s ease 0.1s both" }}>
            <p className="text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Edge Harbour Candidate Portal
            </p>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-[1.05] tracking-tight">
              YOUR CAREER<br />
              MOVES<br />
              START <span className="text-brand-blue">HERE.</span>
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Check your verification badge, respond to interview requests, and
              let top UK employers find you.
            </p>
          </div>

          {/* Profile status cards */}
          <div className="space-y-2.5" style={{ animation: "panel-fade-up-c 0.7s ease 0.25s both" }}>
            {[
              { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Identity & RTW Verified", sub: "Documents cleared · Active badge", color: "text-green-400", bg: "bg-green-500/10 border-green-400/20" },
              { icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", label: "2 Interview Requests", sub: "Northgate Health · City Care Group", color: "text-brand-blue", bg: "bg-brand-blue/10 border-brand-blue/20" },
              { icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25", label: "Profile 80% complete", sub: "Add sector credentials to unlock more", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-400/20" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 border rounded-xl px-4 py-3 backdrop-blur-sm bg-white/5 ${item.bg}`}>
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${item.color}`}>{item.label}</p>
                  <p className="text-white/35 text-[10px] truncate">{item.sub}</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-auto" style={{ background: "currentColor", animation: "status-pulse 2s ease-in-out infinite" }} />
              </div>
            ))}
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2" style={{ animation: "panel-fade-up-c 0.7s ease 0.4s both" }}>
            {[
              { value: "Free", label: "To register" },
              { value: "24hrs", label: "Avg. verify" },
              { value: "1,200+", label: "Roles filled" },
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
            Thousands of verified UK candidates already on their next role
          </p>
        </div>
      </div>
    </div>
  );
}
