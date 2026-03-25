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
  title: "Sectors – Edge Harbour",
};

export default function SectorsPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">
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
