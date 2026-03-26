import SectionHeader from "@/components/ui/SectionHeader";
import StarRating from "@/components/ui/StarRating";

const testimonials = [
  {
    quote:
      "We filled three senior nursing roles in under a week. Every candidate was RTW-verified before we even picked up the phone. It's transformed our resourcing process.",
    name: "Claire Hendricks",
    title: "Head of Recruitment",
    company: "Northgate Health Group",
    sector: "Healthcare",
    initials: "CH",
    color: "bg-brand",
  },
  {
    quote:
      "The compliance gate in the ATS is genuinely game-changing. We had a near-miss with a contractor last year — Edge Harbour makes that impossible to repeat.",
    name: "Marcus Webb",
    title: "Operations Director",
    company: "Elevate Hospitality Ltd.",
    sector: "Hospitality",
    initials: "MW",
    color: "bg-brand-blue",
  },
  {
    quote:
      "I uploaded my DBS and NMC PIN once. Within four days I had two interview offers from NHS trusts I'd never heard of. The visibility is unlike anything else I've used.",
    name: "Adeola Mensah",
    title: "Band 6 Registered Nurse",
    company: "Birmingham, UK",
    sector: "Candidate",
    initials: "AM",
    color: "bg-slate-700",
  },
  {
    quote:
      "As a tech SME we struggle to compete with big agencies. Edge Harbour connected us with niche data engineers who actually understood our stack and culture.",
    name: "Tom Ashford",
    title: "CTO",
    company: "Parallax Systems",
    sector: "Tech & Data",
    initials: "TA",
    color: "bg-brand",
  },
  {
    quote:
      "No ghosting, no black holes. I always knew where my application was. Got my role as Customer Success Lead within 10 days of registering.",
    name: "Priya Sharma",
    title: "Customer Success Lead",
    company: "London, UK",
    sector: "Candidate",
    initials: "PS",
    color: "bg-brand-blue",
  },
  {
    quote:
      "We've used four recruitment agencies over five years. Edge Harbour is the only one that understood what 'compliance-first' actually means in practice.",
    name: "Rachel Okafor",
    title: "HR Manager",
    company: "Crescent Care Homes",
    sector: "Healthcare",
    initials: "RO",
    color: "bg-slate-700",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <SectionHeader
            label="What People Say"
            heading={<>Trusted by employers<br />and candidates alike.</>}
          />
          <p className="text-slate-500 text-sm max-w-xs sm:text-right leading-relaxed">
            Rated 4.9/5 across 200+ verified reviews from UK employers and professionals.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-gsap="stagger-item"
              className="group relative bg-white border border-gray-border rounded-2xl p-7 hover:border-brand-blue/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Sector badge */}
              <div className="flex items-center justify-between mb-5">
                <StarRating />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border border-gray-border rounded-full px-2.5 py-1">
                  {t.sector}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-border">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.title} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
