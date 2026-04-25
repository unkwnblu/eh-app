import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

const collectionPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Legal Documents – Edge Harbour",
  url: `${siteUrl}/legal`,
  description:
    "Edge Harbour's legal documents including Terms of Service, Privacy Policy, and Compliance Framework.",
  publisher: { "@id": `${siteUrl}/#organization` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Legal", item: `${siteUrl}/legal` },
    ],
  },
  hasPart: [
    { "@type": "WebPage", name: "Terms of Service", url: `${siteUrl}/legal/terms` },
    { "@type": "WebPage", name: "Privacy Policy", url: `${siteUrl}/legal/privacy` },
    { "@type": "WebPage", name: "Compliance Framework", url: `${siteUrl}/compliance` },
  ],
};

export const metadata: Metadata = {
  title: "Legal – Terms, Privacy Policy & Compliance",
  description:
    "Review Edge Harbour's legal documents: Terms of Service, Privacy Policy, and our Compliance Framework — all aligned with UK law and GDPR.",
  keywords: [
    "Edge Harbour terms of service",
    "Edge Harbour privacy policy",
    "GDPR recruitment platform",
    "ICO registered UK",
    "recruitment legal documents",
  ],
  openGraph: {
    title: "Legal Documents – Edge Harbour",
    description:
      "Terms of Service, Privacy Policy, and Compliance Framework — all aligned with UK law and GDPR.",
    url: "/legal",
    type: "website",
  },
  twitter: {
    title: "Legal Documents – Edge Harbour",
    description: "Terms of Service, Privacy Policy, and Compliance Framework — aligned with UK law.",
  },
  alternates: { canonical: "/legal" },
  robots: { index: true, follow: false },
};

const legalCards = [
  {
    title: "Terms of Service",
    description:
      "The rules governing your use of the Edge Harbour platform as an employer or candidate.",
    href: "/legal/terms",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
  },
  {
    title: "Privacy Policy",
    description:
      "How we collect, process, store and protect your personal data in line with UK GDPR.",
    href: "/legal/privacy",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },
  {
    title: "Compliance Framework",
    description:
      "Our document verification standards, legal basis for checks, and sector-specific requirements.",
    href: "/compliance",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
        />
      </svg>
    ),
  },
];

export default function LegalHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        {/* Hero */}
        <section className="bg-gray-soft py-16">
          <div data-gsap="fade-up" className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue mb-3">
              LEGAL
            </p>
            <h1 className="text-brand font-black text-4xl mb-4">
              Legal Information
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto">
              Everything you need to know about how Edge Harbour operates, what
              we collect, and what you agree to.
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {legalCards.map((card) => (
                <div
                  key={card.href}
                  data-gsap="stagger-item"
                  className="bg-white border border-gray-border rounded-2xl p-8 hover:border-brand-blue/30 hover:shadow-md transition-all"
                >
                  {/* Icon */}
                  <div className="bg-brand-blue/8 text-brand-blue rounded-xl w-10 h-10 flex items-center justify-center mb-5">
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-brand font-bold text-lg mb-2">
                    {card.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    {card.description}
                  </p>

                  {/* Link */}
                  <Link
                    href={card.href}
                    className="text-brand-blue text-sm font-semibold hover:underline"
                  >
                    Read more &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
