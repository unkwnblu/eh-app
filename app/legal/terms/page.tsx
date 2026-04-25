import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

const termsPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service – Edge Harbour",
  url: `${siteUrl}/legal/terms`,
  description:
    "Edge Harbour's Terms of Service governing use of the platform by employers and candidates.",
  publisher: { "@id": `${siteUrl}/#organization` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Legal", item: `${siteUrl}/legal` },
      { "@type": "ListItem", position: 3, name: "Terms of Service", item: `${siteUrl}/legal/terms` },
    ],
  },
};

export const metadata: Metadata = {
  title: "Terms of Service – Platform Agreement",
  description:
    "Read Edge Harbour's Terms of Service. Understand your rights and obligations as an employer or candidate on our compliance-first recruitment platform.",
  keywords: [
    "Edge Harbour terms of service",
    "recruitment platform agreement UK",
    "employer candidate terms UK",
    "platform usage terms",
  ],
  openGraph: {
    title: "Terms of Service – Edge Harbour",
    description:
      "Your rights and obligations when using Edge Harbour's compliance-first recruitment platform.",
    url: "/legal/terms",
    type: "website",
  },
  twitter: {
    title: "Terms of Service – Edge Harbour",
    description: "Your rights and obligations when using Edge Harbour's recruitment platform.",
  },
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: false },
};

