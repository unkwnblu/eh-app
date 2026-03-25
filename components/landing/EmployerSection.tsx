import Link from "next/link";
import BrowserMockup from "./BrowserMockup";

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
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div data-gsap="slide-left">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
              For Employers
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
              Recruitment Intelligence for Modern Business.
            </h2>

            <ul className="mt-10 space-y-6">
              {features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/8 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand">{f.title}</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/employers/register"
              className="mt-10 inline-flex items-center gap-2 bg-brand text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-brand/90 transition-colors"
            >
              Start Hiring with Intelligence
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
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
