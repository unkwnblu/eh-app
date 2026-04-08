"use client";

import { useState, useEffect, useRef } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

type LegalDoc = {
  id:         string;
  docType:    string;
  label:      string;
  fileName:   string;
  filePath:   string;
  expiryDate: string;
  uploadedAt: string;
};

type Certificate = {
  id:         string;
  name:       string;
  issuer:     string;
  fileName:   string;
  filePath:   string;
  expiryDate: string;
  verified:   boolean;
};

const LEGAL_DOC_TYPES: { value: string; label: string }[] = [
  { value: "ukvi_visa",  label: "UKVI Visa / BRP" },
  { value: "passport",   label: "Passport" },
  { value: "rtw_letter", label: "Right to Work Letter" },
  { value: "other",      label: "Other Legal Document" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function labelForDocType(t: string) {
  return LEGAL_DOC_TYPES.find((d) => d.value === t)?.label ?? "Document";
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateLegalPage() {
  const { toast } = useToast();

  const [legalDocs,   setLegalDocs]   = useState<LegalDoc[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [uploadingLegal, setUploadingLegal] = useState(false);
  const [uploadingCert,  setUploadingCert]  = useState(false);

  const [pendingDocType, setPendingDocType] = useState<string>("ukvi_visa");
  const [pendingCertName, setPendingCertName] = useState("");

  const [shareCode,       setShareCode]       = useState("");
  const [shareCodeExpiry, setShareCodeExpiry] = useState("");
  const [savingShareCode, setSavingShareCode] = useState(false);

  const [dbsLevel,    setDbsLevel]    = useState("");
  const [dbsFileName, setDbsFileName] = useState("");
  const [dbsFilePath, setDbsFilePath] = useState("");
  const [savingDbsLevel, setSavingDbsLevel] = useState(false);
  const [uploadingDbs,   setUploadingDbs]   = useState(false);

  const legalInputRef = useRef<HTMLInputElement>(null);
  const certInputRef  = useRef<HTMLInputElement>(null);
  const dbsInputRef   = useRef<HTMLInputElement>(null);

  const DBS_LEVELS = ["None", "Basic", "Standard", "Enhanced", "Enhanced with Barred Lists"];

  // ── Load existing uploads ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch("/api/candidate/legal-documents").then((r) => r.json()),
      fetch("/api/candidate/certificates").then((r) => r.json()),
      fetch("/api/candidate/share-code").then((r) => r.json()),
      fetch("/api/candidate/dbs").then((r) => r.json()),
    ])
      .then(([legal, certs, share, dbs]) => {
        setLegalDocs(legal.documents ?? []);
        setCertificates(certs.certificates ?? []);
        setShareCode(share.shareCode ?? "");
        setShareCodeExpiry(share.expiryDate ?? "");
        setDbsLevel(dbs.level ?? "");
        setDbsFileName(dbs.fileName ?? "");
        setDbsFilePath(dbs.filePath ?? "");
      })
      .catch(() => toast("Failed to load documents", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function saveDbsLevel(level: string) {
    setDbsLevel(level);
    setSavingDbsLevel(true);
    const res = await fetch("/api/candidate/dbs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
    setSavingDbsLevel(false);
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Failed to save DBS level", "error");
      return;
    }
    toast("DBS level saved", "success");
  }

  async function handleDbsUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingDbs(true);
    const result = await uploadFile(file, "dbs");
    if (!result) { setUploadingDbs(false); return; }

    const res = await fetch("/api/candidate/dbs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, filePath: result.filePath }),
    });
    const data = await res.json();
    setUploadingDbs(false);
    if (!res.ok) {
      toast(data.error ?? "Failed to save DBS certificate", "error");
      return;
    }
    setDbsFileName(file.name);
    setDbsFilePath(result.filePath);
    toast("DBS certificate uploaded", "success");
  }

  async function deleteDbs() {
    const res = await fetch("/api/candidate/dbs", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Failed to delete", "error");
      return;
    }
    setDbsFileName("");
    setDbsFilePath("");
    toast("DBS certificate removed", "success");
  }

  async function saveShareCode() {
    const trimmed = shareCode.trim().toUpperCase();
    if (!trimmed) {
      toast("Please enter a share code", "error");
      return;
    }
    if (!/^[A-Z0-9]{9}$/.test(trimmed)) {
      toast("Share code must be exactly 9 alphanumeric characters", "error");
      return;
    }
    if (!shareCodeExpiry) {
      toast("Please enter the share code expiry date", "error");
      return;
    }
    const expiry = new Date(shareCodeExpiry);
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry <= today) {
      toast("Share code expiry must be a future date", "error");
      return;
    }

    setSavingShareCode(true);
    const res = await fetch("/api/candidate/share-code", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareCode: trimmed, expiryDate: shareCodeExpiry }),
    });
    const data = await res.json();
    setSavingShareCode(false);
    if (!res.ok) {
      toast(data.error ?? "Failed to save share code", "error");
      return;
    }
    toast("Share code saved", "success");
  }

  // ── Upload helpers ────────────────────────────────────────────────────────
  async function uploadFile(file: File, category: "legal" | "certificates" | "dbs"): Promise<{ filePath: string } | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast("You must be signed in to upload", "error");
      return null;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${category}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("candidate-documents")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      toast(`Upload failed: ${error.message}`, "error");
      return null;
    }
    return { filePath: path };
  }

  async function handleLegalFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingLegal(true);
    const result = await uploadFile(file, "legal");
    if (!result) { setUploadingLegal(false); return; }

    const res = await fetch("/api/candidate/legal-documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docType:  pendingDocType,
        label:    labelForDocType(pendingDocType),
        fileName: file.name,
        filePath: result.filePath,
      }),
    });
    const data = await res.json();
    setUploadingLegal(false);
    if (!res.ok) {
      toast(data.error ?? "Failed to save document", "error");
      return;
    }
    setLegalDocs((prev) => [data.document, ...prev]);
    toast("Document uploaded", "success");
  }

  async function handleCertFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const name = pendingCertName.trim();
    if (!name) {
      toast("Enter a certificate name first", "error");
      return;
    }

    setUploadingCert(true);
    const result = await uploadFile(file, "certificates");
    if (!result) { setUploadingCert(false); return; }

    const res = await fetch("/api/candidate/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        fileName: file.name,
        filePath: result.filePath,
      }),
    });
    const data = await res.json();
    setUploadingCert(false);
    if (!res.ok) {
      toast(data.error ?? "Failed to save certificate", "error");
      return;
    }
    setCertificates((prev) => [data.certificate, ...prev]);
    setPendingCertName("");
    toast("Certificate uploaded", "success");
  }

  async function deleteLegal(id: string) {
    const res = await fetch("/api/candidate/legal-documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Failed to delete", "error");
      return;
    }
    setLegalDocs((prev) => prev.filter((d) => d.id !== id));
    toast("Document removed", "success");
  }

  async function deleteCert(id: string) {
    const res = await fetch("/api/candidate/certificates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Failed to delete", "error");
      return;
    }
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    toast("Certificate removed", "success");
  }

  async function downloadFile(filePath: string, fileName: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("candidate-documents")
      .createSignedUrl(filePath, 60);
    if (error || !data) {
      toast("Could not generate download link", "error");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6">
      <GsapAnimations />

      {/* Hidden file inputs */}
      <input
        ref={legalInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="sr-only"
        onChange={handleLegalFileChange}
      />
      <input
        ref={certInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="sr-only"
        onChange={handleCertFileChange}
      />
      <input
        ref={dbsInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="sr-only"
        onChange={handleDbsUpload}
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">Compliance &amp; Legal</h1>
          <p className="text-sm text-slate-400 mt-1">Upload your right-to-work, UKVI and sector documents.</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-gsap="fade-up">
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legal Documents</p>
            <p className="text-2xl font-black text-brand">{legalDocs.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sector Certificates</p>
            <p className="text-2xl font-black text-brand">{certificates.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified</p>
            <p className="text-2xl font-black text-brand">{certificates.filter((c) => c.verified).length}</p>
          </div>
        </div>
      </div>

      {/* ── Share Code (text-only, no file) ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex items-center gap-2 mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          <h2 className="text-sm font-bold text-brand">Right to Work Share Code</h2>
        </div>
        <p className="text-[11px] text-slate-400 mb-4 max-w-xl">
          Generate your share code at <span className="font-semibold text-slate-500">gov.uk/prove-right-to-work</span> and enter the 9-character code below. Codes expire 90 days after issue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Share Code</label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase())}
              maxLength={9}
              placeholder="e.g. W88 K3F R9P"
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm font-mono tracking-widest text-brand outline-none focus:border-brand-blue transition-colors uppercase"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Expires</label>
            <input
              type="date"
              value={shareCodeExpiry}
              min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}
              onChange={(e) => setShareCodeExpiry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={saveShareCode}
            disabled={savingShareCode}
            className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingShareCode ? "Saving…" : "Save Code"}
          </button>
        </div>
      </div>

      {/* ── DBS Certificate ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex items-center gap-2 mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-sm font-bold text-brand">DBS Certificate</h2>
        </div>
        <p className="text-[11px] text-slate-400 mb-4 max-w-xl">
          Upload your Disclosure and Barring Service certificate. Required for healthcare and other regulated sectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">DBS Level</label>
            <select
              value={dbsLevel}
              onChange={(e) => saveDbsLevel(e.target.value)}
              disabled={savingDbsLevel}
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors disabled:opacity-60"
            >
              <option value="">Not applicable</option>
              {DBS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Certificate File</label>
            {dbsFileName ? (
              <div className="flex items-center gap-3 bg-[#F7F8FA] border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{dbsFileName}</p>
                  <p className="text-[11px] text-slate-400">Uploaded</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadFile(dbsFilePath, dbsFileName)}
                    aria-label="Download"
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-brand-blue transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => dbsInputRef.current?.click()}
                    disabled={uploadingDbs}
                    className="px-3 py-1.5 text-[11px] font-bold text-brand-blue border border-brand-blue/30 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
                  >
                    {uploadingDbs ? "Uploading…" : "Replace"}
                  </button>
                  <button
                    type="button"
                    onClick={deleteDbs}
                    aria-label="Delete"
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => dbsInputRef.current?.click()}
                disabled={uploadingDbs}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 hover:border-brand-blue/50 hover:bg-blue-50/30 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-xs font-medium text-slate-500">
                  {uploadingDbs ? "Uploading…" : "Click to upload"}
                </p>
                <p className="text-[10px] text-slate-400">PDF, PNG or JPG</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Upload zones ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-gsap="fade-up">

        {/* Legal / UKVI upload */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <h2 className="text-sm font-bold text-brand">Right to Work / UKVI</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Document Type</label>
              <select
                value={pendingDocType}
                onChange={(e) => setPendingDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              >
                {LEGAL_DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => legalInputRef.current?.click()}
              disabled={uploadingLegal}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-blue/50 hover:bg-blue-50/30 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-xs font-medium text-slate-500">
                {uploadingLegal ? "Uploading…" : "Click to upload"}
              </p>
              <p className="text-[10px] text-slate-400">PDF, PNG or JPG</p>
            </button>
          </div>
        </div>

        {/* Sector Certificate upload */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814" />
            </svg>
            <h2 className="text-sm font-bold text-brand">Sector Certificates</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Certificate Name</label>
              <input
                type="text"
                value={pendingCertName}
                onChange={(e) => setPendingCertName(e.target.value)}
                placeholder="e.g. NMC PIN, Food Hygiene L2"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!pendingCertName.trim()) {
                  toast("Enter a certificate name first", "error");
                  return;
                }
                certInputRef.current?.click();
              }}
              disabled={uploadingCert}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-blue/50 hover:bg-blue-50/30 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-xs font-medium text-slate-500">
                {uploadingCert ? "Uploading…" : "Click to upload"}
              </p>
              <p className="text-[10px] text-slate-400">PDF, PNG or JPG</p>
            </button>
          </div>
        </div>
      </div>

      {/* ── My Uploaded Documents ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-brand">My Uploaded Documents</h2>
          <span className="text-xs text-slate-400">{legalDocs.length + certificates.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-14 bg-gray-100 rounded-xl" />
            <div className="h-14 bg-gray-100 rounded-xl" />
          </div>
        ) : legalDocs.length === 0 && certificates.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {legalDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 bg-[#F7F8FA] border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{labelForDocType(doc.docType)}</p>
                  <p className="text-[11px] text-slate-400 truncate">{doc.fileName} · Uploaded {formatDate(doc.uploadedAt)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-brand-blue shrink-0">Legal</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => downloadFile(doc.filePath, doc.fileName)}
                    aria-label="Download"
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-brand-blue transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteLegal(doc.id)}
                    aria-label="Delete"
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 bg-[#F7F8FA] border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand truncate">{cert.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{cert.fileName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                  cert.verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {cert.verified ? "Verified" : "Pending"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {cert.filePath && (
                    <button
                      onClick={() => downloadFile(cert.filePath, cert.fileName)}
                      aria-label="Download"
                      className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-brand-blue transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteCert(cert.id)}
                    aria-label="Delete"
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
