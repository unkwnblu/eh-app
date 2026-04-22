"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Timesheet Types ──────────────────────────────────────────────────────────

type TimesheetStatus = "pending" | "approved" | "rejected";

type TimesheetEntry = {
  id:               string;
  candidateId:      string;
  candidateName:    string;
  shiftId:          string;
  jobTitle:         string;
  employer:         string;
  date:             string | null;
  scheduledStart:   string | null;
  scheduledEnd:     string | null;
  breakMinutes:     number;
  department:       string | null;
  shiftLocation:    string | null;
  clockedInAt:      string | null;
  clockedOutAt:     string | null;
  clockedInLat:     number | null;
  clockedInLng:     number | null;
  durationMins:     number | null;
  assignmentStatus: string;
  timesheetStatus:  TimesheetStatus;
};

type Counts = { pending: number; approved: number; rejected: number };
type Filter = "all" | TimesheetStatus;

// ─── Invoice Types ────────────────────────────────────────────────────────────

type InvoiceStatus = "draft" | "sent" | "paid";

type Invoice = {
  id:             string;
  invoice_number: string;
  employer_id:    string;
  employer_name:  string;
  period_start:   string;
  period_end:     string;
  status:         InvoiceStatus;
  subtotal:       number;
  vat_rate:       number;
  vat_amount:     number;
  total_amount:   number;
  notes:          string | null;
  created_at:     string;
};

type InvoiceItem = {
  id:             string;
  invoice_id:     string;
  candidate_name: string;
  job_title:      string | null;
  shift_date:     string;
  hours_worked:   number | null;
  hourly_rate:    number | null;
  amount:         number;
};

type PreviewItem = {
  assignmentId:  string;
  candidateName: string;
  jobTitle:      string;
  shiftDate:     string;
  hoursWorked:   number;
  hourlyRate:    number;
  amount:        number;
};

