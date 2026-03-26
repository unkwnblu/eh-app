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

export const metadata: Metadata = {
  title: "Edge Harbour – Compliance-First Recruitment",
  description:
    "The UK's trusted recruitment platform for Healthcare, Hospitality, Customer Service, and Tech. Hire pre-vetted, role-ready candidates faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
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
