"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CandidateResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase exchanges the recovery token from the URL hash and fires
  // an SIGNED_IN event with type "RECOVERY" — we wait for that before
  // allowing the password change.
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function validate() {
    const errs: { password?: string; confirm?: string } = {};
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(password)) errs.password = "Password must include an uppercase letter.";
    else if (!/[0-9]/.test(password)) errs.password = "Password must include a number.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError(null);

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setServerError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/auth/candidate/login"), 3000);
    });
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-soft dark:bg-[#0B1222] px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-400/20 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-brand dark:text-slate-100 font-black text-2xl mb-2">Password updated!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Redirecting you to sign in…
          </p>
          <Link href="/auth/candidate/login" className="text-brand-blue text-sm font-semibold hover:underline">
            Sign in now →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-soft dark:bg-[#0B1222] px-6">
      <div className="w-full max-w-md">

        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <span className="text-brand dark:text-slate-100 font-bold text-base tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-border p-8">
          <h1 className="text-brand dark:text-slate-100 font-black text-2xl mb-1">Set new password</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Choose a strong password for your account.
          </p>

          {!sessionReady && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 mb-5">
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Verifying your reset link…
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined })); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-brand dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-[#1e293b] ${
                  errors.confirm ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-border focus:border-brand-blue focus:ring-brand-blue"
                }`}
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !sessionReady}
              className="w-full bg-brand-blue text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