type Employer = { id: string; name: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateShort(d: string | null): string {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtPeriod(from: string, to: string): string {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to   + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const sameYear = f.getFullYear() === t.getFullYear();
  return `${f.toLocaleDateString("en-GB", opts)} – ${t.toLocaleDateString("en-GB", { ...opts, year: sameYear ? undefined : "numeric" })} ${t.getFullYear()}`;
}

function fmtDuration(mins: number | null): string {
  if (mins === null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function fmtCurrency(n: number): string {
  return `£${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

function variance(scheduled: string | null, actual: string | null, date: string | null): number | null {
  if (!scheduled || !actual || !date) return null;
  const [sh, sm] = scheduled.split(":").map(Number);
  const sched = new Date(`${date}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00`);
  const act   = new Date(actual);
  return Math.round((act.getTime() - sched.getTime()) / 60_000);
}

// ─── Timesheet Components ─────────────────────────────────────────────────────

function VarianceBadge({ mins }: { mins: number | null }) {
  if (mins === null) return null;
  const abs = Math.abs(mins);
  if (abs < 5) return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">On time</span>;
  const label = abs < 60 ? `${abs}m` : `${Math.floor(abs / 60)}h ${abs % 60}m`;
  if (mins < 0) return <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded-md">{label} early</span>;
  return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">{label} late</span>;
}

function StatusBadge({ status }: { status: TimesheetStatus }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending Review
    </span>
  );
}

function TimesheetCard({
  entry, onApprove, onReject, actioning,
}: {
  entry:     TimesheetEntry;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  actioning: string | null;
}) {
  const inVariance  = variance(entry.scheduledStart, entry.clockedInAt,  entry.date);
  const outVariance = variance(entry.scheduledEnd,   entry.clockedOutAt, entry.date);
  const isActioning = actioning === entry.id;

  const scheduledMins = (() => {
    if (!entry.scheduledStart || !entry.scheduledEnd) return null;
    const [sh, sm] = entry.scheduledStart.split(":").map(Number);
    const [eh, em] = entry.scheduledEnd.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm) - (entry.breakMinutes ?? 0);
  })();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue font-black text-sm flex items-center justify-center shrink-0">
            {initials(entry.candidateName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand truncate">{entry.candidateName}</p>
            <p className="text-[11px] text-slate-400 truncate">{entry.jobTitle} · {entry.employer}</p>
          </div>
        </div>
        <StatusBadge status={entry.timesheetStatus} />
      </div>

      <div className="h-px bg-gray-50 mx-5" />

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {fmtDate(entry.date)}
          </span>
          {entry.department && (
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">{entry.department}</span>
          )}
          {entry.shiftLocation && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {entry.shiftLocation}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Scheduled</p>
            <p className="text-xs font-bold text-brand">
              {entry.scheduledStart?.slice(0, 5) ?? "—"} – {entry.scheduledEnd?.slice(0, 5) ?? "—"}
            </p>
            {scheduledMins !== null && (
              <p className="text-[10px] text-slate-400 mt-0.5">{fmtDuration(scheduledMins)} paid</p>
            )}
          </div>
          <div className="bg-blue-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-blue/60 mb-1">Clocked In</p>
            <p className="text-xs font-bold text-brand-blue">{fmtTime(entry.clockedInAt)}</p>
            <VarianceBadge mins={inVariance} />
          </div>
          <div className="bg-slate-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Clocked Out</p>
            <p className="text-xs font-bold text-brand">{fmtTime(entry.clockedOutAt)}</p>
            <VarianceBadge mins={outVariance} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-brand">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fmtDuration(entry.durationMins)} worked
          </span>
          {entry.clockedInLat && entry.clockedInLng ? (
            <a
              href={`https://www.google.com/maps?q=${entry.clockedInLat},${entry.clockedInLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              View GPS
            </a>
          ) : (
            <span className="text-[11px] text-slate-300">No GPS</span>
          )}
        </div>
      </div>

      {entry.timesheetStatus === "pending" && (
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            onClick={() => onApprove(entry.id)}
            disabled={isActioning}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isActioning ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            Approve
          </button>
          <button
            onClick={() => onReject(entry.id)}
            disabled={isActioning}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isActioning ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Invoice Status Badge ─────────────────────────────────────────────────────

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Paid
    </span>
  );
  if (status === "sent") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-100">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" /> Sent
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Draft
    </span>
  );
}

// ─── Invoice Card ─────────────────────────────────────────────────────────────

function InvoiceCard({
  invoice, onView, onUpdateStatus, updating,
}: {
  invoice:        Invoice;
  onView:         (inv: Invoice) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  updating:       string | null;
}) {
  const isUpdating = updating === invoice.id;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-brand-blue tracking-wide">{invoice.invoice_number}</p>
          <p className="text-sm font-bold text-brand mt-0.5 truncate">{invoice.employer_name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{fmtPeriod(invoice.period_start, invoice.period_end)}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="h-px bg-gray-50 mx-5" />

      {/* Amount */}
      <div className="px-5 py-5 text-center flex-1 flex flex-col items-center justify-center">
        <p className="text-3xl font-black text-brand leading-none">{fmtCurrency(invoice.total_amount)}</p>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {fmtCurrency(invoice.subtotal)} + {fmtCurrency(invoice.vat_amount)} VAT ({invoice.vat_rate}%)
        </p>
      </div>

      <div className="h-px bg-gray-50 mx-5" />

      {/* Actions */}
      <div className="px-5 py-4 flex items-center gap-2">
        <button
          onClick={() => onView(invoice)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-slate-600 text-xs font-bold rounded-xl transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View
        </button>

        {invoice.status === "draft" && (
          <button
            onClick={() => onUpdateStatus(invoice.id, "sent")}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
            Mark as Sent
          </button>
        )}

        {invoice.status === "sent" && (
          <button
            onClick={() => onUpdateStatus(invoice.id, "paid")}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Mark as Paid
          </button>
        )}

        {invoice.status === "paid" && (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-600 text-xs font-bold rounded-xl">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Settled
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generate Invoice Modal ───────────────────────────────────────────────────

type GenForm = {
  employerId:  string;
  from:        string;
  to:          string;
  defaultRate: string;
  vatRate:     string;
  notes:       string;
};

type PreviewData = { items: PreviewItem[]; subtotal: number };

function GenerateInvoiceModal({ onClose, onCreated }: {
  onClose:   () => void;
  onCreated: () => void;
}) {
  const [employers,   setEmployers]   = useState<Employer[]>([]);
  const [loadingEmps, setLoadingEmps] = useState(true);

  const [form, setForm] = useState<GenForm>({
    employerId: "", from: "", to: "", defaultRate: "", vatRate: "20", notes: "",
  });

  const [step,       setStep]       = useState<"form" | "preview">("form");
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview,    setPreview]    = useState<PreviewData | null>(null);
  const [error,      setError]      = useState("");

  // Load employer list
  useEffect(() => {
    fetch("/api/admin/invoices?mode=employers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { employers?: Employer[] }) => { setEmployers(d.employers ?? []); })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingEmps(false));
  }, []);

  function setField<K extends keyof GenForm>(k: K, v: GenForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  const canPreview = form.employerId && form.from && form.to && form.from <= form.to;

  // VAT calculation for the preview
  const vatRate   = parseFloat(form.vatRate) || 20;
  const vatAmount = preview ? Math.round(preview.subtotal * (vatRate / 100) * 100) / 100 : 0;
  const total     = preview ? Math.round((preview.subtotal + vatAmount) * 100) / 100 : 0;

  async function handlePreview() {
    if (!canPreview) return;
    setPreviewing(true);
    setError("");
    try {
      const rate = parseFloat(form.defaultRate) || 0;
      const url  = `/api/admin/invoices?preview=true&employerId=${encodeURIComponent(form.employerId)}&from=${form.from}&to=${form.to}&defaultRate=${rate}`;
      const res  = await fetch(url, { cache: "no-store" });
      const data = await res.json() as { items?: PreviewItem[]; subtotal?: number; error?: string };
      if (!res.ok) { setError(data.error ?? "Preview failed"); return; }
      if (!data.items || data.items.length === 0) {
        setError("No approved timesheets found for this employer and period.");
        return;
      }
      setPreview({ items: data.items, subtotal: data.subtotal ?? 0 });
      setStep("preview");
    } catch {
      setError("Preview failed. Please try again.");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleGenerate() {
    if (!preview) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invoices", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          employerId:  form.employerId,
          periodStart: form.from,
          periodEnd:   form.to,
          defaultRate: parseFloat(form.defaultRate) || 0,
          vatRate,
          notes:       form.notes || undefined,
        }),
      });
      const data = await res.json() as { invoiceNumber?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to generate invoice"); return; }
      onCreated();
      onClose();
    } catch {
      setError("Failed to generate invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand focus:outline-none focus:border-brand-blue/40 placeholder:text-slate-300";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Modal header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-black text-brand">Generate Invoice</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === "form" ? "Step 1 of 2 — Invoice details" : "Step 2 of 2 — Preview & confirm"}
            </p>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mr-4">
            <div className={`w-6 h-1.5 rounded-full ${step === "form" ? "bg-brand-blue" : "bg-brand-blue/30"}`} />
            <div className={`w-6 h-1.5 rounded-full ${step === "preview" ? "bg-brand-blue" : "bg-gray-200"}`} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-400 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Step 1 — Form */}
        {step === "form" && (
          <>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {/* Employer */}
              <div>
                <label className={labelCls}>Employer</label>
                {loadingEmps ? (
                  <div className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={form.employerId}
                    onChange={(e) => setField("employerId", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select employer…</option>
                    {employers.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Period From</label>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(e) => setField("from", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Period To</label>
                  <input
                    type="date"
                    value={form.to}
                    min={form.from || undefined}
                    onChange={(e) => setField("to", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Default Rate (£/hr)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.defaultRate}
                    onChange={(e) => setField("defaultRate", e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used when a shift has no hourly rate set</p>
                </div>
                <div>
                  <label className={labelCls}>VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.vatRate}
                    onChange={(e) => setField("vatRate", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Payment terms, reference numbers…"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex items-center justify-end gap-2 shrink-0 border-t border-gray-50 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={!canPreview || previewing}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-40"
              >
                {previewing ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.963-7.178z" />
                  </svg>
                )}
                Preview Line Items
              </button>
            </div>
          </>
        )}

        {/* Step 2 — Preview */}
        {step === "preview" && preview && (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Summary bar */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                  <span><strong className="text-brand">{preview.items.length}</strong> line items</span>
                </div>
                <div className="text-[10px] text-slate-400">{fmtDateShort(form.from)} – {fmtDateShort(form.to)}</div>
                <div className="ml-auto text-xs font-black text-brand">{fmtCurrency(total)}</div>
              </div>

              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hrs</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate</th>
                      <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.items.map((item) => (
                      <tr key={item.assignmentId} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{fmtDateShort(item.shiftDate)}</td>
                        <td className="px-3 py-3 font-semibold text-brand whitespace-nowrap">{item.candidateName}</td>
                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{item.jobTitle}</td>
                        <td className="px-3 py-3 text-right text-slate-600 whitespace-nowrap">{item.hoursWorked}h</td>
                        <td className="px-3 py-3 text-right text-slate-500 whitespace-nowrap">{fmtCurrency(item.hourlyRate)}</td>
                        <td className="px-6 py-3 text-right font-bold text-brand whitespace-nowrap">{fmtCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 space-y-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold">{fmtCurrency(preview.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT ({form.vatRate}%)</span>
                  <span className="font-semibold">{fmtCurrency(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-brand pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{fmtCurrency(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mx-6 mb-4 flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex items-center gap-2 shrink-0 border-t border-gray-50 pt-4">
              <button
                onClick={() => { setStep("form"); setPreview(null); setError(""); }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
              <div className="flex-1" />
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-40"
              >
                {generating ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
                Generate Invoice
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────

function InvoiceDetailModal({
  invoice, onClose, onUpdateStatus,
}: {
  invoice:        Invoice;
  onClose:        () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
}) {
  const [items,   setItems]   = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inv,     setInv]     = useState<Invoice>(invoice);
  const [updating, setUpdating] = useState(false);

  // Sync when parent invoice changes (e.g. after optimistic update)
  useEffect(() => { setInv(invoice); }, [invoice]);

  useEffect(() => {
    fetch(`/api/admin/invoices/${invoice.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { invoice?: Invoice; items?: InvoiceItem[] }) => {
        if (d.invoice) setInv(d.invoice);
        setItems(d.items ?? []);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, [invoice.id]);

  async function handleStatusUpdate(status: InvoiceStatus) {
    setUpdating(true);
    setInv((prev) => ({ ...prev, status }));
    onUpdateStatus(inv.id, status);
    try {
      await fetch(`/api/admin/invoices/${inv.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
    } catch {
      /* silent — parent will revert if needed */
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-black text-brand">{inv.invoice_number}</span>
              <InvoiceStatusBadge status={inv.status} />
            </div>
            <p className="text-sm font-semibold text-brand">{inv.employer_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{fmtPeriod(inv.period_start, inv.period_end)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-400 transition-colors text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Line items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate</th>
                      <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">{fmtDateShort(item.shift_date)}</td>
                        <td className="px-3 py-3.5 font-semibold text-brand whitespace-nowrap">{item.candidate_name}</td>
                        <td className="px-3 py-3.5 text-slate-400 whitespace-nowrap">{item.job_title ?? "—"}</td>
                        <td className="px-3 py-3.5 text-right text-slate-600 whitespace-nowrap">
                          {item.hours_worked != null ? `${item.hours_worked}h` : "—"}
                        </td>
                        <td className="px-3 py-3.5 text-right text-slate-500 whitespace-nowrap">
                          {item.hourly_rate != null ? fmtCurrency(item.hourly_rate) : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-brand whitespace-nowrap">
                          {fmtCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">No line items found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-6 py-5 space-y-2 border-t border-gray-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold">{fmtCurrency(inv.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT ({inv.vat_rate}%)</span>
                  <span className="font-semibold">{fmtCurrency(inv.vat_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-brand pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{fmtCurrency(inv.total_amount)}</span>
                </div>
              </div>

              {/* Notes */}
              {inv.notes && (
                <div className="mx-6 mb-5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Notes</p>
                  <p className="text-xs text-amber-800">{inv.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-2 shrink-0 border-t border-gray-50 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>
          <div className="flex-1" />
          {inv.status === "draft" && (
            <button
              onClick={() => handleStatusUpdate("sent")}
              disabled={updating}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-40"
            >
              {updating ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
              Mark as Sent
            </button>
          )}
          {inv.status === "sent" && (
            <button
              onClick={() => handleStatusUpdate("paid")}
              disabled={updating}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-40"
            >
              {updating ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimesheetsPage() {
  const [activeTab, setActiveTab] = useState<"timesheets" | "invoices">("timesheets");

  // ── Timesheets state ───────────────────────────────────────────────────────
  const [entries,   setEntries]   = useState<TimesheetEntry[]>([]);
  const [counts,    setCounts]    = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<Filter>("all");
  const [actioning, setActioning] = useState<string | null>(null);

  // ── Invoices state ─────────────────────────────────────────────────────────
  const [invoices,       setInvoices]       = useState<Invoice[]>([]);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);
  const [invLoading,     setInvLoading]     = useState(false);
  const [showGenerate,   setShowGenerate]   = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [updatingInv,    setUpdatingInv]    = useState<string | null>(null);

  // ── Load timesheets ────────────────────────────────────────────────────────

  const load = useCallback(async (f: Filter = "all") => {
    setLoading(true);
    try {
      const url = f === "all" ? "/api/admin/timesheets" : `/api/admin/timesheets?status=${f}`;
      const res  = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { timesheets: TimesheetEntry[]; counts: Counts };
      setEntries(data.timesheets ?? []);
      setCounts(data.counts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  // ── Load invoices ──────────────────────────────────────────────────────────

  const loadInvoices = useCallback(async () => {
    setInvLoading(true);
    try {
      const res  = await fetch("/api/admin/invoices", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { invoices: Invoice[] };
      setInvoices(data.invoices ?? []);
      setInvoicesLoaded(true);
    } catch {
      // silent
    } finally {
      setInvLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "invoices" && !invoicesLoaded) loadInvoices();
  }, [activeTab, invoicesLoaded, loadInvoices]);

  // ── Approve / Reject timesheet ─────────────────────────────────────────────

  async function updateStatus(assignmentId: string, status: "approved" | "rejected") {
    setActioning(assignmentId);
    setEntries((prev) => prev.map((e) => e.id === assignmentId ? { ...e, timesheetStatus: status } : e));
    setCounts((prev) => ({ ...prev, pending: prev.pending - 1, [status]: prev[status] + 1 }));
    try {
      const res = await fetch("/api/admin/timesheets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, status }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      load(filter);
    } finally {
      setActioning(null);
    }
  }

  // ── Update invoice status ──────────────────────────────────────────────────

  async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    setUpdatingInv(invoiceId);
    setInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? { ...inv, status } : inv));
    if (viewingInvoice?.id === invoiceId) {
      setViewingInvoice((prev) => prev ? { ...prev, status } : null);
    }
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      loadInvoices();
    } finally {
      setUpdatingInv(null);
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalClocked = counts.pending + counts.approved + counts.rejected;

  const invoiceStats = useMemo(() => ({
    total:      invoices.length,
    draft:      invoices.filter((i) => i.status === "draft").length,
    sent:       invoices.filter((i) => i.status === "sent").length,
    paid:       invoices.filter((i) => i.status === "paid").length,
    totalValue: invoices.reduce((s, i) => s + i.total_amount, 0),
  }), [invoices]);

  const FILTERS: { key: Filter; label: string; count?: number }[] = [
    { key: "all",      label: "All",     count: totalClocked },
    { key: "pending",  label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  function handleRefresh() {
    if (activeTab === "timesheets") load(filter);
    else { setInvoicesLoaded(false); loadInvoices(); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col">
      <GsapAnimations />

      {/* ── Page header ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-2xl font-black text-brand tracking-tight">Timesheets</h1>
          <p className="text-sm text-slate-400 mt-1">Review completed shifts and generate employer invoices</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || invLoading}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40 shrink-0 self-start"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
            className={(loading || invLoading) ? "animate-spin" : ""}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6" data-gsap="fade-down">
        <button
          onClick={() => setActiveTab("timesheets")}
          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "timesheets" ? "bg-white text-brand shadow-sm" : "text-slate-400 hover:text-brand"
          }`}
        >
          Timesheets
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "invoices" ? "bg-white text-brand shadow-sm" : "text-slate-400 hover:text-brand"
          }`}
        >
          Invoices
          {invoiceStats.draft > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-600 rounded-full leading-none">
              {invoiceStats.draft}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════ TIMESHEETS TAB ══════════════════════ */}
      {activeTab === "timesheets" && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-gsap="fade-up">
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Clocked</p>
              <p className="text-3xl font-black text-brand leading-none">{totalClocked}</p>
              <div className="mt-3 h-0.5 bg-brand-blue/20 rounded-full">
                <div className="h-full bg-brand-blue rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-brand-blue text-white rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-black leading-none">{counts.pending}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-black text-brand leading-none">{counts.approved}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-black text-brand leading-none">{counts.rejected}</p>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 flex items-center gap-2 mb-6" data-gsap="fade-down">
            <span className="text-xs font-bold text-slate-400 mr-1">Filter:</span>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === f.key ? "bg-brand-blue text-white" : "bg-gray-50 text-slate-500 hover:bg-gray-100"
                }`}
              >
                {f.label}
                {f.count !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    filter === f.key ? "bg-white/20 text-white" : "bg-gray-200 text-slate-500"
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4" data-gsap="fade-up">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                      <div className="h-3 bg-gray-50 rounded-lg w-3/4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((j) => <div key={j} className="h-16 bg-gray-50 rounded-xl" />)}
                  </div>
                  <div className="h-10 bg-green-50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center" data-gsap="fade-up">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand">
                {filter === "all" ? "No completed timesheets yet" : `No ${filter} timesheets`}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {filter === "all"
                  ? "Timesheets appear here once candidates clock out via the mobile app."
                  : `There are no timesheets with ${filter} status right now.`}
              </p>
              {filter !== "all" && (
                <button onClick={() => setFilter("all")} className="mt-4 text-xs font-semibold text-brand-blue hover:underline">
                  View all timesheets
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 flex-1" data-gsap="fade-up">
              {entries.map((entry) => (
                <TimesheetCard
                  key={entry.id}
                  entry={entry}
                  onApprove={(id) => updateStatus(id, "approved")}
                  onReject={(id)  => updateStatus(id, "rejected")}
                  actioning={actioning}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════ INVOICES TAB ══════════════════════ */}
      {activeTab === "invoices" && (
        <>
          {/* Stat cards + generate button */}
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 mb-6" data-gsap="fade-up">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Invoices</p>
                <p className="text-3xl font-black text-brand leading-none">{invoiceStats.total}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">{fmtCurrency(invoiceStats.totalValue)} total</p>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Draft</p>
                  <p className="text-2xl font-black text-brand leading-none">{invoiceStats.draft}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sent</p>
                  <p className="text-2xl font-black text-brand leading-none">{invoiceStats.sent}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid</p>
                  <p className="text-2xl font-black text-brand leading-none">{invoiceStats.paid}</p>
                </div>
              </div>
            </div>

            {/* Generate CTA */}
            <button
              onClick={() => setShowGenerate(true)}
              className="flex items-center justify-center gap-2.5 px-6 py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue/90 transition-colors shrink-0 lg:flex-col lg:w-40"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-sm">Generate Invoice</span>
            </button>
          </div>

          {/* Invoice grid */}
          {invLoading ? (
            <div className="grid md:grid-cols-2 gap-4" data-gsap="fade-up">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-blue-50 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                  <div className="h-12 bg-gray-50 rounded-xl" />
                  <div className="flex gap-2">
                    <div className="h-9 bg-gray-100 rounded-xl w-1/3" />
                    <div className="h-9 bg-blue-50 rounded-xl flex-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center col-span-2" data-gsap="fade-up">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-brand">No invoices yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Generate your first invoice from approved timesheets using the button above.
              </p>
              <button
                onClick={() => setShowGenerate(true)}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Generate Invoice
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 flex-1" data-gsap="fade-up">
              {invoices.map((inv) => (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  onView={setViewingInvoice}
                  onUpdateStatus={updateInvoiceStatus}
                  updating={updatingInv}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      {showGenerate && (
        <GenerateInvoiceModal
          onClose={() => setShowGenerate(false)}
          onCreated={() => {
            setInvoicesLoaded(false);
            loadInvoices();
          }}
        />
      )}

      {viewingInvoice && (
        <InvoiceDetailModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onUpdateStatus={updateInvoiceStatus}
        />
      )}
    </main>
  );
}
