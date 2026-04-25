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

export const metadata: Metadata = {
  title: "Hire Compliant, Pre-Vetted Candidates in the UK",
  description:
    "Post vacancies, get matched with RTW-verified candidates, and manage your entire hiring pipeline — all in one compliance-first ATS. Built for UK employers in Healthcare, Hospitality, and Tech.",
  keywords: [
    "hire candidates UK",
    "UK recruitment platform",
    "compliance hiring",
    "right to work verification",
    "ATS UK",
    "healthcare recruitment",
    "hospitality recruitment",
    "employer recruitment software",
    "pre-vetted candidates",
  ],
  openGraph: {
    title: "Hire Compliant, Pre-Vetted Candidates – Edge Harbour",
    description:
      "Post vacancies, get matched with RTW-verified candidates, and manage your entire hiring pipeline — all in one compliance-first ATS.",
    url: "/employers",
  },
  twitter: {
    title: "Hire Compliant, Pre-Vetted Candidates – Edge Harbour",
    description:
      "Post vacancies, get matched with RTW-verified candidates, and manage your entire hiring pipeline — all in one compliance-first ATS.",
  },
  alternates: { canonical: "/employers" },
};

export default function EmployersPage() {
  return (
    <>
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
