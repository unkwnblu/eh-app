import Button from "@/components/ui/Button";

export default function CandidatesHero() {
  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Left floating card */}
      <div
        data-hero="card"
        className="hidden md:flex absolute left-[3%] top-[28%] bg-white rounded-2xl shadow-lg border border-gray-border px-4 py-3.5 items-center gap-3 z-10 w-56"
      >
        <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">Adeola M.</p>
          <p className="text-[10px] text-slate-500 truncate">Band 6 Nurse</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Right floating card */}
      <div
        data-hero="card"
        className="hidden md:flex absolute right-[3%] top-[32%] bg-white rounded-2xl shadow-lg border border-gray-border px-4 py-3.5 items-center gap-3 z-10 w-60"
      >
        <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="text-brand-blue"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Interview Request</p>
          <p className="text-xs font-semibold text-slate-800 truncate">Northgate Health</p>
          <p className="text-[10px] text-brand-blue font-medium mt-0.5">Today · 2:30pm</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-32 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Label */}
          <span
            data-hero="label"
            className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-6"
          >
            For Candidates
          </span>

          {/* Heading */}
          <h1
            data-hero="heading"
            className="text-5xl lg:text-7xl font-black tracking-tight text-brand leading-[1.06] mb-6"
          >
            Your skills. Verified.
            <br />
            Your career,{" "}
            <span className="text-brand-blue">accelerated.</span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero="subtitle"
            className="text-slate-500 text-lg leading-relaxed max-w-xl mb-10"
          >
            Register once, upload your credentials, and get matched directly
            with UK employers — no agencies, no black holes, no ghosting.
          </p>

          {/* CTAs */}
          <div data-hero="ctas" className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              href="/candidates/register"
              variant="primary"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              }
            >
              Register as a Candidate
            </Button>
            <Button
              href="#how-it-works"
              variant="outline"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              }
            >
              Learn How It Works
            </Button>
          </div>

          {/* Trust strip */}
          <div
            data-hero="trust"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-400 text-xs"
          >
            {[
              {
                label: "Free to register",
                icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
              },
              {
                label: "Verified in 24–48hrs",
                icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
              },
              {
                label: "Direct employer access",
                icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
              },
              {
                label: "Real-time application tracking",
                icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
              },
            ].map((item, i, arr) => (
              <span key={item.label} className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </span>
                {i < arr.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-gray-border" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
