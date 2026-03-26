"use client";

import Link from "next/link";

/**
 * Route-level error boundary — catches errors in page components
 * while preserving the root layout (navbar, footer, etc.).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="font-black text-2xl text-brand mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          We hit an unexpected error loading this page.
          {error.digest && (
            <span className="block text-xs text-slate-400 mt-1">
              Reference: {error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-brand-blue text-white text-sm font-semibold rounded-full px-6 py-2.5 hover:bg-brand-blue-dark transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-gray-border text-brand text-sm font-semibold rounded-full px-6 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
