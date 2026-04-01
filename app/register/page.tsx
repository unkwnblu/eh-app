import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import GsapAnimations from "@/components/landing/GsapAnimations";

export const metadata: Metadata = {
  title: "Create Account – Edge Harbour",
  description:
    "Join Edge Harbour as an employer or candidate. Create your free account and access the UK's compliance-first recruitment platform.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-soft dark:bg-[#0B1222] flex flex-col">
      <GsapAnimations />
      {/* Minimal header */}
      <header className="w-full border-b border-gray-border dark:border-white/10 bg-white dark:bg-[#111827]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/eh-logo.svg"
              alt="Edge Harbour logo"
              width={30}
              height={30}
              priority
            />
            <span className="text-brand dark:text-white font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Heading */}
        <div data-gsap="fade-up" className="text-center mb-12">
          <p className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-3">
            Get Started
          </p>
          <h1 className="text-brand dark:text-white font-black text-4xl lg:text-5xl tracking-tight mb-4">
            Create your account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
            Tell us how you&apos;ll be using Edge Harbour so we can set up the
            right experience for you.
          </p>
        </div>

        {/* Cards */}
        <div data-gsap="fade-up" className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* Employer card */}
          <Link
            href="/auth/employer"
            className="group relative bg-white dark:bg-[#111827] border border-gray-border dark:border-white/10 rounded-2xl p-8 hover:border-brand-blue hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand/8 flex items-center justify-center mb-6 group-hover:bg-brand-blue/10 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="text-brand dark:text-white group-hover:text-brand-blue transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            </div>

            <h2 className="text-brand dark:text-white font-bold text-xl mb-2">
              I&apos;m an Employer
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1 mb-6">
              Post roles, manage applicants, and access a pool of pre-vetted,
              compliance-ready candidates across your sector.
            </p>

            {/* Feature list */}
            <ul className="space-y-2 mb-8">
              {[
                "Post unlimited job listings",
                "100% RTW-verified candidates",
                "Built-in compliance workflow",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-brand-blue shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <span className="inline-flex items-center justify-center gap-2 w-full bg-brand text-white text-sm font-semibold rounded-full py-3 group-hover:bg-brand-blue transition-colors">
              Register as Employer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Candidate card */}
          <Link
            href="/auth/candidate/register"
            className="group relative bg-white dark:bg-[#111827] border border-gray-border dark:border-white/10 rounded-2xl p-8 hover:border-brand-blue hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-brand-blue/8 dark:bg-brand-blue/15 flex items-center justify-center mb-6 group-hover:bg-brand-blue/15 transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="text-brand-blue"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <h2 className="text-brand dark:text-white font-bold text-xl mb-2">
              I&apos;m a Candidate
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1 mb-6">
              Upload your documents once, get verified, and let employers come
              to you — with your credentials already confirmed.
            </p>

            {/* Feature list */}
            <ul className="space-y-2 mb-8">
              {[
                "One-time document upload",
                "Verified badge on your profile",
                "Direct access to top employers",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-brand-blue shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <span className="inline-flex items-center justify-center gap-2 w-full bg-brand-blue text-white text-sm font-semibold rounded-full py-3 group-hover:bg-brand-blue-dark transition-colors">
              Register as Candidate
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-10 text-center max-w-sm">
          By creating an account you agree to our{" "}
          <Link href="/legal/terms" className="text-brand-blue hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-brand-blue hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
