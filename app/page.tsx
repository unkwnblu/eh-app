import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import WhyEdgeHarbour from "@/components/landing/WhyEdgeHarbour";
import EmployerSection from "@/components/landing/EmployerSection";
import IndustriesSection from "@/components/landing/IndustriesSection";
import CandidateSection from "@/components/landing/CandidateSection";
import Testimonials from "@/components/landing/Testimonials";
import JobPostings from "@/components/landing/JobPostings";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1">
        <Hero />
        <WhyEdgeHarbour />
        <EmployerSection />
        <IndustriesSection />
        <CandidateSection />
        <JobPostings />
        <Testimonials />
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
