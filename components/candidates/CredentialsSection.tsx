import Link from "next/link";

const credentials = [
  {
    icon: (
      <svg
        width="16"
        height="16"
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
    name: "Right to Work",
    status: "Verified",
    statusClass: "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-500",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
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
    name: "DBS Certificate (Enhanced)",
    status: "Verified",
    statusClass: "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-500",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
    name: "NMC PIN",
    status: "Verified",
    statusClass: "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-500",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
    name: "Professional References",
    status: "Pending",
    statusClass: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-400",
  },
  {
    icon: (
      <svg
        width="16"
        height="16"
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
    name: "Food Hygiene Certificate",
    status: "Not uploaded",
    statusClass: "bg-slate-50 text-slate-500 border-slate-200",
    dot: "bg-slate-300",
  },
];

const verifiedCount = credentials.filter((c) => c.status === "Verified").length;
const totalCount = credentials.length;
const progressPct = Math.round((verifiedCount / totalCount) * 100);

export default function CredentialsSection() {
  return (
    <section className="w-full bg-gray-soft dark:bg-[#0B1222] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left — credential card */}
          <div data-gsap="slide-left" className="flex justify-center lg:justify-start">
            <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-md border border-gray-border dark:border-white/10 p-5 w-full max-w-sm">
              {/* Card header */}
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-border dark:border-white/10">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 dark:bg-brand-blue/15 border border-brand-blue/20 flex items-center justify-center text-brand-blue flex-shrink-0">
                  <svg
                    width="16"
                    height="16"
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
                </div>
                <div>
                  <p className="text-sm font-bold text-brand dark:text-white">My Credentials</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Compliance profile</p>
                </div>
              </div>

              {/* Credential rows */}
              <ul className="space-y-2.5 mb-5">
                {credentials.map((cred, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">{cred.icon}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {cred.name}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0 ${cred.statusClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cred.dot} inline-block`} />
                      {cred.status}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Progress summary */}
              <div className="pt-4 border-t border-gray-border dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {verifiedCount} of {totalCount} credentials verified
                  </span>
                  <span className="text-[11px] font-bold text-brand-blue">{progressPct}%</span>
                </div>
                <div className="w-full bg-gray-border dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-blue h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right — text content */}
          <div data-gsap="slide-right">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
              Credentials &amp; Compliance
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand dark:text-white leading-tight mb-6">
              Upload once.
              <br />
              Verified for life.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-6">
              We handle the compliance side so employers don&apos;t have to ask.
              Your verified profile becomes your passport to faster hiring
              across every role you apply for. Whether it&apos;s an NMC PIN, an
              enhanced DBS, or a Right to Work check — you do it once with us,
              and it travels with you.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
              When your credentials are up to date, you appear in employer
              searches immediately. Renewals are flagged automatically — so
              nothing slips through the cracks and you&apos;re never caught off
              guard in the middle of a placement.
            </p>
            <Link
              href="/candidates/register"
              className="inline-flex items-center gap-1.5 text-brand-blue font-semibold text-sm hover:gap-2.5 transition-all"
            >
              Start your verification
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
