"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CANDIDATE_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const CERTIFICATES = [
  "Basic Life Support (BLS)",
  "Manual Handling",
  "DBS Enhanced",
  "Food Hygiene Level 2",
  "First Aid at Work",
  "Fire Safety Awareness",
  "COSHH Awareness",
  "Infection Control",
];

type JobDetail = {
  id:                     string;
  title:                  string;
  location:               string;
  salaryMin:              number | null;
  salaryMax:              number | null;
  employmentType:         string;
  requiredCertifications: string[];
  candidatesNeeded:       number;
  status:                 "draft" | "review" | "live" | "closed" | "flagged" | "rejected";
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, rest] = t.split(":");
  const [m, period] = rest.split(" ");
  let hours = parseInt(h);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + parseInt(m);
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary not set";
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function statusColor(status: JobDetail["status"]): { dot: string; text: string } {
  switch (status) {
    case "live":     return { dot: "bg-green-500",  text: "text-green-600" };
    case "review":   return { dot: "bg-amber-400",  text: "text-amber-600" };
    case "flagged":  return { dot: "bg-orange-500", text: "text-orange-600" };
    case "rejected": return { dot: "bg-red-500",    text: "text-red-500" };
    case "closed":   return { dot: "bg-slate-300",  text: "text-slate-400" };
    default:         return { dot: "bg-slate-300",  text: "text-slate-400" };
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EditJobPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { toast } = useToast();

  // ── Load state ─────────────────────────────────────────────────────────────
  const [job,      setJob]      = useState<JobDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [loadErr,  setLoadErr]  = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [shiftTitle,    setShiftTitle]    = useState("");
  const [candidates,    setCandidates]    = useState("1");
  const [hourlyRate,    setHourlyRate]    = useState("");
  const [selectedDays,  setSelectedDays]  = useState<Day[]>(["Wednesday", "Thursday", "Friday"]);
  const [startTime,     setStartTime]     = useState("08:00 AM");
  const [endTime,       setEndTime]       = useState("05:00 PM");
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  // ── Load job ───────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await fetch(`/api/employer/jobs/${id}`);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to load job");
      }
      const data = await res.json() as { job: JobDetail };
      setJob(data.job);

      // Pre-fill form
      setShiftTitle(data.job.title ?? "");
      setCandidates(String(data.job.candidatesNeeded ?? 1));
      // salary_min stored as annual — but the form field is labelled hourly rate.
      // Keep it populated if present; employer can overwrite.
      setHourlyRate(data.job.salaryMin != null ? String(data.job.salaryMin) : "");
      setSelectedCerts(data.job.requiredCertifications ?? []);
    } catch (err) {
      setLoadErr((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ── Form helpers ───────────────────────────────────────────────────────────

  function toggleDay(day: Day) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function toggleCert(cert: string) {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  }

  const summary = useMemo(() => {
    const startMins = timeToMinutes(startTime);
    const endMins   = timeToMinutes(endTime);
    const hours     = Math.max(0, (endMins - startMins) / 60);
    const days      = selectedDays.length;
    const staff     = parseInt(candidates) || 1;
    const rate      = parseFloat(hourlyRate) || 0;
    const cost      = hours * rate * days * staff;
    return { hours, days, staff, cost };
  }, [startTime, endTime, selectedDays, candidates, hourlyRate]);

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!shiftTitle.trim()) {
      toast("Shift title is required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/employer/jobs/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:                  shiftTitle.trim(),
          candidatesNeeded:       parseInt(candidates) || 1,
          salaryMin:              hourlyRate ? parseFloat(hourlyRate) : null,
          requiredCertifications: selectedCerts,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }

      toast("Changes saved successfully", "success");
      // Reload so the header + summary reflect the latest data
      load();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex-1 px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-lg" />
          <div className="grid grid-cols-[1fr_320px] gap-6 mt-8">
            <div className="space-y-5">
              <div className="h-48 bg-white border border-gray-100 rounded-2xl" />
              <div className="h-32 bg-white border border-gray-100 rounded-2xl" />
            </div>
            <div className="space-y-4">
              <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
              <div className="h-40 bg-white border border-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loadErr || !job) {
    return (
      <main className="flex-1 px-8 py-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="font-bold text-brand">{loadErr ?? "Job not found"}</p>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
            <Link href="/dashboard/employer/jobs" className="text-sm font-semibold text-slate-500 underline">Back to Jobs</Link>
          </div>
        </div>
      </main>
    );
  }

  const statusStyle = statusColor(job.status);

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-8 py-8">
        {/* Job header */}
        <div className="flex items-start justify-between mb-8" data-gsap="fade-down">
          <div>
            <Link
              href="/dashboard/employer/jobs"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-blue mb-3 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Jobs
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-brand tracking-tight">{job.title}</h1>
              <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${statusStyle.text}`}>
                <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                {job.status}
              </span>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.employmentType}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-5" data-gsap="fade-up">
            {/* Role Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-brand">Role Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Shift Title / Role</label>
                  <input
                    type="text"
                    value={shiftTitle}
                    onChange={(e) => setShiftTitle(e.target.value)}
                    placeholder="e.g. Registered Nurse - Emergency Dept"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Number of Candidates</label>
                    <div className="relative">
                      <select
                        value={candidates}
                        onChange={(e) => setCandidates(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors appearance-none bg-white"
                      >
                        {CANDIDATE_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Hourly Rate (£)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="eg 45.00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Certificates */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-brand">Required Certificates</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATES.map((cert) => {
                  const active = selectedCerts.includes(cert);
                  return (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`border rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                        active
                          ? "bg-brand-blue border-brand-blue text-white"
                          : "border-gray-200 text-slate-500 hover:border-brand-blue hover:text-brand-blue"
                      }`}
                    >
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Changes */}
            <div className="flex justify-end gap-3">
              <Link
                href="/dashboard/employer/jobs"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-brand text-white font-bold text-sm rounded-xl px-8 py-3 hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4" data-gsap="fade-up">
            {/* Select Dates */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <h3 className="text-sm font-bold text-brand">Select Dates</h3>
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                        active
                          ? "bg-brand-blue text-white"
                          : "bg-gray-50 text-slate-500 hover:bg-gray-100"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              {/* Times */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-brand mb-1.5">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand mb-1.5">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => toast("Shift scheduling coming soon", "info")}
                className="w-full mt-4 bg-brand-blue text-white text-sm font-semibold rounded-xl py-3 hover:bg-brand-blue-dark transition-colors"
              >
                Add Shift
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">Summary</p>
              <div className="space-y-3">
                {[
                  { label: "Duration",       value: `${summary.hours.toFixed(1)} Hours / day` },
                  { label: "Selected Dates", value: `${summary.days} ${summary.days === 1 ? "Day" : "Days"}` },
                  { label: "Total Staff",    value: `${summary.staff} ${summary.staff === 1 ? "Person" : "People"}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-brand">{value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand">Est. Total Cost</span>
                  <span className="text-lg font-black text-brand-blue">
                    £{summary.cost.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
