const features = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Agile Hiring Cycles",
    body: "Our proprietary automated screening engine reduces your average time-to-hire by 65%, connecting you with role-ready candidates in days, not weeks.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Elite Vetting Protocols",
    body: "Zero-risk hiring with our 100% UK Right-to-Work guarantee. Every dossier is pre-verified against legal requirements before a single introduction is made.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
    title: "Domain Specialisation",
    body: "We operate with deep-rooted expertise in Healthcare, Hospitality, and Tech sectors, ensuring candidate matching that respects technical nuance and culture.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
    title: "Long-Term Retention",
    body: "Our 'Role-Ready' methodology identifies temperament-fit alongside skill fit, resulting in 40% higher year-one retention rates compared to industry averages.",
  },
];

export default function WhyEdgeHarbour() {
  return (
    <section className="w-full bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div data-gsap="slide-left">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
              The Edge Harbour Advantage
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
              Why Edge{" "}
              <span className="text-brand-blue">Harbour?</span>
            </h2>
            <p className="mt-5 text-slate-500 text-base leading-relaxed max-w-sm">
              We don&apos;t just fill seats; we provide a high-performance
              recruitment engine that transforms how you build your teams.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 border border-gray-border bg-white rounded-full px-5 py-2.5 text-sm text-slate-600">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-brand-blue"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              Trusted by 200+ UK firms
            </div>
          </div>

          {/* Right: 2x2 feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                data-gsap="stagger-item"
                className="bg-white rounded-2xl p-6 border border-gray-border hover:border-brand-blue/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue/8 flex items-center justify-center text-brand-blue mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-brand mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
