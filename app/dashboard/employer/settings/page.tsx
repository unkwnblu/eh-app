"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

type TabKey = "account" | "business";

const INDUSTRIES = ["Healthcare", "Hospitality", "Customer Care", "Tech & Data"];

const DBS_LEVELS = [
  "Basic",
  "Standard",
  "Enhanced",
  "Enhanced with Barred Lists",
];

// ─── ReadOnlyField ─────────────────────────────────────────────────────────────

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </label>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Locked
        </span>
      </div>
      <div className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-[#F7F8FA] text-slate-500 select-all">
        {value || <span className="text-slate-300 italic">Not set</span>}
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder, disabled = false, hint, error,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; hint?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
          error
            ? "border-red-300 bg-red-50 text-brand focus:border-red-400"
            : disabled
            ? "bg-[#F7F8FA] border-gray-100 text-slate-400 cursor-not-allowed"
            : "border-gray-200 text-brand focus:border-brand-blue bg-white"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────────

function Select({
  label, value, onChange, options, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors appearance-none bg-white ${
          error
            ? "border-red-300 bg-red-50 text-brand focus:border-red-400"
            : "border-gray-200 text-brand focus:border-brand-blue"
        }`}
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

function Section({
  icon, title, description, children, onSave, saving, saveDisabled, noSaveButton,
}: {
  icon: React.ReactNode; title: string; description: string;
  children: React.ReactNode; onSave?: () => void; saving?: boolean;
  saveDisabled?: boolean; noSaveButton?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        {!noSaveButton && onSave && (
          <button
            onClick={onSave}
            disabled={saving || saveDisabled}
            className="px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>
      <div className="pt-5 border-t border-gray-100">
        {children}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  useEffect(() => { document.title = "Settings | Edge Harbour"; }, []);

  const { toast } = useToast();
  const [tab, setTab]         = useState<TabKey>("account");
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount]   = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Account fields
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [jobTitle,   setJobTitle]   = useState("");
  const [phone,      setPhone]      = useState("");

  // Locked business fields (display only)
  const [companyName,       setCompanyName]       = useState("");
  const [crn,               setCrn]               = useState("");
  const [vatNumber,         setVatNumber]         = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");

  // Editable business fields
  const [companyPhone,   setCompanyPhone]   = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industries,     setIndustries]     = useState<string[]>([]);

  // Compliance fields
  const [cqcProviderId,              setCqcProviderId]              = useState("");
  const [dbsLevel,                   setDbsLevel]                   = useState("");
  const [modernSlaveryAct,           setModernSlaveryAct]           = useState(false);
  const [employerLiabilityInsurance, setEmployerLiabilityInsurance] = useState(false);
  const [healthcareComplianceStatus, setHealthcareComplianceStatus] = useState<"not_submitted" | "pending" | "verified" | "rejected">("not_submitted");

  const [compErrors, setCompErrors] = useState<Record<string, string>>({});

  // Logo state
  const [logoUrl,        setLogoUrl]        = useState<string | null>(null);
  const [logoUploading,  setLogoUploading]  = useState(false);
  const [logoProgress,   setLogoProgress]   = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, logoRes] = await Promise.all([
        fetch("/api/employer/settings"),
        fetch("/api/employer/logo"),
      ]);
      const data    = await settingsRes.json();
      const logoData = logoRes.ok ? await logoRes.json() : null;

      if (!settingsRes.ok) throw new Error(data.error);
      const e = data.employer;
      setFirstName(e.first_name  ?? "");
      setLastName(e.last_name    ?? "");
      setEmail(e.email           ?? "");
      setJobTitle(e.job_title    ?? "");
      setPhone(e.phone           ?? "");
      setCompanyName(e.company_name        ?? "");
      setCrn(e.crn                         ?? "");
      setCompanyPhone(e.company_phone      ?? "");
      setCompanyWebsite(e.company_website  ?? "");
      setRegisteredAddress(e.registered_address ?? "");
      setVatNumber(e.vat_number  ?? "");
      setIndustries(e.industries ?? []);
      setCqcProviderId(e.cqc_provider_id ?? "");
      setDbsLevel(e.dbs_level ?? "");
      setModernSlaveryAct(e.modern_slavery_act ?? false);
      setEmployerLiabilityInsurance(e.employer_liability_insurance ?? false);
      setHealthcareComplianceStatus(e.healthcare_compliance_status ?? "not_submitted");

      if (logoData?.url) setLogoUrl(logoData.url);
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // ── Logo upload ────────────────────────────────────────────────────────────
  async function handleLogoUpload(file: File) {
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`Logo must be under ${MAX_MB} MB`, "error");
      return;
    }

    setLogoUploading(true);
    setLogoProgress(0);

    // Fake progress ticking to 85 % while the request is in-flight
    const interval = setInterval(() => {
      setLogoProgress((p) => (p < 85 ? p + 5 : p));
    }, 80);

    try {
      const form = new FormData();
      form.append("file", file);

      const res  = await fetch("/api/employer/logo", { method: "POST", body: form });
      const data = await res.json() as { success?: boolean; url?: string; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      clearInterval(interval);
      setLogoProgress(100);
      setLogoUrl(data.url ?? null);
      toast("Logo updated successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      clearInterval(interval);
      setTimeout(() => { setLogoUploading(false); setLogoProgress(0); }, 600);
    }
  }

  async function removeLogo() {
    try {
      const res = await fetch("/api/employer/logo", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLogoUrl(null);
      toast("Logo removed", "success");
    } catch {
      toast("Failed to remove logo", "error");
    }
  }

  // ── Compliance validation ──────────────────────────────────────────────────
  const needsHealthcare  = industries.includes("Healthcare");
  const needsHospitality = industries.includes("Hospitality");

  const complianceValid = useMemo(() => {
    if (needsHealthcare  && (!cqcProviderId.trim() || !dbsLevel)) return false;
    if (needsHospitality && (!modernSlaveryAct || !employerLiabilityInsurance)) return false;
    return true;
  }, [needsHealthcare, needsHospitality, cqcProviderId, dbsLevel, modernSlaveryAct, employerLiabilityInsurance]);

  function validateCompliance(): boolean {
    const errs: Record<string, string> = {};
    if (needsHealthcare) {
      if (!cqcProviderId.trim()) errs.cqcProviderId = "CQC Provider ID is required for Healthcare.";
      if (!dbsLevel)             errs.dbsLevel      = "Minimum DBS level is required for Healthcare.";
    }
    if (needsHospitality) {
      if (!modernSlaveryAct)           errs.modernSlaveryAct           = "You must confirm Modern Slavery Act compliance.";
      if (!employerLiabilityInsurance) errs.employerLiabilityInsurance = "You must confirm Employer Liability Insurance.";
    }
    setCompErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function toggleIndustry(ind: string) {
    setCompErrors({});
    setIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  }

  async function saveAccount() {
    setSavingAccount(true);
    try {
      const res = await fetch("/api/employer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "account", firstName, lastName, jobTitle, phone }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Account details saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSavingAccount(false);
    }
  }

  async function saveBusiness() {
    if (!validateCompliance()) {
      toast("Please complete the required compliance fields.", "error");
      return;
    }
    setSavingBusiness(true);
    try {
      const res = await fetch("/api/employer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "business",
          companyPhone, companyWebsite,
          industries, cqcProviderId, dbsLevel,
          modernSlaveryAct, employerLiabilityInsurance,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      if (industries.includes("Healthcare")) {
        setHealthcareComplianceStatus((prev) => prev === "verified" ? "verified" : "pending");
      } else {
        setHealthcareComplianceStatus("not_submitted");
      }
      toast("Business details saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSavingBusiness(false);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />

      {/* Header */}
      <div data-gsap="fade-down">
        <h1 className="text-[28px] font-black text-brand tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and company information.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200" role="tablist" data-gsap="fade-down">
        {(["account", "business"] as TabKey[]).map((t) => {
          const labels: Record<TabKey, string> = {
            account:  "Account Information",
            business: "Business Information",
          };
          return (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-1 pb-3 mr-6 text-sm font-semibold border-b-2 transition-all -mb-px ${
                tab === t
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4" data-gsap="fade-up">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-40" />
                  <div className="h-2.5 bg-slate-100 rounded w-56" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 pt-5 border-t border-gray-100">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Account Information ── */}
      {!loading && tab === "account" && (
        <div className="space-y-5" data-gsap="fade-up">
          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
            title="Personal Details"
            description="Your name, job title, and contact number."
            onSave={saveAccount}
            saving={savingAccount}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="First Name"  value={firstName}  onChange={setFirstName}  placeholder="e.g. Jane" />
              <Field label="Last Name"   value={lastName}   onChange={setLastName}   placeholder="e.g. Smith" />
              <Field label="Job Title"   value={jobTitle}   onChange={setJobTitle}   placeholder="e.g. HR Manager" />
              <Field label="Phone"       value={phone}      onChange={setPhone}      placeholder="+44 7700 900000" type="tel" />
            </div>
          </Section>

          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            }
            title="Login Email"
            description="The email address used to sign in to your account."
            onSave={() => toast("To change your email address, please contact support.", "info")}
            saving={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Email Address"
                value={email}
                type="email"
                disabled
                hint="Contact support to change your login email."
              />
            </div>
          </Section>
        </div>
      )}

      {/* ── Business Information ── */}
      {!loading && tab === "business" && (
        <div className="space-y-5" data-gsap="fade-up">

          {/* ── Company Logo ── */}
          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
            title="Company Logo"
            description="Displayed on your profile and visible to candidates."
            noSaveButton
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
                e.target.value = "";
              }}
            />

            <div className="flex items-center gap-6">
              {/* Preview */}
              <div className="w-20 h-20 rounded-2xl border border-gray-100 bg-[#F7F8FA] flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Company logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl font-black text-brand/40">
                    {companyName ? getInitials(companyName) : "?"}
                  </span>
                )}
              </div>

              {/* Controls + progress */}
              <div className="flex-1 min-w-0">
                {logoUploading ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">Uploading…</p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full transition-all duration-200"
                        style={{ width: `${logoProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{logoProgress}%</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-3">
                      JPG, PNG, WebP or SVG · Max 5 MB · Recommended 400 × 400 px
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                      >
                        {logoUrl ? "Replace Logo" : "Upload Logo"}
                      </button>
                      {logoUrl && (
                        <button
                          onClick={removeLogo}
                          className="px-4 py-2 bg-white border border-gray-200 text-xs font-semibold text-slate-500 rounded-xl hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Section>

          {/* ── Company Details (locked fields + editable phone/website) ── */}
          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
            title="Company Details"
            description="Phone and website can be updated. Registration details are locked."
            onSave={saveBusiness}
            saving={savingBusiness}
          >
            <div className="space-y-5">
              {/* Locked fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ReadOnlyField
                  label="Company Name"
                  value={companyName}
                  hint="Set at registration — contact support to change."
                />
                <ReadOnlyField
                  label="Company Registration Number (CRN)"
                  value={crn}
                  hint="Verified by Companies House."
                />
                <ReadOnlyField
                  label="VAT Number"
                  value={vatNumber}
                  hint="Contact support to update."
                />
                <ReadOnlyField
                  label="Registered Address"
                  value={registeredAddress}
                  hint="Contact support to update."
                />
              </div>

              {/* Editable fields */}
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Editable Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Company Phone" value={companyPhone} onChange={setCompanyPhone} placeholder="+44 20 0000 0000" type="tel" />
                  <Field label="Website"       value={companyWebsite} onChange={setCompanyWebsite} placeholder="https://yourcompany.co.uk" type="url" />
                </div>
              </div>
            </div>
          </Section>

          {/* ── Industries + compliance gates ── */}
          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            }
            title="Industries"
            description="The sectors your company operates in — used to match you with relevant candidates."
            onSave={saveBusiness}
            saving={savingBusiness}
            saveDisabled={!complianceValid || industries.length === 0}
          >
            {/* Sector pills */}
            <div className="flex flex-wrap gap-2.5">
              {INDUSTRIES.map((ind) => {
                const active  = industries.includes(ind);
                const hasGate = ind === "Healthcare" || ind === "Hospitality";
                return (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                      active
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-slate-500 border-gray-200 hover:border-brand-blue hover:text-brand-blue"
                    }`}
                  >
                    {ind}
                    {hasGate && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={active ? "text-white/70" : "text-slate-400"}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {industries.length === 0 && (
              <p className="text-xs text-amber-600 mt-3">Select at least one industry.</p>
            )}

            {/* ── Healthcare compliance gate ── */}
            {needsHealthcare && (
              <div className="mt-5 p-4 rounded-2xl border border-blue-100 bg-blue-50/60 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Healthcare Compliance
                  </p>
                  {healthcareComplianceStatus === "verified" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Verified
                    </span>
                  )}
                  {healthcareComplianceStatus === "pending" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Pending Verification
                    </span>
                  )}
                  {healthcareComplianceStatus === "rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Rejected — Update Required
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="CQC Provider ID *"
                    value={cqcProviderId}
                    onChange={(v) => { setCqcProviderId(v); setCompErrors((p) => ({ ...p, cqcProviderId: "" })); }}
                    placeholder="e.g. 1-123456789"
                    error={compErrors.cqcProviderId}
                  />
                  <Select
                    label="Minimum DBS Level Required *"
                    value={dbsLevel}
                    onChange={(v) => { setDbsLevel(v); setCompErrors((p) => ({ ...p, dbsLevel: "" })); }}
                    options={DBS_LEVELS}
                    placeholder="Select DBS level"
                    error={compErrors.dbsLevel}
                  />
                </div>
                {healthcareComplianceStatus === "pending" ? (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 mt-0.5 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Your healthcare compliance details have been submitted and are <strong>awaiting verification</strong> by the Edge Harbour team. You&apos;ll be notified once reviewed.
                    </p>
                  </div>
                ) : healthcareComplianceStatus === "rejected" ? (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mt-0.5 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Your submission was not accepted. Please update your CQC Provider ID or DBS level and save again. Contact <a href="mailto:support@edgeharbour.co.uk" className="font-bold underline">support@edgeharbour.co.uk</a> if you need help.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-brand-blue/70 leading-relaxed">
                    Required by the Care Quality Commission. Your CQC Provider ID is used to verify your registration and match you with appropriately checked candidates.
                  </p>
                )}
              </div>
            )}

            {/* ── Hospitality compliance gate ── */}
            {needsHospitality && (
              <div className="mt-5 p-4 rounded-2xl border border-amber-100 bg-amber-50 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Hospitality Compliance
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modernSlaveryAct}
                    onChange={(e) => { setModernSlaveryAct(e.target.checked); setCompErrors((p) => ({ ...p, modernSlaveryAct: "" })); }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-blue shrink-0"
                  />
                  <span className="text-xs text-brand leading-relaxed">
                    <span className="font-semibold">UK Modern Slavery Act compliance <span className="text-brand-blue">*</span></span>
                    <span className="text-slate-400 block mt-0.5">I confirm this organisation complies with the Modern Slavery Act 2015.</span>
                  </span>
                </label>
                {compErrors.modernSlaveryAct && <p className="text-xs text-red-500 -mt-1 pl-7">{compErrors.modernSlaveryAct}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employerLiabilityInsurance}
                    onChange={(e) => { setEmployerLiabilityInsurance(e.target.checked); setCompErrors((p) => ({ ...p, employerLiabilityInsurance: "" })); }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-blue shrink-0"
                  />
                  <span className="text-xs text-brand leading-relaxed">
                    <span className="font-semibold">Employer&apos;s Liability Insurance <span className="text-brand-blue">*</span></span>
                    <span className="text-slate-400 block mt-0.5">I confirm this organisation holds valid Employer&apos;s Liability Insurance as required by UK law.</span>
                  </span>
                </label>
                {compErrors.employerLiabilityInsurance && <p className="text-xs text-red-500 -mt-1 pl-7">{compErrors.employerLiabilityInsurance}</p>}
              </div>
            )}

            {(needsHealthcare || needsHospitality) && !complianceValid && (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Complete the required compliance fields above before saving.
              </p>
            )}
          </Section>
        </div>
      )}
    </main>
  );
}