const tocSections = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "about", label: "About Edge Harbour" },
  { id: "user-types", label: "User Types and Accounts" },
  { id: "employer-obligations", label: "Employer Obligations" },
  { id: "candidate-obligations", label: "Candidate Obligations" },
  { id: "compliance-verification", label: "Compliance Verification" },
  { id: "ats", label: "The ATS and Compliance Gate" },
  { id: "ip", label: "Intellectual Property" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsPageJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        {/* Page header */}
        <div className="bg-gray-soft py-14 border-b border-gray-border">
          <div data-gsap="fade-up" className="max-w-4xl mx-auto px-6">
            <p className="text-slate-400 text-xs mb-3">
              <Link href="/legal" className="hover:text-brand-blue transition-colors">Legal</Link>
              {" / "}
              Terms of Service
            </p>
            <h1 className="text-brand font-black text-4xl lg:text-5xl">
              Terms of Service
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              Last updated: 25 March 2026 &middot; Governed by the laws of England and Wales
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-14 w-full">
          <div className="grid lg:grid-cols-[220px_1fr] gap-12">
            {/* Sidebar TOC */}
            <aside data-gsap="slide-left" className="hidden lg:block">
              <nav className="sticky top-24 self-start">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Contents
                </p>
                <ul className="space-y-2">
                  {tocSections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-sm text-slate-500 hover:text-brand-blue transition-colors leading-snug block"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main content */}
            <article data-gsap="slide-right">
              {/* Section 1 */}
              <section id="acceptance" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10 first:mt-0">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  By accessing or using the Edge Harbour platform (the &ldquo;Platform&rdquo;), you agree to be
                  bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, you must not use
                  the Platform. These Terms apply to all users including Employers and Candidates.
                </p>
              </section>

              {/* Section 2 */}
              <section id="about" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  2. About Edge Harbour
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Edge Harbour is a compliance-first recruitment platform operated by Edge Harbour
                  Recruitment Company Ltd, a company registered in England and Wales. Our Platform
                  connects verified candidates with UK employers across the Healthcare, Hospitality,
                  Customer Service, and Technology sectors.
                </p>
              </section>

              {/* Section 3 */}
              <section id="user-types" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  3. User Types and Accounts
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The Platform supports two account types:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>
                    <strong>Employer Accounts</strong> — for businesses seeking to hire pre-vetted
                    candidates. Each account is a single-user structure associated with one legal entity.
                  </li>
                  <li>
                    <strong>Candidate Accounts</strong> — for individuals seeking employment.
                    Candidates must complete the verification process before accessing the full platform.
                  </li>
                </ul>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">
                  You are responsible for maintaining the confidentiality of your account credentials
                  and for all activity that occurs under your account.
                </p>
              </section>

              {/* Section 4 */}
              <section id="employer-obligations" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  4. Employer Obligations
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Employers must:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>
                    provide accurate company information including a valid UK Company Registration
                    Number (CRN);
                  </li>
                  <li>use the Platform only for lawful hiring purposes;</li>
                  <li>
                    complete the mandatory Compliance Review stage before progressing candidates to
                    interview;
                  </li>
                  <li>
                    not discriminate on grounds prohibited by the Equality Act 2010;
                  </li>
                  <li>keep job posting information accurate and up to date.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="candidate-obligations" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  5. Candidate Obligations
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Candidates must:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>provide accurate personal and professional information;</li>
                  <li>upload genuine, unaltered documents;</li>
                  <li>
                    notify Edge Harbour immediately if any credential expires or is revoked;
                  </li>
                  <li>
                    not misrepresent their qualifications, experience, or right to work status.
                  </li>
                </ul>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">
                  Submission of fraudulent documents may result in immediate account termination and
                  referral to relevant authorities.
                </p>
              </section>

              {/* Section 6 */}
              <section id="compliance-verification" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  6. Compliance Verification
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Edge Harbour operates a mandatory document verification process. Candidates will
                  not be visible to employers until their documents have been reviewed and approved
                  by our compliance team. Verification typically takes 24–48 working hours. Edge
                  Harbour reserves the right to reject any document submission that does not meet
                  our verification standards.
                </p>
              </section>

              {/* Section 7 */}
              <section id="ats" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  7. The ATS and Compliance Gate
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our Applicant Tracking System (ATS) includes a mandatory Compliance Review stage.
                  Employers using the ATS agree that they will not attempt to circumvent this stage
                  and acknowledge that no candidate should be interviewed or offered employment
                  without first passing the Compliance Review.
                </p>
              </section>

              {/* Section 9 */}
              <section id="ip" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  9. Intellectual Property
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All content on the Platform, including but not limited to software, design, text,
                  and graphics, is owned by or licensed to Edge Harbour Recruitment Company Ltd.
                  You may not reproduce, distribute, or create derivative works without our express
                  written consent.
                </p>
              </section>

              {/* Section 10 */}
              <section id="liability" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  10. Limitation of Liability
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Edge Harbour provides the Platform on an &ldquo;as is&rdquo; basis. To the fullest extent
                  permitted by law, we exclude all liability for indirect, consequential, or special
                  damages arising from your use of the Platform. Our total liability to you shall
                  not exceed the fees paid by you in the 12 months preceding the claim.
                </p>
              </section>

              {/* Section 11 */}
              <section id="termination" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  11. Termination
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We reserve the right to suspend or terminate any account that violates these
                  Terms, provides fraudulent information, or engages in conduct that harms other
                  users or the integrity of the Platform. Upon termination, your right to access
                  the Platform ceases immediately.
                </p>
              </section>

              {/* Section 12 */}
              <section id="governing-law" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  12. Governing Law
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  These Terms are governed by the laws of England and Wales. Any disputes shall be
                  subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              {/* Section 13 */}
              <section id="changes" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  13. Changes to These Terms
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We may update these Terms from time to time. We will notify users of material
                  changes via email or in-Platform notification. Continued use of the Platform
                  after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* Section 14 */}
              <section id="contact" className="pb-8">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  14. Contact
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  For questions about these Terms, contact us at{" "}
                  <a
                    href="mailto:legal@edgeharbour.co.uk"
                    className="text-brand-blue hover:underline"
                  >
                    legal@edgeharbour.co.uk
                  </a>{" "}
                  or write to: Edge Harbour Recruitment Company Ltd, 1 Harbour Place, London,
                  EC2A 1AB.
                </p>
              </section>
            </article>
          </div>
        </div>
      </main>
      <Footer />
      <GsapAnimations />
    </>
  );
}
