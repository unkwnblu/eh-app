import SectionHeader from "@/components/ui/SectionHeader";

const steps = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    label: "We source candidates from our verified pool — matched to your role and sector.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: "Our compliance team checks RTW, DBS, and every sector-specific credential.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    label: "Edge Harbour conducts structured interviews so you never waste a slot.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    label: "You receive a curated shortlist. Review profiles and make the final call.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "We handle all candidate communications, rejections, and follow-ups for you.",
  },
];

type ShortlistCardProps = {
  name: string;
  role: string;
  rtw: boolean;
  dbs: boolean;
  interviewed: boolean;
};

function ShortlistCard({ name, role, rtw, dbs, interviewed }: ShortlistCardProps) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-border dark:border-white/10 p-3 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-brand-blue/8 border border-brand-blue/15 flex items-center justify-center flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{name}</p>
          <p className="text-[10px] text-slate-400 truncate">{role}</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 rounded-full px-1.5 py-0.5">
            Ready
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-[9px] font-medium rounded-full px-1.5 py-0.5 ${rtw ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
          <span className={`w-1 h-1 rounded-full ${rtw ? "bg-green-400" : "bg-amber-400"}`} />
          RTW
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-medium rounded-full px-1.5 py-0.5 ${dbs ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
          <span className={`w-1 h-1 rounded-full ${dbs ? "bg-green-400" : "bg-amber-400"}`} />
          DBS
        </div>
        <div className={`flex items-center gap-1 text-[9px] font-medium rounded-full px-1.5 py-0.5 ${interviewed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
          <span className={`w-1 h-1 rounded-full ${interviewed ? "bg-green-400" : "bg-amber-400"}`} />
          Interviewed
        </div>
      </div>
    </div>
  );
}

const shortlist: ShortlistCardProps[] = [
  { name: "Sarah M.", role: "Senior Nurse (Band 6)", rtw: true, dbs: true, interviewed: true },
  { name: "James T.", role: "Head Chef", rtw: true, dbs: true, interviewed: true },
  { name: "Priya S.", role: "Customer Success Lead", rtw: true, dbs: true, interviewed: true },
];

export default function AtsPreview() {
  return (
    <section className="w-full bg-white dark:bg-[#111827] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <SectionHeader
          label="How It Works For You"
          heading={
            <>
              Post a role.{" "}
              <span className="text-brand-blue">We handle the rest.</span>
            </>
          }
          description="From sourcing to verification to interviewing — Edge Harbour manages the full candidate journey. You receive a curated shortlist of people who are ready to start."
          className="text-center max-w-2xl mx-auto mb-16"
          data-gsap="fade-up"
        />

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: what we do */}
          <div data-gsap="slide-left">
            <ul className="space-y-5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/8 border border-brand-blue/12 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                    {step.icon}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                    {step.label}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 text-xs text-green-700 font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Every candidate you see has already been verified and interviewed
            </div>
          </div>

          {/* Right: shortlist mockup */}
          <div data-gsap="slide-right">
            <div className="bg-gray-soft dark:bg-[#0B1222] rounded-2xl border border-gray-border dark:border-white/10 p-4">
              {/* Mockup top bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-300" />
                  <div className="w-2 h-2 rounded-full bg-amber-300" />
                  <div className="w-2 h-2 rounded-full bg-green-300" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                  Your Shortlist — Senior Nurse (Band 6)
                </span>
                <div className="w-14" />
              </div>

              {/* Shortlist header pill */}
              <div className="flex items-center gap-2 mb-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl px-3 py-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <p className="text-[10px] text-green-700 dark:text-green-400 font-semibold">
                  3 candidates verified &amp; interviewed — ready to hire
                </p>
              </div>

              {/* Candidate shortlist cards */}
              <div className="flex flex-col gap-2">
                {shortlist.map((candidate) => (
                  <ShortlistCard key={candidate.name} {...candidate} />
                ))}
              </div>

              {/* Mockup footer */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  All checks completed by Edge Harbour
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">RTW · DBS · Interview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
