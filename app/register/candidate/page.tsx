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
  // Step 2 — Personal
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  // Step 3 — Right to Work
  documentType: string;
  documentNumber: string;
  documentExpiry: string;
  // Step 4 — Work Preferences
  sector: string;
  jobTypes: string[];
  locations: string[];
  // Step 5 — Documents
  cvFileName: string;
  dbsFileName: string;
  dbsLevel: string;
  // Consent
  checkPrivacy: boolean;
  checkTerms: boolean;
};

const INITIAL: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  documentType: "",
  documentNumber: "",
  documentExpiry: "",
  sector: "",
  jobTypes: [],
  locations: [],
  cvFileName: "",
  dbsFileName: "",
  dbsLevel: "",
  checkPrivacy: false,
  checkTerms: false,
};

const DOCUMENT_TYPES = [
  "UK Passport",
  "Non-UK Passport + Visa",
  "Biometric Residence Permit (BRP)",
  "UK Birth Certificate + NI Number",
  "Share Code (eVisa)",
];

const NATIONALITIES = [
  "British", "Irish", "EU / EEA", "Other",
];

const SECTORS = [
  { id: "Healthcare", description: "Nurses, HCAs, Allied Health" },
  { id: "Hospitality", description: "Chefs, FOH, Hotel & Events" },
  { id: "Customer Care", description: "Contact Centre, CX & Support" },
  { id: "Tech & Data", description: "Engineers, Analysts & SMEs" },
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];

const LOCATIONS = [
  "London", "Manchester", "Birmingham", "Leeds", "Bristol",
  "Edinburgh", "Cardiff", "Remote / Flexible",
];

const DBS_LEVELS = [
  "None",
  "Basic",
  "Standard",
  "Enhanced",
  "Enhanced with Barred Lists",
];

const STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Personal" },
  { number: 3, label: "RTW" },
  { number: 4, label: "Preferences" },
  { number: 5, label: "Documents" },
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

