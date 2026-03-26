import SectionHeader from "@/components/ui/SectionHeader";

type Check = {
  name: string;
  regulation: string;
};

type Sector = {
  name: string;
  accent: string;
  badgeClass: string;
  checks: Check[];
};

const sectors: Sector[] = [
  {
    name: "Healthcare",
    accent: "border-red-200 bg-red-50",
    badgeClass: "bg-red-100 text-red-700",
    checks: [
      { name: "Right to Work", regulation: "Immigration Act 2014" },
      { name: "Enhanced DBS", regulation: "Rehabilitation of Offenders Act 1974" },
      { name: "NMC / HCPC Registration", regulation: "Nursing & Midwifery Order 2001" },
      { name: "Mandatory Training (BLS, safeguarding)", regulation: "CQC Standards" },
      { name: "Professional References (2 clinical)", regulation: "NHS Employment Check Standards" },
    ],
  },
  {
    name: "Hospitality",
    accent: "border-orange-200 bg-orange-50",
    badgeClass: "bg-orange-100 text-orange-700",
    checks: [
      { name: "Right to Work", regulation: "Immigration Act 2014" },
      { name: "Basic/Standard DBS", regulation: "Rehabilitation of Offenders Act 1974" },
      { name: "Food Hygiene Certificate (Level 2/3)", regulation: "Food Safety Act 1990" },
      { name: "Professional References (2 hospitality)", regulation: "Industry standard" },
      { name: "Personal Licence (where applicable)", regulation: "Licensing Act 2003" },
    ],
  },
  {
    name: "Customer Service",
    accent: "border-purple-200 bg-purple-50",
    badgeClass: "bg-purple-100 text-purple-700",
    checks: [
      { name: "Right to Work", regulation: "Immigration Act 2014" },
      { name: "Standard DBS", regulation: "Rehabilitation of Offenders Act 1974" },
      { name: "Professional References (2 professional)", regulation: "Industry standard" },
      { name: "Communication Assessment", regulation: "Internal methodology" },
      { name: "Background Verification", regulation: "BS7858:2019" },
    ],
  },
  {
    name: "Tech & Data",
    accent: "border-emerald-200 bg-emerald-50",
    badgeClass: "bg-emerald-100 text-emerald-700",
    checks: [
      { name: "Right to Work", regulation: "Immigration Act 2014" },
      { name: "Standard DBS", regulation: "Rehabilitation of Offenders Act 1974" },
      { name: "Professional References (2 technical)", regulation: "Industry standard" },
      { name: "Technical Screen (stack + seniority)", regulation: "Internal methodology" },
      { name: "Portfolio / GitHub Review", regulation: "Internal methodology" },
    ],
  },
];

function TickIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-green-500 flex-shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

export default function DocumentChecks() {
  return (
    <section className="w-full bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <SectionHeader
          label="Document Verification"
          heading="What we check, and why."
          description={
            <>
              Our verification framework is built around UK legal requirements.
              Here&apos;s every check we run — and the regulation it satisfies.
            </>
          }
          className="text-center max-w-2xl mx-auto mb-16"
          data-gsap="fade-up"
        />

        {/* Sector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectors.map((sector) => (
            <div
              key={sector.name}
              data-gsap="stagger-item"
              className={`rounded-2xl border p-6 ${sector.accent}`}
            >
              {/* Sector heading */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${sector.badgeClass}`}
                >
                  {sector.name}
                </span>
              </div>

              {/* Check rows */}
              <ul className="space-y-3">
                {sector.checks.map((check) => (
                  <li
                    key={check.name}
                    className="flex items-center justify-between gap-3 bg-white/60 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TickIcon />
                      <span className="text-brand font-semibold text-sm truncate">
                        {check.name}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs whitespace-nowrap flex-shrink-0">
                      {check.regulation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
