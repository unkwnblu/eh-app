"use client";

/**
 * Catches errors in the root layout itself.
 * Must provide its own <html> and <body> since the layout may have failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen flex items-center justify-center bg-[#F7F8FC] px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="font-black text-3xl text-[#1B2F5E] mb-3">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            An unexpected error occurred. Our team has been notified.
            {error.digest && (
              <span className="block text-xs text-slate-400 mt-2">
                Reference: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold rounded-full px-8 py-3 hover:bg-[#1D4ED8] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
