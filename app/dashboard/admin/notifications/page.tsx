"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotifType   = "System Alert" | "Feature Update" | "Compliance Notice" | "Maintenance";
type Audience    = "All Users" | "Employers" | "Candidates" | "Admins";
type Priority    = "Low" | "Medium" | "High" | "Critical";
type Delivery    = "In-App" | "Email" | "Both";
type NotifStatus = "delivered" | "scheduled" | "failed" | "draft";

type Notif = {
  id:         string;
  title:      string;
  message:    string;
  type:       NotifType;
  audience:   Audience;
  priority:   Priority;
  delivery:   Delivery;
  status:     NotifStatus;
  sent:       string;
  readRate:   number | null;
  recipients: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const NOTIF_TYPES: NotifType[] = ["System Alert", "Feature Update", "Compliance Notice", "Maintenance"];
const AUDIENCES:   Audience[]  = ["All Users", "Employers", "Candidates", "Admins"];
const PRIORITIES:  Priority[]  = ["Low", "Medium", "High", "Critical"];
const DELIVERIES:  Delivery[]  = ["In-App", "Email", "Both"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<NotifType, string> = {
  "System Alert":      "bg-blue-50 text-blue-600",
  "Feature Update":    "bg-green-50 text-green-600",
  "Compliance Notice": "bg-purple-50 text-purple-600",
  "Maintenance":       "bg-amber-50 text-amber-700",
};

const TYPE_ICONS: Record<NotifType, React.ReactNode> = {
  "System Alert": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  "Feature Update": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  "Compliance Notice": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  "Maintenance": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
};

const PRIORITY_STYLES: Record<Priority, string> = {
  Low:      "bg-gray-100 text-slate-500",
  Medium:   "bg-blue-50 text-blue-600",
  High:     "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-600",
};

const STATUS_CONFIG: Record<NotifStatus, { label: string; dot: string; text: string }> = {
  delivered: { label: "Delivered", dot: "bg-green-500",  text: "text-green-600" },
  scheduled: { label: "Scheduled", dot: "bg-blue-400",   text: "text-blue-600"  },
  failed:    { label: "Failed",    dot: "bg-red-500",    text: "text-red-500"   },
  draft:     { label: "Draft",     dot: "bg-slate-300",  text: "text-slate-400" },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [notifs,         setNotifs]         = useState<Notif[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError,   setHistoryError]   = useState<string | null>(null);

  // ── Compose state ──────────────────────────────────────────────────────────
  const [title,        setTitle]        = useState("");
  const [message,      setMessage]      = useState("");
  const [type,         setType]         = useState<NotifType>("System Alert");
  const [audience,     setAudience]     = useState<Audience>("All Users");
  const [priority,     setPriority]     = useState<Priority>("Medium");
  const [delivery,     setDelivery]     = useState<Delivery>("Both");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleAt,   setScheduleAt]   = useState("");
  const [sending,      setSending]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [sendError,    setSendError]    = useState<string | null>(null);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [historyFilter, setHistoryFilter] = useState<"all" | NotifStatus>("all");

  // ── Load history ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const json = await res.json() as { notifications: Notif[] };
      setNotifs(json.notifications);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const delivered       = notifs.filter((n) => n.status === "delivered");
  const totalSent       = delivered.length;
  const totalScheduled  = notifs.filter((n) => n.status === "scheduled").length;
  const withReadRate    = notifs.filter((n) => n.readRate !== null);
  const avgReadRate     = withReadRate.length > 0
    ? Math.round(withReadRate.reduce((a, n) => a + (n.readRate ?? 0), 0) / withReadRate.length)
    : 0;
  const totalRecipients = delivered.reduce((a, n) => a + n.recipients, 0);

  // ── Send ───────────────────────────────────────────────────────────────────
  async function sendNotification() {
    if (!title.trim() || !message.trim()) return;
    if (scheduleMode === "later" && !scheduleAt) {
      setSendError("Please choose a scheduled date and time.");
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          audience,
          priority,
          delivery,
          scheduleAt: scheduleMode === "later" ? scheduleAt : null,
        }),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to send notification");
      }

      // Reset form
      setTitle(""); setMessage("");
      setType("System Alert"); setAudience("All Users");
      setPriority("Medium"); setDelivery("Both");
      setScheduleMode("now"); setScheduleAt("");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);

      // Refresh list
      await load();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSending(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deleteNotification(id: string) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
  }

  const filtered = historyFilter === "all" ? notifs : notifs.filter((n) => n.status === historyFilter);

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">Compose and broadcast messages to platform users.</p>
        </div>
        <button
          onClick={load}
          disabled={historyLoading}
          className="self-start p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/20 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className={historyLoading ? "animate-spin" : ""}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-up">

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Total Sent</p>
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
          {historyLoading ? (
            <div className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-black text-brand-blue">{totalSent}</p>
          )}
          <p className="text-xs text-slate-400 font-medium mt-1">Delivered</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Total Recipients</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          {historyLoading ? (
            <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-black text-brand-blue">{totalRecipients.toLocaleString()}</p>
          )}
          <p className="text-xs text-slate-400 font-medium mt-1">Unique users reached</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Avg. Read Rate</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          {historyLoading ? (
            <div className="h-8 w-14 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-black text-brand-blue">{avgReadRate}%</p>
          )}
          <p className="text-xs text-slate-400 font-medium mt-1">Across delivered</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Scheduled</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {historyLoading ? (
            <div className="h-8 w-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-black text-brand-blue">{totalScheduled}</p>
          )}
          <p className="text-xs text-slate-400 font-medium mt-1">Pending dispatch</p>
        </div>

      </div>

      {/* Main: compose + history */}
      <div className="flex flex-col lg:flex-row gap-5 items-start" data-gsap="fade-up">

        {/* ── Compose panel ───────────────────────────────────────────────── */}
        <div className="w-full lg:w-[420px] lg:shrink-0 bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-brand">Compose Notification</h2>
          </div>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-100 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-semibold text-green-700">Notification sent successfully!</p>
            </div>
          )}

          {/* Error banner */}
          {sendError && (
            <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs font-semibold text-red-600">{sendError}</p>
            </div>
          )}

          {/* Type selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Notification Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {NOTIF_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    type === t
                      ? "border-brand-blue bg-brand-blue/5 text-brand-blue"
                      : "border-gray-100 bg-[#F7F8FA] text-slate-500 hover:border-gray-200"
                  }`}
                >
                  <span className={type === t ? "text-brand-blue" : "text-slate-400"}>{TYPE_ICONS[t]}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Maintenance Notice"
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Write your notification message here..."
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors resize-none"
            />
            <p className={`text-[11px] mt-1 text-right font-medium ${message.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
              {message.length}/500
            </p>
          </div>

          {/* Audience + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as Audience)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              >
                {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              >
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Delivery method */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Method</label>
            <div className="flex gap-2">
              {DELIVERIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDelivery(d)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    delivery === d
                      ? "border-brand-blue bg-brand-blue/5 text-brand-blue"
                      : "border-gray-100 bg-[#F7F8FA] text-slate-500 hover:border-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule toggle */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Send Timing</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setScheduleMode("now")}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${scheduleMode === "now" ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-gray-50"}`}
              >
                Send Now
              </button>
              <button
                onClick={() => setScheduleMode("later")}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${scheduleMode === "later" ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-gray-50"}`}
              >
                Schedule
              </button>
            </div>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full mt-2 px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            )}
          </div>

          {/* Send button */}
          <button
            onClick={sendNotification}
            disabled={!title.trim() || !message.trim() || sending}
            className="w-full py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {scheduleMode === "now" ? "Send Notification" : "Schedule Notification"}
              </>
            )}
          </button>
        </div>

        {/* ── History table ────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
            <div className="flex gap-1" role="tablist">
              {(["all", "delivered", "scheduled", "failed"] as const).map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={historyFilter === f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 capitalize transition-colors ${
                    historyFilter === f
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-slate-400 hover:text-brand"
                  }`}
                >
                  {f === "all" ? "All" : STATUS_CONFIG[f].label}
                  {f !== "all" && !historyLoading && (
                    <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                      historyFilter === f ? "bg-brand-blue text-white" : "bg-gray-100 text-slate-500"
                    }`}>
                      {notifs.filter((n) => n.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 pb-3">
              {!historyLoading && `${filtered.length} notification${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Body */}
          <div className="divide-y divide-gray-50">

            {/* Loading skeleton */}
            {historyLoading && (
              <div className="p-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-1.5 bg-gray-100 rounded w-full" />
                    </div>
                    <div className="space-y-1.5 shrink-0">
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!historyLoading && historyError && (
              <div className="p-10 text-center">
                <p className="text-sm text-red-500 mb-3">{historyError}</p>
                <button
                  onClick={load}
                  className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!historyLoading && !historyError && filtered.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-brand">
                  {historyFilter === "all" ? "No notifications sent yet" : `No ${historyFilter} notifications`}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {historyFilter === "all"
                    ? "Compose and send your first notification using the panel on the left."
                    : "Switch to a different filter or send a new notification."}
                </p>
              </div>
            )}

            {/* Notification rows */}
            {!historyLoading && !historyError && filtered.map((n) => {
              const sc = STATUS_CONFIG[n.status];
              return (
                <div key={n.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_STYLES[n.type]}`}>
                        {TYPE_ICONS[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand truncate">{n.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_STYLES[n.type]}`}>{n.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_STYLES[n.priority]}`}>{n.priority}</span>
                          <span className="text-[11px] text-slate-400">{n.audience}</span>
                          <span className="text-slate-300 text-[11px]">·</span>
                          <span className="text-[11px] text-slate-400">{n.delivery}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        <p className="text-[11px] text-slate-400">{n.sent}</p>
                      </div>
                      {/* Delete button — visible on hover */}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400"
                        title="Delete"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Read rate bar */}
                  {n.readRate !== null && n.status === "delivered" && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1 bg-brand-blue rounded-full transition-all" style={{ width: `${n.readRate}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">{n.readRate}% read</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{n.recipients.toLocaleString()} recipients</span>
                    </div>
                  )}
                  {n.status === "delivered" && n.readRate === null && n.recipients > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full" />
                      <span className="text-[11px] text-slate-400 shrink-0">{n.recipients.toLocaleString()} recipients</span>
                    </div>
                  )}
                  {n.status === "scheduled" && (
                    <p className="mt-2 text-[11px] text-blue-500 font-medium">
                      Queued for {n.sent} · {n.recipients.toLocaleString()} recipients
                    </p>
                  )}
                  {n.status === "failed" && (
                    <p className="mt-2 text-[11px] text-red-500 font-medium">
                      Delivery failed · {n.recipients.toLocaleString()} recipients affected
                    </p>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </main>
  );
}
