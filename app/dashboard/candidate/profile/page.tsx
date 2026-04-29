"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import NextImage from "next/image";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

// ─── Crop helper (same as admin profile) ─────────────────────────────────────

async function cropImageToBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise<void>((res) => { img.onload = () => res(); });

  const canvas = document.createElement("canvas");
  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas empty"))), "image/jpeg", 0.92)
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileData = {
  fullName:       string;
  email:          string;
  phone:          string;
  bio:            string;
  nationality:    string;
  sector:         string;
  jobTypes:       string[];
  locations:      string[];
  skills:         string[];
  documentType:   string;
  documentNumber: string;
  documentExpiry: string;
  cvFileName:     string;
  dbsFileName:    string;
  dbsLevel:       string;
  status:         string;
  ehId:           string | null;
};

type Certificate = {
  id:         string;
  name:       string;
  issuer:     string;
  fileName:   string;
  expiryDate: string;
  verified:   boolean;
};

type Experience = {
  id:          string;
  title:       string;
  company:     string;
  location:    string;
  startDate:   string;
  endDate:     string;
  current:     boolean;
  description: string;
  skills:      string[];
  verified:    boolean;
};

type DocEntry = {
  label:  string;
  detail: string;
  status: "verified" | "pending" | "missing";
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function periodLabel(exp: Experience) {
  const end = exp.current ? "Present" : exp.endDate;
  return `${exp.startDate}${exp.startDate ? " — " : ""}${end}`;
}

function buildDocs(p: ProfileData, certificates: Certificate[]): DocEntry[] {
  const isActive = p.status === "active";
  const docs: DocEntry[] = [];

  if (p.documentType) {
    docs.push({
      label:  p.documentType,
      detail: p.documentExpiry ? `Expires ${p.documentExpiry}` : "No expiry",
      status: isActive ? "verified" : "pending",
    });
  } else {
    docs.push({ label: "Right to Work", detail: "Not submitted", status: "missing" });
  }

  if (p.cvFileName) {
    docs.push({
      label:  "CV / Resume",
      detail: p.cvFileName,
      status: isActive ? "verified" : "pending",
    });
  } else {
    docs.push({ label: "CV / Resume", detail: "Not submitted", status: "missing" });
  }

  if (p.dbsFileName) {
    docs.push({
      label:  `DBS Certificate${p.dbsLevel && p.dbsLevel !== "None" ? ` (${p.dbsLevel})` : ""}`,
      detail: p.dbsFileName,
      status: isActive ? "verified" : "pending",
    });
  } else {
    docs.push({ label: "DBS Certificate", detail: "Not submitted", status: "missing" });
  }

  for (const cert of certificates) {
    docs.push({
      label:  cert.name,
      detail: cert.expiryDate ? `Expires ${cert.expiryDate}` : (cert.issuer || cert.fileName || "Uploaded"),
      status: cert.verified ? "verified" : "pending",
    });
  }

  return docs;
}

function calcCompleteness(p: ProfileData, experiences: Experience[], certificates: Certificate[]): number {
  let score = 0;
  if (p.fullName)               score += 10;
  if (p.email)                  score += 10;
  if (p.phone)                  score += 10;
  if (p.bio)                    score += 10;
  if (p.skills.length > 0)      score += 15;
  if (experiences.length > 0)   score += 15;
  if (p.documentType)           score += 10;
  if (p.cvFileName)             score += 10;
  if (p.dbsFileName)            score += 5;
  if (certificates.length > 0)  score += 5;
  return Math.min(score, 100);
}

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: "verified" | "pending" | "missing" }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Verified
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 border border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Missing
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className ?? ""}`} />;
}

// ─── Avatar display widget ────────────────────────────────────────────────────

function AvatarDisplay({
  heroInitials,
  avatarUrl,
  uploading,
  uploadProgress,
  onFileSelect,
  onRemove,
}: {
  heroInitials: string;
  avatarUrl: string | null;
  uploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2">
      <div className="relative group">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden select-none">
          {avatarUrl ? (
            <NextImage
              src={avatarUrl}
              alt="Profile photo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-2xl font-black">
              {heroInitials}
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <label
          aria-label="Upload profile photo"
          className={`absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer ${uploading ? "opacity-100 cursor-wait" : "opacity-0 group-hover:opacity-100"}`}
        >
          {uploading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-white text-[9px] font-bold tracking-wide">PHOTO</span>
            </>
          )}
          {!uploading && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onFileSelect(file);
              }}
            />
          )}
        </label>

        {/* Remove × button */}
        {avatarUrl && !uploading && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove photo"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="w-20">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-1">{uploadProgress}%</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateProfilePage() {
  const { toast } = useToast();

  const [profile, setProfile]           = useState<ProfileData | null>(null);
  const [experiences, setExperiences]   = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading]           = useState(true);

  // Avatar state
  const [avatarUrl,       setAvatarUrl]       = useState<string | null>(null);
  const [uploading,       setUploading]       = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);

  // Crop state
  const [cropSrc,             setCropSrc]             = useState<string | null>(null);
  const [showCropper,         setShowCropper]         = useState(false);
  const [crop,                setCrop]                = useState({ x: 0, y: 0 });
  const [zoom,                setZoom]                = useState(1);
  const [croppedAreaPixels,   setCroppedAreaPixels]   = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    document.title = "My Profile | Edge Harbour";

    Promise.all([
      fetch("/api/candidate/profile").then((r) => r.json()),
      fetch("/api/candidate/experiences").then((r) => r.json()),
      fetch("/api/candidate/certificates").then((r) => r.json()),
      fetch("/api/candidate/avatar").then((r) => r.json()),
    ]).then(([prof, exp, certs, avatar]) => {
      setProfile(prof);
      setExperiences(exp.experiences ?? []);
      setCertificates(certs.certificates ?? []);
      setAvatarUrl((avatar as { url?: string | null }).url ?? null);
    }).finally(() => setLoading(false));
  }, []);

  // ── Step 1: file selected → open cropper ────────────────────────────────────
  function handleFileSelect(file: File) {
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`Image must be under ${MAX_MB} MB.`, "error");
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropSrc(URL.createObjectURL(file));
    setShowCropper(true);
  }

  // ── Step 2: crop applied → upload ────────────────────────────────────────────
  async function applyCropAndUpload() {
    if (!cropSrc || !croppedAreaPixels) return;

    let blob: Blob;
    try {
      blob = await cropImageToBlob(cropSrc, croppedAreaPixels);
    } catch {
      toast("Failed to crop image.", "error");
      return;
    }

    setShowCropper(false);
    setCropSrc(null);
    setUploading(true);
    setUploadProgress(0);

    // Fake progress: tick to 85% quickly, stall until upload completes
    let fakeProgress = 0;
    const ticker = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 12, 85);
      setUploadProgress(Math.round(fakeProgress));
    }, 200);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/avatar/${Date.now()}.jpg`;

      const { error: upErr } = await supabase.storage
        .from("candidate-documents")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

      if (upErr) throw new Error(upErr.message);

      clearInterval(ticker);
      setUploadProgress(95);

      const res  = await fetch("/api/candidate/avatar", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fileName: "avatar.jpg", filePath: path }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save avatar");

      setUploadProgress(100);
      setAvatarUrl(data.url ?? null);
      toast("Profile photo updated.", "success");
    } catch (err) {
      clearInterval(ticker);
      toast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 600);
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      const res = await fetch("/api/candidate/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove photo");
      setAvatarUrl(null);
      toast("Profile photo removed.", "info");
    } catch {
      toast("Failed to remove photo.", "error");
    } finally {
      setUploading(false);
    }
  }

  const completeness = profile ? calcCompleteness(profile, experiences, certificates) : 0;
  const docs         = profile ? buildDocs(profile, certificates) : [];
  const heroInitials = profile?.fullName ? initials(profile.fullName) : "—";
  const jobTitle     = experiences[0]?.title ?? profile?.sector ?? "";
  const heroLocation = profile?.locations?.[0] ?? "";

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
      <GsapAnimations />

      {/* Header */}
      <div className="flex items-center justify-between mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-400 mt-1">How employers see your public profile</p>
        </div>
        <Link
          href="/dashboard/candidate/settings"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          Edit Profile
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6" data-gsap="fade-up">
        {loading ? (
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-2 w-full mt-4" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar — clickable upload */}
              <AvatarDisplay
                heroInitials={heroInitials}
                avatarUrl={avatarUrl}
                uploading={uploading}
                uploadProgress={uploadProgress}
                onFileSelect={handleFileSelect}
                onRemove={handleRemove}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-black text-brand">{profile?.fullName || "No name set"}</h2>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                    profile?.status === "active"
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {profile?.status === "active" ? "Active" : "Pending Verification"}
                  </span>
                </div>
                {/* EH-ID */}
                {profile?.ehId && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">{profile.ehId}</span>
                  </div>
                )}
                {jobTitle && (
                  <p className="text-sm font-semibold text-slate-500 mb-0.5">{jobTitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-4">
                  {heroLocation && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {heroLocation}
                    </span>
                  )}
                  {profile?.email && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {profile.email}
                    </span>
                  )}
                  {profile?.phone && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {profile.phone}
                    </span>
                  )}
                </div>

                {/* Completeness bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Profile Completeness</span>
                    <span className="text-xs font-bold text-brand-blue">{completeness}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-blue rounded-full transition-all duration-700"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {completeness === 100
                      ? "Your profile is complete!"
                      : "Add more experience and documents to reach 100%"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="mt-5 pt-5 border-t border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">About</p>
                <p className="text-sm text-slate-500 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column — Skills + Experience */}
        <div className="md:col-span-2 space-y-6">

          {/* Skills */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Skills</h3>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {["w-20", "w-16", "w-24", "w-20", "w-28", "w-16"].map((w, i) => (
                  <div key={i} className={`h-7 bg-gray-100 rounded-xl animate-pulse ${w}`} />
                ))}
              </div>
            ) : profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-sm text-slate-400">No skills added yet.</p>
                <Link href="/dashboard/candidate/settings" className="text-xs font-semibold text-brand-blue mt-1 hover:underline">
                  Add skills in Settings →
                </Link>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-5">Experience</h3>
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : experiences.length > 0 ? (
              <div className="space-y-6">
                {experiences.map((exp, i) => (
                  <div key={exp.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${exp.current ? "bg-brand-blue" : "bg-gray-300"}`} />
                      {i < experiences.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <div>
                          <p className="text-sm font-bold text-brand">{exp.title}</p>
                          <p className="text-xs text-slate-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                        </div>
                        {exp.verified
                          ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 shrink-0">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Verified
                            </span>
                          : <span className="text-[10px] font-bold text-slate-300 shrink-0">Unverified</span>
                        }
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mb-2">{periodLabel(exp)}</p>
                      {exp.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">{exp.description}</p>
                      )}
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {exp.skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 text-slate-500 text-[11px] font-medium rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-sm text-slate-400">No experience added yet.</p>
                <Link href="/dashboard/candidate/settings" className="text-xs font-semibold text-brand-blue mt-1 hover:underline">
                  Add experience in Settings →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Compliance Documents */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Compliance Documents</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {docs.map((doc) => (
                  <div key={doc.label} className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-600 mb-0.5 truncate">{doc.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{doc.detail}</p>
                    </div>
                    <StatusChip status={doc.status} />
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/candidate/settings"
              className="block w-full mt-4 text-center text-xs font-semibold text-brand-blue hover:underline"
            >
              Manage documents →
            </Link>
          </div>

          {/* Professional details */}
          {!loading && profile && (profile.sector || profile.jobTypes.length > 0 || profile.nationality) && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
              <h3 className="text-sm font-bold text-brand mb-4">Professional Details</h3>
              <div className="space-y-3">
                {profile.sector && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sector</p>
                    <span className="px-2.5 py-1 bg-blue-50 text-brand-blue text-xs font-semibold rounded-full">{profile.sector}</span>
                  </div>
                )}
                {profile.jobTypes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Job Types</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.jobTypes.map((j) => (
                        <span key={j} className="px-2 py-0.5 bg-gray-100 text-slate-500 text-[11px] font-medium rounded-full">{j}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.nationality && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nationality</p>
                    <p className="text-xs font-semibold text-slate-600">{profile.nationality}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Crop Modal (same pattern as admin profile) ── */}
      {showCropper && cropSrc && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[60]" />
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-brand">Crop Photo</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Drag to reposition · scroll to zoom</p>
                </div>
                <button
                  onClick={() => { setShowCropper(false); setCropSrc(null); }}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Crop area */}
              <div className="relative w-full" style={{ height: 320, background: "#111" }}>
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { borderRadius: 0 },
                    cropAreaStyle: { borderRadius: 12, border: "2px solid white" },
                  }}
                />
              </div>

              {/* Zoom slider */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-brand-blue"
                    aria-label="Zoom"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v3m0 0v3m0-3h3m-3 0H7.5" />
                  </svg>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 pb-5">
                <button
                  onClick={applyCropAndUpload}
                  className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                >
                  Apply &amp; Upload
                </button>
                <button
                  onClick={() => { setShowCropper(false); setCropSrc(null); }}
                  className="flex-1 py-2.5 bg-gray-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
