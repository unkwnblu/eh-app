import Link from "next/link";

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
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-brand-blue rounded-md flex items-center justify-center flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-white"
            >
              <path
                d="M8 2L10 6H14L11 9L12 13L8 10.5L4 13L5 9L2 6H6L8 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
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
            href="/login"
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
