import Button from "@/components/ui/Button";

export default function ComplianceHero() {
  return (
    <section className="relative w-full bg-white overflow-hidden min-h-[75vh] flex items-center">
      {/* Floating stat card — left */}
      <div
        data-hero="card"
        className="absolute left-[4%] top-[28%] bg-white rounded-xl shadow-lg border border-gray-border px-5 py-4 z-10 w-52"
      >
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Documents Reviewed
        </p>
        <p className="text-3xl font-black text-brand leading-none">14,200+</p>
        <p className="text-[10px] text-slate-400 mt-1">and counting</p>
      </div>

      {/* Floating stat card — right */}
      <div
        data-hero="card"
        className="absolute right-[4%] top-[32%] bg-white rounded-xl shadow-lg border border-gray-border px-5 py-4 z-10 w-52"
      >
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Compliance Rate
        </p>
        <p className="text-3xl font-black text-brand leading-none">99.8%</p>
        <p className="text-[10px] text-slate-400 mt-1">zero breaches to date</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-32 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Label */}
          <span
            data-hero="label"
            className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-6"
          >
            Compliance Framework
          </span>

          {/* Heading */}
          <h1
            data-hero="heading"
            className="text-5xl lg:text-7xl font-black tracking-tight text-brand leading-[1.06] mb-6"
          >
            Compliance isn&apos;t a
            <br />
            checkbox. It&apos;s our
            <br />
            <span className="text-brand-blue">foundation.</span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero="subtitle"
            className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-10"
          >
            Every hire through Edge Harbour is backed by a rigorous,
            legally-aligned compliance framework — protecting employers,
            candidates, and the people they serve.
          </p>

          {/* CTAs */}
          <div
            data-hero="ctas"
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Button href="#" variant="primary">
              How We Verify Candidates
            </Button>
            <Button href="#" variant="outline">
              Download Framework PDF
            </Button>
          </div>

          {/* Trust strip */}
          <div
            data-hero="trust"
            className="mt-12 flex flex-wrap justify-center items-center gap-6 text-slate-400 text-xs"
          >
            {[
              "UK GDPR Compliant",
              "Immigration Act 2014 Aligned",
              "ICO Registered",
              "100% RTW Verified",
            ].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
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
                  {item}
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