export default function CandidateRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof FormData) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  function toggleArray(field: "sectors" | "jobTypes" | "locations", val: string) {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      };
    });
  }

  function next() { setStep((s) => Math.min(s + 1, 6)); }
  function back() { setStep((s) => Math.max(s - 1, 1)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 6) {
      next();
    } else {
      setSubmitted(true);
    }
  }

  // ── Progress indicator ─────────────────────────────────────────────────────────
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

  // ── Success screen ──────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-soft px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-brand font-black text-3xl mb-3">Application submitted!</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Welcome, <strong>{form.firstName}</strong>! We&apos;re reviewing your documents.
            You&apos;ll receive a confirmation at <strong>{form.email}</strong> once your
            profile is verified — usually within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold rounded-full px-8 py-3 hover:bg-brand-blue-dark transition-colors"
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

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-brand font-black text-3xl leading-tight tracking-tight mb-1.5">
              CREATE YOUR <span className="text-brand-blue">PROFILE.</span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {step === 1 && "Set up your login credentials."}
              {step === 2 && "Tell us a little about yourself."}
              {step === 3 && "Provide your right to work documentation."}
              {step === 4 && "Let employers know where and how you want to work."}
              {step === 5 && "Upload your CV and any compliance documents."}
              {step === 6 && "Review your details before submitting."}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@email.com"
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
                      className="w-full border border-gray-border rounded-xl px-4 py-3 pr-11 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
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

            {/* ── Step 2: Personal ── */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input placeholder="Jane" value={form.firstName} onChange={set("firstName")} required />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input placeholder="Smith" value={form.lastName} onChange={set("lastName")} required />
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="+44 7700 900000" value={form.phone} onChange={set("phone")} required />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} required />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Select
                    value={form.nationality}
                    onChange={set("nationality")}
                    options={NATIONALITIES}
                    placeholder="Select nationality"
                  />
                </div>
              </>
            )}

            {/* ── Step 3: Right to Work ── */}
            {step === 3 && (
              <>
                <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-xl px-4 py-3">
                  <p className="text-xs text-brand-blue font-semibold mb-0.5">Why we need this</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    UK law requires employers to verify your right to work before you can be placed.
                    Your documents are securely stored and only shared with employers you&apos;re matched with.
                  </p>
                </div>
                <div>
                  <Label>Document Type</Label>
                  <Select
                    value={form.documentType}
                    onChange={set("documentType")}
                    options={DOCUMENT_TYPES}
                    placeholder="Select document type"
                  />
                </div>
                <div>
                  <Label>Document Number</Label>
                  <Input placeholder="e.g. 123456789" value={form.documentNumber} onChange={set("documentNumber")} required />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" value={form.documentExpiry} onChange={set("documentExpiry")} required />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  You&apos;ll be prompted to upload a scan or photo of this document after registration.
                </p>
              </>
            )}

            {/* ── Step 4: Work Preferences ── */}
            {step === 4 && (
              <>
                <div>
                  <Label>Sector you work in</Label>
                  <div className="space-y-2">
                    {SECTORS.map((s) => {
                      const active = form.sector === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, sector: s.id }))}
                          className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-left transition-all ${
                            active
                              ? "border-brand-blue bg-brand-blue/5 text-brand-blue"
                              : "border-gray-border text-brand hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold">{s.id}</p>
                            <p className="text-[11px] text-slate-400">{s.description}</p>
                          </div>
                          {active && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Preferred Job Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((jt) => {
                      const active = form.jobTypes.includes(jt);
                      return (
                        <button
                          key={jt}
                          type="button"
                          onClick={() => toggleArray("jobTypes", jt)}
                          className={`border rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                            active
                              ? "border-brand-blue bg-brand-blue text-white"
                              : "border-gray-border text-slate-500 hover:border-brand-blue hover:text-brand-blue"
                          }`}
                        >
                          {jt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Preferred Locations</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => {
                      const active = form.locations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => toggleArray("locations", loc)}
                          className={`border rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                            active
                              ? "border-brand-blue bg-brand-blue text-white"
                              : "border-gray-border text-slate-500 hover:border-brand-blue hover:text-brand-blue"
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 5: Documents ── */}
            {step === 5 && (
              <>
                {/* CV Upload */}
                <div>
                  <Label>CV / Résumé <span className="normal-case font-normal text-slate-300">(required)</span></Label>
                  <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-8 cursor-pointer transition-colors ${
                    form.cvFileName ? "border-brand-blue bg-brand-blue/5" : "border-gray-border hover:border-brand-blue"
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) set("cvFileName")(file.name);
                      }}
                    />
                    {form.cvFileName ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <p className="text-xs text-brand-blue font-semibold">{form.cvFileName}</p>
                        <p className="text-[10px] text-slate-400">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="text-xs text-slate-400">Upload your CV</p>
                        <p className="text-[10px] text-slate-300">PDF, DOC or DOCX · Max 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                {/* DBS */}
                <div>
                  <Label>DBS Certificate <span className="normal-case font-normal text-slate-300">(optional)</span></Label>
                  <div className="space-y-3">
                    <Select
                      value={form.dbsLevel}
                      onChange={set("dbsLevel")}
                      options={DBS_LEVELS}
                      placeholder="DBS level (if applicable)"
                    />
                    {form.dbsLevel && form.dbsLevel !== "None" && (
                      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition-colors ${
                        form.dbsFileName ? "border-brand-blue bg-brand-blue/5" : "border-gray-border hover:border-brand-blue"
                      }`}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) set("dbsFileName")(file.name);
                          }}
                        />
                        {form.dbsFileName ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <p className="text-xs text-brand-blue font-semibold">{form.dbsFileName}</p>
                            <p className="text-[10px] text-slate-400">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="text-xs text-slate-400">Upload DBS certificate</p>
                            <p className="text-[10px] text-slate-300">PDF or image · Max 5MB</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                {/* Consent */}
                <div className="space-y-3 pt-2">
                  {[
                    { field: "checkPrivacy" as const, text: "I consent to Edge Harbour storing and processing my personal data in line with the Privacy Policy." },
                    { field: "checkTerms" as const, text: "I agree to the Terms of Service and confirm the information I've provided is accurate." },
                  ].map(({ field, text }) => (
                    <label key={field} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-brand-blue shrink-0"
                      />
                      <span className="text-xs text-slate-500 leading-relaxed">{text}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* ── Step 6: Review ── */}
            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Account</p>
                  <ReviewRow label="Email" value={form.email} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Personal</p>
                  <ReviewRow label="Full Name" value={`${form.firstName} ${form.lastName}`.trim()} />
                  <ReviewRow label="Phone" value={form.phone} />
                  <ReviewRow label="Date of Birth" value={form.dateOfBirth} />
                  <ReviewRow label="Nationality" value={form.nationality} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Right to Work</p>
                  <ReviewRow label="Document Type" value={form.documentType} />
                  <ReviewRow label="Document Number" value={form.documentNumber} />
                  <ReviewRow label="Expiry Date" value={form.documentExpiry} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Work Preferences</p>
                  <ReviewRow label="Sector" value={form.sector} />
                  <ReviewRow label="Job Types" value={form.jobTypes.join(", ")} />
                  <ReviewRow label="Locations" value={form.locations.join(", ")} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Documents</p>
                  <ReviewRow label="CV" value={form.cvFileName || "Not uploaded"} />
                  <ReviewRow label="DBS Level" value={form.dbsLevel || "None"} />
                  {form.dbsFileName && <ReviewRow label="DBS Certificate" value={form.dbsFileName} />}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className={`flex gap-3 pt-2 ${step > 1 ? "justify-between" : "justify-end"}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center gap-1.5 border border-gray-border text-brand text-sm font-semibold rounded-full px-6 py-3 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={step === 5 && (!form.checkPrivacy || !form.checkTerms || !form.cvFileName)}
                className="flex-1 bg-brand-blue text-white text-sm font-semibold rounded-full py-3 hover:bg-brand-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 6 ? "Submit Application" : "Continue"}
              </button>
            </div>

          </form>

          {/* Footer links */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/candidate/login" className="text-brand-blue font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link href="/register" className="hover:text-brand-blue transition-colors">
                ← Back to registration options
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ── Right: Branded panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-navy">
        <style>{`
          @keyframes orb-a-cr {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(40px, -60px) scale(1.1); }
            66%       { transform: translate(-30px, 35px) scale(0.95); }
          }
          @keyframes orb-b-cr {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(-45px, 25px) scale(1.06); }
            66%       { transform: translate(35px, -40px) scale(1.12); }
          }
          @keyframes orb-c-cr {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%       { transform: translate(20px, 50px) scale(1.08); }
          }
          @keyframes fade-up-cr {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes step-in {
            from { opacity: 0; transform: translateX(16px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {/* Orbs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-blue/25 blur-[100px]" style={{ animation: "orb-a-cr 16s ease-in-out infinite" }} />
        <div className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-teal-500/15 blur-[90px]" style={{ animation: "orb-b-cr 20s ease-in-out infinite" }} />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] rounded-full bg-emerald-500/15 blur-[80px]" style={{ animation: "orb-c-cr 12s ease-in-out infinite" }} />

        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Top-right pill */}
        <div className="relative flex justify-end p-8">
          <div className="flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2.5">
            <span className="text-white/50 text-xs">Already registered?</span>
            <Link href="/auth/candidate/login" className="text-white text-xs font-bold tracking-wider uppercase hover:text-brand-blue transition-colors">
              Sign In →
            </Link>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 gap-8">

          {/* Headline */}
          <div style={{ animation: "fade-up-cr 0.7s ease 0.1s both" }}>
            <p className="text-brand-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              Edge Harbour Candidate Portal
            </p>
            <h2 className="text-white font-black text-4xl xl:text-5xl leading-[1.05] tracking-tight">
              GET FOUND.<br />
              GET <span className="text-brand-blue">VERIFIED.</span><br />
              GET HIRED.
            </h2>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Register once and let 200+ UK employers find you — with your
              compliance credentials already confirmed.
            </p>
          </div>

          {/* Step progress cards */}
          <div className="space-y-2" style={{ animation: "fade-up-cr 0.7s ease 0.25s both" }}>
            {[
              { n: 1, label: "Create Account", active: step >= 1 },
              { n: 2, label: "Personal Details", active: step >= 2 },
              { n: 3, label: "Right to Work", active: step >= 3 },
              { n: 4, label: "Work Preferences", active: step >= 4 },
              { n: 5, label: "Upload Documents", active: step >= 5 },
              { n: 6, label: "Review & Submit", active: step >= 6 },
            ].map((s) => (
              <div
                key={s.n}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ${
                  s.n === step
                    ? "bg-brand-blue/15 border-brand-blue/30 text-brand-blue"
                    : s.active
                    ? "bg-white/5 border-white/10 text-white/60"
                    : "bg-transparent border-transparent text-white/20"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  s.n < step ? "bg-brand-blue text-white" : s.n === step ? "bg-brand-blue text-white" : "bg-white/10 text-white/30"
                }`}>
                  {s.n < step ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : s.n}
                </div>
                <span className="text-xs font-semibold">{s.label}</span>
                {s.n === step && (
                  <span className="ml-auto text-[10px] font-bold text-brand-blue uppercase tracking-widest">Current</span>
                )}
              </div>
            ))}
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2" style={{ animation: "fade-up-cr 0.7s ease 0.4s both" }}>
            {[
              { value: "Free", label: "To register" },
              { value: "24hrs", label: "Avg. verify" },
              { value: "1,200+", label: "Roles filled" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl px-3 py-3 text-center">
                <p className="text-brand-blue font-black text-lg leading-none">{s.value}</p>
                <p className="text-white/35 text-[9px] uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative p-8 pt-0">
          <p className="text-white/20 text-xs">
            Join thousands of verified UK candidates already on their next role
          </p>
        </div>
      </div>
    </div>
  );
}
