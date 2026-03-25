const sectors = [
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
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
    name: "Healthcare",
    subtitle: "Nurses, HCAs, Allied Health, Theatre Staff",
    roles: ["Band 5 & 6 Nurses", "Healthcare Assistants", "Theatre Practitioners", "Allied Health Professionals"],
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
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.254 1.837 2.445V21M3 19.125v-1.557c0-1.191.767-2.285 1.837-2.445A48.507 48.507 0 016 15.12"
        />
      </svg>
    ),
    name: "Hospitality",
    subtitle: "Chefs, FOH, Hotel Management, Events",
    roles: ["Head Chefs & Sous Chefs", "Front of House Managers", "Hotel Operations", "Events Coordinators"],
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
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
    name: "Customer Service",
    subtitle: "CX Managers, Contact Centre, Support Leads",
    roles: ["Customer Success Managers", "Contact Centre Team Leads", "CX Operations", "Support Specialists"],
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
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
    name: "Tech & Data",
    subtitle: "Engineers, Analysts, Product Managers, QA",
    roles: ["Senior Data Engineers", "Product Managers", "QA Engineers", "Data Analysts"],
  },
];

export default function SectorsForCandidates() {
  return (
    <section className="w-full bg-navy py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="mb-14 text-center">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Where We Place You
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Roles across every major UK sector.
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re clinical, commercial, or technical — Edge Harbour
            specialises in the sectors where compliance matters most.
          </p>
        </div>

        {/* Sector cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sectors.map((sector, i) => (
            <div
              key={i}
              data-gsap="stagger-item"
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white mb-5">
                {sector.icon}
              </div>

              {/* Name & subtitle */}
              <h3 className="text-base font-bold text-white mb-1">{sector.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                {sector.subtitle}
              </p>

              {/* Role pills */}
              <div className="flex flex-wrap gap-1.5">
                {sector.roles.map((role, j) => (
                  <span
                    key={j}
                    className="bg-white/10 text-white/70 rounded-full px-2.5 py-1 text-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
