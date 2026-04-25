import Link from "next/link";

export default function CandidateCta() {
  return (
    <section className="w-full bg-brand py-20">
      <div
        data-gsap="fade-up"
        className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center text-center"
      >
        {/* Heading */}
        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-5">
          Ready to get Role Ready?
        </h2>

        {/* Subtitle */}
        <p className="text-white/60 text-base leading-relaxed max-w-xl mb-10">
          Join thousands of UK professionals who&apos;ve found their next role
          through Edge Harbour. It&apos;s free, fast, and compliance-first.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <Link
            href="/auth/candidate/register"
            className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-brand-blue-dark transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
            Register for Free
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:border-white/60 transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            Browse Live Roles
          </Link>
        </div>

        {/* Small note */}
        <p className="text-white/40 text-xs">
          No CV required to register &middot; Verified within 48 hours &middot; Free forever for candidates
        </p>
      </div>
    </section>
  );
}
