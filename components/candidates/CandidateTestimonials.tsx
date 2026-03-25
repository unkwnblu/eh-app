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

function StarRating() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-amber-400"
        >
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function CandidateTestimonials() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Real Stories
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
            Candidates who found their role.
          </h2>
        </div>

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
