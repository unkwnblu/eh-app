import Link from "next/link";
import Image from "next/image";
import GsapAnimations from "@/components/landing/GsapAnimations";

const quickLinks = [
  { label: "For Employers", href: "/employers", description: "Post roles & manage hiring" },
  { label: "For Candidates", href: "/candidates", description: "Find and apply for roles" },
  { label: "Our Sectors", href: "/sectors", description: "Industries we specialise in" },
  { label: "Contact Us", href: "/contact", description: "Get in touch with our team" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <GsapAnimations />
      {/* Minimal header */}
      <header className="w-full border-b border-gray-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-4xl mx-auto">

          {/* Large 404 */}
          <div data-gsap="fade-up" className="relative mb-8 select-none pointer-events-none">
            <p className="text-[160px] lg:text-[240px] font-black text-center leading-none tracking-tighter text-gray-border">
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5 mb-4">
                  Page not found
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div data-gsap="fade-up" className="text-center mb-14">
            <h1 className="text-brand font-black text-3xl lg:text-4xl tracking-tight mb-4">
              This page doesn&apos;t exist.
            </h1>
            <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
              The link you followed may be broken, or the page may have been moved.
              Here are some places to get you back on track.
            </p>
          </div>

          {/* Quick links grid */}
          <div data-gsap="fade-up" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group border border-gray-border rounded-2xl p-5 hover:border-brand-blue hover:shadow-md transition-all duration-200 flex flex-col gap-2"
              >
                <p className="text-brand font-bold text-sm group-hover:text-brand-blue transition-colors">
                  {link.label}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">{link.description}</p>
                <div className="mt-auto pt-3 flex items-center gap-1 text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-semibold">Go</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Home CTA */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold rounded-full px-8 py-3.5 hover:bg-brand-blue transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Back to Home
            </Link>
          </div>

        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Edge Harbour Ltd. All rights reserved.
          </p>
          <Link href="/contact" className="text-xs text-slate-400 hover:text-brand-blue transition-colors">
            Need help?
          </Link>
        </div>
      </footer>
    </div>
  );
}
