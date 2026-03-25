"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1 — Account
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 — Company
  companyName: string;
  crn: string;
  registeredAddress: string;
  incorporationDate: string;
  companyStatus: string;
  // Step 3 — Profile
  firstName: string;
  lastName: string;
  jobTitle: string;
  vatNumber: string;
  // Step 4 — Industry
  industries: string[];
  cqcProviderId: string;
  dbsLevel: string;
  modernSlaveryAct: boolean;
  employerLiabilityInsurance: boolean;
  // Step 5 — Legal & Billing
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  checkEmployerLiability: boolean;
  checkRiskAssessment: boolean;
  checkBusinessCredit: boolean;
  checkGdpr: boolean;
  checkTerms: boolean;
};

const INITIAL: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  crn: "",
  registeredAddress: "",
  incorporationDate: "",
  companyStatus: "",
  firstName: "",
  lastName: "",
  jobTitle: "",
  vatNumber: "",
  industries: [],
  cqcProviderId: "",
  dbsLevel: "",
  modernSlaveryAct: false,
  employerLiabilityInsurance: false,
  billingName: "",
  billingEmail: "",
  billingAddress: "",
  checkEmployerLiability: false,
  checkRiskAssessment: false,
  checkBusinessCredit: false,
  checkGdpr: false,
  checkTerms: false,
};


const COMPANY_STATUSES = [
  "Active",
  "Dormant",
  "In Administration",
  "Dissolved",
];


const DBS_LEVELS = [
  "Basic",
  "Standard",
  "Enhanced",
  "Enhanced with Barred Lists",
];

const INDUSTRIES = [
  {
    id: "Healthcare",
    description: "Nurses, HCAs, Allied Health",
    image: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "Hospitality",
    description: "Chefs, FOH, Hotel & Events",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "Customer Care",
    description: "Contact Centre, CX & Support",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "Tech & Data",
    description: "Engineers, Analysts & SMEs",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
  },
];

const STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Company" },
  { number: 3, label: "Profile" },
  { number: 4, label: "Industry" },
  { number: 5, label: "Legal" },
  { number: 6, label: "Review" },
];

// ─── Field helpers ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
      {children}
    </label>
  );
}

