"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout, { NavItem, NotifItem } from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import SessionGuard from "@/components/session/SessionGuard";

// ─── Nav ─────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/candidate",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Job Listings",
    href: "/dashboard/candidate/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "Applications",
    href: "/dashboard/candidate/applications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    label: "Shifts",
    href: "/dashboard/candidate/shifts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V9z" />
      </svg>
    ),
  },
  {
    label: "Legal & Compliance",
    href: "/dashboard/candidate/legal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/dashboard/candidate/notifications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/candidate/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Notifications ───────────────────────────────────────────────────────────────

function notifIcon(type: string) {
  if (type === "application" || type === "interview" || type === "offer" || type === "rejection") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
  );
  if (type === "verification") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  );
  if (type === "compliance") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
  );
}

function notifColor(type: string) {
  if (type === "application")  return "bg-brand-blue/15 text-brand-blue";
  if (type === "interview")    return "bg-purple-500/15 text-purple-500 dark:text-purple-400";
  if (type === "offer")        return "bg-green-500/15 text-green-500 dark:text-green-400";
  if (type === "rejection")    return "bg-red-500/15 text-red-500 dark:text-red-400";
  if (type === "verification") return "bg-green-500/15 text-green-500 dark:text-green-400";
  if (type === "compliance")   return "bg-amber-500/15 text-amber-500 dark:text-amber-400";
  return "bg-slate-500/15 text-slate-500 dark:text-slate-400";
}

// ─── Layout ──────────────────────────────────────────────────────────────────────

export default function CandidateDashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [profileName,     setProfileName]     = useState("Candidate");
  const [profileInitials, setProfileInitials] = useState("C");
  const [profileEmail,    setProfileEmail]    = useState("");
  const [profileStatus,   setProfileStatus]   = useState<string | null>(null);
  const [resubmissionNote, setResubmissionNote] = useState<string>("");

  // ── Live notifications state ─────────────────────────────────────────────────
  const [notifData, setNotifData] = useState<NotifItem[]>([]);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/candidate/notifications");
      if (!res.ok) return;
      const data = await res.json() as { notifications: NotifItem[] };
      setNotifData(data.notifications ?? []);
    } catch {
      // best-effort
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await fetch("/api/candidate/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ all: true }),
      });
    } catch {}
  }, []);

  const handleMarkOneRead = useCallback(async (id: string | number) => {
    try {
      await fetch("/api/candidate/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: String(id) }),
      });
    } catch {}
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata as Record<string, string> | null;
      const fullName =
        meta?.full_name?.trim() ||
        `${meta?.first_name ?? ""} ${meta?.last_name ?? ""}`.trim() ||
        user.email?.split("@")[0] ||
        "Candidate";
      const email = user.email ?? "";
      const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "C";
      setProfileName(fullName);
      setProfileInitials(initials);
      setProfileEmail(email);

      // Fetch profile status to enforce resubmission lock
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, resubmission_note")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfileStatus(profile.status);
        setResubmissionNote(profile.resubmission_note ?? "");
      }
    });

    // Load notifications on mount
    fetchNotifs();
  }, [fetchNotifs]);

  const isResubmission = profileStatus === "resubmission";
  const isSuspended    = profileStatus === "suspended";

  // Redirect away from non-legal pages while in resubmission state
  useEffect(() => {
    if (!isResubmission) return;
    const legalPath = "/dashboard/candidate/legal";
    if (!pathname.startsWith(legalPath)) {
      router.replace(legalPath);
    }
  }, [isResubmission, pathname, router]);

  // Don't render anything until we know the status — prevents dashboard flash
  if (profileStatus === null) {
    return (
      <div className="min-h-screen bg-gray-soft dark:bg-[#0B1222] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Suspended: full-screen block ─────────────────────────────────────────────
  if (isSuspended) {
    const handleSignOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/auth/candidate/login");
    };

    return (
      <div className="min-h-screen bg-gray-soft dark:bg-[#0B1222] flex items-center justify-center px-6">
        <style>{`
          @keyframes float-up {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .sus-fade { animation: float-up 0.5s ease forwards; }
          .sus-fade-2 { animation: float-up 0.5s 0.1s ease both; }
          .sus-fade-3 { animation: float-up 0.5s 0.2s ease both; }
        `}</style>

        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 sus-fade">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand dark:text-slate-100 font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6 sus-fade">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <div className="sus-fade-2">
            <h1 className="text-brand dark:text-slate-100 font-black text-3xl leading-tight tracking-tight mb-3">
              Application <span className="text-red-500">Not Approved.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Unfortunately your application did not meet our compliance requirements at this time. If you believe this is an error or wish to appeal, please get in touch with our team.
            </p>
          </div>

          <div className="sus-fade-3 space-y-3">
            {/* Appeal / contact */}
            <a
              href="mailto:compliance@edgeharbour.com"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-blue text-white text-sm font-bold rounded-2xl hover:bg-brand-blue-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Compliance Team
            </a>

            <button
              onClick={handleSignOut}
              className="w-full py-3.5 border border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm font-semibold rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Sign Out
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-8 sus-fade-3">
            Reference: <span className="font-mono">{profileEmail}</span>
          </p>
        </div>
      </div>
    );
  }

  const navItems = isResubmission
    ? NAV_ITEMS.filter((n) => n.href === "/dashboard/candidate/legal")
    : NAV_ITEMS;

  const resubmissionBanner = isResubmission ? (
    <div className="mx-4 mt-4 md:mx-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800">Additional documents required</p>
          {resubmissionNote ? (
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">{resubmissionNote}</p>
          ) : (
            <p className="text-xs text-amber-700 mt-1">Our compliance team has requested more information. Please upload the required documents below.</p>
          )}
          <p className="text-[11px] text-amber-600 mt-2 font-medium">Your account access will be restored once your documents are reviewed and approved.</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
    <SessionGuard idleMinutes={360} logoutHref="/auth/candidate/login" />
    <DashboardLayout
      navItems={navItems}
      basePath="/dashboard/candidate"
      searchPlaceholder="Search jobs, applications..."
      profileHref="/dashboard/candidate/profile"
      profileName={profileName}
      profileSub={profileEmail}
      profileInitials={profileInitials}
      supportHref="/dashboard/candidate/support"
      notifData={notifData}
      notifIcon={notifIcon}
      notifColor={notifColor}
      notifFooter={
        <Link
          href="/dashboard/candidate/notifications"
          className="w-full text-center text-xs font-semibold text-brand-blue hover:underline py-1 block"
        >
          View all notifications
        </Link>
      }
      onMarkAllRead={handleMarkAllRead}
      onMarkOneRead={handleMarkOneRead}
      logoutHref="/auth/candidate/login"
    >
      {resubmissionBanner}
      {children}
    </DashboardLayout>
    </>
  );
}
