"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavStyle = "side" | "top";

type Settings = {
  platform_name:     string;
  brand_color:       string;
  nav_style:         NavStyle;
  two_factor:        boolean;
  dbs_rule:          boolean;
  gdpr_rule:         boolean;
  rtw_rule:          boolean;
  session_timeout:   string;
  password_rotation: string;
  logo_url:          string | null;
};

const DEFAULTS: Settings = {
  platform_name:     "Edge Harbour",
  brand_color:       "#1275E2",
  nav_style:         "side",
  two_factor:        true,
  dbs_rule:          true,
  gdpr_rule:         true,
  rtw_rule:          false,
  session_timeout:   "4 Hours",
  password_rotation: "90 Days",
  logo_url:          null,
};

type ActiveTab = "general" | "compliance" | "security" | "integrations";
type IntegStatus = "connected" | "pending" | "disconnected";

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-pressed={on}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-40 ${on ? "bg-brand-blue" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0"}`} />
    </button>
  );
}

// ─── SettingRow ────────────────────────────────────────────────────────────────

function SettingRow({
  iconBg, icon, title, description, action,
}: {
  iconBg: string; icon: React.ReactNode; title: string; description: string; action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#F7F8FA] rounded-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ─── Tab button ────────────────────────────────────────────────────────────────

function TabBtn({
  label, icon, active, onClick, dirty,
}: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void; dirty?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
        active ? "bg-brand-blue text-white shadow-sm" : "text-slate-500 hover:text-brand hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
      {dirty && !active && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border-2 border-white" />
      )}
    </button>
  );
}

// ─── Save bar ─────────────────────────────────────────────────────────────────

function SaveBar({
  dirty, saving, onDiscard, onSave, label,
}: {
  dirty: boolean; saving: boolean; onDiscard: () => void; onSave: () => void; label: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={onDiscard}
        disabled={!dirty || saving}
        className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors disabled:opacity-40"
      >
        Discard
      </button>
      <button
        onClick={onSave}
        disabled={!dirty || saving}
        className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-40 flex items-center gap-2"
      >
        {saving && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        )}
        {saving ? "Saving…" : label}
      </button>
    </div>
  );
}

// ─── Integration card ──────────────────────────────────────────────────────────

