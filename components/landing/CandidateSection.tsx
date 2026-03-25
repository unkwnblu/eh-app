import Link from "next/link";
import BrowserMockup from "./BrowserMockup";

const benefits = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Direct Visibility",
    body: "Your profile gets showcased directly to decision-makers, bypassing the black hole of traditional job boards.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Clear Application Tracking",
    body: "Know exactly where you stand with real-time status updates on every application you make.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Fast Feedback Loops",
    body: "No more ghosting. We prioritise prompt feedback from employers to help you improve and secure the right role.",
  },
];

export default function CandidateSection() {
  return (
    <section className="w-full bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left mockup */}
          <div className="flex justify-center lg:justify-start">
            <BrowserMockup variant="candidate" />
          </div>

          {/* Right copy */}
          <div>
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
              For Job Seekers
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
              A Better Way to Work.
            </h2>
            <p className="mt-5 text-slate-500 text-base leading-relaxed max-w-md">
              Join thousands of UK professionals who&apos;ve found their next role
              through Edge Harbour&apos;s compliance-first matching process.
            </p>

            <ul className="mt-10 space-y-7">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/8 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand">{b.title}</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/candidates/register"
              className="mt-10 inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-brand-blue-dark transition-colors"
            >
              Get Started as a Candidate
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
