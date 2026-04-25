import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import EmployersHero from "@/components/employers/EmployersHero";
import HowItWorks from "@/components/employers/HowItWorks";
import ComplianceSection from "@/components/employers/ComplianceSection";
import AtsPreview from "@/components/employers/AtsPreview";
import EmployerStats from "@/components/employers/EmployerStats";
import EmployerCta from "@/components/employers/EmployerCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteUrl}/employers#service`,
  name: "Edge Harbour – Managed Recruitment for UK Employers",
  description:
    "Post a vacancy, and Edge Harbour handles the rest — sourcing, verifying, and interviewing candidates on your behalf. Receive a shortlist of RTW-verified, DBS-checked, interview-ready candidates.",
  provider: { "@id": `${siteUrl}/#organization` },
  serviceType: "Managed Recruitment & Staffing",
  areaServed: { "@type": "Country", name: "United Kingdom" },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "UK employers in Healthcare, Hospitality, Customer Service, and Technology",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Employer services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Job posting & candidate sourcing",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "RTW, DBS & credential verification",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Candidate interviewing & shortlisting",
        },
      },
    ],
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "For Employers", item: `${siteUrl}/employers` },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Hire Pre-Vetted, Interview-Ready Candidates in the UK",
  description:
    "Post a vacancy and Edge Harbour does the rest. We source, verify, and interview candidates on your behalf — delivering a shortlist of RTW-verified, DBS-checked, interview-ready professionals. Built for UK employers.",
  keywords: [
    "hire candidates UK",
    "managed recruitment UK",
    "compliance hiring UK",
    "right to work verification employer",
    "pre-vetted candidates UK",
    "DBS checked staff UK",
    "RTW verified candidates",
    "healthcare employer recruitment",
    "hospitality staff recruitment UK",
    "interview-ready candidates UK",
    "staffing agency UK compliance",
  ],
  openGraph: {
    title: "Hire Pre-Vetted, Interview-Ready Candidates – Edge Harbour",
    description:
      "Post a vacancy and Edge Harbour does the rest — sourcing, verifying, and interviewing candidates on your behalf.",
    url: "/employers",
    type: "website",
  },
  twitter: {
    title: "Hire Pre-Vetted, Interview-Ready Candidates – Edge Harbour",
    description:
      "Post a vacancy and Edge Harbour does the rest — sourcing, verifying, and interviewing candidates on your behalf.",
  },
  alternates: { canonical: "/employers" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        <EmployersHero />
        <HowItWorks />
        <ComplianceSection />
        <AtsPreview />
        <EmployerStats />
        <EmployerCta />
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
