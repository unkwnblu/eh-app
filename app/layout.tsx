import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Inter } from "next/font/google";
import ThemeProvider, { ThemeScript } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── Site-wide JSON-LD ────────────────────────────────────────────────────────

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Edge Harbour",
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/eh-logo.png`,
    width: 512,
    height: 512,
  },
  description:
    "The UK's compliance-first recruitment platform connecting pre-vetted candidates with verified employers across Healthcare, Hospitality, Customer Service, and Technology.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "124 City Road",
    addressLocality: "London",
    postalCode: "EC1V 2NX",
    addressCountry: "GB",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@edgeharbour.co.uk",
      telephone: "+44-800-123-4567",
      areaServed: "GB",
      availableLanguage: "English",
    },
  ],
  areaServed: {
    "@type": "Country",
    name: "United Kingdom",
  },
  knowsAbout: [
    "Recruitment",
    "Right to Work verification",
    "DBS checks",
    "Healthcare staffing",
    "Hospitality recruitment",
    "Compliance hiring",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "Edge Harbour",
  url: siteUrl,
  publisher: { "@id": `${siteUrl}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/jobs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ─── Root metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Edge Harbour – Compliance-First Recruitment",
    template: "%s | Edge Harbour",
  },
  description:
    "The UK's trusted recruitment platform for Healthcare, Hospitality, Customer Service, and Tech. Hire pre-vetted, role-ready candidates faster.",
  keywords: [
    "recruitment UK",
    "compliance recruitment",
    "pre-vetted candidates",
    "right to work UK",
    "UK jobs",
    "healthcare recruitment",
    "hospitality recruitment",
    "tech recruitment UK",
    "Edge Harbour",
  ],
  authors: [{ name: "Edge Harbour", url: siteUrl }],
  creator: "Edge Harbour",
  publisher: "Edge Harbour",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    other: [
      { rel: "icon", type: "image/png", url: "/eh-logo.png" },
    ],
  },
  openGraph: {
    siteName: "Edge Harbour",
    type: "website",
    locale: "en_GB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Edge Harbour – Compliance-First Recruitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@EdgeHarbour",
    creator: "@EdgeHarbour",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* Organization JSON-LD — present on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* WebSite JSON-LD — enables Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-[#0B1222] text-foreground transition-colors">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-blue focus:text-white focus:text-sm focus:font-semibold focus:rounded-full focus:px-6 focus:py-3 focus:shadow-lg"
          >
            Skip to main content
          </a>
          <ViewTransition>{children}</ViewTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
