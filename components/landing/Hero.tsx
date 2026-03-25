import Link from "next/link";

function FloatingCard({
  name,
  role,
  status = "Role Ready",
  className,
}: {
  name: string;
  role: string;
  status?: string;
  className: string;
}) {
  return (
    <div
      data-hero="card"
      className={`absolute bg-white rounded-xl shadow-lg border border-gray-border px-4 py-3 flex items-center gap-3 w-44 z-10 ${className}`}
    >
      <div className="w-9 h-9 rounded-full bg-gray-soft border border-gray-border flex items-center justify-center flex-shrink-0">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{name}</p>
        <p className="text-[10px] text-slate-500 truncate">{role}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          <span className="text-[9px] text-slate-400">{status}</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[92vh] flex items-center">
      {/* Floating cards — positioned relative to the full section */}
      <FloatingCard
        name="Sarah M."
        role="Senior Nurse"
        className="left-[4%] top-[22%]"
      />
      <FloatingCard
        name="James T."
        role="Head Chef"
        className="right-[4%] top-[30%]"
      />
      <FloatingCard
        name="Priya S."
        role="Customer Success"
        className="left-[7%] bottom-[22%]"
      />
      <FloatingCard
        name="David K."
        role="Data Engineer"
        status="Verified"
        className="right-[6%] bottom-[28%]"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-32 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Label */}
          <span data-hero="label" className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-6">
            Recruitment Redefined
          </span>

          {/* Heading */}
          <h1 data-hero="heading" className="text-5xl lg:text-7xl font-black tracking-tight text-brand leading-[1.06] mb-6">
            Hire Pre-Vetted
            <br />
            <span className="text-brand-blue">Role-Ready</span>
            <br />
            Candidates Faster.
          </h1>

          {/* Subtitle */}
          <p data-hero="subtitle" className="text-slate-500 text-lg leading-relaxed max-w-xl mb-10">
            The UK&apos;s trusted, compliance-first recruitment platform for
            Healthcare, Hospitality, Customer Service, and Data professionals.
          </p>

          {/* CTAs */}
          <div data-hero="ctas" className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/candidates/register"
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-brand/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Looking for work?
            </Link>
            <Link
              href="/employers/register"
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-brand-blue-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Looking to hire
            </Link>
          </div>

          {/* Trust strip */}
          <div data-hero="trust" className="mt-12 flex items-center gap-6 text-slate-400 text-xs">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              100% RTW Verified
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-border" />
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              200+ UK Firms
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-border" />
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Avg. 4-day hire
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
