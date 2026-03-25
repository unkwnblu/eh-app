import Link from "next/link";

const sectors = [
  {
    name: "Healthcare",
    stat: "1,200+",
    statLabel: "verified clinicians",
    description:
      "Clinical placements with full compliance — DBS, NMC, HCPC, and RTW verified before introduction.",
    href: "#healthcare",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    name: "Hospitality",
    stat: "800+",
    statLabel: "hospitality professionals",
    description:
      "From front-of-house to head chef — fully referenced, food hygiene certified, and culture-matched.",
    href: "#hospitality",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 21v-3.75A2.25 2.25 0 0012.75 15h-1.5A2.25 2.25 0 009 17.25V21m6 0h-6m6 0h2.25m-8.25 0H6.75M3 12h18M3 12V9.75A2.25 2.25 0 015.25 7.5h13.5A2.25 2.25 0 0121 9.75V12"
        />
      </svg>
    ),
  },
  {
    name: "Customer Service",
    stat: "650+",
    statLabel: "CX specialists",
    description:
      "Temperament, communication, and culture-matched CX talent — not just experience on a CV.",
    href: "#customer-service",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    name: "Tech & Data",
    stat: "400+",
    statLabel: "tech professionals",
    description:
      "Stack-screened engineers and analysts for UK SMEs — no noise, just right-fit candidates.",
    href: "#tech-data",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
];

export default function SectorsOverview() {
  return (
    <section className="bg-gray-soft py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="text-center mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-4 block">
            AT A GLANCE
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-brand tracking-tight">
            One platform, four deep specialisms.
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {sectors.map((sector) => (
            <div
              key={sector.name}
              data-gsap="stagger-item"
              className="bg-white border border-gray-border rounded-2xl p-6 hover:shadow-md hover:border-brand-blue/30 transition-all flex flex-col"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 ${sector.iconBg} ${sector.iconColor} rounded-xl flex items-center justify-center mb-5 flex-shrink-0`}
              >
                {sector.icon}
              </div>

              {/* Sector name */}
              <p className="text-sm font-bold text-brand mb-1">
                {sector.name}
              </p>

              {/* Stat */}
              <p className="text-2xl font-black text-brand-blue leading-tight mb-1">
                {sector.stat}
              </p>
              <p className="text-xs text-slate-500 mb-3">{sector.statLabel}</p>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
                {sector.description}
              </p>

              {/* Link */}
              <Link
                href={sector.href}
                className="text-xs text-brand-blue font-semibold hover:underline"
              >
                Explore →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
