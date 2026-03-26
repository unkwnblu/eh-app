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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    title: "Register & Verify",
    body: "Enter your CRN. We auto-fill your company details via Companies House API and verify your business in seconds.",
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
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
    title: "Post Your Vacancy",
    body: "Describe the role and set sector-specific requirements. Our system handles RTW and credential pre-screening automatically.",
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
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Review & Hire",
    body: "Shortlist from a compliance-gated candidate pool. Every profile in your pipeline is pre-verified before you see it.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-white dark:bg-[#111827] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <SectionHeader
          label="The Process"
          heading="Up and running in minutes."
          className="text-center max-w-2xl mx-auto mb-16"
          data-gsap="fade-up"
        />

        {/* Steps grid */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gray-border dark:bg-white/10"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                data-gsap="stagger-item"
                className="relative flex flex-col items-start lg:items-center lg:text-center"
              >
                {/* Step number + icon row */}
                <div className="relative flex items-center gap-4 lg:flex-col lg:gap-3 mb-6">
                  {/* Large background number */}
                  <span className="text-7xl font-black text-brand-blue/8 leading-none select-none absolute -top-3 -left-2 lg:static lg:block">
                    {step.number}
                  </span>

                  {/* Icon circle — sits on top of the connecting line */}
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-brand-blue/8 border border-brand-blue/15 flex items-center justify-center text-brand-blue flex-shrink-0 lg:mx-auto ml-16">
                    {step.icon}
                  </div>
                </div>

                <div className="lg:px-4">
                  <h3 className="text-lg font-bold text-brand dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.body}</p>
                </div>

                {/* Mobile arrow connector */}
                {step.number !== "03" && (
                  <div
                    aria-hidden="true"
                    className="lg:hidden mt-8 flex items-center justify-center w-full"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="text-gray-border dark:text-white/10 rotate-90"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div data-gsap="fade-up" className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-soft dark:bg-[#0B1222] border border-gray-border dark:border-white/10 rounded-full px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-brand-blue"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            Most employers post their first vacancy within 10 minutes of signing up
          </div>
        </div>
      </div>
    </section>
  );
}
