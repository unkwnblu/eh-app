import SectionHeader from "@/components/ui/SectionHeader";

const steps = [
  {
    number: "01",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    title: "Create Your Profile",
    body: "Sign up and enter your personal and professional details. Takes less than 5 minutes.",
  },
  {
    number: "02",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
    ),
    title: "Upload Your Credentials",
    body: "Upload your RTW documents, DBS certificate, NMC PIN, or other sector-specific qualifications.",
  },
  {
    number: "03",
    icon: (
      <svg
        width="22"
        height="22"
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
    title: "Get Verified",
    body: "Our compliance team manually reviews your documents within 24–48 hours and marks you as Role Ready.",
  },
  {
    number: "04",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Start Getting Matched",
    body: "Employers browse verified candidates directly. You'll receive interview requests and real-time updates.",
  },
];

export default function HowCandidatesWork() {
  return (
    <section id="how-it-works" className="w-full bg-gray-soft dark:bg-[#0B1222] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <SectionHeader
          label="Your Journey"
          heading="From registration to role-ready."
          className="mb-16 text-center"
          data-gsap="fade-up"
        />

        {/* Steps grid */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Dashed connector line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-gray-border dark:border-white/10 z-0"
          />

          {steps.map((step, i) => (
            <div
              key={i}
              data-gsap="stagger-item"
              className="relative z-10 flex flex-col bg-white dark:bg-[#111827] rounded-2xl border border-gray-border dark:border-white/10 p-6 hover:border-brand-blue/30 hover:shadow-sm transition-all"
            >
              {/* Large background number */}
              <span
                aria-hidden="true"
                className="absolute top-3 right-4 text-6xl font-black text-gray-border/70 dark:text-white/5 leading-none select-none pointer-events-none"
              >
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-brand/5 dark:bg-white/5 border border-brand/10 dark:border-white/10 flex items-center justify-center text-brand dark:text-white mb-5 flex-shrink-0">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-sm font-bold text-brand dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
