"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "./actions";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue mb-3">
              Admin Portal
            </p>
            <h1 className="text-brand dark:text-slate-100 font-black text-4xl leading-tight tracking-tight mb-2">
              SYSTEM <span className="text-brand-blue">ACCESS.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Restricted to authorised Edge Harbour administrators only.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 p-3.5 mb-5 bg-red-50 border border-red-100 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@edgeharbour.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-brand-blue focus:ring-brand-blue transition-colors bg-white dark:bg-[#1e293b]"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-border rounded-xl px-4 py-3 pr-11 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-brand-blue focus:ring-brand-blue transition-colors bg-white dark:bg-[#1e293b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue-dark transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Verifying…
                </>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          {/* Back link */}
          <p className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500">
            <Link href="/login" className="hover:text-brand-blue transition-colors">
              ← Back to sign in options
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Branded panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-navy">
        <style>{`
          @keyframes orb-a-adm {
            0%, 100% { transform: translate(0,0) scale(1); }
            33%       { transform: translate(40px,-60px) scale(1.1); }
            66%       { transform: translate(-25px,35px) scale(0.95); }
          }
          @keyframes orb-b-adm {
            0%, 100% { transform: translate(0,0) scale(1); }
            33%       { transform: translate(-45px,25px) scale(1.06); }
            66%       { transform: translate(35px,-40px) scale(1.12); }
          }
          @keyframes panel-fade-up-adm {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Orbs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-blue/20 blur-[100px]" style={{ animation: "orb-a-adm 18s ease-in-out infinite" }} />
        <div className="absolute bottom-0 -left-40 w-[380px] h-[380px] rounded-full bg-amber-500/10 blur-[90px]" style={{ animation: "orb-b-adm 22s ease-in-out infinite" }} />

        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Top-right tag */}
        <div className="relative flex justify-end p-8">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-xs">System Online</span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 gap-8">
          <div style={{ animation: "panel-fade-up-adm 0.7s ease 0.1s both" }}>
            <p className="text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Edge Harbour Admin Portal
            </p>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-[1.05] tracking-tight">
              MANAGE<br />
              THE<br />
              PLATFORM<span className="text-brand-blue">.</span>
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Verify candidates, moderate job postings, manage users, and broadcast notifications — all from one secure dashboard.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5" style={{ animation: "panel-fade-up-adm 0.7s ease 0.25s both" }}>
            {[
              { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Candidate Verification Queue", sub: "DBS, RTW, and credential review" },
              { icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z", label: "Job Moderation", sub: "Approve and flag employer postings" },
              { icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", label: "User Management", sub: "Full control over platform access" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 bg-white/5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center shrink-0 text-brand-blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/80">{item.label}</p>
                  <p className="text-white/35 text-[10px] truncate">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2" style={{ animation: "panel-fade-up-adm 0.7s ease 0.4s both" }}>
            {[
              { value: "12,482", label: "Total users" },
              { value: "86", label: "Pending verify" },
              { value: "99.9%", label: "Uptime" },
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
          <p className="text-white/20 text-xs">Authorised access only — all sessions are logged</p>
        </div>
      </div>
    </div>
  );
}
