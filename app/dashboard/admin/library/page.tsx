"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType = "pdf" | "video" | "article" | "other";
type DocCategory = "training" | "sop" | "resource";
type Tab = DocCategory | "faq";

type LibraryDoc = {
  id:           string;
  title:        string;
  category:     DocCategory;
  description:  string | null;
  file_path:    string;
  file_type:    FileType;
  file_size_mb: number | null;
  created_at:   string;
  url:          string | null;
};

type FaqItem = {
  id:       string;
  question: string;
  answer:   string;
  category: string;
  order:    number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtSize(mb: number | null) {
  if (mb === null) return null;
  return mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function OtherIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  );
}

function DocTypeIcon({ type }: { type: FileType }) {
  if (type === "pdf")     return <PdfIcon />;
  if (type === "video")   return <VideoIcon />;
  if (type === "article") return <ArticleIcon />;
  return <OtherIcon />;
}

function typeColor(type: FileType): string {
  if (type === "pdf")     return "bg-red-50 text-red-500";
  if (type === "video")   return "bg-purple-50 text-purple-500";
  if (type === "article") return "bg-blue-50 text-brand-blue";
  return "bg-slate-100 text-slate-500";
}

function typeBadgeColor(type: FileType): string {
  if (type === "pdf")     return "bg-red-50 text-red-500 border-red-100";
  if (type === "video")   return "bg-purple-50 text-purple-500 border-purple-100";
  if (type === "article") return "bg-blue-50 text-brand-blue border-blue-100";
  return "bg-slate-50 text-slate-500 border-slate-100";
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onDelete,
  deleting,
}: {
  doc:      LibraryDoc;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeColor(doc.file_type)}`}>
        <DocTypeIcon type={doc.file_type} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-brand leading-snug">{doc.title}</p>
          <button
            onClick={() => onDelete(doc.id)}
            disabled={deleting === doc.id}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
            title="Delete"
          >
            {deleting === doc.id ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-transparent animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            )}
          </button>
        </div>

        {doc.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{doc.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadgeColor(doc.file_type)}`}>
            {doc.file_type.toUpperCase()}
          </span>
          {fmtSize(doc.file_size_mb) && (
            <span className="text-[11px] text-slate-400">{fmtSize(doc.file_size_mb)}</span>
          )}
          <span className="text-[11px] text-slate-300">·</span>
          <span className="text-[11px] text-slate-400">{fmtDate(doc.created_at)}</span>

          {/* View/Download link */}
          {doc.url && (
            <>
              <span className="text-[11px] text-slate-300">·</span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-brand-blue hover:underline flex items-center gap-0.5"
              >
                {doc.file_type === "pdf" || doc.file_type === "other" ? "Download" : "Open"}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({
  defaultCategory,
  onClose,
  onUploaded,
}: {
  defaultCategory: DocCategory;
  onClose:   () => void;
  onUploaded: () => void;
}) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<DocCategory>(defaultCategory);
  const [fileType,    setFileType]    = useState<FileType>("pdf");
  const [url,         setUrl]         = useState("");
  const [file,        setFile]        = useState<File | null>(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const needsFile = fileType === "pdf" || fileType === "other";
  const needsUrl  = fileType === "video" || fileType === "article";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (needsFile && !file)       { setError("Please select a file"); return; }
    if (needsUrl  && !url.trim()) { setError("Please enter a URL"); return; }

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("title",       title.trim());
    fd.append("category",    category);
    fd.append("fileType",    fileType);
    if (description.trim()) fd.append("description", description.trim());
    if (needsFile && file)  fd.append("file", file);
    if (needsUrl)           fd.append("url",  url.trim());

    try {
      const res = await fetch("/api/admin/library", { method: "POST", body: fd });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      onUploaded();
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  const urlPlaceholder = fileType === "video"
    ? "https://youtube.com/watch?v=... or Vimeo URL"
    : "https://example.com/article";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-brand">Add Document</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload a file or link an external resource</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Manual Handling Certificate Guide"
              className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-brand-blue/40"
            />
          </div>

          {/* Category + File type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocCategory)}
                className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand focus:outline-none focus:border-brand-blue/40"
              >
                <option value="training">Training</option>
                <option value="sop">SOP</option>
                <option value="resource">Resource</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as FileType)}
                className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand focus:outline-none focus:border-brand-blue/40"
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="article">Article / Link</option>
                <option value="other">Other File</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Description <span className="normal-case font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-brand-blue/40 resize-none"
            />
          </div>

          {/* File upload — for PDF / other */}
          {needsFile && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">File</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors px-4 py-6 flex flex-col items-center gap-2 ${
                  dragOver ? "border-brand-blue bg-blue-50" : file ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-brand-blue/40"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={fileType === "pdf" ? ".pdf" : undefined}
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
                />
                {file ? (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-brand text-center">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{fmtSize(Math.round((file.size / 1_048_576) * 100) / 100)}</p>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-gray-100 text-slate-400 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Drop file here or <span className="text-brand-blue">browse</span></p>
                    <p className="text-[11px] text-slate-400">Max 4 MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* URL — for video / article */}
          {needsUrl && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {fileType === "video" ? "Video URL" : "Article URL"}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={urlPlaceholder}
                className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-brand-blue/40"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add FAQ Modal ────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = ["general", "payroll", "shifts", "compliance"];

function AddFaqModal({
  onClose,
  onAdded,
}: {
  onClose:  () => void;
  onAdded:  () => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");
  const [category, setCategory] = useState("general");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) { setError("Question and answer are required"); return; }
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/library", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "faq", question: question.trim(), answer: answer.trim(), category }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      onAdded();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-brand">Add FAQ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add a question and answer for the app FAQ section</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I view my payslip?"
              className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-brand-blue/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a clear, concise answer..."
              rows={4}
              className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand placeholder:text-slate-300 focus:outline-none focus:border-brand-blue/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand focus:outline-none focus:border-brand-blue/40"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex items-center gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {saving && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {saving ? "Saving…" : "Add FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  label,
  onConfirm,
  onCancel,
  deleting,
}: {
  label:    string;
  onConfirm: () => void;
  onCancel:  () => void;
  deleting:  boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 className="text-base font-black text-brand text-center mb-1">Delete this item?</h3>
        <p className="text-xs text-slate-400 text-center mb-5">
          <span className="font-semibold text-brand">{label}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FaqRow({
  item,
  onDelete,
}: {
  item:     FaqItem;
  onDelete: (id: string, question: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const catColor: Record<string, string> = {
    general:    "bg-gray-50 text-slate-500",
    payroll:    "bg-green-50 text-green-600",
    shifts:     "bg-blue-50 text-brand-blue",
    compliance: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0 ${catColor[item.category] ?? catColor.general}`}>
          {item.category}
        </div>
        <p className="flex-1 text-sm font-bold text-brand">{item.question}</p>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-gray-50">
          <p className="text-sm text-slate-500 leading-relaxed pt-3 whitespace-pre-wrap">{item.answer}</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => onDelete(item.id, item.question)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-500 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: "training", label: "Training" },
  { key: "sop",      label: "SOPs" },
  { key: "resource", label: "Resources" },
  { key: "faq",      label: "FAQ" },
];

export default function LibraryPage() {
  const [tab,         setTab]         = useState<Tab>("training");
  const [docs,        setDocs]        = useState<LibraryDoc[]>([]);
  const [faqs,        setFaqs]        = useState<FaqItem[]>([]);
  const [counts,      setCounts]      = useState<Record<Tab, number>>({ training: 0, sop: 0, resource: 0, faq: 0 });
  const [loading,     setLoading]     = useState(true);
  const [showUpload,  setShowUpload]  = useState(false);
  const [showFaq,     setShowFaq]     = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [confirmDel,  setConfirmDel]  = useState<{ id: string; label: string; type: "doc" | "faq" } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "faq") {
        const res  = await fetch("/api/admin/library?type=faq", { cache: "no-store" });
        const data = await res.json() as { faqs: FaqItem[] };
        setFaqs(data.faqs ?? []);
        setCounts((p) => ({ ...p, faq: (data.faqs ?? []).length }));
      } else {
        const res  = await fetch(`/api/admin/library?category=${t}`, { cache: "no-store" });
        const data = await res.json() as { documents: LibraryDoc[] };
        setDocs(data.documents ?? []);
        setCounts((p) => ({ ...p, [t]: (data.documents ?? []).length }));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTab(tab); }, [loadTab, tab]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function confirmDelete() {
    if (!confirmDel) return;
    const { id, type } = confirmDel;
    setDeleting(id);
    setConfirmDel(null);

    try {
      const url = type === "faq"
        ? `/api/admin/library/${id}?type=faq`
        : `/api/admin/library/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (type === "faq") setFaqs((p) => p.filter((f) => f.id !== id));
        else                setDocs((p) => p.filter((d) => d.id !== id));
        setCounts((p) => ({ ...p, [tab]: Math.max(0, p[tab] - 1) }));
      }
    } finally {
      setDeleting(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isFaq    = tab === "faq";
  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col">
      <GsapAnimations />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-2xl font-black text-brand tracking-tight">Library</h1>
          <p className="text-sm text-slate-400 mt-1">Manage training materials, SOPs, resources and FAQs for the app</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Refresh */}
          <button
            onClick={() => loadTab(tab)}
            disabled={loading}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={loading ? "animate-spin" : ""}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          {/* Add button */}
          {isFaq ? (
            <button
              onClick={() => setShowFaq(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-2xl hover:bg-brand-blue/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add FAQ
            </button>
          ) : (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-2xl hover:bg-brand-blue/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-gsap="fade-up">
        {TABS.map((t) => {
          const active = tab === t.key;
          const colors: Record<Tab, string> = {
            training: "bg-brand-blue text-white",
            sop:      "bg-white border border-gray-100",
            resource: "bg-white border border-gray-100",
            faq:      "bg-white border border-gray-100",
          };
          const iconColors: Record<Tab, string> = {
            training: "bg-white/20",
            sop:      "bg-amber-50",
            resource: "bg-green-50",
            faq:      "bg-purple-50",
          };
          const iconStroke: Record<Tab, string> = {
            training: "text-white",
            sop:      "text-amber-500",
            resource: "text-green-500",
            faq:      "text-purple-500",
          };

          const icons: Record<Tab, React.ReactElement> = {
            training: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconStroke[t.key]}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            ),
            sop: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconStroke[t.key]}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            ),
            resource: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconStroke[t.key]}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            ),
            faq: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconStroke[t.key]}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            ),
          };

          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all ${active ? colors.training : colors.sop} ${active ? "" : "hover:border-brand-blue/20"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColors[t.key]}`}>
                {icons[t.key]}
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${active ? "opacity-70 text-white" : "text-slate-400"}`}>{t.label}</p>
                <p className={`text-2xl font-black leading-none ${active ? "text-white" : "text-brand"}`}>{counts[t.key]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4" data-gsap="fade-up">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                <div className="h-3 bg-gray-50 rounded-lg w-full" />
                <div className="h-3 bg-gray-50 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>

      ) : isFaq ? (
        // ── FAQ accordion ────────────────────────────────────────────────────
        faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center" data-gsap="fade-up">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-brand">No FAQ items yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Add questions and answers that candidates will see in the app.</p>
            <button
              onClick={() => setShowFaq(true)}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add first FAQ
            </button>
          </div>
        ) : (
          <div className="space-y-3 flex-1" data-gsap="fade-up">
            {faqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                onDelete={(id, question) => setConfirmDel({ id, label: question, type: "faq" })}
              />
            ))}
          </div>
        )

      ) : (
        // ── Document grid ─────────────────────────────────────────────────────
        docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center" data-gsap="fade-up">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <p className="text-sm font-bold text-brand">No {tabLabel} documents yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Upload PDFs, link videos or articles for candidates to access in the app.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload first document
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 flex-1" data-gsap="fade-up">
            {docs.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onDelete={(id) => setConfirmDel({ id, label: doc.title, type: "doc" })}
                deleting={deleting}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          defaultCategory={tab !== "faq" ? tab : "training"}
          onClose={() => setShowUpload(false)}
          onUploaded={() => loadTab(tab)}
        />
      )}

      {showFaq && (
        <AddFaqModal
          onClose={() => setShowFaq(false)}
          onAdded={() => loadTab("faq")}
        />
      )}

      {confirmDel && (
        <DeleteConfirmModal
          label={confirmDel.label}
          deleting={deleting === confirmDel.id}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </main>
  );
}
