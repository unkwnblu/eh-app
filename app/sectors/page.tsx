import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import SectorsHero from "@/components/sectors/SectorsHero";
import SectorsOverview from "@/components/sectors/SectorsOverview";
import HealthcareSection from "@/components/sectors/HealthcareSection";
import HospitalitySection from "@/components/sectors/HospitalitySection";
import CustomerServiceSection from "@/components/sectors/CustomerServiceSection";
import TechSection from "@/components/sectors/TechSection";
import SectorsCta from "@/components/sectors/SectorsCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Sectors covered by Edge Harbour",
  description:
    "Edge Harbour provides compliance-first recruitment across four sectors in the United Kingdom.",
  url: `${siteUrl}/sectors`,
  numberOfItems: 4,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Healthcare",
      description:
        "Nurses, healthcare assistants, support workers, and allied health professionals — all RTW and DBS verified.",
      url: `${siteUrl}/sectors#healthcare`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Hospitality",
      description:
        "Front-of-house, kitchen staff, hotel management, and events professionals across the UK.",
      url: `${siteUrl}/sectors#hospitality`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Customer Service",
      description:
        "Call centre agents, customer support specialists, and client-facing roles for UK businesses.",
      url: `${siteUrl}/sectors#customer-service`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Technology & Data",
      description:
        "Software engineers, data analysts, DevOps, and product professionals for UK tech companies.",
      url: `${siteUrl}/sectors#tech`,
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Sectors", item: `${siteUrl}/sectors` },
  ],
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Sectors We Cover – Healthcare, Hospitality, Tech & Customer Service",
  description:
    "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK. Find pre-vetted, compliance-verified talent for your industry.",
  keywords: [
    "healthcare recruitment UK",
    "NHS recruitment agency",
    "hospitality recruitment UK",
    "hotel staff recruitment",
    "customer service recruitment UK",
    "tech recruitment UK",
    "IT recruitment agency UK",
    "sector-specific recruitment",
    "compliance verified candidates UK",
    "UK staffing agency sectors",
    "DBS checked healthcare workers",
  ],
  openGraph: {
    title: "Sectors We Cover – Edge Harbour",
    description:
      "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK with pre-vetted, compliance-verified talent.",
    url: "/sectors",
    type: "website",
  },
  twitter: {
    title: "Sectors We Cover – Edge Harbour",
    description:
      "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK with pre-vetted, compliance-verified talent.",
  },
  alternates: { canonical: "/sectors" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SectorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        <SectorsHero />
        <SectorsOverview />
        <HealthcareSection />
        <HospitalitySection />
        <CustomerServiceSection />
        <TechSection />
        <SectorsCta />
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
