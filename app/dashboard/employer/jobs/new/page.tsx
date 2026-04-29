"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EMPLOYMENT_TYPES  = ["Full-time", "Part-time", "Contract", "Temporary / Ad-hoc"];
const CERTIFICATIONS    = ["Enhanced DBS Check", "Right to Work in UK", "GMC Registration", "NMC Pin", "Manual Handling"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior"];

// Annual salary hints (full-time / contract)
const SALARY_HINTS: Record<string, string> = {
  Healthcare:      "Market average: £32k – £45k / year",
  Hospitality:     "Market average: £22k – £32k / year",
  "Customer Care": "Market average: £24k – £35k / year",
  "Tech & Data":   "Market average: £45k – £75k / year",
  Logistics:       "Market average: £28k – £40k / year",
};

// Hourly rate hints (part-time / temporary)
const HOURLY_HINTS: Record<string, string> = {
  Healthcare:      "Market average: £14 – £22 / hr",
  Hospitality:     "Market average: £11 – £16 / hr",
  "Customer Care": "Market average: £11 – £15 / hr",
  "Tech & Data":   "Market average: £25 – £50 / hr",
  Logistics:       "Market average: £12 – £18 / hr",
};

// Employment types that bill hourly
const HOURLY_TYPES = new Set(["Part-time", "Temporary / Ad-hoc"]);

// ─── Field error helper ────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CreateJobPage() {
  useEffect(() => { document.title = "Post a Job | Edge Harbour"; }, []);

  const router    = useRouter();
  const { toast } = useToast();

  // Employer industries + compliance status (fetched from profile)
  const [industries,                setIndustries]                = useState<string[]>([]);
  const [industriesLoading,         setIndustriesLoading]         = useState(true);
  const [healthcareComplianceStatus, setHealthcareComplianceStatus] = useState<"not_submitted" | "pending" | "verified" | "rejected">("not_submitted");

  // Form state
  const [jobTitle,         setJobTitle]         = useState("");
  const [sector,           setSector]           = useState("");
  const [employmentType,   setEmploymentType]   = useState("Full-time");
  const [location,         setLocation]         = useState("");
  const [remote,           setRemote]           = useState(false);
  const [payMin,           setPayMin]           = useState("");
  const [payMax,           setPayMax]           = useState("");
  const [description,      setDescription]      = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [selectedCerts,    setSelectedCerts]    = useState<string[]>([]);
  const [experienceLevel,  setExperienceLevel]  = useState("Mid-level");
  const [closesAt,         setClosesAt]         = useState("");

  // Action state
  const [isPosting,     setIsPosting]     = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Whether this type bills per hour
  const isHourly = HOURLY_TYPES.has(employmentType);

  // When switching between hourly/annual types, clear pay fields to avoid confusion
  useEffect(() => {
    setPayMin("");
    setPayMax("");
    setErrors((p) => ({ ...p, pay: "" }));
  }, [isHourly]);

  // Fetch employer's industries + compliance status on mount
  useEffect(() => {
    fetch("/api/employer/settings")
      .then((r) => r.json())
      .then((data: { employer?: { industries?: string[]; healthcare_compliance_status?: string } }) => {
        setIndustries(data.employer?.industries ?? []);
        setHealthcareComplianceStatus(
          (data.employer?.healthcare_compliance_status ?? "not_submitted") as
            "not_submitted" | "pending" | "verified" | "rejected"
        );
      })
      .catch(() => setIndustries([]))
      .finally(() => setIndustriesLoading(false));
  }, []);

  // Auto-save timestamp
  const [savedTime, setSavedTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSavedTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  function toggleCert(cert: string) {
    setSelectedCerts((prev) => prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!jobTitle.trim()) e.jobTitle  = "Job title is required.";
    if (!sector)          e.sector    = "Please select a sector.";
    if (!location.trim()) e.location  = "Location is required.";
    if (payMin && payMax && Number(payMin) > Number(payMax)) {
      e.pay = isHourly
        ? "Minimum hourly rate cannot exceed maximum."
        : "Minimum salary cannot exceed maximum.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildPayload(status: "review" | "draft") {
    return {
      title:                  jobTitle.trim(),
      sector,
      employmentType,
      location:               location.trim(),
      remote,
      salaryMin:              payMin ? Number(payMin) : null,
      salaryMax:              payMax ? Number(payMax) : null,
      description:            description.trim() || null,
      responsibilities:       responsibilities.trim() || null,
      requiredCertifications: selectedCerts,
      experienceLevel,
      closesAt:               closesAt || null,
      status,
    };
  }

  async function submit(status: "review" | "draft") {
    if (status === "review" && !validate()) return;

    status === "draft" ? setIsSavingDraft(true) : setIsPosting(true);
    try {
      const res = await fetch("/api/employer/jobs", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(buildPayload(status)),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error);
      toast(
        status === "draft" ? "Job saved as draft" : "Job submitted for review",
        "success",
      );
      router.push("/dashboard/employer/jobs");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setIsPosting(false);
      setIsSavingDraft(false);
    }
  }

  const hint = sector
    ? (isHourly ? HOURLY_HINTS[sector] : SALARY_HINTS[sector]) ?? null
    : null;

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-8 py-8 pb-28">
        <div className="flex items-center gap-3 mb-6" data-gsap="fade-down">
          <Link href="/dashboard/employer/jobs" className="p-1.5 rounded-lg hover:bg-gray-100 text-slate-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Post New Job</h1>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-6 items-start" data-gsap="fade-up">
          {/* ── Left column ── */}
          <div className="space-y-5">

            {/* Basic Information */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-brand">Basic Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => { setJobTitle(e.target.value); if (errors.jobTitle) setErrors((p) => ({ ...p, jobTitle: "" })); }}
                    placeholder="e.g., Senior Support Worker"
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:ring-1 transition-colors ${errors.jobTitle ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-brand-blue focus:ring-brand-blue"}`}
                  />
                  <FieldError msg={errors.jobTitle} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Sector / Industry</label>
                    <div className="relative">
                      <select
                        value={sector}
                        disabled={industriesLoading}
                        onChange={(e) => { setSector(e.target.value); if (errors.sector) setErrors((p) => ({ ...p, sector: "" })); }}
                        className={`w-full border rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:ring-1 transition-colors appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed ${errors.sector ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-brand-blue focus:ring-brand-blue"}`}
                      >
                        {industriesLoading ? (
                          <option value="" disabled>Loading…</option>
                        ) : industries.length === 0 ? (
                          <option value="" disabled>No industries set — update your profile</option>
                        ) : (
                          <>
                            <option value="" disabled>Select Industry</option>
                            {industries.map((s) => <option key={s} value={s}>{s}</option>)}
                          </>
                        )}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                    {!industriesLoading && industries.length === 0 && (
                      <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        Add industries in{" "}
                        <a href="/dashboard/employer/settings" className="underline font-semibold">Business Settings</a>
                        {" "}first.
                      </p>
                    )}
                    <FieldError msg={errors.sector} />

                    {/* Healthcare compliance gate — shown when sector selected but not verified */}
                    {sector === "Healthcare" && healthcareComplianceStatus !== "verified" && (
                      <div className={`mt-2 rounded-xl border px-3 py-2.5 flex items-start gap-2 ${
                        healthcareComplianceStatus === "pending"
                          ? "bg-amber-50 border-amber-100"
                          : healthcareComplianceStatus === "rejected"
                          ? "bg-red-50 border-red-100"
                          : "bg-amber-50 border-amber-100"
                      }`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`mt-0.5 shrink-0 ${healthcareComplianceStatus === "rejected" ? "text-red-500" : "text-amber-500"}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                          {healthcareComplianceStatus === "pending" && (
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              <span className="font-bold">Verification pending.</span> Your CQC & DBS details are under review. You can&apos;t post Healthcare jobs until approved.{" "}
                              <a href="/dashboard/employer/legal" className="font-bold underline">Check status →</a>
                            </p>
                          )}
                          {healthcareComplianceStatus === "rejected" && (
                            <p className="text-[11px] text-red-700 leading-relaxed">
                              <span className="font-bold">Submission rejected.</span> Update your CQC Provider ID and DBS level in{" "}
                              <a href="/dashboard/employer/settings" className="font-bold underline">Settings</a> before posting Healthcare jobs.
                            </p>
                          )}
                          {healthcareComplianceStatus === "not_submitted" && (
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              <span className="font-bold">Compliance required.</span> Healthcare employers must submit their CQC Provider ID & DBS level and have them verified.{" "}
                              <a href="/dashboard/employer/settings" className="font-bold underline">Go to Settings →</a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Employment Type</label>
                    <div className="relative">
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none bg-white"
                      >
                        {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Location</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); if (errors.location) setErrors((p) => ({ ...p, location: "" })); }}
                        placeholder="e.g. London, UK"
                        className={`w-full border rounded-xl pl-9 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:ring-1 transition-colors ${errors.location ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-gray-200 focus:border-brand-blue focus:ring-brand-blue"}`}
                      />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-blue transition-colors">
                      <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} className="accent-brand-blue" />
                      <span className="text-sm font-medium text-slate-600">Remote</span>
                    </label>
                  </div>
                  <FieldError msg={errors.location} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Closing Date <span className="normal-case font-normal text-slate-300">(optional)</span></label>
                  <input
                    type="date"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Role & Remuneration */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-brand">Role & Remuneration</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">

                  {/* ── Pay range — switches between annual salary and hourly rate ── */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {isHourly ? "Hourly Rate Range" : "Salary Range (Annual)"}
                      </label>
                      {/* Pill badge indicating pay period */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${isHourly ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-blue-50 text-brand-blue border border-blue-100"}`}>
                        {isHourly ? (
                          <>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Per Hour
                          </>
                        ) : (
                          <>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            Per Year
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
                        <input
                          type="number"
                          value={payMin}
                          onChange={(e) => { setPayMin(e.target.value); if (errors.pay) setErrors((p) => ({ ...p, pay: "" })); }}
                          placeholder={isHourly ? "e.g. 14.00" : "Min"}
                          min="0"
                          step={isHourly ? "0.50" : "1000"}
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        />
                      </div>
                      <span className="text-slate-300 font-bold shrink-0">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-semibold">£</span>
                        <input
                          type="number"
                          value={payMax}
                          onChange={(e) => { setPayMax(e.target.value); if (errors.pay) setErrors((p) => ({ ...p, pay: "" })); }}
                          placeholder={isHourly ? "e.g. 22.00" : "Max"}
                          min="0"
                          step={isHourly ? "0.50" : "1000"}
                          className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                        />
                      </div>
                    </div>

                    {errors.pay && <FieldError msg={errors.pay} />}

                    {hint && (
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                        {hint}
                      </p>
                    )}

                    {isHourly && (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                        <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1.5 mb-0.5">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                          Hourly billing applies
                        </p>
                        <p className="text-[10px] text-amber-600 leading-relaxed">
                          Candidates for {employmentType.toLowerCase()} roles are paid per hour worked. The rate shown will appear on the job listing.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue mb-3">Quick Tips</p>
                    <ul className="space-y-2">
                      {["Be specific about shift patterns for healthcare roles.", "Highlight perks like the 'NHS Pension' if applicable."].map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                          <span className="text-[11px] text-brand-blue leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Job Description</label>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-t-xl px-3 py-2 border-b-0 bg-gray-50">
                      {["B", "I"].map((f) => (
                        <button key={f} type="button" className={`w-6 h-6 rounded text-xs font-${f === "B" ? "black" : "normal"} ${f === "I" ? "italic" : ""} text-slate-500 hover:bg-gray-200 transition-colors flex items-center justify-center`}>{f}</button>
                      ))}
                    </div>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the day-to-day life in this role..." rows={4} className="w-full border border-gray-200 rounded-b-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Key Responsibilities</label>
                    <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="List the 3–5 most critical duties..." rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column — Compliance (dark) ── */}
          <div className="bg-[#0F1C2E] rounded-2xl p-5 text-white sticky top-24">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold">Compliance</h2>
            </div>

            <div className="mb-6">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">Required Certifications</p>
              <div className="space-y-2">
                {CERTIFICATIONS.map((cert) => {
                  const checked = selectedCerts.includes(cert);
                  return (
                    <label key={cert} className="flex items-center gap-3 cursor-pointer group">
                      <div onClick={() => toggleCert(cert)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${checked ? "bg-brand-blue border-brand-blue" : "border-white/20 hover:border-white/40"}`}>
                        {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                      </div>
                      <span className="text-xs text-white/70 group-hover:text-white transition-colors">{cert}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 mb-6">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">Experience Level</p>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((level) => {
                  const active = experienceLevel === level;
                  return (
                    <button key={level} type="button" onClick={() => setExperienceLevel(level)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-brand-blue text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}>
                      {level}
                      {active && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-white/30 leading-relaxed">
              All certifications will be verified via the Edge Harbour compliance engine before shortlist release.
            </p>
          </div>
        </div>
      </main>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 left-[260px] right-0 z-30 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
          {savedTime ? `Draft auto-saved at ${savedTime}` : "Saving…"}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/employer/jobs"
            className="border border-gray-200 text-brand text-sm font-semibold rounded-xl px-5 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            Cancel
          </Link>

          {/* Save as Draft */}
          <button
            onClick={() => submit("draft")}
            disabled={isSavingDraft || isPosting}
            className="flex items-center gap-2 border border-gray-200 bg-white text-brand text-sm font-semibold rounded-xl px-5 py-2.5 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingDraft ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Save as Draft
              </>
            )}
          </button>

          {/* Post Job Now */}
          {(() => {
            const healthcareBlocked =
              sector === "Healthcare" && healthcareComplianceStatus !== "verified";
            return (
              <div className="relative group/post">
                <button
                  onClick={() => submit("review")}
                  disabled={isPosting || isSavingDraft || healthcareBlocked}
                  className="flex items-center gap-2 bg-brand text-white text-sm font-bold rounded-xl px-6 py-2.5 hover:bg-brand-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPosting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Posting…
                    </>
                  ) : healthcareBlocked ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Posting Restricted
                    </>
                  ) : (
                    <>
                      Post Job Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
                {/* Tooltip shown on hover when blocked */}
                {healthcareBlocked && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-lg opacity-0 group-hover/post:opacity-100 transition-opacity pointer-events-none z-20">
                    {healthcareComplianceStatus === "pending"
                      ? "Your CQC & DBS details are pending verification. Check your Legal & Compliance page for status."
                      : healthcareComplianceStatus === "rejected"
                      ? "Your compliance submission was rejected. Update your details in Settings."
                      : "Submit your CQC Provider ID & DBS level in Settings to unlock Healthcare job posting."}
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-slate-800" />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
