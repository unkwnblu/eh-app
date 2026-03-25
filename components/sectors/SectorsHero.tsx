import Link from "next/link";

const sectorPills = [
  { label: "Healthcare", href: "#healthcare" },
  { label: "Hospitality", href: "#hospitality" },
  { label: "Customer Service", href: "#customer-service" },
  { label: "Tech & Data", href: "#tech-data" },
];

const trustItems = [
  "Sector-specific compliance",
  "Pre-verified talent pools",
  "Deep niche matching",
  "UK-focused",
];

export default function SectorsHero() {
  return (
    <section className="relative w-full bg-white min-h-[70vh] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Label */}
          <span
            data-hero="label"
            className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-6"
          >
            OUR SPECIALISMS
          </span>

          {/* Heading */}
          <h1
            data-hero="heading"
            className="text-5xl lg:text-7xl font-black tracking-tight text-brand leading-[1.06] mb-6"
          >
            Deep expertise.
            <br />
            <span className="text-brand-blue">Four sectors.</span>
          </h1>

          {/* Subtitle */}
          <p
            data-hero="subtitle"
            className="text-slate-500 text-lg leading-relaxed max-w-xl mb-10"
          >
            Edge Harbour doesn&apos;t recruit everywhere — we go deep. Four
            specialist sectors, each with its own compliance framework, talent
            pool, and placement methodology.
          </p>

          {/* Sector pill anchors */}
          <div data-hero="ctas" className="flex flex-wrap justify-center gap-3">
            {sectorPills.map((pill) => (
              <Link
                key={pill.href}
                href={pill.href}
                className="border border-gray-border rounded-full px-5 py-2 text-sm font-medium text-slate-600 hover:border-brand-blue hover:text-brand-blue transition-all"
              >
                {pill.label}
              </Link>
            ))}
          </div>

          {/* Trust strip */}
          <div
            data-hero="trust"
            className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-slate-400 text-xs"
          >
            {trustItems.map((item, i) => (
              <span key={item} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-border mr-4" />
                )}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
