"use client";

import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOB = {
  title: "Senior Care Assistant",
  company: "Heritage Care Homes",
  location: "London, UK",
  badge: "URGENT FILL",
  salary: "£14.50 – £16.00 / hr",
  type: "Full-time",
  startDate: "Immediate",
  compliance: "DBS Required",
  description: [
    "At Heritage Care Homes, our mission is to provide the highest standard of personalized care in a warm, welcoming environment. We are looking for a dedicated Senior Care Assistant to join our expert team in London. You will play a pivotal role in ensuring the well-being of our residents while providing leadership to our junior staff members.",
    "This is more than just a job; it's an opportunity to make a meaningful difference in the lives of the elderly. We value compassion, professional excellence, and a commitment to maintaining the dignity of every individual in our care.",
  ],
  responsibilities: [
    "Leading a team of care assistants and coordinating shift activities to ensure resident needs are met.",
    "Assisting residents with daily living tasks including personal care, mobility, and nutrition.",
    "Monitoring health conditions, administering medications, and maintaining detailed care records.",
    "Supporting families through regular communication and providing emotional guidance.",
    "Mentoring new staff and ensuring adherence to health and safety regulations.",
  ],
  requirements: [
    { icon: "edu",  text: "NVQ Level 3 in Health and Social Care (or equivalent)." },
    { icon: "exp",  text: "Minimum of 2 years experience in a senior care role." },
    { icon: "doc",  text: "Strong understanding of CQC regulations and medication administration." },
    { icon: "team", text: "Excellent interpersonal skills and the ability to lead a diverse team." },
  ],
};

const COMPLIANCE_ITEMS = [
  { label: "Right to Work",      status: "verified" as const },
  { label: "Enhanced DBS",       status: "pending"  as const },
  { label: "Vaccination Status", status: "verified" as const },
];

const SIMILAR_ROLES = [
  { title: "Registered Nurse",    company: "Sunrise Senior Living", rate: "£22/hr"    },
  { title: "Lead Carer",          company: "Bluebird Care",         rate: "£15.50/hr" },
  { title: "Healthcare Assistant",company: "Nightingale Care",      rate: "£13/hr"    },
];

// ─── Requirement icon ──────────────────────────────────────────────────────────

function ReqIcon({ type }: { type: string }) {
  const cls = "text-brand-blue shrink-0 mt-0.5";
  if (type === "edu") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
  if (type === "exp") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
  if (type === "doc") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
      {/* Back */}
      <Link
        href="/dashboard/candidate/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-5"
        data-gsap="fade-down"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Search
      </Link>

      <div className="flex flex-col md:flex-row gap-5 items-start">

        {/* ── Left: main content ───────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Hero card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-black text-brand tracking-tight">{JOB.title}</h1>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                    {JOB.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {JOB.location}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-brand-blue border border-blue-200 rounded-full text-[11px] font-bold tracking-wide">
                    {JOB.badge}
                  </span>
                </div>
              </div>
              <button className="shrink-0 px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shadow-sm">
                Apply Now
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Salary",     value: JOB.salary,     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg> },
                { label: "Type",       value: JOB.type,       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
                { label: "Start Date", value: JOB.startDate,  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg> },
                { label: "Compliance", value: JOB.compliance, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.icon}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="text-sm font-semibold text-brand mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5" data-gsap="fade-up">
            <div>
              <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                Job Description
              </h2>
              {JOB.description.map((p, i) => (
                <p key={i} className="text-sm text-slate-500 leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
            </div>

            <div>
              <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                Responsibilities
              </h2>
              <ul className="space-y-2">
                {JOB.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-base font-bold text-brand flex items-center gap-2 mb-3">
                <span className="w-1 h-5 bg-brand-blue rounded-full inline-block" />
                Requirements
              </h2>
              <ul className="space-y-2">
                {JOB.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <ReqIcon type={req.icon} />
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <div className="w-full md:w-[260px] md:shrink-0 space-y-4">

          {/* Company card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-brand">{JOB.company}</p>
                <p className="text-xs text-slate-400">Specialist Elderly Care</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              A network of luxury care homes dedicated to providing exceptional living standards for the elderly across the UK.
            </p>
            <button className="w-full border border-brand-blue text-brand-blue text-sm font-semibold rounded-xl py-2 hover:bg-blue-50 transition-colors">
              View Company Profile
            </button>
          </div>

          {/* Compliance checklist */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h3 className="text-sm font-bold text-brand">Compliance Checklist</h3>
            </div>
            <div className="space-y-2">
              {COMPLIANCE_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  {item.status === "verified" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Similar roles */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-3">Similar Roles</h3>
            <div className="space-y-2">
              {SIMILAR_ROLES.map((role) => (
                <button
                  key={role.title}
                  className="w-full text-left px-3 py-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <p className="text-sm font-semibold text-brand group-hover:text-brand-blue transition-colors">{role.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{role.company} • {role.rate}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
