"use client";

import { useState } from "react";
import Image from "next/image";

const industries = [
  {
    id: "healthcare",
    number: "01",
    name: "Healthcare",
    description:
      "Connecting the UK's most trusted clinical talent with NHS Trusts, private hospitals, and care networks.",
    roles: ["Band 5–7 Nurses", "Healthcare Assistants", "Allied Health", "Theatre Staff"],
    stat: { value: "48hrs", label: "avg. placement" },
    image:
      "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1200&auto=format&fit=crop&q=80",
    alt: "Healthcare professional",
  },
  {
    id: "hospitality",
    number: "02",
    name: "Hospitality",
    description:
      "From Michelin-starred kitchens to luxury hotel groups — we source talent that delivers exceptional experiences.",
    roles: ["Head Chefs", "Sous Chefs", "Front of House", "Events & Banqueting"],
    stat: { value: "200+", label: "venues served" },
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80",
    alt: "Fine dining restaurant",
  },
  {
    id: "customer-care",
    number: "03",
    name: "Customer Care",
    description:
      "Pre-vetted CX professionals ready to hit the ground running in contact centres and support operations.",
    roles: ["Contact Centre Agents", "CX Leads", "Team Managers", "Quality Analysts"],
    stat: { value: "4 days", label: "avg. hire time" },
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80",
    alt: "Customer service team",
  },
  {
    id: "tech",
    number: "04",
    name: "Tech & Data",
    description:
      "Engineers, analysts, and product specialists matched to UK scale-ups and enterprise teams with precision.",
    roles: ["Data Engineers", "Software Developers", "Product Managers", "BI Analysts"],
    stat: { value: "98%", label: "retention rate" },
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    alt: "Technology workspace",
  },
];

export default function IndustriesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full bg-navy py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-6">
          <div data-gsap="fade-up">
            <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
              Our Specialisms
            </span>
            <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Industries we serve.
            </h2>
          </div>
          <p data-gsap="fade-up" className="text-slate-400 text-sm max-w-xs leading-relaxed lg:text-right">
            Specialised recruitment for four of the UK&apos;s highest-demand sectors —
            built for speed, compliance, and quality.
          </p>
        </div>

        {/* ── Desktop: expanding accordion panels ── */}
        <div className="hidden lg:flex gap-2 h-[540px]">
          {industries.map((ind, i) => (
            <div
              key={ind.id}
              onMouseEnter={() => setActive(i)}
              className="relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-500 ease-in-out"
              style={{ flex: active === i ? "4 1 0%" : "1 1 0%", minWidth: 0 }}
            >
              {/* Background image */}
              <Image
                src={ind.image}
                alt={ind.alt}
                fill
                sizes="(max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-700"
                style={{ transform: active === i ? "scale(1.06)" : "scale(1)" }}
              />

              {/* Overlays */}
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{ background: active === i ? "rgba(10,20,50,0.45)" : "rgba(10,20,50,0.72)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-transparent" />

              {/* ── Collapsed view: vertical number + name ── */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: active === i ? 0 : 1, pointerEvents: active === i ? "none" : "auto" }}
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="text-white/30 text-[10px] font-bold tracking-widest">
                    {ind.number}
                  </span>
                  <p
                    className="text-white font-black text-lg whitespace-nowrap select-none"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {ind.name}
                  </p>
                </div>
              </div>

              {/* ── Expanded view ── */}
              <div
                className="absolute inset-0 p-8 flex flex-col justify-between transition-opacity duration-300"
                style={{ opacity: active === i ? 1 : 0, pointerEvents: active === i ? "auto" : "none" }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">
                    {ind.number} — {ind.name}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>

                {/* Bottom content */}
                <div>
                  <h3 className="text-white font-black text-3xl xl:text-4xl mb-3 leading-tight">
                    {ind.name}
                  </h3>
                  <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-xs">
                    {ind.description}
                  </p>

                  {/* Role chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {ind.roles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] font-semibold text-white/75 border border-white/20 rounded-full px-2.5 py-1 bg-white/5 backdrop-blur-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  {/* Stat + CTA */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-brand-blue font-black text-3xl leading-none">
                        {ind.stat.value}
                      </p>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                        {ind.stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Mobile: stacked cards ── */}
        <div className="lg:hidden space-y-3">
          {industries.map((ind) => (
            <div key={ind.id} className="relative rounded-2xl overflow-hidden h-56">
              <Image
                src={ind.image}
                alt={ind.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <span className="text-white/40 text-[10px] font-bold tracking-widest">
                  {ind.number}
                </span>
                <div>
                  <h3 className="text-white font-black text-xl mb-1">{ind.name}</h3>
                  <p className="text-white/60 text-xs leading-relaxed mb-3">{ind.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.roles.slice(0, 3).map((role) => (
                      <span
                        key={role}
                        className="text-[10px] font-semibold text-white/70 border border-white/20 rounded-full px-2.5 py-1 bg-white/5"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-8">
          {industries.map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                active === i ? "w-8 bg-brand-blue" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
