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
  title: "For Employers – Edge Harbour",
  description:
    "Post vacancies, get matched with pre-vetted, RTW-verified candidates, and manage your entire hiring pipeline with Edge Harbour's compliance-first ATS.",
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
