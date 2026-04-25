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
  title: "Find Jobs in the UK – Healthcare, Hospitality, Tech & More",
  description:
    "Register once, upload your credentials, and get matched directly with UK employers. Edge Harbour is the compliance-first job platform for Healthcare, Hospitality, Customer Service, and Tech candidates.",
  keywords: [
    "UK jobs",
    "healthcare jobs UK",
    "hospitality jobs UK",
    "tech jobs UK",
    "customer service jobs",
    "compliance recruitment",
    "right to work UK",
    "job seekers UK",
    "pre-vetted jobs",
    "Edge Harbour candidates",
  ],
  openGraph: {
    title: "Find Your Next UK Job – Edge Harbour",
    description:
      "Register once, upload your credentials, and get matched with verified UK employers. Healthcare, Hospitality, Customer Service, and Tech roles available.",
    url: "/candidates",
  },
  twitter: {
    title: "Find Your Next UK Job – Edge Harbour",
    description:
      "Register once, upload your credentials, and get matched with verified UK employers. Healthcare, Hospitality, Customer Service, and Tech roles available.",
  },
  alternates: { canonical: "/candidates" },
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
