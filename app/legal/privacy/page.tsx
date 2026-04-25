import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Edge Harbour collects, uses, and protects your personal data. ICO-registered and fully GDPR compliant.",
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: false },
};

const tocSections = [
  { id: "introduction", label: "Introduction" },
  { id: "data-controller", label: "Data Controller" },
  { id: "what-we-collect", label: "What Data We Collect" },
  { id: "how-we-use", label: "How We Use Your Data" },
  { id: "special-category", label: "Special Category Data" },
  { id: "sharing", label: "How We Share Your Data" },
  { id: "retention", label: "Data Retention" },
  { id: "rights", label: "Your Rights" },
  { id: "security", label: "Data Security" },
  { id: "cookies", label: "Cookies" },
  { id: "transfers", label: "International Transfers" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact & Complaints" },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex flex-col flex-1">
        {/* Page header */}
        <div className="bg-gray-soft py-14 border-b border-gray-border">
          <div data-gsap="fade-up" className="max-w-4xl mx-auto px-6">
            <p className="text-slate-400 text-xs mb-3">
              <Link href="/legal" className="hover:text-brand-blue transition-colors">Legal</Link>
              {" / "}
              Privacy Policy
            </p>
            <h1 className="text-brand font-black text-4xl lg:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-sm mt-3">
              Last updated: 25 March 2026 &middot; ICO Registration: [PENDING — insert real ICO number]
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
              <section id="introduction" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10 first:mt-0">
                  1. Introduction
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Edge Harbour Recruitment Company Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to
                  protecting your personal data. This Privacy Policy explains how we collect, use,
                  store, and protect your information when you use the Edge Harbour platform. We are
                  registered with the Information Commissioner&apos;s Office (ICO), registration number
                  [PENDING — insert real ICO number].
                </p>
              </section>

              {/* Section 2 */}
              <section id="data-controller" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  2. Data Controller
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Edge Harbour Recruitment Company Ltd is the data controller for personal data
                  processed through the Platform. Contact:{" "}
                  <a
                    href="mailto:privacy@edgeharbour.co.uk"
                    className="text-brand-blue hover:underline"
                  >
                    privacy@edgeharbour.co.uk
                  </a>{" "}
                  &middot; 1 Harbour Place, London, EC2A 1AB.
                </p>
              </section>

              {/* Section 3 */}
              <section id="what-we-collect" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  3. What Data We Collect
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We collect the following categories of personal data:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>
                    <strong>All users:</strong> name, email address, password (hashed), IP address,
                    usage data, device information
                  </li>
                  <li>
                    <strong>Candidates additionally:</strong> date of birth, address, phone number,
                    Right to Work documents (passport, visa, biometric residence permit), DBS
                    certificate number and issue date, professional registration numbers (NMC PIN,
                    HCPC number), employment history, professional references, sector-specific
                    certifications, profile photograph (optional)
                  </li>
                  <li>
                    <strong>Employers additionally:</strong> company name, Company Registration
                    Number (CRN), registered address, VAT number (optional), billing contact details
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="how-we-use" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  4. How We Use Your Data
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We process your personal data for the following purposes and legal bases:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>
                    <strong>Contract performance:</strong> to provide the recruitment platform
                    service, verify identities, and facilitate candidate-employer matching
                  </li>
                  <li>
                    <strong>Legal obligation:</strong> to perform Right to Work checks as required
                    by the Immigration Act 2014; to conduct DBS checks as required by the
                    Rehabilitation of Offenders Act 1974
                  </li>
                  <li>
                    <strong>Legitimate interests:</strong> to improve platform security, prevent
                    fraud, and maintain audit trails
                  </li>
                  <li>
                    <strong>Consent:</strong> for optional communications such as marketing emails
                    (you may withdraw consent at any time)
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="special-category" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  5. Special Category Data
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  DBS certificates and certain professional registration data may constitute special
                  category data under UK GDPR Article 9. We process this data under Article
                  9(2)(b) (legal obligations in employment law) and Article 9(2)(h) (health or
                  social care purposes for Healthcare candidates). This data is accessible only to
                  our compliance team and to employers once verification is complete.
                </p>
              </section>

              {/* Section 6 */}
              <section id="sharing" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  6. How We Share Your Data
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We share your data with:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>
                    <strong>Employers</strong> — verified candidate profiles and documents are
                    shared with employers using the platform;
                  </li>
                  <li>
                    <strong>Supabase</strong> — our database infrastructure provider, operating
                    under a Data Processing Agreement;
                  </li>
                  <li>
                    <strong>UK government bodies</strong> — where required by law (e.g., Home
                    Office RTW checks);
                  </li>
                </ul>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">
                  We do not sell personal data to third parties.
                </p>
              </section>

              {/* Section 7 */}
              <section id="retention" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  7. Data Retention
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We retain personal data for as long as your account is active. Upon account
                  deletion: candidate documents are deleted within 30 days; employer data is
                  retained for 6 years for legal compliance (Companies Act 2006). Compliance audit
                  logs are retained for 7 years.
                </p>
              </section>

              {/* Section 8 */}
              <section id="rights" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  8. Your Rights
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Under UK GDPR, you have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>access your personal data (Subject Access Request);</li>
                  <li>rectify inaccurate data;</li>
                  <li>
                    erasure (&ldquo;right to be forgotten&rdquo;) where no legal basis for retention exists;
                  </li>
                  <li>restrict or object to processing;</li>
                  <li>data portability;</li>
                  <li>withdraw consent at any time.</li>
                </ul>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">
                  To exercise your rights, contact{" "}
                  <a
                    href="mailto:privacy@edgeharbour.co.uk"
                    className="text-brand-blue hover:underline"
                  >
                    privacy@edgeharbour.co.uk
                  </a>
                  . We will respond within 30 days.
                </p>
              </section>

              {/* Section 9 */}
              <section id="security" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  9. Data Security
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We implement technical and organisational measures to protect your data including:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 mt-2 ml-4">
                  <li>encrypted storage via Supabase (AES-256);</li>
                  <li>TLS encryption in transit;</li>
                  <li>role-based access controls;</li>
                  <li>regular security audits.</li>
                </ul>
                <p className="text-slate-600 text-sm leading-relaxed mt-3">
                  In the event of a data breach affecting your rights, we will notify you and the
                  ICO within 72 hours as required by UK GDPR Article 33.
                </p>
              </section>

              {/* Section 10 */}
              <section id="cookies" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  10. Cookies
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We use essential cookies required for platform functionality and session
                  management. We do not use third-party advertising cookies. You may disable
                  non-essential cookies through your browser settings. A full cookie notice is
                  available on the Platform.
                </p>
              </section>

              {/* Section 11 */}
              <section id="transfers" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  11. International Transfers
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your data is primarily processed within the UK and EEA. Where data is transferred
                  outside these areas (e.g., Supabase infrastructure), we ensure appropriate
                  safeguards are in place including Standard Contractual Clauses (SCCs) and
                  adequacy decisions.
                </p>
              </section>

              {/* Section 12 */}
              <section id="children" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  12. Children
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The Platform is not intended for individuals under the age of 18. We do not
                  knowingly collect data from children.
                </p>
              </section>

              {/* Section 13 */}
              <section id="changes" className="pb-8 border-b border-gray-border">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  13. Changes to This Policy
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We may update this Privacy Policy to reflect changes in law or our practices. We
                  will notify you of material changes via email. The current version is always
                  available at{" "}
                  <Link href="/legal/privacy" className="text-brand-blue hover:underline">
                    edgeharbour.co.uk/legal/privacy
                  </Link>
                  .
                </p>
              </section>

              {/* Section 14 */}
              <section id="contact" className="pb-8">
                <h2 className="text-brand font-bold text-xl mb-4 mt-10">
                  14. Contact &amp; Complaints
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  For privacy enquiries:{" "}
                  <a
                    href="mailto:privacy@edgeharbour.co.uk"
                    className="text-brand-blue hover:underline"
                  >
                    privacy@edgeharbour.co.uk
                  </a>
                  . If you are unsatisfied with our response, you have the right to lodge a
                  complaint with the ICO:{" "}
                  <a
                    href="https://ico.org.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-blue hover:underline"
                  >
                    ico.org.uk
                  </a>{" "}
                  &middot; 0303 123 1113.
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
