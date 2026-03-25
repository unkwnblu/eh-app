import Link from "next/link";

function CheckItem({
  label,
  sub,
}: {
  label: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </span>
      <span>
        <span className="text-sm font-semibold text-brand">{label}</span>
        <span className="text-xs text-slate-400 ml-2">{sub}</span>
      </span>
    </li>
  );
}

const compliance = [
  { label: "Right to Work", sub: "verified" },
  { label: "Food Hygiene Certificate", sub: "Level 2/3 validated" },
  { label: "Professional References", sub: "minimum 2 hospitality refs" },
  { label: "DBS Certificate", sub: "where role requires" },
  { label: "Skills Assessment", sub: "practical role-match scoring" },
];

const roles = [
  "Head Chef",
  "Sous Chef",
  "Front of House Manager",
  "Hotel General Manager",
  "Events Coordinator",
  "Commis Chef",
];

export default function HospitalitySection() {
  return (
    <section id="hospitality" className="bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — roles + stat (reversed layout) */}
          <div data-gsap="slide-left" className="flex flex-col gap-6">
            {/* Roles we place */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Roles we place
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((role) => (
                  <div
                    key={role}
                    className="bg-white border border-gray-border rounded-xl px-4 py-3 text-sm font-medium text-brand"
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* Stat callout */}
            <div className="bg-brand-blue rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
                <span className="font-black text-lg">Avg. placement: 5 days</span>
              </div>
              <p className="text-sm text-white/70">
                800+ hospitality professionals in pool
              </p>
            </div>
          </div>

          {/* Right — copy */}
          <div data-gsap="slide-right">
            {/* Sector pill */}
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-3 py-1 text-xs font-semibold mb-6">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 21v-3.75A2.25 2.25 0 0012.75 15h-1.5A2.25 2.25 0 009 17.25V21m6 0h-6m6 0h2.25m-8.25 0H6.75M3 12h18M3 12V9.75A2.25 2.25 0 015.25 7.5h13.5A2.25 2.25 0 0121 9.75V12"
                />
              </svg>
              Hospitality
            </span>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-black text-brand tracking-tight leading-tight mb-5">
              Front-of-house to head chef. Placed with{" "}
              <span className="text-brand-blue">precision.</span>
            </h2>

            {/* Body */}
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Hospitality hiring is high-speed and high-stakes. Our operators
              know that a bad hire can ruin a service. Every candidate is
              reference-checked, food hygiene certified where relevant, and
              matched for both skill and culture.
            </p>

            {/* Compliance checklist */}
            <ul className="space-y-3.5 mb-8">
              {compliance.map((item) => (
                <CheckItem key={item.label} label={item.label} sub={item.sub} />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/jobs?sector=hospitality"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Browse Hospitality Roles →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
