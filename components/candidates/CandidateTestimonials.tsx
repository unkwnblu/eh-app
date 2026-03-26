import SectionHeader from "@/components/ui/SectionHeader";
import StarRating from "@/components/ui/StarRating";

const testimonials = [
  {
    quote:
      "I uploaded my DBS and NMC PIN once. Within four days I had two interview offers from NHS trusts. The visibility is unlike anything else.",
    name: "Adeola Mensah",
    title: "Band 6 Registered Nurse",
    location: "Birmingham",
    initials: "AM",
    color: "bg-brand",
  },
  {
    quote:
      "No ghosting, no black holes. I always knew where my application was. Got my role within 10 days of registering.",
    name: "Priya Sharma",
    title: "Customer Success Lead",
    location: "London",
    initials: "PS",
    color: "bg-brand-blue",
  },
  {
    quote:
      "Edge Harbour matched me with a fintech startup that actually understood my stack. Interviewed Tuesday, offer Friday.",
    name: "James Okafor",
    title: "Senior Data Engineer",
    location: "Manchester",
    initials: "JO",
    color: "bg-slate-700",
  },
];

export default function CandidateTestimonials() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <SectionHeader
          label="Real Stories"
          heading="Candidates who found their role."
          className="mb-14"
          data-gsap="fade-up"
        />

        {/* Testimonial grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-gsap="stagger-item"
              className="group relative bg-white border border-gray-border rounded-2xl p-7 hover:border-brand-blue/30 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Stars */}
              <div className="flex items-center justify-between mb-5">
                <StarRating />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider border border-gray-border rounded-full px-2.5 py-1">
                  Candidate
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-border">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand">{t.name}</p>
                  <p className="text-xs text-slate-400">
                    {t.title} &middot; {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
