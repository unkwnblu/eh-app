"use client";

import { useState, useEffect, useCallback } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = "active" | "suspended" | "pending";
type UserRole = "Candidate" | "Employer" | "Admin" | "Moderator";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  lastLogin: string;
  lastLoginTime: string;
  permissions: string[];
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ["Candidate", "Employer", "Admin", "Moderator"];

// Only staff roles can be created from this dashboard
const STAFF_ROLES: UserRole[] = ["Admin", "Moderator"];

const ROLE_STYLES: Record<UserRole, string> = {
  Candidate: "bg-blue-50 text-blue-600",
  Employer:  "bg-purple-50 text-purple-600",
  Admin:     "bg-amber-50 text-amber-700",
  Moderator: "bg-green-50 text-green-700",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  useEffect(() => { document.title = "User Management | Edge Harbour Admin"; }, []);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<"all" | UserRole>("all");
  const [panel, setPanel] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Admin");
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  // ── Fetch users ──────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(false);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setUsersError(true);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function suspend(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      });
      if (!res.ok) throw new Error();
      setUsers((p) =>
        p.map((u) => (u.id === id ? { ...u, status: "suspended" } : u))
      );
      if (panel?.id === id) setPanel((p) => p && { ...p, status: "suspended" });
      toast("User suspended", "info");
    } catch {
      toast("Failed to suspend user", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function restore(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!res.ok) throw new Error();
      setUsers((p) =>
        p.map((u) => (u.id === id ? { ...u, status: "active" } : u))
      );
      if (panel?.id === id) setPanel((p) => p && { ...p, status: "active" });
      toast("User access restored", "success");
    } catch {
      toast("Failed to restore user", "error");
    } finally {
      setActionLoading(null);
    }
  }

  function deleteUser(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete user");
      }
      setUsers((p) => p.filter((u) => u.id !== id));
      if (panel?.id === id) setPanel(null);
      toast("User deleted", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete user", "error");
    } finally {
      setActionLoading(null);
    }
  }

  function resetForm() {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewConfirm("");
    setNewRole("Admin");
    setFormError("");
    setShowForm(false);
  }

  async function addUser() {
    setFormError("");
    if (!newName.trim() || !newEmail.trim()) {
      setFormError("Full name and email are required.");
      return;
    }
    if (!newPassword) {
      setFormError("A password is required so the user can log in.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== newConfirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setActionLoading("create");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: newName, email: newEmail, password: newPassword, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create user");
      }
      const data = await res.json();
      setUsers((p) => [data.user, ...p]);
      resetForm();
      toast(`${data.user.name} added successfully`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create user", "error");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const filtered = tab === "all" ? users : users.filter((u) => u.role === tab);
  const totalActive = users.filter((u) => u.status === "active").length;
  const totalSuspended = users.filter((u) => u.status === "suspended").length;

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">
      <GsapAnimations />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4" data-gsap="fade-down">
        <div>
          <h1 className="text-[28px] font-black text-brand tracking-tight">User Management</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Oversee platform access, monitor account statuses, and manage roles across Employers, Candidates, and Admin teams.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors shrink-0 self-start"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Create New User Profile
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-brand-blue/30 rounded-2xl p-6" data-gsap="fade-down">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-brand">New Staff Account</h3>
              <p className="text-xs text-slate-400 mt-0.5">Creates an admin portal login — not a candidate or employer account</p>
            </div>
            <button onClick={resetForm} className="p-1.5 text-slate-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Row 1 — name, email, role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                type="text"
                placeholder="e.g. Jane Smith"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              >
                {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2 — password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Confirm Password</label>
              <input
                value={newConfirm}
                onChange={(e) => setNewConfirm(e.target.value)}
                type="password"
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
              />
            </div>
          </div>

          {/* Inline error */}
          {formError && (
            <p className="text-xs font-semibold text-red-500 mb-4">{formError}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={addUser}
              disabled={actionLoading === "create"}
              className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === "create" ? "Creating…" : "Create Account"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-up">
        {/* Total */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Total Users</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">{usersLoading ? "—" : users.length.toLocaleString()}</p>
          <p className="text-xs text-green-500 font-semibold mt-1">Registered accounts</p>
        </div>

        {/* Active */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Active</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">{usersLoading ? "—" : totalActive.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Active accounts</p>
        </div>

        {/* Suspended */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Suspended</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">{usersLoading ? "—" : totalSuspended.toLocaleString()}</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Requiring review</p>
        </div>

        {/* Staff */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Staff</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">
            {usersLoading ? "—" : users.filter((u) => u.role === "Admin" || u.role === "Moderator").length}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">Admins &amp; Moderators</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" data-gsap="fade-up">

        {/* Tab bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-gray-100">
          <div className="flex gap-1" role="tablist" aria-label="Filter users by role">
            {(["all", ...ROLES] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t as typeof tab)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
                  tab === t
                    ? "border-brand-blue text-brand-blue"
                    : "border-transparent text-slate-400 hover:text-brand"
                }`}
              >
                {t === "all" ? "All Users" : `${t}s`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <button aria-label="Sort users" className="p-2 text-slate-400 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
              </svg>
            </button>
            <button aria-label="Export users" className="p-2 text-slate-400 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">User Name</th>
              <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
              <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Status</th>
              <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Login</th>
              <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-5">
                  <TableRowSkeleton count={6} />
                </td>
              </tr>
            ) : usersError ? (
              <tr>
                <td colSpan={5} className="px-6 py-5">
                  <ErrorState message="Unable to load users." onRetry={fetchUsers} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-5">
                  <EmptyState
                    icon={
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    }
                    title="No users found"
                    description="No users match this filter. Try switching to another tab or create a new user profile."
                  />
                </td>
              </tr>
            ) : null}
            {!usersLoading && !usersError && filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Name + email */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      user.status === "suspended" ? "bg-red-100 text-red-500"     :
                      user.status === "pending"   ? "bg-amber-100 text-amber-600" :
                                                    "bg-brand-blue/10 text-brand-blue"
                    }`}>
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-blue leading-snug">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role pill */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${ROLE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-bold w-fit ${
                    user.status === "active"   ? "text-green-600" :
                    user.status === "pending"  ? "text-amber-500" :
                                                 "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      user.status === "active"  ? "bg-green-500" :
                      user.status === "pending" ? "bg-amber-400" :
                                                  "bg-red-500"
                    }`} />
                    {user.status === "active"  ? "ACTIVE" :
                     user.status === "pending" ? "PENDING VERIFICATION" :
                                                 "SUSPENDED"}
                  </span>
                </td>

                {/* Last login */}
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-brand-blue">{user.lastLogin}</p>
                  {user.lastLoginTime && <p className="text-xs text-slate-400">{user.lastLoginTime}</p>}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* View details */}
                    <button
                      onClick={() => setPanel(panel?.id === user.id ? null : user)}
                      title="View details"
                      aria-label="View user details"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:bg-brand-blue/10 hover:text-brand-blue flex items-center justify-center transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </button>

                    {/* Suspend / Restore */}
                    {user.status === "suspended" ? (
                      <button
                        onClick={() => restore(user.id)}
                        disabled={actionLoading === user.id}
                        title="Restore access"
                        aria-label="Restore user access"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => suspend(user.id)}
                        disabled={actionLoading === user.id}
                        title="Suspend user"
                        aria-label="Suspend user"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={actionLoading === user.id}
                      title="Delete user"
                      aria-label="Delete user"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-600 flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-brand">{filtered.length}</span> user{filtered.length !== 1 ? "s" : ""}
            {tab !== "all" && <> · filtered by <span className="font-bold text-brand-blue">{tab}</span></>}
          </p>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-blue transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Detail panel (slide-in) */}
      {panel && (() => {
        const u = users.find((x) => x.id === panel.id) ?? panel;
        return (
          <>
            <style>{`
              @keyframes panelSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
              .panel-slide-up { animation: panelSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }
            `}</style>
            <div className="panel-slide-up bg-white border border-gray-100 rounded-2xl p-6 space-y-5" data-gsap="fade-up">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base ${
                    u.status === "suspended" ? "bg-red-100 text-red-500"     :
                    u.status === "pending"   ? "bg-amber-100 text-amber-600" :
                                               "bg-brand-blue/10 text-brand-blue"
                  }`}>{u.avatar}</div>
                  <div>
                    <h2 className="text-base font-black text-brand">{u.name}</h2>
                    <p className="text-sm text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                  <button
                    onClick={() => setPanel(null)}
                    aria-label="Close user details panel"
                    className="p-1.5 text-slate-400 hover:text-brand hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    u.status === "active"  ? "text-green-600" :
                    u.status === "pending" ? "text-amber-500" :
                                             "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      u.status === "active"  ? "bg-green-500" :
                      u.status === "pending" ? "bg-amber-400" :
                                               "bg-red-500"
                    }`} />
                    {u.status === "active"  ? "Active" :
                     u.status === "pending" ? "Pending Verification" :
                                              "Suspended"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Last Login</p>
                  <p className="text-sm font-bold text-brand">{u.lastLogin}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Permissions</p>
                  <p className="text-sm font-bold text-brand">{u.permissions.length} assigned</p>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Assigned Permissions</p>
                {u.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {u.permissions.map((p) => (
                      <span key={p} className="px-3 py-1.5 bg-blue-50 text-brand-blue text-xs font-semibold rounded-lg">{p}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No permissions assigned yet.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={actionLoading === u.id}
                  className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete User
                </button>
                <div className="flex items-center gap-2">
                  {u.status === "suspended" ? (
                    <button
                      onClick={() => restore(u.id)}
                      disabled={actionLoading === u.id}
                      className="px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      Restore Access
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => suspend(u.id)}
                        disabled={actionLoading === u.id}
                        className="px-5 py-2.5 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => toast("Edit profile coming soon", "info")}
                        className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      })()}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete this user?"
        description="This user's account and all associated data will be permanently removed. This action cannot be undone."
        confirmLabel="Delete User"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </main>
  );
}
