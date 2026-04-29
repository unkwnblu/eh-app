"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase/client";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { useToast } from "@/components/ui/Toast";

// ─── Crop helper ──────────────────────────────────────────────────────────────

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

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  job_title: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  eh_id: string | null;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminCount: number;
}

// ─── Mock recent activity ─────────────────────────────────────────────────────

const RECENT_ACTIVITY = [
  { id: 1, action: "Suspended user account",   target: "david.vane@email.com",        time: "2h ago",  type: "suspend"  },
  { id: 2, action: "Approved employer",         target: "Swift Logistics UK",          time: "4h ago",  type: "approve"  },
  { id: 3, action: "Flagged job listing",       target: "BlueSky Hospitality — Chef",  time: "6h ago",  type: "flag"     },
  { id: 4, action: "Verified candidate",        target: "Sarah Mitchell",              time: "1d ago",  type: "verify"   },
  { id: 5, action: "Created user account",      target: "jessica.okafor@email.com",   time: "1d ago",  type: "create"   },
  { id: 6, action: "Restored user account",     target: "thomas.reed@email.com",      time: "2d ago",  type: "restore"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function activityIcon(type: string) {
  if (type === "suspend") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
  if (type === "approve" || type === "verify") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (type === "flag") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  );
  if (type === "restore") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function activityColor(type: string) {
  if (type === "suspend")          return "bg-red-50 text-red-500";
  if (type === "approve" || type === "verify") return "bg-green-50 text-green-600";
  if (type === "flag")             return "bg-amber-50 text-amber-500";
  if (type === "restore")          return "bg-blue-50 text-brand-blue";
  return "bg-purple-50 text-purple-500";
}

// ─── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  {
    label: "User Management",
    desc: "Add, suspend, or remove users",
    href: "/dashboard/admin/users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Verifications",
    desc: "Review pending candidate & employer verifications",
    href: "/dashboard/admin/verification",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Job Moderation",
    desc: "Review flagged and pending listings",
    href: "/dashboard/admin/moderation",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "Platform Settings",
    desc: "Configure system-wide preferences",
    href: "/dashboard/admin/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProfilePage() {
  useEffect(() => { document.title = "My Profile | Edge Harbour Admin"; }, []);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroImgError, setHeroImgError] = useState(false);

  // Edit details modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirm, setEditConfirm] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Cropper state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function openEditModal() {
    setEditName(profile?.full_name ?? "");
    setEditPassword("");
    setEditConfirm("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setCropSrc(null);
    setFieldError("");
    setShowEditModal(true);
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected after cancelling
    e.target.value = "";
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropSrc(URL.createObjectURL(file));
    setShowCropper(true);
  }

  async function applyCrop() {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const blob = await cropImageToBlob(cropSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(blob));
      setShowCropper(false);
      setCropSrc(null);
    } catch {
      toast("Failed to crop image", "error");
    }
  }

  async function handleSave() {
    setFieldError("");
    if (!editName.trim()) {
      setFieldError("Display name cannot be empty.");
      return;
    }
    if (editPassword && editPassword !== editConfirm) {
      setFieldError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      let avatarUrl = profile?.avatar_url ?? undefined;

      // Upload avatar if a new file was selected
      if (avatarFile && profile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${profile.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadError) {
          toast(`Upload failed: ${uploadError.message}`, "error");
        } else {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      const updates: Parameters<typeof supabase.auth.updateUser>[0] = {
        data: { full_name: editName.trim(), avatar_url: avatarUrl },
      };
      if (editPassword) updates.password = editPassword;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      setProfile((p) => p ? { ...p, full_name: editName.trim(), avatar_url: avatarUrl ?? null } : p);
      setHeroImgError(false);
      toast("Details updated", "success");
      setShowEditModal(false);
      // Reload so the layout sidebar/topbar picks up the new name and avatar
      window.location.reload();
    } catch {
      toast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch eh_id from profiles in parallel with stats
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("eh_id")
          .eq("id", user.id)
          .single();

        setProfile({
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin",
          role: user.app_metadata?.role ?? "admin",
          job_title: user.user_metadata?.job_title ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at ?? null,
          eh_id: (profileRow as { eh_id?: string } | null)?.eh_id ?? null,
        });
      }

      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const users: { status: string; role: string }[] = await res.json();
          setStats({
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.status === "active").length,
            suspendedUsers: users.filter((u) => u.status === "suspended").length,
            adminCount: users.filter((u) => u.role === "admin").length,
          });
        }
      } catch {
        // stats remain null — handled gracefully in UI
      }

      setLoading(false);
    }

    load();
  }, []);

  const initials = profile ? getInitials(profile.full_name) : "A";
  const displayName = profile?.full_name ?? "Administrator";

  const STAT_CARDS = [
    {
      label: "Total Users",
      value: stats ? String(stats.totalUsers) : "—",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Active Accounts",
      value: stats ? String(stats.activeUsers) : "—",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Suspended",
      value: stats ? String(stats.suspendedUsers) : "—",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: "Admin Accounts",
      value: stats ? String(stats.adminCount) : "—",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
      <GsapAnimations />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Your admin account details and platform overview</p>
        </div>
        <button
          onClick={openEditModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          Edit Details
        </button>
      </div>

      {/* Hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6" data-gsap="fade-up">
        {loading ? (
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-100 rounded animate-pulse w-48" />
              <div className="h-3.5 bg-gray-100 rounded animate-pulse w-32" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-64" />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-blue flex items-center justify-center shrink-0">
              {profile?.avatar_url && !heroImgError ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={() => setHeroImgError(true)}
                />
              ) : (
                <span className="text-white text-2xl font-black">{initials}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-black text-brand">{displayName}</h2>
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 text-[10px] font-bold uppercase tracking-wide rounded-full">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  {profile?.role === "moderator" ? "Moderator" : "System Controller"}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-500 mb-1">
                {profile?.job_title ?? (profile?.role === "moderator" ? "Content Moderator" : "Super Administrator")}
              </p>
              {/* EH-ID */}
              {profile?.eh_id && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">{profile.eh_id}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {profile?.email}
                </span>
                {profile?.created_at && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Member since {formatDate(profile.created_at)}
                  </span>
                )}
                {profile?.last_sign_in_at && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last login {formatDate(profile.last_sign_in_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Role summary */}
        <div className="mt-5 pt-5 border-t border-gray-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Access Level</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            {profile?.role === "moderator"
              ? "Moderator access — can review verifications, moderate job listings, and manage notifications. User management and platform settings are restricted to system administrators."
              : "Full system controller with unrestricted access to user management, verification workflows, job moderation, and platform configuration. All actions are logged for audit purposes."}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-gsap="fade-up">
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-brand leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-brand">Recent Activity</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Last 7 days</span>
            </div>
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activityColor(item.type)}`}>
                    {activityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{item.action}</p>
                    <p className="text-xs text-slate-400 truncate">{item.target}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Quick Access</h3>
            <div className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    {link.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand">{link.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{link.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto shrink-0 text-slate-300 group-hover:text-brand-blue transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Crop Modal ── */}
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
                  onClick={applyCrop}
                  className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                >
                  Apply Crop
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

      {/* Edit Details Modal */}
      {showEditModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-black text-brand">Edit Details</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Update your display name or password</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Avatar upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-3">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-blue flex items-center justify-center shrink-0">
                      {avatarPreview ?? profile?.avatar_url ? (
                        <img
                          src={avatarPreview ?? profile?.avatar_url ?? ""}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl font-black">
                          {getInitials(editName || profile?.full_name || "")}
                        </span>
                      )}
                    </div>
                    {/* Upload trigger */}
                    <div className="flex flex-col gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        {avatarFile ? "Change photo" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarSelect}
                        />
                      </label>
                      {avatarFile && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{avatarFile.name}</p>
                      )}
                      {!avatarFile && (
                        <p className="text-[11px] text-slate-400">PNG, JPG or WebP · max 2 MB</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-bold text-slate-600 mb-3">Change Password <span className="text-slate-400 font-medium">(optional)</span></p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
                      placeholder="New password"
                    />
                    <input
                      type="password"
                      value={editConfirm}
                      onChange={(e) => setEditConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {/* Inline error */}
                {fieldError && (
                  <p className="text-xs font-semibold text-red-500">{fieldError}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
