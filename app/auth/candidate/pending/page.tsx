"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/candidate/login/actions";

export default function CandidatePendingPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata as Record<string, string> | null;
      const fullName = meta?.full_name ?? "";
      setFirstName(fullName.split(" ")[0] ?? "");
      setEmail(user.email ?? "");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-soft dark:bg-[#0B1222] px-6">
      <div className="text-center max-w-md w-full">

        {/* Animated clock */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-blue/10 border-2 border-brand-blue/30 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue animate-spin" />
        </div>

        <h1 className="text-brand dark:text-slate-100 font-black text-3xl mb-3">
          Application <span className="text-brand-blue">Under Review.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          {firstName && (
            <>Thank you, <strong className="text-brand dark:text-slate-200">{firstName}</strong>. </>
          )}
          Your application is being reviewed by our compliance team. This typically takes{" "}
          <strong className="text-brand dark:text-slate-200">24–48 hours</strong>.
        </p>

        {/* Status steps */}
        <div className="bg-white dark:bg-[#111827] border border-gray-border rounded-2xl px-6 py-5 text-left space-y-4 mb-6">
          {[
            { label: "Application submitted",   done: true,  active: false },
            { label: "Document & RTW review",   done: false, active: true  },
            { label: "Account activated",       done: false, active: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                s.done
                  ? "bg-brand-blue"
                  : s.active
                  ? "bg-amber-400/20 border-2 border-amber-400"
                  : "bg-gray-100 dark:bg-white/5 border-2 border-gray-border"
              }`}>
                {s.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {s.active && <div className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <span className={`text-sm ${
                s.done   ? "text-brand dark:text-slate-200 font-medium" :
                s.active ? "text-amber-600 dark:text-amber-400 font-medium" :
                           "text-slate-400"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {email && (
          <p className="text-xs text-slate-400 mb-6">
            We&apos;ll notify you at{" "}
            <strong className="text-slate-500 dark:text-slate-300">{email}</strong>{" "}
            once your account is approved.
          </p>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-slate-400 hover:text-brand-blue transition-colors"
          >
            Sign out
          </button>
        </form>

      </div>
    </div>
  );
}
