import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Employers", href: "/employers" },
  { label: "Candidates", href: "/candidates" },
  { label: "Sectors", href: "/sectors" },
  { label: "Legal", href: "/legal" },
];

export default function Navbar() {
  return (
    <header data-gsap="navbar" className="sticky top-0 z-50 w-full bg-white border-b border-gray-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/eh-logo.svg"
            alt="Edge Harbour logo"
            width={32}
            height={32}
            priority
          />
          <span className="text-brand font-bold text-lg tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="hidden sm:block text-sm font-medium text-brand border border-brand rounded-full px-5 py-2 hover:bg-brand hover:text-white transition-all"
          >
            Create Account
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white bg-brand-blue rounded-full px-5 py-2 hover:bg-brand-blue-dark transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
