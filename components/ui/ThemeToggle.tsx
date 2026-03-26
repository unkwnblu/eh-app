"use client";

import { useTheme } from "@/components/ThemeProvider";

/** Compact sun/moon toggle for the Navbar. */
export default function ThemeToggle() {
  const { resolved, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-border dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
    >
      {/* Sun — shown in dark mode */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="hidden dark:block"
      >
        <circle cx="12" cy="12" r="5" />
        <path strokeLinecap="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95-6.95-1.41 1.41M6.46 17.54l-1.41 1.41m12.9 0-1.41-1.41M6.46 6.46 5.05 5.05" />
      </svg>
      {/* Moon — shown in light mode */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="block dark:hidden"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    </button>
  );
}
