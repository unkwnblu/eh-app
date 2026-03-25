import Link from "next/link";

export default function ComplianceCta() {
  return (
    <section className="w-full bg-brand-blue py-20">
      <div
        data-gsap="fade-up"
        className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center text-center"
      >
        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-5 max-w-2xl">
          Compliance you can trust. Hires you can stand behind.
        </h2>
        <p className="text-white/70 text-base leading-relaxed max-w-xl mb-10">
          Whether you&apos;re an employer protecting your business or a
          candidate building your verified profile — Edge Harbour has you
          covered.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="#"
            className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold text-sm rounded-full px-7 py-3.5 hover:bg-gray-soft transition-colors"
          >
            I&apos;m an Employer
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold text-sm rounded-full px-7 py-3.5 hover:border-white/70 transition-colors"
          >
            I&apos;m a Candidate
          </Link>
        </div>
      </div>
    </section>
  );
}
