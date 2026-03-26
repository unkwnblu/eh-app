import SectionHeader from "@/components/ui/SectionHeader";

const complianceChecks = [
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
        />
      </svg>
    ),
    title: "Right to Work (RTW)",
    description: "Verified against UK Home Office standards",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
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
    title: "DBS Certificate",
    description: "Enhanced checks validated for sector relevance",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
        />
      </svg>
    ),
    title: "NMC / Professional Pin",
    description: "Verified active registration for Healthcare roles",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
    title: "Sector Credentials",
    description: "Role-specific certifications and qualifications confirmed",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
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
    title: "Reference Checks",
    description: "Professional references verified before shortlisting",
  },
];

const comparisonRows = [
  {
    feature: "RTW Verification",
    edgeHarbour: "Automated, instant",
    traditional: "Manual, often skipped",
    positive: true,
  },
  {
    feature: "DBS Checks",
    edgeHarbour: "Built-in, sector-specific",
    traditional: "Employer responsibility",
    positive: true,
  },
  {
    feature: "Sector Credentials",
    edgeHarbour: "Pre-confirmed",
    traditional: "Self-declared only",
    positive: true,
  },
  {
    feature: "Avg. Time to Hire",
    edgeHarbour: "4 days",
    traditional: "3–6 weeks",
    positive: true,
  },
  {
    feature: "Compliance Gate",
    edgeHarbour: "Mandatory, enforced",
    traditional: "None",
    positive: true,
  },
  {
    feature: "Ghosting Risk",
    edgeHarbour: "Very low",
    traditional: "High",
    positive: true,
  },
];

export default function ComplianceSection() {
  return (
    <section className="w-full bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column */}
          <div data-gsap="slide-left">
            <SectionHeader
              label="Compliance Built-In"
              heading={<>Zero risk hiring,{" "}<span className="text-brand-blue">guaranteed.</span></>}
              description={
                <span className="max-w-md inline-block">
                  Every candidate in your pipeline has been pre-screened against UK
                  legal requirements. You never interview someone whose documents
                  haven&apos;t cleared.
                </span>
              }
            />

            {/* Compliance check list */}
            <ul className="mt-10 space-y-4">
              {complianceChecks.map((check) => (
                <li
                  key={check.title}
                  className="flex items-start gap-4 bg-white rounded-xl border border-gray-border p-4"
                >
                  {/* Green check */}
                  <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  {/* Icon + text */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-brand-blue mt-0.5 flex-shrink-0">
                      {check.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand">{check.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{check.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — comparison card */}
          <div data-gsap="slide-right">
            <div className="bg-white border border-gray-border rounded-2xl p-6 shadow-sm">
              {/* Card header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/8 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="text-brand-blue"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-brand">
                  Edge Harbour vs Traditional Agencies
                </h3>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1" />
                <div className="text-center">
                  <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wide">
                    Edge Harbour
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Traditional
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-border mb-3" />

              {/* Table rows */}
              <div className="space-y-0">
                {comparisonRows.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-3 gap-3 py-3 items-center ${
                      index < comparisonRows.length - 1
                        ? "border-b border-gray-border/60"
                        : ""
                    }`}
                  >
                    {/* Feature label */}
                    <p className="text-xs font-semibold text-slate-600 col-span-1 leading-snug">
                      {row.feature}
                    </p>

                    {/* Edge Harbour value */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-green-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-green-700 font-medium text-center leading-tight">
                        {row.edgeHarbour}
                      </span>
                    </div>

                    {/* Traditional value */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-red-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-red-600 font-medium text-center leading-tight">
                        {row.traditional}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="mt-5 pt-4 border-t border-gray-border flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-brand-blue flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Based on 2024 UK recruitment industry benchmarks and Edge Harbour
                  platform data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
