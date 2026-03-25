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
      {/* Green circle checkmark */}
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
  { label: "Right to Work", sub: "UK Home Office standard" },
  { label: "Enhanced DBS Certificate", sub: "validated and in-date" },
  { label: "NMC / HCPC Registration", sub: "active pin verified" },
  { label: "Mandatory Training", sub: "BLS, manual handling, safeguarding" },
  { label: "Professional References", sub: "minimum 2 clinical references" },
];

const roles = [
  "Band 5/6 Registered Nurse",
  "Healthcare Assistant (Complex Care)",
  "Theatre Scrub Nurse",
  "Allied Health Professional",
  "Ward Manager",
  "Community Nurse",
];

export default function HealthcareSection() {
  return (
    <section id="healthcare" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div data-gsap="slide-left">
            {/* Sector pill */}
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold mb-6">
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              Healthcare
            </span>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-black text-brand tracking-tight leading-tight mb-5">
              Placing clinicians who are verified,
              compliant, and{" "}
              <span className="text-brand-blue">ready.</span>
            </h2>

            {/* Body */}
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Healthcare recruitment demands more than a CV match. Every
              candidate in our clinical pool holds verified RTW, valid DBS
              (Enhanced), and active professional registration — checked before
              a single introduction is made.
            </p>

            {/* Compliance checklist */}
            <ul className="space-y-3.5 mb-8">
              {compliance.map((item) => (
                <CheckItem key={item.label} label={item.label} sub={item.sub} />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/jobs?sector=healthcare"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Browse Healthcare Roles →
            </Link>
          </div>

          {/* Right — roles + stat */}
          <div data-gsap="slide-right" className="flex flex-col gap-6">
            {/* Roles we place */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Roles we place
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((role) => (
                  <div
                    key={role}
                    className="bg-gray-soft border border-gray-border rounded-xl px-4 py-3 text-sm font-medium text-brand"
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>

            {/* Stat callout */}
            <div className="bg-brand rounded-xl p-5 text-white">
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
                <span className="font-black text-lg">Avg. placement: 4 days</span>
              </div>
              <p className="text-sm text-white/70">
                1,200+ verified clinicians in pool
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
