import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import ComplianceHero from "@/components/compliance/ComplianceHero";
import CompliancePhilosophy from "@/components/compliance/CompliancePhilosophy";
import DocumentChecks from "@/components/compliance/DocumentChecks";
import AtsGate from "@/components/compliance/AtsGate";
import LegalFramework from "@/components/compliance/LegalFramework";
import ComplianceFaq from "@/components/compliance/ComplianceFaq";
import ComplianceCta from "@/components/compliance/ComplianceCta";

export const metadata: Metadata = {
  title: "Compliance – Edge Harbour",
  description:
    "Every hire through Edge Harbour is backed by a rigorous, legally-aligned compliance framework. Right to Work, DBS, sector credentials — verified by humans, grounded in UK law.",
};

export default function CompliancePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">
        <ComplianceHero />
        <CompliancePhilosophy />
        <DocumentChecks />
        <AtsGate />
        <LegalFramework />
        <ComplianceFaq />
        <ComplianceCta />
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
