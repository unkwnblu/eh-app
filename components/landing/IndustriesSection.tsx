const industries = [
  {
    name: "Healthcare",
    description: "Nurses, HCAs, Allied Health Professionals",
    accent: "from-brand/80 to-navy",
  },
  {
    name: "Hospitality",
    description: "Chefs, FOH, Hotel & Events Specialists",
    accent: "from-navy to-brand/90",
  },
  {
    name: "Customer Care",
    description: "Contact Centre, CX & Support Teams",
    accent: "from-brand-blue/70 to-navy",
  },
  {
    name: "Tech & Data Analysis",
    description: "Engineers, Analysts & Product SMEs",
    accent: "from-navy to-brand-blue/60",
  },
];

export default function IndustriesSection() {
  return (
    <section className="w-full bg-navy py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Our Specialisms
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Industries we serve.
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-lg mx-auto">
            Specialised recruitment solutions tailored for high-demand UK sectors
            with precision and speed.
          </p>
        </div>

        {/* Industry panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-96">
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${industry.accent} opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6">
                {/* Vertical label */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <p
                    className="text-white/10 font-black text-5xl whitespace-nowrap select-none group-hover:text-white/5 transition-colors"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {industry.name}
                  </p>
                </div>

                {/* Foreground text */}
                <div className="relative">
                  <p className="text-white font-bold text-sm lg:text-base leading-snug mb-1">
                    {industry.name}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed group-hover:text-white/70 transition-colors">
                    {industry.description}
                  </p>
                  <div className="mt-3 w-6 h-0.5 bg-brand-blue group-hover:w-10 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Hover over a sector to explore our specialised talent programmes
        </p>
      </div>
    </section>
  );
}
