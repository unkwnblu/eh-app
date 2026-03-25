import Link from "next/link";

export default function SectorsCta() {
  return (
    <section className="bg-navy py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div data-gsap="fade-up" className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Heading */}
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            Not sure which sector fits?
            <br />
            Talk to our team.
          </h2>

          {/* Subtitle */}
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Our sector specialists will match you to the right talent pool —
            whether you&apos;re hiring or looking for work.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/employers/register"
              className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm rounded-full px-8 py-3.5 hover:bg-brand-blue-dark transition-colors"
            >
              I&apos;m an Employer
            </Link>
            <Link
              href="/candidates/register"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold text-sm rounded-full px-8 py-3.5 hover:border-white/60 transition-colors"
            >
              I&apos;m a Candidate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
