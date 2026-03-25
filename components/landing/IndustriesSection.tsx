import Image from "next/image";

const industries = [
  {
    name: "Healthcare",
    description: "Nurses, HCAs, Allied Health Professionals",
    image:
      "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=800&auto=format&fit=crop&q=80",
    alt: "Healthcare professionals in a hospital setting",
  },
  {
    name: "Hospitality",
    description: "Chefs, FOH, Hotel & Events Specialists",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
    alt: "Fine dining restaurant interior",
  },
  {
    name: "Customer Care",
    description: "Contact Centre, CX & Support Teams",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80",
    alt: "Customer service representative at work",
  },
  {
    name: "Tech & Data Analysis",
    description: "Engineers, Analysts & Product SMEs",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    alt: "Technology and data analytics workspace",
  },
];

export default function IndustriesSection() {
  return (
    <section className="w-full bg-navy py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="text-center mb-14">
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
              data-gsap="stagger-item"
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Background image */}
              <Image
                src={industry.image}
                alt={industry.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Dark overlay — darkens on hover */}
              <div className="absolute inset-0 bg-navy/60 group-hover:bg-navy/40 transition-colors duration-500" />

              {/* Bottom gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />

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
                  <p className="text-white/60 text-xs leading-relaxed group-hover:text-white/80 transition-colors">
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
