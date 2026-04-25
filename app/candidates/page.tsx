import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import CandidatesHero from "@/components/candidates/CandidatesHero";
import HowCandidatesWork from "@/components/candidates/HowCandidatesWork";
import WhyRegister from "@/components/candidates/WhyRegister";
import CredentialsSection from "@/components/candidates/CredentialsSection";
import SectorsForCandidates from "@/components/candidates/SectorsForCandidates";
import CandidateTestimonials from "@/components/candidates/CandidateTestimonials";
import CandidateCta from "@/components/candidates/CandidateCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteUrl}/candidates#service`,
  name: "Edge Harbour – Job Matching for Candidates",
  description:
    "Register once, upload your credentials, and get matched directly with verified UK employers. Compliance handled for you — Healthcare, Hospitality, Customer Service, and Tech roles available.",
  provider: { "@id": `${siteUrl}/#organization` },
  serviceType: "Job Placement & Career Matching",
  areaServed: { "@type": "Country", name: "United Kingdom" },
  audience: {
    "@type": "Audience",
    audienceType: "Job seekers across Healthcare, Hospitality, Customer Service, and Technology",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Candidate services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "One-time document upload and verification",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Verified candidate profile badge",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Direct access to top UK employers",
        },
      },
    ],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "For Candidates", item: `${siteUrl}/candidates` },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Find Jobs in the UK – Healthcare, Hospitality, Tech & More",
  description:
    "Register once, upload your credentials, and get matched directly with UK employers. Edge Harbour is the compliance-first job platform for Healthcare, Hospitality, Customer Service, and Tech candidates.",
  keywords: [
    "UK jobs 2025",
    "healthcare jobs UK",
    "hospitality jobs UK",
    "tech jobs UK",
    "customer service jobs UK",
    "compliance recruitment UK",
    "right to work UK candidates",
    "job seekers UK",
    "pre-vetted jobs UK",
    "find a job UK",
    "DBS checked jobs UK",
    "NMC pin nursing jobs",
    "Edge Harbour candidates",
  ],
  openGraph: {
    title: "Find Your Next UK Job – Edge Harbour",
    description:
      "Register once, upload your credentials, and get matched with verified UK employers. Healthcare, Hospitality, Customer Service, and Tech roles available.",
    url: "/candidates",
    type: "website",
  },
  twitter: {
    title: "Find Your Next UK Job – Edge Harbour",
    description:
      "Register once, upload your credentials, and get matched with verified UK employers. Healthcare, Hospitality, Customer Service, and Tech roles available.",
  },
  alternates: { canonical: "/candidates" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        <CandidatesHero />
        <HowCandidatesWork />
        <WhyRegister />
        <CredentialsSection />
        <SectorsForCandidates />
        <CandidateTestimonials />
        <CandidateCta />
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
