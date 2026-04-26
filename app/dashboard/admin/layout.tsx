"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout, { NavItem, NotifItem } from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import SessionGuard from "@/components/session/SessionGuard";
import AdminSearchBar from "@/components/admin/AdminSearchBar";

// ─── Nav ─────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Candidate Verification",
    href: "/dashboard/admin/verification",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Employer Verification",
    href: "/dashboard/admin/employer-verification",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    label: "Job Moderation",
    href: "/dashboard/admin/moderation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "Job Pipeline",
    href: "/dashboard/admin/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125-.504-1.125-1.125M10.875 12c.621 0 1.125.504 1.125 1.125v1.5m-4.125 0h7.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-7.5c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125z" />
      </svg>
    ),
  },
  {
    label: "Library",
    href: "/dashboard/admin/library",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: "Timesheets",
    href: "/dashboard/admin/timesheets",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    label: "User Management",
    href: "/dashboard/admin/users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/dashboard/admin/notifications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

// ─── Notifications ───────────────────────────────────────────────────────────────

const READ_KEY = "admin_inbox_read_ids";

function notifIcon(type: string) {
  if (type === "verification") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  );
  if (type === "moderation") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
  );
  if (type === "user") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
  );
}

function notifColor(type: string) {
  if (type === "verification") return "bg-brand-blue/15 text-brand-blue";
  if (type === "moderation")   return "bg-amber-500/15 text-amber-500 dark:text-amber-400";
  if (type === "user")         return "bg-purple-500/15 text-purple-500 dark:text-purple-400";
  return "bg-green-500/15 text-green-500 dark:text-green-400";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function SidebarUserCard({ name, sub, initials, imageUrl }: {
  name: string;
  sub: string;
  initials: string;
  imageUrl?: string;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-3 px-3 py-2 mb-0.5">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-blue flex items-center justify-center shrink-0">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white text-sm font-bold">{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-brand truncate">{name}</p>
        <p className="text-[11px] text-slate-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────────

// Nav items hidden from moderators
const MODERATOR_HIDDEN = new Set(["/dashboard/admin/users"]);

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [profileName,     setProfileName]     = useState("Admin");
  const [profileInitials, setProfileInitials] = useState("A");
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [role,            setRole]            = useState<string>("admin");
  const [notifData,       setNotifData]       = useState<NotifItem[]>([]);

  const profileSub = role === "moderator" ? "Moderator" : "System Controller";

  const visibleNavItems =
    role === "moderator"
      ? NAV_ITEMS.filter((item) => !MODERATOR_HIDDEN.has(item.href))
      : NAV_ITEMS;

  // Load read IDs from localStorage
  const getReadIds = useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      return new Set(raw ? JSON.parse(raw) as string[] : []);
    } catch { return new Set(); }
  }, []);

  const saveReadIds = useCallback((ids: Set<string>) => {
    try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch {}
  }, []);

  // Fetch live inbox items
  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/inbox");
      if (!res.ok) return;
      const data = await res.json() as { items: (NotifItem & { href?: string })[] };
      const readIds = getReadIds();
      setNotifData(
        (data.items ?? []).map((item) => ({
          ...item,
          read: readIds.has(String(item.id)),
        })),
      );
    } catch { /* best-effort */ }
  }, [getReadIds]);

  const handleMarkOneRead = useCallback((id: string | number) => {
    const readIds = getReadIds();
    readIds.add(String(id));
    saveReadIds(readIds);
    setNotifData((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, [getReadIds, saveReadIds]);

  const handleMarkAllRead = useCallback(() => {
    setNotifData((prev) => {
      const readIds = getReadIds();
      prev.forEach((n) => readIds.add(String(n.id)));
      saveReadIds(readIds);
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, [getReadIds, saveReadIds]);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Admin";
        setProfileName(name);
        setProfileInitials(getInitials(name));
        setProfileImageUrl(user.user_metadata?.avatar_url ?? undefined);
        setRole(user.app_metadata?.role ?? "admin");
      }
    }
    loadUser();
    fetchNotifs();
  }, [fetchNotifs]);

  const sidebarBottom = (
    <SidebarUserCard
      name={profileName}
      sub={profileSub}
      initials={profileInitials}
      imageUrl={profileImageUrl}
    />
  );

  return (
    <>
    <SessionGuard idleMinutes={360} logoutHref="/auth/admin/login" />
    <DashboardLayout
      navItems={visibleNavItems}
      basePath="/dashboard/admin"
      searchSlot={<AdminSearchBar />}
      profileHref="/dashboard/admin/profile"
      profileName={profileName}
      profileSub={profileSub}
      profileInitials={profileInitials}
      profileImageUrl={profileImageUrl}
      logoSub="Admin Portal"
      sidebarBottom={sidebarBottom}
      notifData={notifData}
      notifIcon={notifIcon}
      notifColor={notifColor}
      onMarkAllRead={handleMarkAllRead}
      onMarkOneRead={handleMarkOneRead}
      notifFooter={
        <Link
          href="/dashboard/admin/notifications"
          className="block w-full text-center text-xs font-semibold text-brand-blue hover:underline py-1"
        >
          Notification centre
        </Link>
      }
      mobileBlocked
      logoutHref="/auth/admin/login"
    >
      {children}
    </DashboardLayout>
    </>
  );
}
