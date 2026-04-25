import Button from "@/components/ui/Button";

function HeroFloatingCard({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-hero="card"
      className={`hidden md:block absolute bg-white dark:bg-[#111827] rounded-xl shadow-lg border border-gray-border dark:border-white/10 px-4 py-3 z-10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function EmployersHero() {
  return (
    <section className="relative w-full bg-white dark:bg-[#111827] overflow-hidden min-h-[90vh] flex items-center">
      {/* Floating card — left */}
      <HeroFloatingCard className="left-[4%] top-[28%] w-48">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">3 hires this week</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">City Health Trust</span>
            </div>
          </div>
        </div>
      </HeroFloatingCard>

      {/* Floating card — right */}
      <HeroFloatingCard className="right-[4%] top-[32%] w-52">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-blue/8 border border-brand-blue/15 flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="text-brand-blue"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">RTW Verified</p>
            <p className="text-[10px] text-slate-400 truncate">12 candidates ready</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">All docs cleared</span>
            </div>
          </div>
        </div>
      </HeroFloatingCard>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-32 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Label */}
          <span
            data-hero="label"
            className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-6"
          >
            For Employers
          </span>

          {/* Heading */}
          <h1
            data-hero="heading"
            className="text-5xl lg:text-7xl font-black tracking-tight text-brand dark:text-white leading-[1.06] mb-6"
          >
            Hire Smarter.
            <br />
            Stay <span className="text-brand-blue">Compliant.</span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero="subtitle"
            className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl mb-10"
          >
            Post a vacancy, get matched with pre-vetted candidates — RTW verified,
            sector-credentialed, and interview-ready.
          </p>

          {/* CTAs */}
          <div data-hero="ctas" className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              href="/auth/employer"
              variant="primary"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            >
              Create Employer Account
            </Button>
            <Button
              href="#how-it-works"
              variant="outline"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              }
            >
              See How It Works
            </Button>
          </div>

          {/* Trust strip */}
          <div
            data-hero="trust"
            className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-slate-400 dark:text-slate-500 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              200+ UK Employers
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-border dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Avg. 4-day hire
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-border dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              100% RTW Verified
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-border dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Zero compliance risk
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-blue/4 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-brand/3 blur-3xl" />
      </div>
    </section>
  );
}
