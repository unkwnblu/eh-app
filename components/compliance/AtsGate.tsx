import Link from "next/link";

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-amber-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

const features = [
  {
    title: "Mandatory Gate",
    body: "The Compliance Review column in the ATS is locked. Candidates cannot progress without a manual compliance sign-off.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-brand-blue"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
  {
    title: "Full Dossier Access",
    body: "Employers see the complete verified document set — RTW, DBS, credentials — before making any hiring decision.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-brand-blue"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    title: "Audit Trail",
    body: "Every compliance action is timestamped and logged, providing a full audit trail for regulatory inspection.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-brand-blue"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function AtsGate() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div data-gsap="slide-left">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-4 block">
              The Compliance Gate
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-brand tracking-tight leading-[1.08] mb-6">
              Employers can&apos;t skip it.
              <br />
              That&apos;s the point.
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-10">
              Our ATS includes a mandatory Compliance Review stage built
              directly into the hiring pipeline. Before any candidate can be
              moved to the Interviewing stage, their full document dossier must
              be reviewed and approved. It cannot be bypassed, overridden, or
              skipped.
            </p>

            {/* Feature rows */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  data-gsap="stagger-item"
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-soft border border-gray-border flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-brand font-bold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="#"
                className="text-brand-blue font-semibold text-sm hover:underline"
              >
                See the ATS in action &rarr;
              </Link>
            </div>
          </div>

          {/* Right column — Kanban pipeline mockup */}
          <div data-gsap="slide-right">
            <div className="bg-gray-soft rounded-2xl border border-gray-border p-4">
              <div className="overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {/* Applied column */}
                  <div className="w-44">
                    <div className="bg-white border border-gray-border rounded-xl px-3 py-2 mb-3">
                      <p className="text-brand font-bold text-xs">Applied</p>
                      <p className="text-slate-400 text-[10px]">2 candidates</p>
                    </div>
                    <div className="bg-white border border-gray-border rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          Marcus B.
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Healthcare Assistant
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Shortlisted column */}
                  <div className="w-44">
                    <div className="bg-white border border-gray-border rounded-xl px-3 py-2 mb-3">
                      <p className="text-brand font-bold text-xs">Shortlisted</p>
                      <p className="text-slate-400 text-[10px]">1 candidate</p>
                    </div>
                    <div className="bg-white border border-gray-border rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          Aisha K.
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Registered Nurse
                      </p>
                      <button className="mt-2 w-full text-[9px] font-semibold bg-brand-blue text-white px-2 py-1 rounded-full text-center">
                        &rarr; Move to Compliance Review
                      </button>
                    </div>
                  </div>

                  {/* Compliance Review column */}
                  <div className="w-48">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <LockIcon />
                        <p className="text-amber-700 font-bold text-xs">
                          Compliance Review ⚠
                        </p>
                      </div>
                      <p className="text-amber-600 text-[10px] mt-0.5">
                        Manual review required
                      </p>
                    </div>
                    <div className="bg-white border border-gray-border rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          Daniel O.
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Senior Chef
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Awaiting review
                      </span>
                    </div>
                  </div>

                  {/* Interviewing column */}
                  <div className="w-44">
                    <div className="bg-white border border-gray-border rounded-xl px-3 py-2 mb-3">
                      <p className="text-brand font-bold text-xs">
                        Interviewing
                      </p>
                      <p className="text-slate-400 text-[10px]">1 candidate</p>
                    </div>
                    <div className="bg-white border border-gray-border rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          Priya S.
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Data Engineer
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
