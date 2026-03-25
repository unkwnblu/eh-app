import Link from "next/link";

type PricingFeature = string;

type Plan = {
  name: string;
  price: string;
  priceNote?: string;
  tagline: string;
  badge?: string;
  features: PricingFeature[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "£299",
    priceNote: "/mo",
    tagline: "For SMEs making 1–3 hires per month.",
    features: [
      "3 active job posts",
      "ATS Kanban access",
      "RTW verification included",
      "Compliance review gate",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/employers/register?plan=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "£599",
    priceNote: "/mo",
    tagline: "For growing businesses scaling their team.",
    badge: "Most Popular",
    features: [
      "10 active job posts",
      "Priority candidate matching",
      "Full compliance dashboard",
      "Dedicated account manager",
      "Advanced ATS analytics",
      "Phone & email support",
    ],
    cta: "Start Free Trial",
    ctaHref: "/employers/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "For high-volume and complex hiring operations.",
    features: [
      "Unlimited job posts",
      "White-glove onboarding",
      "API access & integrations",
      "SLA guarantee",
      "Custom compliance workflows",
      "Dedicated success team",
    ],
    cta: "Talk to Sales",
    ctaHref: "/employers/contact",
    highlighted: false,
  },
];

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="flex-shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function PricingSection() {
  return (
    <section className="w-full bg-gray-soft py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div data-gsap="fade-up" className="text-center max-w-xl mx-auto mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
            Transparent.{" "}
            <span className="text-brand-blue">No surprises.</span>
          </h2>
          <p className="mt-4 text-slate-500 text-base leading-relaxed">
            Simple, flat-rate pricing that scales with your hiring volume.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              data-gsap="stagger-item"
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "bg-brand border-brand shadow-xl shadow-brand/20 ring-1 ring-brand"
                  : "bg-white border-gray-border"
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p
                className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                  plan.highlighted ? "text-white/60" : "text-brand-blue"
                }`}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-3">
                <span
                  className={`text-5xl font-black tracking-tight leading-none ${
                    plan.highlighted ? "text-white" : "text-brand"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.priceNote && (
                  <span
                    className={`text-base font-medium mb-1 ${
                      plan.highlighted ? "text-white/50" : "text-slate-400"
                    }`}
                  >
                    {plan.priceNote}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p
                className={`text-sm leading-relaxed mb-7 ${
                  plan.highlighted ? "text-white/70" : "text-slate-500"
                }`}
              >
                {plan.tagline}
              </p>

              {/* Divider */}
              <div
                className={`border-t mb-6 ${
                  plan.highlighted ? "border-white/15" : "border-gray-border"
                }`}
              />

              {/* Feature list */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span
                      className={
                        plan.highlighted ? "text-brand-blue" : "text-green-500"
                      }
                    >
                      <CheckIcon />
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/80" : "text-slate-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`w-full text-center text-sm font-semibold rounded-full py-3 transition-all ${
                  plan.highlighted
                    ? "bg-white text-brand hover:bg-white/90"
                    : "bg-brand text-white hover:bg-brand/90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p data-gsap="fade-up" className="text-center text-sm text-slate-400 mt-10">
          All plans include a{" "}
          <span className="font-semibold text-slate-500">14-day free trial</span>. No
          credit card required.
        </p>
      </div>
    </section>
  );
}