function IntegCard({
  name, status, iconBg, icon, onConfigure, onConnect, onDisconnect,
}: {
  name: string; status: IntegStatus; iconBg: string;
  icon: React.ReactNode; onConfigure: () => void; onConnect: () => void; onDisconnect: () => void;
}) {
  const statusCfg = {
    connected:    { dot: "bg-green-500", text: "text-green-600", label: "Connected" },
    pending:      { dot: "bg-amber-400", text: "text-amber-600", label: "Pending Setup" },
    disconnected: { dot: "bg-gray-300",  text: "text-slate-400", label: "Not Connected" },
  }[status];

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-brand truncate">{name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
            <p className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-3">
        {status === "connected" ? (
          <>
            <button onClick={onConfigure} title="Configure" className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-gray-100 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={onDisconnect} title="Disconnect" className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <button onClick={onConnect} className="px-3 py-1.5 text-xs font-bold bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { toast } = useToast();

  useEffect(() => { document.title = "Settings | Edge Harbour Admin"; }, []);

  const [settings,  setSettings]  = useState<Settings>(DEFAULTS);
  const [draft,     setDraft]     = useState<Settings>(DEFAULTS);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/settings");
      const data = await res.json() as Settings & { updated_at?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const s: Settings = {
        platform_name:     data.platform_name     ?? DEFAULTS.platform_name,
        brand_color:       data.brand_color       ?? DEFAULTS.brand_color,
        nav_style:         (data.nav_style as NavStyle) ?? DEFAULTS.nav_style,
        two_factor:        data.two_factor        ?? DEFAULTS.two_factor,
        dbs_rule:          data.dbs_rule          ?? DEFAULTS.dbs_rule,
        gdpr_rule:         data.gdpr_rule         ?? DEFAULTS.gdpr_rule,
        rtw_rule:          data.rtw_rule          ?? DEFAULTS.rtw_rule,
        session_timeout:   data.session_timeout   ?? DEFAULTS.session_timeout,
        password_rotation: data.password_rotation ?? DEFAULTS.password_rotation,
        logo_url:          data.logo_url          ?? null,
      };
      setSettings(s);
      setDraft(s);
      if (data.updated_at) setLastSaved(new Date(data.updated_at));
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  // ── Save (optimistic) ──────────────────────────────────────────────────────

  const save = useCallback(async (fields: Partial<Settings>) => {
    setSaving(true);
    const prev = settings;
    const next = { ...settings, ...fields };
    setSettings(next);
    try {
      const res  = await fetch("/api/admin/settings", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(fields),
      });
      const data = await res.json() as { ok?: boolean; updated_at?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setDraft(next);
      if (data.updated_at) setLastSaved(new Date(data.updated_at));
      toast("Settings saved", "success");
    } catch (err) {
      setSettings(prev);
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  // ── Dirty state per tab ────────────────────────────────────────────────────

  const dirtyGeneral = useMemo(() =>
    draft.platform_name !== settings.platform_name ||
    draft.brand_color   !== settings.brand_color   ||
    draft.nav_style     !== settings.nav_style,
  [draft, settings]);

  const dirtyCompliance = useMemo(() =>
    draft.dbs_rule  !== settings.dbs_rule  ||
    draft.gdpr_rule !== settings.gdpr_rule ||
    draft.rtw_rule  !== settings.rtw_rule,
  [draft, settings]);

  const dirtySecurity = useMemo(() =>
    draft.two_factor        !== settings.two_factor        ||
    draft.session_timeout   !== settings.session_timeout   ||
    draft.password_rotation !== settings.password_rotation,
  [draft, settings]);

  function discard() { setDraft(settings); }

  function saveGeneral()    { void save({ platform_name: draft.platform_name, brand_color: draft.brand_color, nav_style: draft.nav_style }); }
  function saveCompliance() { void save({ dbs_rule: draft.dbs_rule, gdpr_rule: draft.gdpr_rule, rtw_rule: draft.rtw_rule }); }
  function saveSecurity()   { void save({ two_factor: draft.two_factor, session_timeout: draft.session_timeout, password_rotation: draft.password_rotation }); }

  // ── Last saved label ───────────────────────────────────────────────────────

  const lastSavedLabel = lastSaved ? (() => {
    const mins = Math.floor((Date.now() - lastSaved.getTime()) / 60000);
    if (mins < 1)  return "Saved just now";
    if (mins < 60) return `Saved ${mins}m ago`;
    return `Saved ${Math.floor(mins / 60)}h ago`;
  })() : null;

  // ── Compliance count (from persisted settings) ─────────────────────────────

  const complianceCount = useMemo(() =>
    [settings.dbs_rule, settings.gdpr_rule, settings.rtw_rule].filter(Boolean).length,
  [settings]);

  // ── Shared SVG paths ───────────────────────────────────────────────────────

  const SpinPath = () => <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />;

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-5">
      <GsapAnimations />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">System Configuration</h1>
          <p className="text-sm text-slate-400 mt-1">Manage global platform settings, compliance protocols, and integrations.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastSavedLabel && (
            <span className="hidden sm:block text-xs font-semibold text-slate-400 px-3 py-2 bg-white border border-gray-100 rounded-xl">
              {lastSavedLabel}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            title="Reload settings"
            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
              <SpinPath />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-gsap="fade-up">

        {/* Brand color */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl">
          <div className="w-9 h-9 rounded-xl border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: settings.brand_color }} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand</p>
            <p className="text-sm font-black text-brand font-mono truncate">{settings.brand_color}</p>
          </div>
        </div>

        {/* Compliance */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-transparent border ${
          complianceCount === 3 ? "bg-green-500" : complianceCount === 0 ? "bg-red-500" : "bg-amber-400"
        }`}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Compliance</p>
            <p className="text-sm font-black text-white">{complianceCount}/3 Active</p>
          </div>
        </div>

        {/* MFA */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${settings.two_factor ? "bg-white border-gray-100" : "bg-red-50 border-red-100"}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${settings.two_factor ? "bg-brand-blue/10" : "bg-red-100"}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={settings.two_factor ? "text-brand-blue" : "text-red-500"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MFA</p>
            <p className={`text-sm font-black ${settings.two_factor ? "text-brand" : "text-red-500"}`}>
              {settings.two_factor ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>

        {/* Session */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Session</p>
            <p className="text-sm font-black text-brand truncate">{settings.session_timeout}</p>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 flex items-center gap-1 overflow-x-auto" data-gsap="fade-up">
        <TabBtn label="General" active={activeTab === "general"} dirty={dirtyGeneral} onClick={() => setActiveTab("general")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>}
        />
        <TabBtn label="Compliance" active={activeTab === "compliance"} dirty={dirtyCompliance} onClick={() => setActiveTab("compliance")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
        />
        <TabBtn label="Security" active={activeTab === "security"} dirty={dirtySecurity} onClick={() => setActiveTab("security")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
        />
        <TabBtn label="Integrations" active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" /></svg>}
        />
      </div>

      {/* ── Tab content ── */}
      {loading ? (
        <SettingsSkeleton />
      ) : (
        <>
          {/* ─ General ─────────────────────────────────────────────────────── */}
          {activeTab === "general" && (
            <div className="space-y-4" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-brand">Platform Branding</h2>
                    <p className="text-xs text-slate-400">Customise the look and feel of the user portal.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Platform name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={draft.platform_name}
                      onChange={(e) => setDraft((d) => ({ ...d, platform_name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>

                  {/* Brand colour — native picker + hex input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Primary Brand Colour
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Swatch is a label so clicking it opens the hidden <input type="color"> */}
                      <label
                        className="relative w-[42px] h-[42px] rounded-xl border border-gray-200 overflow-hidden cursor-pointer shrink-0 shadow-sm hover:scale-105 transition-transform"
                        style={{ backgroundColor: draft.brand_color }}
                        title="Pick a colour"
                      >
                        <input
                          type="color"
                          value={draft.brand_color}
                          onChange={(e) => setDraft((d) => ({ ...d, brand_color: e.target.value }))}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={draft.brand_color}
                        onChange={(e) => setDraft((d) => ({ ...d, brand_color: e.target.value }))}
                        onBlur={(e) => {
                          if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            setDraft((d) => ({ ...d, brand_color: settings.brand_color }));
                          }
                        }}
                        placeholder="#1275E2"
                        maxLength={7}
                        className="flex-1 px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm font-mono text-brand outline-none focus:border-brand-blue transition-colors"
                      />
                    </div>
                  </div>

                  {/* Logo upload */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Platform Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-blue/40 hover:bg-blue-50/30 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-xs font-semibold text-slate-500">Click to upload SVG or PNG</p>
                      <p className="text-[11px] text-slate-400">Recommended: 200 × 50 px</p>
                    </div>
                  </div>

                  {/* Nav style */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Navigation Style
                    </label>
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                      {(["side", "top"] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setDraft((d) => ({ ...d, nav_style: style }))}
                          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                            draft.nav_style === style ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-gray-50"
                          }`}
                        >
                          {style === "side" ? "Side Nav" : "Top Nav"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <SaveBar dirty={dirtyGeneral} saving={saving} onDiscard={discard} onSave={saveGeneral} label="Save General" />
            </div>
          )}

          {/* ─ Compliance ──────────────────────────────────────────────────── */}
          {activeTab === "compliance" && (
            <div className="space-y-4" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-brand">Global Compliance Rules</h2>
                    <p className="text-xs text-slate-400">Platform-wide enforcement applied to all new applications.</p>
                  </div>
                </div>

                <SettingRow
                  iconBg="bg-red-50"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                  title="Mandatory DBS for Healthcare"
                  description="Require criminal background checks for all medical roles."
                  action={<Toggle on={draft.dbs_rule} onChange={() => setDraft((d) => ({ ...d, dbs_rule: !d.dbs_rule }))} disabled={saving} />}
                />
                <SettingRow
                  iconBg="bg-purple-50"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>}
                  title="GDPR Right to be Forgotten"
                  description="Automated data deletion request handling for EU candidates."
                  action={<Toggle on={draft.gdpr_rule} onChange={() => setDraft((d) => ({ ...d, gdpr_rule: !d.gdpr_rule }))} disabled={saving} />}
                />
                <SettingRow
                  iconBg="bg-amber-50"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
                  title="Right to Work Verification"
                  description="Require visa documentation for non-resident applicants."
                  action={<Toggle on={draft.rtw_rule} onChange={() => setDraft((d) => ({ ...d, rtw_rule: !d.rtw_rule }))} disabled={saving} />}
                />

                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-xs text-brand-blue leading-relaxed">
                    Compliance rules are enforced platform-wide. Changes take effect immediately after saving and apply to all new job applications and candidate onboarding.
                  </p>
                </div>
              </div>

              <SaveBar dirty={dirtyCompliance} saving={saving} onDiscard={discard} onSave={saveCompliance} label="Save Compliance" />
            </div>
          )}

          {/* ─ Security ────────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="space-y-4" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-brand">Security Settings</h2>
                    <p className="text-xs text-slate-400">Authentication and session controls for the admin portal.</p>
                  </div>
                </div>

                <SettingRow
                  iconBg={draft.two_factor ? "bg-brand-blue/10" : "bg-red-50"}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={draft.two_factor ? "text-brand-blue" : "text-red-500"}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  }
                  title="Two-Factor Authentication"
                  description="Require MFA for all administrative users. Strongly recommended."
                  action={<Toggle on={draft.two_factor} onChange={() => setDraft((d) => ({ ...d, two_factor: !d.two_factor }))} disabled={saving} />}
                />

                {!draft.two_factor && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-xs text-red-600 font-medium leading-relaxed">
                      Disabling MFA significantly increases the risk of unauthorised access. Not recommended for production environments.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Session Timeout</label>
                    <select
                      value={draft.session_timeout}
                      onChange={(e) => setDraft((d) => ({ ...d, session_timeout: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors cursor-pointer"
                    >
                      {["30 Minutes", "1 Hour", "4 Hours", "8 Hours", "24 Hours"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Password Rotation</label>
                    <select
                      value={draft.password_rotation}
                      onChange={(e) => setDraft((d) => ({ ...d, password_rotation: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors cursor-pointer"
                    >
                      {["30 Days", "60 Days", "90 Days", "180 Days", "Never"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <SaveBar dirty={dirtySecurity} saving={saving} onDiscard={discard} onSave={saveSecurity} label="Save Security" />
            </div>
          )}

          {/* ─ Integrations ────────────────────────────────────────────────── */}
          {activeTab === "integrations" && (
            <div className="space-y-4" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-brand">API Integrations</h2>
                      <p className="text-xs text-slate-400">Connect third-party services to the platform.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast("OAuth connector coming soon", "info")}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Connect New App
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <IntegCard name="Slack Notifications" status="connected" iconBg="bg-[#4A154B]/10"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-[#4A154B]"><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304-.002a3.75 3.75 0 010 5.304m-7.425 2.122a6.75 6.75 0 010-9.546m9.546-.001a6.75 6.75 0 010 9.547m-11.667 2.12a10.5 10.5 0 010-13.786m13.788.001a10.5 10.5 0 010 13.785" /></svg>}
                    onConfigure={() => toast("Slack configuration — coming soon", "info")}
                    onConnect={() => toast("Slack OAuth — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect Slack?", "info")}
                  />
                  <IntegCard name="SendGrid Email" status="connected" iconBg="bg-blue-50"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                    onConfigure={() => toast("SendGrid configuration — coming soon", "info")}
                    onConnect={() => toast("SendGrid OAuth — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect SendGrid?", "info")}
                  />
                  <IntegCard name="AWS S3 Storage" status="pending" iconBg="bg-orange-50"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>}
                    onConfigure={() => toast("S3 setup — coming soon", "info")}
                    onConnect={() => toast("S3 setup — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect S3?", "info")}
                  />
                  <IntegCard name="Stripe Billing" status="disconnected" iconBg="bg-violet-50"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-violet-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>}
                    onConfigure={() => toast("Stripe — coming soon", "info")}
                    onConnect={() => toast("Stripe OAuth — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect Stripe?", "info")}
                  />
                  <IntegCard name="Google Analytics" status="disconnected" iconBg="bg-yellow-50"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
                    onConfigure={() => toast("Analytics — coming soon", "info")}
                    onConnect={() => toast("Analytics OAuth — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect Analytics?", "info")}
                  />
                  <IntegCard name="Twilio SMS" status="disconnected" iconBg="bg-red-50"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>}
                    onConfigure={() => toast("Twilio — coming soon", "info")}
                    onConnect={() => toast("Twilio setup — coming soon", "info")}
                    onDisconnect={() => toast("Disconnect Twilio?", "info")}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
