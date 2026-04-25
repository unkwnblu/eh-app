import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${siteUrl}/about`,
  url: `${siteUrl}/about`,
  name: "About Edge Harbour",
  description:
    "Edge Harbour is the UK's compliance-first recruitment platform connecting pre-vetted candidates with verified employers across Healthcare, Hospitality, Customer Service, and Technology.",
  publisher: { "@id": `${siteUrl}/#organization` },
  about: {
    "@id": `${siteUrl}/#organization`,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "About Us – Our Mission, Vision & Team",
  description:
    "Edge Harbour is the UK's compliance-first recruitment platform connecting pre-vetted candidates with verified employers across Healthcare, Hospitality, Customer Service, and Tech.",
  keywords: [
    "about Edge Harbour",
    "UK recruitment company",
    "compliance hiring platform",
    "Edge Harbour team",
    "recruitment mission UK",
    "HR tech startup UK",
  ],
  openGraph: {
    title: "About Edge Harbour – Mission, Vision & Team",
    description:
      "Learn about our mission, vision, and the team behind the UK's compliance-first recruitment platform.",
    url: "/about",
    type: "website",
  },
  twitter: {
    title: "About Edge Harbour – Mission, Vision & Team",
    description:
      "Learn about our mission, vision, and the team behind the UK's compliance-first recruitment platform.",
  },
  alternates: { canonical: "/about" },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const VALUES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Compliance First",
    body: "We built compliance into the foundation, not as an afterthought. Every candidate is Right-to-Work verified before a single introduction is made.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "People Over Process",
    body: "Behind every CV is a person with ambitions. We keep humans at the centre of every hiring decision, using technology to support — not replace — human judgement.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Speed With Integrity",
    body: "Hiring should be fast and trustworthy — not one or the other. Our platform reduces time-to-hire by 65% without ever cutting corners on vetting.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12c0 .778.099 1.533.284 2.253" />
      </svg>
    ),
    title: "Inclusive by Design",
    body: "We champion diversity in the workforce. Our platform is built to reduce bias and open doors for candidates from all backgrounds across the UK.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Radical Transparency",
    body: "No hidden fees, no opaque pipelines. Employers see exactly what they pay for and candidates always know where they stand in the process.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Continuous Improvement",
    body: "We iterate constantly based on feedback from employers and candidates alike. The platform you see today is better than yesterday's — and tomorrow's will be better still.",
  },
];

const STATS = [
  { value: "5,000+", label: "Candidates registered" },
  { value: "500+",   label: "Verified employers" },
  { value: "65%",    label: "Faster time-to-hire" },
  { value: "100%",   label: "RTW verified placements" },
];

const TEAM = [
  {
    name:  "James Okafor",
    role:  "CEO & Co-Founder",
    bio:   "Former Head of Talent at a FTSE 250 healthcare group. Built Edge Harbour after experiencing first-hand how broken the compliance process was for agency workers.",
    initials: "JO",
    colour: "bg-brand-blue",
  },
  {
    name:  "Priya Nair",
    role:  "CTO & Co-Founder",
    bio:   "10 years in HR-tech. Previously led engineering at two successful recruitment SaaS companies. Passionate about using technology to create fairer hiring outcomes.",
    initials: "PN",
    colour: "bg-teal-500",
  },
  {
    name:  "Marcus Webb",
    role:  "Head of Compliance",
    bio:   "Chartered member of the CIPD with deep expertise in UK employment law, Right-to-Work legislation, and DBS frameworks across regulated sectors.",
    initials: "MW",
    colour: "bg-violet-500",
  },
  {
    name:  "Saoirse Brennan",
    role:  "Head of Candidate Experience",
    bio:   "Spent a decade supporting healthcare workers through complex registration processes. Champions every candidate's journey from sign-up to placement.",
    initials: "SB",
    colour: "bg-rose-500",
  },
];

