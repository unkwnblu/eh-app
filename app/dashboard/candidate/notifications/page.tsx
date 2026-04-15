"use client";

/**
 * /dashboard/candidate/notifications
 * Full notifications inbox — all notifications grouped by date,
 * filterable by All / Unread, with "Mark all read" action.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  body:      string;
  read:      boolean;
  time:      string;
  createdAt: string;
  metadata:  Record<string, string> | null;
}

type Filter = "all" | "unread";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(notifs: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const n of notifs) {
    const d    = new Date(n.createdAt);
    const day  = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.floor((today.getTime() - day.getTime()) / 86_400_000);

    let label: string;
    if (diff === 0)       label = "Today";
    else if (diff === 1)  label = "Yesterday";
    else if (diff < 7)    label = day.toLocaleDateString("en-GB", { weekday: "long" });
    else                  label = day.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    application:  "Application",
    interview:    "Interview",
    offer:        "Offer",
    rejection:    "Application",
    verification: "Verification",
    compliance:   "Compliance",
    system:       "System",
  };
  return map[type] ?? "System";
}

function typeColor(type: string): string {
  if (type === "application")  return "bg-brand-blue/10 text-brand-blue";
  if (type === "interview")    return "bg-purple-100 text-purple-600";
  if (type === "offer")        return "bg-green-100 text-green-600";
  if (type === "rejection")    return "bg-red-100 text-red-500";
  if (type === "verification") return "bg-green-100 text-green-600";
  if (type === "compliance")   return "bg-amber-100 text-amber-600";
  return "bg-slate-100 text-slate-500";
}

function typeIconBg(type: string): string {
  if (type === "application")  return "bg-brand-blue/10 text-brand-blue";
  if (type === "interview")    return "bg-purple-100 text-purple-600";
  if (type === "offer")        return "bg-green-100 text-green-600";
  if (type === "rejection")    return "bg-red-100 text-red-500";
  if (type === "verification") return "bg-green-100 text-green-600";
  if (type === "compliance")   return "bg-amber-100 text-amber-600";
  return "bg-slate-100 text-slate-500";
}

function NotifIcon({ type }: { type: string }) {
  if (type === "application" || type === "interview" || type === "offer" || type === "rejection") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
  if (type === "verification") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
  if (type === "compliance") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifs,    setNotifs]    = useState<Notification[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<Filter>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/candidate/notifications");
      if (!res.ok) throw new Error("failed");
      const data = await res.json() as { notifications: Notification[] };
      setNotifs(data.notifications ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Mark all read ──────────────────────────────────────────────────────────

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/candidate/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ all: true }),
      });
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Mark one read ──────────────────────────────────────────────────────────

  const markOneRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch("/api/candidate/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
    } catch {}
  };

  // ── Filtered + grouped ─────────────────────────────────────────────────────

  const filtered = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;
  const groups   = groupByDate(filtered);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 p-4 md:p-8 min-h-0">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-2xl font-black text-brand dark:text-slate-100 leading-tight tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="p-2.5 bg-white dark:bg-[#1a2332] border border-gray-100 dark:border-[#1e293b] rounded-xl text-slate-400 hover:text-brand-blue transition-colors"
            aria-label="Refresh notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-[#1a2332] border border-gray-100 dark:border-[#1e293b] rounded-xl text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white dark:bg-[#1a2332] border border-gray-100 dark:border-[#1e293b] rounded-2xl p-1 w-fit" data-gsap="fade-down">
        {(["all", "unread"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-brand-blue text-white"
                : "text-slate-500 hover:text-brand dark:hover:text-slate-200"
            }`}
          >
            {f === "unread" && unreadCount > 0 ? (
              <span className="flex items-center gap-1.5">
                Unread
                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </span>
            ) : (
              f.charAt(0).toUpperCase() + f.slice(1)
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        /* Skeleton */
        <div className="space-y-4" data-gsap="fade-up">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1e293b] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded-lg w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-[#1e293b] rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-[#1e293b] rounded-lg w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center" data-gsap="fade-up">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-base font-bold text-brand dark:text-slate-200">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {filter === "unread"
              ? "You've read everything — great job staying on top of things."
              : "When you apply for jobs or your profile is updated, you'll be notified here."}
          </p>
          {filter === "unread" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 text-sm font-semibold text-brand-blue hover:underline"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        /* Grouped notification list */
        <div className="space-y-6" data-gsap="fade-up">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Date group label */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                {label}
              </p>

              {/* Notification cards */}
              <div className="space-y-2">
                {items.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markOneRead(n.id); }}
                    className={`group relative bg-white dark:bg-[#1a2332] rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      n.read
                        ? "border-gray-100 dark:border-[#1e293b]"
                        : "border-brand-blue/20 dark:border-brand-blue/30 bg-brand-blue/[0.02]"
                    }`}
                  >
                    <div className="flex items-start gap-4 p-5">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeIconBg(n.type)}`}>
                        <NotifIcon type={n.type} />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`text-sm leading-snug truncate ${
                              n.read ? "font-medium text-slate-600 dark:text-slate-300" : "font-bold text-brand dark:text-slate-100"
                            }`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor(n.type)}`}>
                              {typeLabel(n.type)}
                            </span>
                            <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap">{n.time}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {n.body}
                        </p>

                        {/* Metadata action links */}
                        {n.metadata?.jobId && (
                          <Link
                            href={`/dashboard/candidate/jobs/${n.metadata.jobId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-brand-blue hover:underline"
                          >
                            View job
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Unread left-border accent */}
                    {!n.read && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-blue rounded-r-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
