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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who reviews candidate documents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our in-house Super Admin compliance team reviews every document submission manually. No document is auto-approved — a human always makes the final call.",
      },
    },
    {
      "@type": "Question",
      name: "How long does candidate verification take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most candidates are verified within 24–48 working hours of submitting their complete document set. Incomplete submissions are flagged immediately with guidance on what's missing.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if a document is rejected?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The candidate is notified with a clear explanation and given the opportunity to resubmit. Employers never see unverified candidates — the rejection is handled entirely within our compliance pipeline.",
      },
    },
    {
      "@type": "Question",
      name: "Can employers access candidate documents directly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once a candidate passes compliance review, employers can view the full verified dossier from within the ATS before making any hiring decision.",
      },
    },
    {
      "@type": "Question",
      name: "How are Right to Work checks performed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We verify RTW documents against UK Home Office standards. For candidates with biometric residence permits or share codes, we perform online verification. All checks are documented and timestamped.",
      },
    },
    {
      "@type": "Question",
      name: "Is Edge Harbour GDPR compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We are registered with the ICO, process all personal data lawfully under UK GDPR, and maintain a full data processing register. Candidates can request data deletion at any time.",
      },
    },
    {
      "@type": "Question",
      name: "What DBS level do you check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The level of DBS check depends on the role. Healthcare and roles involving vulnerable adults or children require Enhanced DBS. Other sectors typically require Standard DBS. We apply the appropriate level automatically based on sector.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle expired credentials?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Candidate profiles include credential expiry tracking. Candidates are notified in advance of expiry and prompted to resubmit. Expired credentials are flagged in the ATS so employers always see current compliance status.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Compliance Framework – Right to Work, DBS & Credential Verification",
  description:
    "Every hire through Edge Harbour is backed by a rigorous, legally-aligned compliance framework. Right to Work, DBS, sector credentials — verified by humans, grounded in UK law.",
  keywords: [
    "right to work check UK",
    "DBS check recruitment",
    "compliance recruitment UK",
    "candidate verification UK",
    "GDPR recruitment",
    "UK employment compliance",
    "enhanced DBS check",
    "ICO registered recruitment",
    "Edge Harbour compliance",
  ],
  openGraph: {
    title: "Compliance Framework – Edge Harbour",
    description:
      "Right to Work, DBS, and sector credential verification — all built into the hiring process. No spreadsheets. No gaps.",
    url: "/compliance",
  },
  twitter: {
    title: "Compliance Framework – Edge Harbour",
    description:
      "Right to Work, DBS, and sector credential verification — all built into the hiring process.",
  },
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
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
