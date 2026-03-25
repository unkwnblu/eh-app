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
  { label: "Technical Screen", sub: "stack and seniority validated" },
  { label: "Professional References", sub: "minimum 2 technical refs" },
  { label: "Background Check", sub: "standard DBS" },
  { label: "Portfolio / GitHub Review", sub: "assessed by our tech team" },
];

const roles = [
  "Senior Data Engineer",
  "Full-Stack Developer",
  "Product Manager",
  "QA Engineer",
  "Data Analyst",
  "DevOps Engineer",
];

export default function TechSection() {
  return (
    <section id="tech-data" className="bg-gray-soft py-24">
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
            <div className="bg-navy rounded-xl p-5 text-white">
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
                <span className="font-black text-lg">Avg. placement: 7 days</span>
              </div>
              <p className="text-sm text-white/70">
                400+ tech professionals in pool
              </p>
            </div>
          </div>

          {/* Right — copy */}
          <div data-gsap="slide-right">
            {/* Sector pill */}
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold mb-6">
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
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
              Tech &amp; Data
            </span>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-black text-brand tracking-tight leading-tight mb-5">
              Niche tech talent for UK SMEs who
              can&apos;t afford a{" "}
              <span className="text-brand-blue">mis-hire.</span>
            </h2>

            {/* Body */}
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Tech hiring is broken for SMEs. Generic job boards flood you with
              irrelevant applicants. We pre-screen for stack, seniority, and
              culture — connecting you only with engineers and analysts who fit
              your actual environment.
            </p>

            {/* Compliance checklist */}
            <ul className="space-y-3.5 mb-8">
              {compliance.map((item) => (
                <CheckItem key={item.label} label={item.label} sub={item.sub} />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/jobs?sector=tech-data"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Browse Tech &amp; Data Roles →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
