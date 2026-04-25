"use client";

import { useState, useEffect } from "react";
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
  id: string | number;
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
  collapsed: boolean;
  onToggleCollapsed: () => void;
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
  searchSlot?: React.ReactNode;
  profileHref: string;
  profileName: string;
  profileSub: string;
  profileInitials: string;
  profileImageUrl?: string;
  notifData: NotifItem[];
  notifIcon: (type: string) => React.ReactNode;
  notifColor: (type: string) => string;
  notifFooter?: React.ReactNode;
  /** Called after all notifications are marked read — use to persist to the server */
  onMarkAllRead?: () => void;
  /** Called after a single notification is marked read — use to persist to the server */
  onMarkOneRead?: (id: string | number) => void;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  // Navigation
  navItems: NavItem[];
  basePath: string;
  // Topbar / profile
  searchPlaceholder?: string;
  /** Replaces the default search input with a custom component (e.g. EmployerSearchBar) */
  searchSlot?: React.ReactNode;
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
  onMarkAllRead?: () => void;
  onMarkOneRead?: (id: string | number) => void;
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

/** Chevron used for the collapse/expand toggle */
function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────────

function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
  navItems,
  basePath,
  logoSub,
  supportHref,
  sidebarBottom,
  logoutHref,
}: SidebarProps) {
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
      className={`fixed left-0 top-0 h-screen flex flex-col bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-[#1e293b] z-40 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[260px]"
      } ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Logo */}
      <div className="h-[72px] flex items-center px-3 border-b border-gray-100 dark:border-[#1e293b] shrink-0">
        <Link
          href="/"
          className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "mx-auto" : "flex-1"}`}
        >
          <img src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} className="shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-brand font-bold text-base tracking-tight leading-none">
                Edge<span className="text-brand-blue">Harbour</span>
              </span>
              {logoSub && (
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-0.5">{logoSub}</p>
              )}
            </div>
          )}
        </Link>

        {/* Mobile close — always present so the sidebar can be dismissed regardless of collapsed state */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="md:hidden p-2 text-slate-400 hover:text-brand transition-colors shrink-0"
        >
          <CloseIcon />
        </button>

        {/* Desktop collapse toggle — shown when expanded; expand button lives at the bottom when collapsed */}
        {!collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <CollapseIcon collapsed={false} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-5 space-y-0.5 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.label} className="relative group/navitem">
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${
                  active
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand"
                }`}
              >
                <span className={`shrink-0 ${active ? "text-white" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </Link>

              {/* Tooltip — shown only when collapsed, on desktop */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden md:block opacity-0 group-hover/navitem:opacity-100 transition-opacity duration-150">
                  <div className="relative">
                    {/* Arrow */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#1e293b]" />
                    <span className="block px-3 py-1.5 bg-[#1e293b] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
                      {item.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`pb-5 space-y-0.5 border-t border-gray-100 dark:border-[#1e293b] pt-4 ${collapsed ? "px-2" : "px-3"}`}>
        {/* User card — hide when collapsed */}
        {!collapsed && sidebarBottom}

        {/* Support link */}
        {supportHref && (
          <div className="relative group/support">
            <Link
              href={supportHref}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${
                isSupportActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand"
              }`}
            >
              <SupportIcon active={isSupportActive} />
              {!collapsed && "Support"}
            </Link>
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden md:block opacity-0 group-hover/support:opacity-100 transition-opacity duration-150">
                <div className="relative">
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#1e293b]" />
                  <span className="block px-3 py-1.5 bg-[#1e293b] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
                    Support
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="relative group/logout">
          <button
            onClick={async () => {
              try { localStorage.setItem("eh_logout", "intentional"); } catch {}
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push(logoutHref ?? "/");
            }}
            className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            <LogoutIcon />
            {!collapsed && "Log Out"}
          </button>
          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden md:block opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150">
              <div className="relative">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-[#1e293b]" />
                <span className="block px-3 py-1.5 bg-[#1e293b] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
                  Log Out
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Expand button — shown only when collapsed, desktop only */}
        {collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            className="w-full hidden md:flex items-center justify-center py-2.5 px-2 rounded-xl text-slate-400 hover:text-brand hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <CollapseIcon collapsed={true} />
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────────

function Topbar({
  onMenuToggle,
  searchPlaceholder,
  searchSlot,
  profileHref,
  profileName,
  profileSub,
  profileInitials,
  profileImageUrl,
  notifData,
  notifIcon,
  notifColor,
  notifFooter,
  onMarkAllRead,
  onMarkOneRead,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifData);
  const [avatarError, setAvatarError] = useState(false);
  const { toast } = useToast();
  const unreadCount = notifs.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    toast("All notifications marked as read", "info");
    onMarkAllRead?.();
  }

  function markRead(id: string | number) {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
    onMarkOneRead?.(id);
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
        {searchSlot ? (
          searchSlot
        ) : (
          <div className="hidden md:flex flex-1 items-center gap-3 bg-gray-50 dark:bg-[#1a2332] rounded-xl px-4 py-2.5 border border-gray-100 dark:border-[#1e293b]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"
              onKeyDown={(e) => { if (e.key === "Enter") toast("Search coming soon", "info"); }}
            />
          </div>
        )}

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
            <p className="text-sm font-semibold text-brand dark:text-white leading-none">{profileName}</p>
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
            <h3 className="text-sm font-bold text-brand dark:text-white">Notifications</h3>
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
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
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
                  <p className={`text-sm leading-snug ${!n.read ? "font-bold text-brand dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300"}`}>
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

const STORAGE_KEY = "eh_sidebar_collapsed";

export default function DashboardLayout({
  children,
  navItems,
  basePath,
  searchPlaceholder = "Search...",
  searchSlot,
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
  onMarkAllRead,
  onMarkOneRead,
  mobileBlocked = false,
  logoutHref,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // Avoid hydration mismatch — read localStorage only after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }

  // Use the resolved collapsed value only after mount to avoid SSR flash
  const sidebarCollapsed = mounted ? collapsed : false;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] dark:bg-[#0B1222]">
      {/* Mobile blocker — shown only on small screens when mobileBlocked is true */}
      {mobileBlocked && <MobileBlocker />}

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleCollapsed}
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

      <div
        className={`flex flex-col min-h-screen flex-1 min-w-0 transition-[margin] duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[260px]"
        }`}
      >
        <Topbar
          onMenuToggle={() => setMenuOpen((v) => !v)}
          searchPlaceholder={searchPlaceholder}
          searchSlot={searchSlot}
          profileHref={profileHref}
          profileName={profileName}
          profileSub={profileSub}
          profileInitials={profileInitials}
          profileImageUrl={profileImageUrl}
          notifData={notifData}
          notifIcon={notifIcon}
          notifColor={notifColor}
          notifFooter={notifFooter}
          onMarkAllRead={onMarkAllRead}
          onMarkOneRead={onMarkOneRead}
        />
        {children}
      </div>
    </div>
  );
}