const MILESTONES = [
  { year: "2021", event: "Edge Harbour founded in London, initially focused on Healthcare staffing." },
  { year: "2022", event: "Launched the compliance-first candidate vetting pipeline. First 100 employers onboarded." },
  { year: "2023", event: "Expanded into Hospitality and Customer Service sectors. Reached 1,000 successful placements." },
  { year: "2024", event: "Launched the full ATS and shift management platform. Tech & Data sector added." },
  { year: "2025", event: "5,000+ active candidates. Recognised as one of the UK's fastest-growing HR-tech platforms." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <GsapAnimations />
      <Navbar />

      <main id="main-content" className="flex flex-col flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-white dark:bg-[#0B1222] overflow-hidden py-24 md:py-32">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 pointer-events-none" />
          {/* Blue glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-6 text-center" data-gsap="fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              About Edge Harbour
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-brand dark:text-white tracking-tight leading-[1.1] mb-6">
              Recruitment built on{" "}
              <span className="text-brand-blue">trust</span> and{" "}
              <span className="text-brand-blue">compliance</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              We&apos;re on a mission to fix the broken relationship between employers, candidates, and compliance — making ethical, efficient hiring the default across the UK workforce.
            </p>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        <section className="bg-brand-blue py-12">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" data-gsap="fade-up">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
                  <p className="text-sm text-blue-100 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission & Vision ──────────────────────────────────────────────── */}
        <section className="bg-[#F7F8FA] dark:bg-[#111827] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Mission */}
              <div className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/10 rounded-3xl p-10" data-gsap="fade-up">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center mb-6">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-3">Our Mission</p>
                <h2 className="text-2xl font-black text-brand dark:text-white leading-tight mb-4">
                  Make compliant hiring the path of least resistance
                </h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                  We exist to eliminate the compliance burden from the hiring process — for both employers and candidates. By building verification, credential checks, and Right-to-Work validation directly into the platform, we make doing the right thing the easiest thing.
                </p>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mt-3">
                  Every placement made through Edge Harbour is one that employers can stand behind and candidates can be proud of.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-brand dark:bg-[#1a2235] border border-gray-100 dark:border-white/10 rounded-3xl p-10" data-gsap="fade-up">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-3">Our Vision</p>
                <h2 className="text-2xl font-black text-white leading-tight mb-4">
                  A UK workforce where everyone is protected and valued
                </h2>
                <p className="text-blue-100 leading-relaxed text-sm">
                  We envision a future where no employer unknowingly hires someone without the right to work, and no candidate is exploited due to document uncertainty. A labour market built on verified trust — where hiring is faster, fairer, and fully accountable.
                </p>
                <p className="text-blue-100 leading-relaxed text-sm mt-3">
                  Edge Harbour is the infrastructure that makes that future possible — across every sector, every region, every role.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Story ─────────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0B1222] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-start">

              {/* Text */}
              <div className="flex-1" data-gsap="fade-up">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-4">Our Story</p>
                <h2 className="text-3xl md:text-4xl font-black text-brand dark:text-white tracking-tight leading-tight mb-6">
                  Born from a broken system
                </h2>
                <div className="space-y-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  <p>
                    Edge Harbour was founded in 2021 after our CEO James spent years watching the same preventable compliance failures play out — healthcare workers placed without proper DBS checks, hospitality venues hiring undocumented workers unknowingly, and tech contractors working without verified right-to-work status.
                  </p>
                  <p>
                    The existing tools weren&apos;t solving it. Spreadsheets, email chains, and disconnected platforms meant compliance was always someone else&apos;s problem until it became everyone&apos;s crisis.
                  </p>
                  <p>
                    So we built Edge Harbour — a single platform where compliance isn&apos;t a checkbox at the end of the hiring process, but the very foundation it&apos;s built on. Pre-vetted candidates. Verified employers. A full audit trail from first application to final placement.
                  </p>
                  <p>
                    Today we serve employers and candidates across Healthcare, Hospitality, Customer Service, and Technology — and we&apos;re just getting started.
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="w-full lg:w-[340px] shrink-0" data-gsap="fade-up">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100 dark:bg-white/10" />
                  <div className="space-y-8">
                    {MILESTONES.map((m) => (
                      <div key={m.year} className="flex gap-5 items-start relative">
                        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0 z-10">
                          <span className="text-[10px] font-black text-white">{m.year.slice(2)}</span>
                        </div>
                        <div className="pt-1">
                          <p className="text-xs font-bold text-brand-blue mb-1">{m.year}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{m.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────────────────── */}
        <section className="bg-[#F7F8FA] dark:bg-[#111827] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14" data-gsap="fade-up">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-3">What we stand for</p>
              <h2 className="text-3xl md:text-4xl font-black text-brand dark:text-white tracking-tight">Our core values</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
                These aren&apos;t wall art — they&apos;re the principles that drive every product decision, every hire, and every client interaction.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-gsap="fade-up">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-white/10 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4">
                    {v.icon}
                  </div>
                  <h3 className="text-base font-bold text-brand dark:text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ──────────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0B1222] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14" data-gsap="fade-up">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-3">The people behind it</p>
              <h2 className="text-3xl md:text-4xl font-black text-brand dark:text-white tracking-tight">Meet the team</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
                A small, focused team of recruitment, compliance, and technology specialists united by a shared belief that hiring can be better.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" data-gsap="fade-up">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="bg-[#F7F8FA] dark:bg-[#1a2235] border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-2xl ${member.colour} flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-lg font-black text-white">{member.initials}</span>
                  </div>
                  <p className="text-sm font-bold text-brand dark:text-white">{member.name}</p>
                  <p className="text-xs text-brand-blue font-semibold mt-0.5 mb-3">{member.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why compliance matters ────────────────────────────────────────── */}
        <section className="bg-[#F7F8FA] dark:bg-[#111827] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-brand rounded-3xl overflow-hidden" data-gsap="fade-up">

              {/* Top — heading + body */}
              <div className="px-10 pt-12 pb-10 flex flex-col lg:flex-row gap-10 lg:items-center border-b border-white/10">
                <div className="lg:w-[45%] shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-4">Why it matters</p>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    Non-compliance isn&apos;t just a legal risk —{" "}
                    <span className="text-blue-200">it&apos;s a human one</span>
                  </h2>
                </div>
                <div className="flex-1 space-y-3 text-blue-100 text-sm leading-relaxed">
                  <p>
                    In the UK, employing someone without the right to work carries a civil penalty of up to{" "}
                    <strong className="text-white">£60,000 per worker</strong>. In regulated sectors like healthcare,
                    it can result in criminal prosecution.
                  </p>
                  <p>
                    Beyond the legal consequences, non-compliance creates unsafe environments — for patients, guests,
                    and colleagues. Edge Harbour exists to close that gap permanently.
                  </p>
                </div>
              </div>

              {/* Bottom — 4 stats in a row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
                {[
                  { value: "£60k",   label: "Max penalty per worker" },
                  { value: "1 in 4", label: "UK businesses cite compliance as top hiring risk" },
                  { value: "72hrs",  label: "Avg RTW check without Edge Harbour" },
                  { value: "< 1hr",  label: "Avg RTW check with Edge Harbour" },
                ].map((s) => (
                  <div key={s.label} className="px-7 py-8 text-center">
                    <p className="text-3xl font-black text-white">{s.value}</p>
                    <p className="text-xs text-blue-200 mt-2 leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#0B1222] py-24">
          <div className="max-w-3xl mx-auto px-6 text-center" data-gsap="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-brand dark:text-white tracking-tight mb-4">
              Ready to hire — or be hired — the right way?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
              Join thousands of employers and candidates who trust Edge Harbour to make compliance effortless and hiring human.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-brand-blue text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-sm"
              >
                Create a free account
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 border border-brand dark:border-white/20 text-brand dark:text-white text-sm font-bold rounded-full hover:bg-brand hover:text-white dark:hover:bg-white/10 transition-all"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
