"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Employers", href: "/employers" },
  { label: "Candidates", href: "/candidates" },
  { label: "Sectors", href: "/sectors" },
  { label: "Legal", href: "/legal" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header data-gsap="navbar" className="sticky top-0 z-50 w-full bg-white dark:bg-[#111827] border-b border-gray-border dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-6 lg:px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/eh-logo.svg"
            alt="Edge Harbour logo"
            width={32}
            height={32}
            priority
          />
          <span className="text-brand dark:text-white font-bold text-lg tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>

        {/* Nav Links — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-blue transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/register"
            className="text-sm font-medium text-brand dark:text-white border border-brand dark:border-white/20 rounded-full px-5 py-2 hover:bg-brand hover:text-white transition-all"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-white bg-brand-blue rounded-full px-5 py-2 hover:bg-brand-blue-dark transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5"
        >
          <span
            aria-hidden="true"
            className={`block h-0.5 w-5 bg-brand dark:bg-white rounded-full transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`block h-0.5 w-5 bg-brand dark:bg-white rounded-full transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`block h-0.5 w-5 bg-brand dark:bg-white rounded-full transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="region"
        aria-label="Mobile navigation"
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96 border-t border-gray-border dark:border-white/10" : "max-h-0"}`}
      >
        <nav className="flex flex-col px-6 py-4 gap-1 bg-white dark:bg-[#111827]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand-blue py-2.5 border-b border-gray-border dark:border-white/10 last:border-0 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-center text-brand dark:text-white border border-brand dark:border-white/20 rounded-full px-5 py-2.5 hover:bg-brand hover:text-white transition-all"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-center text-white bg-brand-blue rounded-full px-5 py-2.5 hover:bg-brand-blue-dark transition-colors"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
