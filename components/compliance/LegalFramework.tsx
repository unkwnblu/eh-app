const laws = [
  {
    name: "Immigration Act 2014",
    body: "Mandates Right to Work checks for all employees. Failure to comply carries civil penalties of up to £20,000 per illegal worker.",
  },
  {
    name: "Rehabilitation of Offenders Act 1974",
    body: "Governs DBS disclosure. We apply the correct level of check (Standard/Enhanced) based on role type and sector.",
  },
  {
    name: "UK GDPR / Data Protection Act 2018",
    body: "All candidate documents are stored securely, processed lawfully, and retained only as long as necessary. ICO registered.",
  },
  {
    name: "Nursing & Midwifery Order 2001",
    body: "Requires active NMC registration for all nursing roles. We verify PIN status directly against the NMC register.",
  },
  {
    name: "Food Safety Act 1990",
    body: "Requires appropriate food hygiene training for food handlers. We validate Level 2/3 certificates for all hospitality candidates.",
  },
  {
    name: "BS7858:2019",
    body: "British Standard for screening individuals in secure environments. Applied to Customer Service and Tech roles with data access.",
  },
];

export default function LegalFramework() {
  return (
    <section className="w-full bg-navy py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-4 block">
            Legal Foundation
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-5">
            Every check has a
            <br />
            legal basis.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            We don&apos;t make up our compliance requirements. Every
            verification is grounded in UK law or sector regulation.
          </p>
        </div>

        {/* Law cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {laws.map((law) => (
            <div
              key={law.name}
              data-gsap="stagger-item"
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all"
            >
              <h3 className="text-white font-bold text-sm mb-3">{law.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{law.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
