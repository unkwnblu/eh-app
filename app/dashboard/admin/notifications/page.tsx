"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NotificationRowSkeleton } from "@/components/ui/Skeleton";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotifType     = "System Alert" | "Feature Update" | "Compliance Notice" | "Maintenance";
type Audience      = "All Users" | "Employers" | "Candidates" | "Admins";
type Priority      = "Low" | "Medium" | "High" | "Critical";
type Delivery      = "In-App" | "Email" | "Both";
type NotifStatus   = "delivered" | "scheduled" | "failed" | "draft";

type SentNotif = {
  id: number;
  title: string;
  type: NotifType;
  audience: Audience;
  priority: Priority;
  delivery: Delivery;
  status: NotifStatus;
  sent: string;
  readRate: number | null;
  recipients: number;
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_SENT: SentNotif[] = [
  { id: 1, title: "Scheduled Maintenance — 2 Nov 02:00 UTC",    type: "Maintenance",       audience: "All Users",  priority: "High",     delivery: "Both",   status: "delivered", sent: "Oct 28, 2023",  readRate: 78,  recipients: 12482 },
  { id: 2, title: "New Compliance Rules for Healthcare Roles",   type: "Compliance Notice", audience: "Employers",  priority: "Critical", delivery: "Email",  status: "delivered", sent: "Oct 25, 2023",  readRate: 64,  recipients: 3210  },
  { id: 3, title: "Profile Verification Reminder",               type: "System Alert",      audience: "Candidates", priority: "Medium",   delivery: "In-App", status: "delivered", sent: "Oct 24, 2023",  readRate: 55,  recipients: 8120  },
  { id: 4, title: "Introducing Smart Job Matching (Beta)",       type: "Feature Update",    audience: "All Users",  priority: "Low",      delivery: "Both",   status: "delivered", sent: "Oct 20, 2023",  readRate: 82,  recipients: 12482 },
  { id: 5, title: "November Platform Downtime Notice",           type: "Maintenance",       audience: "All Users",  priority: "High",     delivery: "Both",   status: "scheduled", sent: "Nov 1, 2023",   readRate: null, recipients: 12482 },
  { id: 6, title: "DBS Check Deadline — Action Required",        type: "Compliance Notice", audience: "Candidates", priority: "Critical", delivery: "Email",  status: "failed",    sent: "Oct 22, 2023",  readRate: null, recipients: 432   },
];

const NOTIF_TYPES:  NotifType[] = ["System Alert", "Feature Update", "Compliance Notice", "Maintenance"];
const AUDIENCES:    Audience[]  = ["All Users", "Employers", "Candidates", "Admins"];
const PRIORITIES:   Priority[]  = ["Low", "Medium", "High", "Critical"];
const DELIVERIES:   Delivery[]  = ["In-App", "Email", "Both"];

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
  const [sent, setSent]               = useState<SentNotif[]>(INITIAL_SENT);
  const [title, setTitle]             = useState("");
  const [message, setMessage]         = useState("");
  const [type, setType]               = useState<NotifType>("System Alert");
  const [audience, setAudience]       = useState<Audience>("All Users");
  const [priority, setPriority]       = useState<Priority>("Medium");
  const [delivery, setDelivery]       = useState<Delivery>("Both");
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [success, setSuccess]         = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | NotifStatus>("all");
  const [historyLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const totalSent      = sent.filter((n) => n.status === "delivered").length;
  const totalScheduled = sent.filter((n) => n.status === "scheduled").length;
  const avgReadRate    = Math.round(sent.filter((n) => n.readRate !== null).reduce((a, n) => a + (n.readRate ?? 0), 0) / sent.filter((n) => n.readRate !== null).length);
  const totalRecipients = sent.filter((n) => n.status === "delivered").reduce((a, n) => a + n.recipients, 0);

  function sendNotification() {
    if (!title || !message) return;
    const notif: SentNotif = {
      id: Date.now(), title, type, audience, priority, delivery,
      status: scheduleMode === "now" ? "delivered" : "scheduled",
      sent: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      readRate: scheduleMode === "now" ? 0 : null,
      recipients: audience === "All Users" ? 12482 : audience === "Candidates" ? 8120 : audience === "Employers" ? 3210 : 42,
    };
    setSent((prev) => [notif, ...prev]);
    setTitle(""); setMessage("");
    setType("System Alert"); setAudience("All Users"); setPriority("Medium"); setDelivery("Both");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  }

  const filtered = historyFilter === "all" ? sent : sent.filter((n) => n.status === historyFilter);

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">Compose and broadcast messages to platform users.</p>
        </div>
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
          <p className="text-2xl font-black text-brand-blue">{totalSent}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">This month</p>
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
          <p className="text-2xl font-black text-brand-blue">{totalRecipients.toLocaleString()}</p>
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
          <p className="text-2xl font-black text-brand-blue">{avgReadRate}%</p>
          <p className="text-xs text-green-500 font-semibold mt-1">+4% vs last month</p>
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
          <p className="text-2xl font-black text-brand-blue">{totalScheduled}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Pending dispatch</p>
        </div>
      </div>

      {/* Main: compose + recent */}
      <div className="flex flex-col lg:flex-row gap-5 items-start" data-gsap="fade-up">

        {/* Compose panel */}
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
              placeholder="Write your notification message here..."
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/500</p>
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
                className="w-full mt-2 px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            )}
          </div>

          {/* Send button */}
          <button
            onClick={sendNotification}
            disabled={!title || !message}
            className="w-full py-3 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            {scheduleMode === "now" ? "Send Notification" : "Schedule Notification"}
          </button>
        </div>

        {/* History table */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-100">
            <div className="flex gap-1" role="tablist" aria-label="Filter notification history">
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
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 pb-3">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {historyLoading ? (
              <div className="p-5">
                <NotificationRowSkeleton count={5} />
              </div>
            ) : historyError ? (
              <div className="p-5">
                <ErrorState message="Unable to load notification history." onRetry={() => setHistoryError(false)} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  }
                  title="No notifications sent yet"
                  description="Compose and send your first notification using the panel on the left."
                />
              </div>
            ) : (
              filtered.map((n) => {
                const sc = STATUS_CONFIG[n.status];
                return (
                  <div key={n.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
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

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        <p className="text-[11px] text-slate-400">{n.sent}</p>
                      </div>
                    </div>

                    {/* Read rate bar */}
                    {n.readRate !== null && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-1 bg-brand-blue rounded-full" style={{ width: `${n.readRate}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 shrink-0">{n.readRate}% read</span>
                        <span className="text-[11px] text-slate-400 shrink-0">{n.recipients.toLocaleString()} recipients</span>
                      </div>
                    )}
                    {n.readRate === null && n.status === "scheduled" && (
                      <p className="mt-2 text-[11px] text-blue-500 font-medium">Queued for {n.sent}</p>
                    )}
                    {n.readRate === null && n.status === "failed" && (
                      <p className="mt-2 text-[11px] text-red-500 font-medium">Delivery failed · {n.recipients.toLocaleString()} recipients affected</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
