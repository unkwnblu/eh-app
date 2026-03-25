export default function CompliancePhilosophy() {
  const pillars = [
    {
      title: "Verify First, Match Second",
      body: "No candidate enters an employer's pipeline until their documents have been reviewed and approved by our compliance team.",
      icon: (
        <svg
          width="22"
          height="22"
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
      ),
    },
    {
      title: "Sector-Specific Standards",
      body: "Compliance requirements differ by sector. We apply the correct legal and regulatory framework for Healthcare, Hospitality, Customer Service, and Tech roles.",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="text-brand-blue"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
      ),
    },
    {
      title: "Human Review, Not Just Automation",
      body: "Our Super Admin team manually reviews every document submission. Technology assists — humans decide.",
      icon: (
        <svg
          width="22"
          height="22"
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12l-6 6m0 0l-6-6m6 6V6"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div data-gsap="slide-left">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-4 block">
              Our Approach
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-brand tracking-tight leading-[1.08] mb-8">
              Built different from
              <br />
              the ground up.
            </h2>
            <div className="space-y-5 text-slate-500 text-base leading-relaxed">
              <p>
                Traditional recruitment agencies treat compliance as an
                afterthought — a box to tick before a placement fee is
                collected. We built Edge Harbour the other way around.
                Compliance is the engine, not the exhaust.
              </p>
              <p>
                Every workflow, every candidate profile, every employer
                interaction is designed with UK legal requirements at its core.
                This isn&apos;t a feature — it&apos;s the architecture.
              </p>
            </div>
            {/* Pull quote */}
            <blockquote className="mt-8 border-l-4 border-brand-blue pl-5">
              <p className="text-brand font-semibold text-sm leading-relaxed">
                &ldquo;We don&apos;t just check documents. We verify them
                against live UK government databases and sector regulatory
                bodies.&rdquo;
              </p>
            </blockquote>
          </div>

          {/* Right column — philosophy pillars */}
          <div data-gsap="slide-right" className="space-y-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                data-gsap="stagger-item"
                className="bg-gray-soft border border-gray-border rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-border flex items-center justify-center flex-shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="text-brand font-bold text-base mb-1.5">
                      {pillar.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {pillar.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
