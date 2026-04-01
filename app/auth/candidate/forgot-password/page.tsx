"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CandidateForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setServerError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/candidate/reset-password`,
      });
      if (error) {
        setServerError(error.message);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-soft dark:bg-[#0B1222] px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <span className="text-brand dark:text-slate-100 font-bold text-base tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-border p-8">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-brand dark:text-slate-100 font-black text-2xl mb-2">Check your inbox</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-brand dark:text-slate-200">{email}</strong>.
                Click the link in the email to set a new password.
              </p>
              <Link
                href="/auth/candidate/login"
                className="inline-flex items-center gap-2 text-brand-blue text-sm font-semibold hover:underline"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <h1 className="text-brand dark:text-slate-100 font-black text-2xl mb-1">Forgot password?</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Enter the email you registered with and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-[#1e293b] ${
                      emailError ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-border focus:border-brand-blue focus:ring-brand-blue"
                    }`}
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>

                {serverError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{serverError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-brand-blue text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-5">
                Remembered your password?{" "}
                <Link href="/auth/candidate/login" className="text-brand-blue font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
