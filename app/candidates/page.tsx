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

export const metadata: Metadata = {
  title: "For Candidates – Edge Harbour",
  description:
    "Register once, upload your credentials, and get matched directly with UK employers. Edge Harbour is the compliance-first platform for UK job seekers in Healthcare, Hospitality, Customer Service, and Tech.",
};

export default function CandidatesPage() {
  return (
    <>
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
