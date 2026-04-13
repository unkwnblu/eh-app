"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

type TabKey = "account" | "business";

const INDUSTRIES = ["Healthcare", "Hospitality", "Customer Care", "Tech & Data"];

// ─── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder, disabled = false, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; hint?: string;
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
          disabled
            ? "bg-[#F7F8FA] border-gray-100 text-slate-400 cursor-not-allowed"
            : "border-gray-200 text-brand focus:border-brand-blue bg-white"
        }`}
      />
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

function Section({
  icon, title, description, children, onSave, saving,
}: {
  icon: React.ReactNode; title: string; description: string;
  children: React.ReactNode; onSave: () => void; saving: boolean;
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
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
      <div className="pt-5 border-t border-gray-100">
        {children}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { toast } = useToast();
  const [tab, setTab]       = useState<TabKey>("account");
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount]   = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Account fields
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [jobTitle,   setJobTitle]   = useState("");
  const [phone,      setPhone]      = useState("");

  // Business fields
  const [companyName,       setCompanyName]       = useState("");
  const [companyPhone,      setCompanyPhone]      = useState("");
  const [companyWebsite,    setCompanyWebsite]    = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [vatNumber,         setVatNumber]         = useState("");
  const [industries,        setIndustries]        = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/employer/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const e = data.employer;
      setFirstName(e.first_name  ?? "");
      setLastName(e.last_name    ?? "");
      setEmail(e.email           ?? "");
      setJobTitle(e.job_title    ?? "");
      setPhone(e.phone           ?? "");
      setCompanyName(e.company_name        ?? "");
      setCompanyPhone(e.company_phone      ?? "");
      setCompanyWebsite(e.company_website  ?? "");
      setRegisteredAddress(e.registered_address ?? "");
      setVatNumber(e.vat_number  ?? "");
      setIndustries(e.industries ?? []);
    } catch {
      toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

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
    setSavingBusiness(true);
    try {
      const res = await fetch("/api/employer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "business", companyName, companyPhone, companyWebsite, registeredAddress, vatNumber, industries }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Business details saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSavingBusiness(false);
    }
  }

  function toggleIndustry(ind: string) {
    setIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
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
          <Section
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
            title="Company Details"
            description="Your company name, phone, website, and registered address."
            onSave={saveBusiness}
            saving={savingBusiness}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Company Name"        value={companyName}       onChange={setCompanyName}       placeholder="e.g. Acme Healthcare Ltd" />
              <Field label="Company Phone"       value={companyPhone}      onChange={setCompanyPhone}      placeholder="+44 20 0000 0000" type="tel" />
              <Field label="Website"             value={companyWebsite}    onChange={setCompanyWebsite}    placeholder="https://yourcompany.co.uk" type="url" />
              <Field label="VAT Number"          value={vatNumber}         onChange={setVatNumber}         placeholder="e.g. GB123456789" />
              <div className="md:col-span-2">
                <Field label="Registered Address" value={registeredAddress} onChange={setRegisteredAddress} placeholder="123 Business Road, London, EC1A 1BB" />
              </div>
            </div>
          </Section>

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
          >
            <div className="flex flex-wrap gap-2.5">
              {INDUSTRIES.map((ind) => {
                const active = industries.includes(ind);
                return (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                      active
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-slate-500 border-gray-200 hover:border-brand-blue hover:text-brand-blue"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
            {industries.length === 0 && (
              <p className="text-xs text-amber-600 mt-3">Select at least one industry.</p>
            )}
          </Section>
        </div>
      )}
    </main>
  );
}
