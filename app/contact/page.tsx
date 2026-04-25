import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";
import ContactForm from "@/components/contact/ContactForm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${siteUrl}/#organization`,
  name: "Edge Harbour",
  url: siteUrl,
  logo: `${siteUrl}/eh-logo.png`,
  image: `${siteUrl}/og-image.png`,
  description:
    "The UK's compliance-first recruitment platform connecting employers with pre-vetted, Right-to-Work verified candidates.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1 Harbour Place",
    addressLocality: "London",
    postalCode: "EC2A 1AB",
    addressCountry: "GB",
  },
  telephone: "+44-20-7946-0800",
  email: "hello@edgeharbour.co.uk",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  areaServed: { "@type": "Country", name: "United Kingdom" },
};

export const metadata: Metadata = {
  title: "Contact Us – Edge Harbour",
  description:
    "Get in touch with the Edge Harbour team. Questions about recruitment, compliance, or your account — we're here to help.",
  keywords: [
    "contact Edge Harbour",
    "recruitment support UK",
    "compliance hiring enquiry",
    "Edge Harbour London",
  ],
  openGraph: {
    title: "Contact Edge Harbour",
    description:
      "Get in touch with the Edge Harbour team. Questions about recruitment, compliance, or your account — we're here to help.",
    url: "/contact",
    type: "website",
  },
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: false },
};

const contactDetails = [
  {
    label: "Registered Address",
    value: "Edge Harbour Recruitment Company Ltd\n1 Harbour Place\nLondon, EC2A 1AB\nEngland & Wales",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: "General Enquiries",
    value: "hello@edgeharbour.co.uk",
    href: "mailto:hello@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Employer Support",
    value: "employers@edgeharbour.co.uk",
    href: "mailto:employers@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    label: "Candidate Support",
    value: "candidates@edgeharbour.co.uk",
    href: "mailto:candidates@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+44 (0) 20 7946 0800",
    href: "tel:+442079460800",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "Legal",
    value: "legal@edgeharbour.co.uk",
    href: "mailto:legal@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Navbar />

      <main id="main-content" className="w-full bg-white dark:bg-[#111827]">
        {/* Hero */}
        <section className="w-full border-b border-gray-border dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div data-gsap="fade-up" className="max-w-2xl">
              <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
                Get in Touch
              </span>
              <h1 className="mt-4 text-5xl lg:text-6xl font-black tracking-tight text-brand dark:text-white leading-tight">
                We&apos;d love to{" "}
                <span className="text-brand-blue">hear</span> from you.
              </h1>
              <p className="mt-5 text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-lg">
                Whether you&apos;re an employer looking to hire or a candidate exploring
                opportunities, our team is here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact grid */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16">

              {/* Left — contact details */}
              <div data-gsap="slide-left">
                <h2 className="text-brand dark:text-white font-black text-2xl tracking-tight mb-8">
                  Company Information
                </h2>
                <div className="space-y-6">
                  {contactDetails.map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-soft dark:bg-[#0B1222] border border-gray-border dark:border-white/10 flex items-center justify-center flex-shrink-0 text-brand-blue">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-brand dark:text-white font-medium hover:text-brand-blue transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-brand dark:text-white font-medium whitespace-pre-line">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Office hours */}
                <div className="mt-10 p-6 rounded-2xl bg-gray-soft dark:bg-[#0B1222] border border-gray-border dark:border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                    Office Hours
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Monday – Friday</span>
                      <span className="text-brand dark:text-white font-medium">09:00 – 18:00 GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Saturday</span>
                      <span className="text-brand dark:text-white font-medium">10:00 – 14:00 GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Sunday</span>
                      <span className="text-slate-400 dark:text-slate-500">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-border dark:border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      We typically respond within one business day.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — enquiry form */}
              <div data-gsap="slide-right">
                <h2 className="text-brand dark:text-white font-black text-2xl tracking-tight mb-8">
                  Send an Enquiry
                </h2>
                <ContactForm />
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
      <GsapAnimations />
    </>
  );
}
