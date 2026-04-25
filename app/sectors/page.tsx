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

export const metadata: Metadata = {
  title: "Sectors We Cover – Healthcare, Hospitality, Tech & Customer Service",
  description:
    "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK. Find pre-vetted, compliance-verified talent for your industry.",
  keywords: [
    "healthcare recruitment UK",
    "hospitality recruitment UK",
    "customer service recruitment",
    "tech recruitment UK",
    "sector recruitment",
    "compliance verified candidates",
    "UK staffing sectors",
  ],
  openGraph: {
    title: "Sectors We Cover – Edge Harbour",
    description:
      "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK with pre-vetted, compliance-verified talent.",
    url: "/sectors",
  },
  twitter: {
    title: "Sectors We Cover – Edge Harbour",
    description:
      "Edge Harbour serves Healthcare, Hospitality, Customer Service, and Technology sectors across the UK with pre-vetted, compliance-verified talent.",
  },
  alternates: { canonical: "/sectors" },
};

export default function SectorsPage() {
  return (
    <>
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
