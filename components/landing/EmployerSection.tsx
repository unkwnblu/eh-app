import BrowserMockup from "./BrowserMockup";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import IconBadge from "@/components/ui/IconBadge";

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Instant Compliance Verification",
    body: "Real-time RTW and certification checks integrated directly into your workflow for peace of mind.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI-Driven Talent Matching",
    body: "Our proprietary algorithms connect you with the top 5% of niche talent based on both skill and cultural alignment.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Reduced Time-to-Fill",
    body: "Slashed hiring cycles with pre-vetted, role-ready pools that are ready to interview when you are.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Detailed Performance Analytics",
    body: "Full visibility into your recruitment funnel with data-backed insights on your hiring efficiency.",
  },
];

export default function EmployerSection() {
  return (
    <section className="w-full bg-white dark:bg-[#111827] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div data-gsap="slide-left">
            <SectionHeader
              label="For Employers"
              heading="Recruitment Intelligence for Modern Business."
            />

            <ul className="mt-10 space-y-6">
              {features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <IconBadge size="sm" className="mt-0.5">
                    {f.icon}
                  </IconBadge>
                  <div>
                    <p className="text-sm font-bold text-brand dark:text-white">{f.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              href="/employers/register"
              variant="primary"
              className="mt-10"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              }
            >
              Start Hiring with Intelligence
            </Button>
          </div>

          {/* Right mockup */}
          <div data-gsap="slide-right" className="flex justify-center lg:justify-end">
            <BrowserMockup variant="employer" />
          </div>
        </div>
      </div>
    </section>
  );
}
