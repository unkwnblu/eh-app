const stats = [
  {
    value: "200+",
    label: "UK employers trust Edge Harbour",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    value: "4 days",
    label: "Average time from post to hire",
    icon: (
      <svg
        width="20"
        height="20"
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
  },
  {
    value: "65%",
    label: "Reduction in time-to-fill vs traditional agencies",
    icon: (
      <svg
        width="20"
        height="20"
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
  },
  {
    value: "100%",
    label: "Of candidates are RTW pre-verified",
    icon: (
      <svg
        width="20"
        height="20"
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
  },
];

export default function EmployerStats() {
  return (
    <section className="w-full bg-navy py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section label */}
        <div data-gsap="fade-up" className="text-center mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Platform Performance
          </span>
          <h2 className="mt-3 text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            Numbers that speak for themselves.
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <div
              key={stat.value}
              data-gsap="stagger-item"
              className={`flex flex-col items-center text-center px-6 py-8 lg:py-0 ${
                index % 2 === 0 && index < stats.length - 1
                  ? "border-r border-white/10 lg:border-r-0"
                  : ""
              }`}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-brand-blue mb-5">
                {stat.icon}
              </div>

              {/* Value */}
              <p className="text-4xl lg:text-5xl font-black text-brand-blue leading-none mb-3">
                {stat.value}
              </p>

              {/* Label */}
              <p className="text-sm text-white/60 leading-snug max-w-[140px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
