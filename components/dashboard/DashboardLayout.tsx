"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export type NotifItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

// ─── Prop interfaces ─────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  basePath: string;
  logoSub?: string;
  supportHref?: string;
  sidebarBottom?: React.ReactNode;
  logoutHref?: string;
}

interface TopbarProps {
  onMenuToggle: () => void;
  searchPlaceholder: string;
  profileHref: string;
  profileName: string;
  profileSub: string;
  profileInitials: string;
  profileImageUrl?: string;
  notifData: NotifItem[];
  notifIcon: (type: string) => React.ReactNode;
  notifColor: (type: string) => string;
  notifFooter?: React.ReactNode;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  // Navigation
  navItems: NavItem[];
  basePath: string;
  // Topbar / profile
  searchPlaceholder?: string;
  profileHref: string;
  profileName: string;
  profileSub: string;
  profileInitials: string;
  profileImageUrl?: string;
  // Sidebar extras
  logoSub?: string;
  supportHref?: string;
  sidebarBottom?: React.ReactNode;
  // Notifications
  notifData: NotifItem[];
  notifIcon: (type: string) => React.ReactNode;
  notifColor: (type: string) => string;
  notifFooter?: React.ReactNode;
  // When true, mobile devices see a "desktop only" screen instead of the dashboard
  mobileBlocked?: boolean;
  // Where to redirect after logout (defaults to "/")
  logoutHref?: string;
}

// ─── Mobile blocker ──────────────────────────────────────────────────────────────

function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-[200] flex md:hidden flex-col items-center justify-center bg-[#F7F8FA] dark:bg-[#0B1222] px-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-blue">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
        </svg>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <img src="/eh-logo.svg" alt="Edge Harbour" width={24} height={24} />
        <span className="text-brand font-bold text-base tracking-tight">
          Edge<span className="text-brand-blue">Harbour</span>
        </span>
      </div>

      {/* Text */}
      <h2 className="text-xl font-black text-brand mb-2 leading-tight">
        Desktop Only
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px]">
        This dashboard is designed for desktop use. Please switch to a larger screen to continue.
      </p>

      {/* Divider */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#1e293b] w-full max-w-[260px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}

// ─── Shared SVG atoms ────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function SupportIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={active ? "text-white" : "text-slate-400"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────────

function Sidebar({ open, onClose, navItems, basePath, logoSub, supportHref, sidebarBottom, logoutHref }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  function isActive(href: string) {
    if (href === basePath) return pathname === href;
    return pathname.startsWith(href);
  }

  const isSupportActive = supportHref ? pathname.startsWith(supportHref) : false;

  return (
    <aside
      className={`fixed left-0 top-0 w-[260px] h-screen flex flex-col bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-[#1e293b] z-40 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Logo */}
      <div className="h-[72px] flex items-center px-6 border-b border-gray-100 dark:border-[#1e293b]">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} />
          <div>
            <span className="text-brand font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
            {logoSub && (
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-0.5">{logoSub}</p>
            )}
          </div>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="ml-auto md:hidden p-2 text-slate-400 hover:text-brand transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-500 hover:bg-gray-50 hover:text-brand"
              }`}
            >
              <span className={active ? "text-white" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-0.5 border-t border-gray-100 dark:border-[#1e293b] pt-4">
        {sidebarBottom}
        {supportHref && (
          <Link
            href={supportHref}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isSupportActive
                ? "bg-brand-blue text-white shadow-sm"
                : "text-slate-500 hover:bg-gray-50 hover:text-brand"
            }`}
          >
            <SupportIcon active={isSupportActive} />
            Support
          </Link>
        )}
        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push(logoutHref ?? "/");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all"
        >
          <LogoutIcon />
          Log Out
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────────

function Topbar({
  onMenuToggle,
  searchPlaceholder,
  profileHref,
  profileName,
  profileSub,
  profileInitials,
  profileImageUrl,
  notifData,
  notifIcon,
  notifColor,
  notifFooter,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifData);
  const [avatarError, setAvatarError] = useState(false);
  const { toast } = useToast();
  const unreadCount = notifs.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read", "info");
  }

  function markRead(id: number) {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <>
      <div className="sticky top-0 z-30 h-[72px] flex items-center gap-4 px-4 md:px-8 bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-[#1e293b] shrink-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          aria-label="Open sidebar"
          className="md:hidden p-2 text-slate-400 hover:text-brand transition-colors shrink-0"
        >
          <HamburgerIcon />
        </button>

        {/* Search — desktop only */}
        <div className="hidden md:flex flex-1 items-center gap-3 bg-gray-50 dark:bg-[#1a2332] rounded-xl px-4 py-2.5 border border-gray-100 dark:border-[#1e293b]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
            onKeyDown={(e) => { if (e.key === "Enter") toast("Search coming soon", "info"); }}
          />
        </div>

        {/* Bell */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle notifications"
          className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors ml-auto md:ml-0"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111827]" />
          )}
        </button>

        <ThemeToggle />

        {/* Profile */}
        <Link
          href={profileHref}
          className="flex items-center gap-3 pl-2 border-l border-gray-100 dark:border-[#1e293b] hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-brand leading-none">{profileName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profileSub}</p>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-blue flex items-center justify-center shrink-0">
            {profileImageUrl && !avatarError ? (
              <img
                src={profileImageUrl}
                alt={profileName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-white text-sm font-semibold">{profileInitials}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-out notification panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white dark:bg-[#111827] shadow-xl border-l border-gray-100 dark:border-[#1e293b] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-gray-100 dark:border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-brand">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-brand-blue text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-brand-blue hover:underline">
                Mark all read
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5 ${
                !n.read ? "bg-brand-blue/[0.06] dark:bg-brand-blue/[0.10]" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notifColor(n.type)}`}>
                {notifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${!n.read ? "font-bold text-brand" : "font-semibold text-slate-600"}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-slate-300 font-medium mt-1.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {notifFooter && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-[#1e293b] bg-gray-50/50 dark:bg-[#1a2332]/50 shrink-0">
            {notifFooter}
          </div>
        )}
      </div>
    </>
  );
}

// ─── DashboardLayout ──────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
  navItems,
  basePath,
  searchPlaceholder = "Search...",
  profileHref,
  profileName,
  profileSub,
  profileInitials,
  profileImageUrl,
  logoSub,
  supportHref,
  sidebarBottom,
  notifData,
  notifIcon,
  notifColor,
  notifFooter,
  mobileBlocked = false,
  logoutHref,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] dark:bg-[#0B1222]">
      {/* Mobile blocker — shown only on small screens when mobileBlocked is true */}
      {mobileBlocked && <MobileBlocker />}

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        basePath={basePath}
        logoSub={logoSub}
        supportHref={supportHref}
        sidebarBottom={sidebarBottom}
        logoutHref={logoutHref}
      />

      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div className="md:ml-[260px] flex flex-col min-h-screen flex-1 min-w-0">
        <Topbar
          onMenuToggle={() => setMenuOpen((v) => !v)}
          searchPlaceholder={searchPlaceholder}
          profileHref={profileHref}
          profileName={profileName}
          profileSub={profileSub}
          profileInitials={profileInitials}
          profileImageUrl={profileImageUrl}
          notifData={notifData}
          notifIcon={notifIcon}
          notifColor={notifColor}
          notifFooter={notifFooter}
        />
        {children}
      </div>
    </div>
  );
}
