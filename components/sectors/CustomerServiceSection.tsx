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
  { label: "Professional References", sub: "minimum 2 professional refs" },
  { label: "Communication Assessment", sub: "verbal and written scored" },
  { label: "Background Check", sub: "standard DBS where required" },
  { label: "Role-fit Interview", sub: "pre-screened by our team" },
];

const roles = [
  "Customer Success Manager",
  "Contact Centre Agent",
  "CX Team Lead",
  "Support Specialist",
  "Client Services Executive",
  "Complaints Handler",
];

export default function CustomerServiceSection() {
  return (
    <section id="customer-service" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div data-gsap="slide-left">
            {/* Sector pill */}
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full px-3 py-1 text-xs font-semibold mb-6">
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
                  d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
              </svg>
              Customer Service
            </span>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-black text-brand tracking-tight leading-tight mb-5">
              CX talent that communicates, retains,
              and{" "}
              <span className="text-brand-blue">performs.</span>
            </h2>

            {/* Body */}
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Customer service is the face of your brand. We match candidates
              not just on experience, but on temperament, communication style,
              and cultural alignment — ensuring they stick around.
            </p>

            {/* Compliance checklist */}
            <ul className="space-y-3.5 mb-8">
              {compliance.map((item) => (
                <CheckItem key={item.label} label={item.label} sub={item.sub} />
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/jobs?sector=customer-service"
              className="text-brand-blue font-semibold text-sm hover:underline"
            >
              Browse Customer Service Roles →
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
                <span className="font-black text-lg">Avg. placement: 6 days</span>
              </div>
              <p className="text-sm text-white/70">
                650+ CX specialists in pool
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