function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white appearance-none"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-border last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs text-brand font-medium text-right max-w-[60%]">
        {value || <span className="text-slate-300 italic">—</span>}
      </span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EmployerRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof FormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  function next() {
    setStep((s) => Math.min(s + 1, 6));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 6) {
      next();
    } else {
      setSubmitted(true);
    }
  }

  // ── Progress bar ──────────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.number} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.number
                  ? "bg-brand-blue text-white"
                  : step === s.number
                  ? "bg-brand text-white"
                  : "bg-gray-border text-slate-400"
              }`}
            >
              {step > s.number ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                s.number
              )}
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider ${
                step >= s.number ? "text-brand" : "text-slate-300"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 mb-4 transition-colors ${
                step > s.number ? "bg-brand-blue" : "bg-gray-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ── Success screen ─────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-soft px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-brand font-black text-3xl mb-3">Application received</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            We&apos;re verifying <strong>{form.companyName}</strong>. You&apos;ll hear
            from us at <strong>{form.email}</strong> within 1–2 business days once
            your account is approved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold rounded-full px-8 py-3 hover:bg-brand-blue transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left: Form panel ── */}
      <div className="flex-1 overflow-y-auto flex flex-col px-8 py-12 bg-white lg:max-w-[55%]">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
            <span className="text-brand font-bold text-base tracking-tight leading-none">
              Edge<span className="text-brand-blue">Harbour</span>
            </span>
          </Link>

          {/* Heading — changes per step */}
          <div className="mb-8">
            {step === 1 && (
              <>
                <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
                  ELEVATE YOUR{" "}
                  <span className="text-brand-blue">HIRING</span> GAME.
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Register your UK entity to access Edge Harbour&apos;s elite
                  recruitment ecosystem.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
                  Step 02 — Business Creation
                </span>
                <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
                  LET&apos;S BUILD YOUR{" "}
                  <span className="text-brand-blue">PROFILE</span>
                  <br />AND YOUR{" "}
                  <span className="text-brand-blue">BUSINESS</span>
                </h1>
              </>
            )}
            {step === 3 && (
              <>
                <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
                  Step 03 — Profile Creation
                </span>
                <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
                  LET&apos;S BUILD YOUR{" "}
                  <span className="text-brand-blue">PROFILE</span>
                  <br />AND YOUR{" "}
                  <span className="text-brand-blue">BUSINESS</span>
                </h1>
              </>
            )}
            {step === 4 && (
              <>
                <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
                  Step 04 — Choose an Industry
                </span>
                <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
                  SELECT YOUR{" "}
                  <span className="text-brand-blue">INDUSTRY</span>
                </h1>
                <p className="text-slate-500 text-sm">
                  Select all that apply — compliance requirements will load automatically.
                </p>
              </>
            )}
            {step === 5 && (
              <>
                <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">
                  Step 05 — Legal &amp; Agreements
                </span>
                <h1 className="text-brand font-black text-4xl leading-tight tracking-tight mb-2">
                  BILLING INFORMATION &amp;{" "}
                  <span className="text-brand-blue">TERMS OF ENGAGEMENT</span>
                </h1>
              </>
            )}
            {step === 6 && (
              <>
                <h1 className="text-brand font-black text-3xl tracking-tight mb-2">
                  Review &amp; Submit
                </h1>
                <p className="text-slate-500 text-sm">
                  Confirm everything looks right before we create your account.
                </p>
              </>
            )}
          </div>

          {/* Step indicator */}
          <StepIndicator />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <>
                <div>
                  <Label>Work Email Address</Label>
                  <Input
                    type="email"
                    placeholder="name@companyemail.co.uk"
                    value={form.email}
                    onChange={set("email")}
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set("password")(e.target.value)}
                      required
                      minLength={8}
                      className="w-full border border-gray-border rounded-xl px-4 py-3 pr-12 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    required
                  />
                </div>
              </>
            )}

            {/* ── Step 2: Company ── */}
            {step === 2 && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Name of your Company"
                    value={form.companyName}
                    onChange={set("companyName")}
                    required
                  />
                </div>
                <div>
                  <Label>Company Registration Number</Label>
                  <Input
                    placeholder="e.g. 12345678"
                    value={form.crn}
                    onChange={set("crn")}
                    required
                  />
                </div>
                <div>
                  <Label>Registered Address</Label>
                  <Input
                    placeholder="Address of the Company"
                    value={form.registeredAddress}
                    onChange={set("registeredAddress")}
                    required
                  />
                </div>
                <div>
                  <Label>Incorporation Date</Label>
                  <Input
                    type="date"
                    placeholder="Date of incorporation"
                    value={form.incorporationDate}
                    onChange={set("incorporationDate")}
                    required
                  />
                </div>
                <div>
                  <Label>Company Status</Label>
                  <Select
                    value={form.companyStatus}
                    onChange={set("companyStatus")}
                    options={COMPANY_STATUSES}
                    placeholder="Select"
                  />
                </div>
              </>
            )}

            {/* ── Step 3: Profile ── */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={set("firstName")}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={set("lastName")}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Job Title</Label>
                  <Input
                    placeholder="Position at the company"
                    value={form.jobTitle}
                    onChange={set("jobTitle")}
                    required
                  />
                </div>
                <div>
                  <Label>Company VAT Number</Label>
                  <Input
                    placeholder="e.g. GB123456789"
                    value={form.vatNumber}
                    onChange={set("vatNumber")}
                  />
                </div>
              </>
            )}

            {/* ── Step 4: Industry ── */}
            {step === 4 && (
              <>
                {/* Industry panels */}
                <div className="grid grid-cols-2 gap-3" style={{ height: "260px" }}>
                  {INDUSTRIES.map((ind) => {
                    const selected = (form.industries ?? []).includes(ind.id);
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            industries: selected
                              ? (prev.industries ?? []).filter((i) => i !== ind.id)
                              : [...(prev.industries ?? []), ind.id],
                          }))
                        }
                        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                          selected
                            ? "ring-2 ring-brand-blue ring-offset-2 shadow-lg"
                            : "hover:shadow-md"
                        }`}
                      >
                        {/* Background image */}
                        <Image
                          src={ind.image}
                          alt={ind.id}
                          fill
                          sizes="25vw"
                          className={`object-cover transition-transform duration-700 ${selected ? "scale-105" : "group-hover:scale-105"}`}
                        />
                        {/* Dark overlay — lighter when selected */}
                        <div className={`absolute inset-0 transition-colors duration-300 ${selected ? "bg-navy/40" : "bg-navy/65 group-hover:bg-navy/50"}`} />
                        {/* Bottom gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />

                        {/* Selected badge */}
                        {selected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-blue shadow-md flex items-center justify-center">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                        )}

                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-black text-sm uppercase tracking-wide leading-tight">
                            {ind.id}
                          </p>
                          <p className="text-white/60 text-[10px] mt-0.5 leading-snug group-hover:text-white/80 transition-colors">
                            {ind.description}
                          </p>
                          <div className={`mt-2 h-0.5 bg-brand-blue transition-all duration-300 ${selected ? "w-8" : "w-0 group-hover:w-5"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Healthcare compliance fields */}
                {(form.industries ?? []).includes("Healthcare") && (
                  <div className="mt-4 p-4 rounded-2xl border border-teal-100 bg-teal-50 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                      Healthcare Compliance
                    </p>
                    <div>
                      <Label>CQC Provider ID</Label>
                      <Input
                        placeholder="e.g. 1-123456789"
                        value={form.cqcProviderId}
                        onChange={set("cqcProviderId")}
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                        Your Care Quality Commission registration number. Confirms you are a legally registered care provider in the UK.
                      </p>
                    </div>
                    <div>
                      <Label>Minimum DBS Level Required</Label>
                      <Select
                        value={form.dbsLevel}
                        onChange={set("dbsLevel")}
                        options={DBS_LEVELS}
                        placeholder="Select DBS level"
                      />
                    </div>
                  </div>
                )}

                {/* Hospitality compliance fields */}
                {(form.industries ?? []).includes("Hospitality") && (
                  <div className="mt-4 p-4 rounded-2xl border border-amber-100 bg-amber-50 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                      Hospitality Compliance
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.modernSlaveryAct}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, modernSlaveryAct: e.target.checked }))
                        }
                        className="mt-0.5 w-4 h-4 rounded border-gray-border accent-brand-blue shrink-0"
                      />
                      <span className="text-xs text-brand leading-relaxed">
                        <span className="font-semibold">UK Modern Slavery Act compliance</span>
                        <span className="text-slate-400 block mt-0.5">
                          I confirm this organisation complies with the Modern Slavery Act 2015, including publishing an annual transparency statement where required.
                        </span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.employerLiabilityInsurance}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, employerLiabilityInsurance: e.target.checked }))
                        }
                        className="mt-0.5 w-4 h-4 rounded border-gray-border accent-brand-blue shrink-0"
                      />
                      <span className="text-xs text-brand leading-relaxed">
                        <span className="font-semibold">Employer&apos;s Liability Insurance</span>
                        <span className="text-slate-400 block mt-0.5">
                          I confirm this organisation holds valid Employer&apos;s Liability Insurance as required by UK law.
                        </span>
                      </span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* ── Step 5: Legal & Billing ── */}
            {step === 5 && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={form.billingName}
                      onChange={set("billingName")}
                      required
                    />
                  </div>
                  <div>
                    <Label>Billing Email</Label>
                    <Input
                      type="email"
                      placeholder="name@company.co.uk"
                      value={form.billingEmail}
                      onChange={set("billingEmail")}
                      required
                    />
                  </div>
                  <div>
                    <Label>Billing Address</Label>
                    <Input
                      placeholder="Company Avenue"
                      value={form.billingAddress}
                      onChange={set("billingAddress")}
                      required
                    />
                  </div>
                </div>

                {/* Agreements */}
                <div className="mt-5 space-y-3">
                  {[
                    { field: "checkEmployerLiability" as const, label: "Employer's Liability Insurance", description: "Confirm your organisation holds valid Employer's Liability Insurance as required by UK law." },
                    { field: "checkRiskAssessment"    as const, label: "Risk Assessment Check",          description: "Confirm you conduct regular workplace risk assessments in line with Health & Safety regulations." },
                    { field: "checkBusinessCredit"    as const, label: "Business Credit Check",          description: "Consent to Edge Harbour performing a business credit check as part of onboarding." },
                    { field: "checkGdpr"              as const, label: "GDPR & Data Processing Agreement", description: "Agree to our Data Processing Agreement in compliance with UK GDPR." },
                    { field: "checkTerms"             as const, label: "Terms & Privacy Policy",         description: "By clicking this you have accepted the Terms of Service of Edge Harbour and our Privacy Policy.", required: true },
                  ].map(({ field, label, description, required }) => (
                    <label key={field} className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={!!form[field]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.checked }))}
                          required={required}
                          className="w-4 h-4 rounded border-gray-border accent-brand-blue"
                        />
                      </div>
                      <span className="text-xs text-brand leading-relaxed">
                        <span className="font-semibold">{label}</span>
                        {required && <span className="text-brand-blue ml-1 text-[10px] font-bold">*</span>}
                        <span className="text-slate-400 block mt-0.5">{description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 6: Review ── */}
            {step === 6 && (
              <div className="bg-gray-soft rounded-2xl p-5 space-y-0 divide-y-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Account
                </p>
                <ReviewRow label="Email" value={form.email} />

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-3">
                  Company
                </p>
                <ReviewRow label="Company" value={form.companyName} />
                <ReviewRow label="CRN" value={form.crn} />
                <ReviewRow label="Address" value={form.registeredAddress} />
                <ReviewRow label="Incorporated" value={form.incorporationDate} />
                <ReviewRow label="Status" value={form.companyStatus} />

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-3">
                  Profile
                </p>
                <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="Job Title" value={form.jobTitle} />
                <ReviewRow label="VAT Number" value={form.vatNumber} />

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-3">
                  Industry
                </p>
                <ReviewRow label="Sectors" value={(form.industries ?? []).join(", ")} />
                {(form.industries ?? []).includes("Healthcare") && (
                  <>
                    <ReviewRow label="CQC Provider ID" value={form.cqcProviderId} />
                    <ReviewRow label="Min. DBS Level" value={form.dbsLevel} />
                  </>
                )}
                {(form.industries ?? []).includes("Hospitality") && (
                  <>
                    <ReviewRow label="Modern Slavery Act" value={form.modernSlaveryAct ? "Confirmed" : "Not confirmed"} />
                    <ReviewRow label="Employer Liability Ins." value={form.employerLiabilityInsurance ? "Confirmed" : "Not confirmed"} />
                  </>
                )}

                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-5 mb-3">
                  Billing &amp; Legal
                </p>
                <ReviewRow label="Billing Name" value={form.billingName} />
                <ReviewRow label="Billing Email" value={form.billingEmail} />
                <ReviewRow label="Billing Address" value={form.billingAddress} />
                <ReviewRow label="Employer Liability" value={form.checkEmployerLiability ? "Confirmed" : "—"} />
                <ReviewRow label="Risk Assessment" value={form.checkRiskAssessment ? "Confirmed" : "—"} />
                <ReviewRow label="Business Credit" value={form.checkBusinessCredit ? "Confirmed" : "—"} />
                <ReviewRow label="GDPR Agreement" value={form.checkGdpr ? "Confirmed" : "—"} />
                <ReviewRow label="Terms Accepted" value={form.checkTerms ? "Yes" : "No"} />
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className={`flex gap-3 pt-2 ${step > 1 ? "flex-row" : "flex-col"}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="flex-1 border border-gray-border text-brand text-sm font-semibold rounded-full py-3 hover:border-brand hover:bg-gray-soft transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-brand-blue text-white text-sm font-bold rounded-full py-3 hover:bg-brand-blue-dark transition-colors tracking-wide uppercase"
              >
                {step === 6 ? "Submit Application" : step === 1 ? "Get Started" : "Continue"}
              </button>
            </div>
          </form>

          {/* Legal note */}
          <p className="text-[11px] text-slate-400 mt-6 leading-relaxed">
            By continuing, you agree to Edge Harbour&apos;s{" "}
            <Link href="/legal/terms" className="underline hover:text-brand-blue">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline hover:text-brand-blue">
              Privacy Policy
            </Link>
            .<br />
            Member of the UK Recruitment &amp; Employment Confederation (REC).
          </p>

          {/* Social proof strip */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center gap-4">
            {/* Overlapping avatars */}
            <div className="flex items-center -space-x-2.5 shrink-0">
              {[
                { initials: "JM", color: "bg-indigo-400" },
                { initials: "SR", color: "bg-sky-500" },
                { initials: "TC", color: "bg-brand-blue" },
                { initials: "AK", color: "bg-violet-400" },
                { initials: "PL", color: "bg-blue-400" },
              ].map((a) => (
                <div
                  key={a.initials}
                  className={`w-8 h-8 rounded-full ${a.color} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {a.initials}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-[9px] font-bold">
                200+
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-brand text-xs font-semibold leading-snug">
                Join 200+ UK employers
              </p>
              <p className="text-slate-400 text-[11px] leading-snug mt-0.5">
                already hiring smarter with Edge Harbour
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Branded panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-navy">
        {/* Keyframe animations */}
        <style>{`
          @keyframes orb-a {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(50px, -70px) scale(1.12); }
            66%       { transform: translate(-35px, 45px) scale(0.94); }
          }
          @keyframes orb-b {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(-55px, 35px) scale(1.08); }
            66%       { transform: translate(45px, -50px) scale(1.15); }
          }
          @keyframes orb-c {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(30px, 60px) scale(1.1); }
          }
          @keyframes panel-fade-up {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ticker-scroll {
            0%   { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.3; transform: scale(0.7); }
          }
        `}</style>

        {/* Orb A — top-right blue */}
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-blue/30 blur-[100px]"
          style={{ animation: "orb-a 14s ease-in-out infinite" }}
        />
        {/* Orb B — centre-left indigo */}
        <div
          className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-indigo-500/20 blur-[90px]"
          style={{ animation: "orb-b 18s ease-in-out infinite" }}
        />
        {/* Orb C — bottom-right sky */}
        <div
          className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] rounded-full bg-sky-500/20 blur-[80px]"
          style={{ animation: "orb-c 10s ease-in-out infinite" }}
        />

        {/* Dot-grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top-right: sign-in pill */}
        <div className="relative flex justify-end p-8">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <span className="text-white/50 text-xs">Already a partner?</span>
            <Link
              href="/login"
              className="text-white text-xs font-bold tracking-wider uppercase hover:text-brand-blue transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 gap-8">

          {/* Headline */}
          <div style={{ animation: "panel-fade-up 0.7s ease 0.1s both" }}>
            <p className="text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Edge Harbour Intelligence
            </p>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-[1.05] tracking-tight">
              YOUR NEXT<br />
              GREAT HIRE<br />
              IS ALREADY<br />
              <span className="text-brand-blue">VERIFIED.</span>
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Every candidate on Edge Harbour is pre-screened, compliance-ready,
              and waiting for you.
            </p>
          </div>

          {/* Live ticker */}
          <div
            className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: "panel-fade-up 0.7s ease 0.25s both" }}
          >
            {/* Ticker header — stays fixed */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }}
              />
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">
                Live Verification Feed
              </span>
            </div>

            {/* Scrolling rows — doubled for seamless loop */}
            <div className="overflow-hidden" style={{ height: "152px" }}>
            <div
              className="flex flex-col"
              style={{ animation: "ticker-scroll 10s linear infinite" }}
            >
              {[
                { initials: "SR", color: "bg-indigo-400", name: "Sarah R.", role: "ICU Nurse · Healthcare", badge: "RTW Verified", badgeColor: "text-green-400", badgeBg: "bg-green-500/15 border-green-400/25" },
                { initials: "TC", color: "bg-sky-500",    name: "Tom C.",   role: "Head Chef · Hospitality",  badge: "DBS Checked",   badgeColor: "text-sky-300",   badgeBg: "bg-sky-500/15 border-sky-300/25" },
                { initials: "AK", color: "bg-violet-400", name: "Aisha K.", role: "Data Analyst · Tech",      badge: "Refs Verified", badgeColor: "text-violet-300", badgeBg: "bg-violet-500/15 border-violet-300/25" },
                { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre", badge: "RTW Verified", badgeColor: "text-green-400", badgeBg: "bg-green-500/15 border-green-400/25" },
                // duplicate for seamless loop
                { initials: "SR", color: "bg-indigo-400", name: "Sarah R.", role: "ICU Nurse · Healthcare", badge: "RTW Verified", badgeColor: "text-green-400", badgeBg: "bg-green-500/15 border-green-400/25" },
                { initials: "TC", color: "bg-sky-500",    name: "Tom C.",   role: "Head Chef · Hospitality",  badge: "DBS Checked",   badgeColor: "text-sky-300",   badgeBg: "bg-sky-500/15 border-sky-300/25" },
                { initials: "AK", color: "bg-violet-400", name: "Aisha K.", role: "Data Analyst · Tech",      badge: "Refs Verified", badgeColor: "text-violet-300", badgeBg: "bg-violet-500/15 border-violet-300/25" },
                { initials: "ML", color: "bg-blue-400",   name: "Marcus L.", role: "CX Lead · Contact Centre", badge: "RTW Verified", badgeColor: "text-green-400", badgeBg: "bg-green-500/15 border-green-400/25" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0"
                >
                  <div className={`w-7 h-7 rounded-lg ${c.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                    <p className="text-white/40 text-[10px] truncate">{c.role}</p>
                  </div>
                  <div className={`flex items-center gap-1 border rounded-full px-2 py-0.5 shrink-0 ${c.badgeBg}`}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={c.badgeColor}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={`text-[9px] font-semibold ${c.badgeColor}`}>{c.badge}</span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>

          {/* Stat pills */}
          <div
            className="grid grid-cols-3 gap-2"
            style={{ animation: "panel-fade-up 0.7s ease 0.4s both" }}
          >
            {[
              { value: "200+", label: "UK Employers" },
              { value: "65%",  label: "Faster Hire" },
              { value: "100%", label: "RTW Pass Rate" },
            ].map((s) => (
              <div
                key={s.value}
                className="bg-white/6 border border-white/10 rounded-xl py-3.5 text-center"
              >
                <p className="text-white font-black text-xl leading-none">{s.value}</p>
                <p className="text-white/35 text-[9px] font-semibold uppercase tracking-wider mt-1.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative p-8">
          <p className="text-white/15 text-[10px] uppercase tracking-widest text-center">
            &copy; 2026 Edge Harbour Recruitment Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
