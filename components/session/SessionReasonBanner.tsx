"use client";

/**
 * SessionReasonBanner
 * Shows a contextual banner on login pages when the user was redirected due to
 * an idle timeout (?reason=idle) or unexpected session expiry (?reason=expired).
 * Must be used inside a component wrapped in <Suspense> because it calls useSearchParams().
 */

import { useSearchParams } from "next/navigation";

export default function SessionReasonBanner() {
  const params = useSearchParams();
  const reason = params.get("reason");

  if (reason === "idle") {
    return (
      <div className="flex items-start gap-3 p-3.5 mb-5 bg-amber-50 border border-amber-200 rounded-xl">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500 shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-amber-700 font-medium leading-relaxed">
          You were signed out due to inactivity. Please sign in again to continue.
        </p>
      </div>
    );
  }

  if (reason === "expired") {
    return (
      <div className="flex items-start gap-3 p-3.5 mb-5 bg-blue-50 border border-blue-200 rounded-xl">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-blue shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-sm text-brand-blue font-medium leading-relaxed">
          Your session expired. Please sign in again to continue where you left off.
        </p>
      </div>
    );
  }

  return null;
}
