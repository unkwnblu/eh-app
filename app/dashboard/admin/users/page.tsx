"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = "active" | "suspended";
type UserRole   = "Candidate" | "Employer" | "Admin";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  lastLogin: string;
  lastLoginTime: string;
  permissions: string[];
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const USERS: AdminUser[] = [
  { id: 1,  name: "Marcus Sterling",  email: "marcus.s@example.com",        role: "Candidate", avatar: "MS", status: "active",    lastLogin: "Oct 24, 2023", lastLoginTime: "14:22 PM", permissions: ["Job Applications", "Profile Management"] },
  { id: 2,  name: "Sarah Chen",       email: "sarah@pixeltech.io",           role: "Employer",  avatar: "SC", status: "active",    lastLogin: "Oct 23, 2023", lastLoginTime: "09:15 AM", permissions: ["Job Posting", "Candidate Search", "Analytics"] },
  { id: 3,  name: "David Vane",       email: "vane.d@outlook.com",           role: "Candidate", avatar: "DV", status: "suspended", lastLogin: "Sep 12, 2023", lastLoginTime: "18:04 PM", permissions: ["Job Applications"] },
  { id: 4,  name: "Leila Jabbour",    email: "l.jabbour@recruitadmin.com",   role: "Admin",     avatar: "LJ", status: "active",    lastLogin: "Just Now",     lastLoginTime: "10:45 AM", permissions: ["Job Moderation", "Candidate Verification", "User Management", "Settings"] },
  { id: 5,  name: "Thomas Reeves",    email: "t.reeves@globalfin.com",       role: "Employer",  avatar: "TR", status: "active",    lastLogin: "Oct 22, 2023", lastLoginTime: "11:30 AM", permissions: ["Job Posting", "Candidate Search"] },
  { id: 6,  name: "Amara Osei",       email: "amara.osei@example.com",       role: "Candidate", avatar: "AO", status: "active",    lastLogin: "Oct 21, 2023", lastLoginTime: "16:50 PM", permissions: ["Job Applications", "Profile Management"] },
  { id: 7,  name: "James Okafor",     email: "james@edgeharbour.co.uk",      role: "Admin",     avatar: "JO", status: "active",    lastLogin: "Oct 24, 2023", lastLoginTime: "08:12 AM", permissions: ["Reports", "Candidate Verification"] },
  { id: 8,  name: "Priya Sharma",     email: "priya@swiftlogistics.co.uk",   role: "Employer",  avatar: "PS", status: "suspended", lastLogin: "Sep 30, 2023", lastLoginTime: "13:05 PM", permissions: [] },
];

const ROLES: UserRole[] = ["Candidate", "Employer", "Admin"];

const ROLE_STYLES: Record<UserRole, string> = {
  Candidate: "bg-blue-50 text-blue-600",
  Employer:  "bg-purple-50 text-purple-600",
  Admin:     "bg-amber-50 text-amber-700",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers]       = useState<AdminUser[]>(USERS);
  const [tab, setTab]           = useState<"all" | UserRole>("all");
  const [panel, setPanel]       = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName]   = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole]   = useState<UserRole>("Candidate");

  const filtered = tab === "all" ? users : users.filter((u) => u.role === tab);

  const [usersLoading] = useState(false);
  const [usersError, setUsersError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  function suspend(id: number) {
    setUsers((p) => p.map((u) => u.id === id ? { ...u, status: "suspended" } : u));
    toast("User suspended", "info");
  }
  function restore(id: number) {
    setUsers((p) => p.map((u) => u.id === id ? { ...u, status: "active" } : u));
    toast("User access restored", "success");
  }
  function deleteUser(id: number) { setConfirmDeleteId(id); }
  function confirmDelete() {
    setUsers((p) => p.filter((u) => u.id !== confirmDeleteId));
    if (panel?.id === confirmDeleteId) setPanel(null);
    setConfirmDeleteId(null);
    toast("User deleted", "success");
  }

  function addUser() {
    if (!newName || !newEmail) return;
    const initials = newName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const u: AdminUser = {
      id: Date.now(), name: newName, email: newEmail, role: newRole,
      avatar: initials, status: "active", lastLogin: "Just Now", lastLoginTime: "", permissions: [],
    };
    setUsers((p) => [u, ...p]);
    setShowForm(false);
    setNewName(""); setNewEmail(""); setNewRole("Candidate");
  }

  const totalActive    = users.filter((u) => u.status === "active").length;
  const totalSuspended = users.filter((u) => u.status === "suspended").length;

  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">

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
          <h3 className="text-sm font-bold text-brand mb-4">New User Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} type="text" placeholder="e.g. Jane Smith"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address</label>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={addUser} className="px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
              Create Profile
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
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
          <p className="text-2xl font-black text-brand-blue">12,482</p>
          <p className="text-xs text-green-500 font-semibold mt-1">+12% from last month</p>
        </div>

        {/* Active */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">Active Now</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">842</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Real-time sessions</p>
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
          <p className="text-2xl font-black text-brand-blue">14</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Requiring review</p>
        </div>

        {/* New Signups */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400">New Signups</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-orange-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue">156</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Past 24 hours</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" data-gsap="fade-up">

        {/* Tab bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-gray-100">
          <div className="flex gap-1" role="tablist" aria-label="Filter users by role">
            {(["all", "Employer", "Candidate", "Admin"] as const).map((t) => (
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
            <button
              aria-label="Sort users"
              className="p-2 text-slate-400 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
              </svg>
            </button>
            <button
              aria-label="Export users"
              className="p-2 text-slate-400 hover:text-brand hover:bg-gray-50 rounded-lg transition-colors"
            >
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
                  <ErrorState message="Unable to load users." onRetry={() => setUsersError(false)} />
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
                      user.status === "suspended" ? "bg-red-100 text-red-500" : "bg-brand-blue/10 text-brand-blue"
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
                    user.status === "active" ? "text-green-600" : "text-red-500"
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      user.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    {user.status === "active" ? "ACTIVE" : "SUSPENDED"}
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
                        title="Restore access"
                        aria-label="Restore user access"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => suspend(user.id)}
                        title="Suspend user"
                        aria-label="Suspend user"
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteUser(user.id)}
                      title="Delete user"
                      aria-label="Delete user"
                      className="w-8 h-8 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-brand">1–10</span> of <span className="font-bold text-brand-blue">12,482</span> users
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-gray-100 text-slate-400 hover:bg-gray-50 flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            {[1, 2, 3].map((n) => (
              <button key={n} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                n === 1 ? "bg-brand-blue text-white" : "border border-gray-100 text-slate-500 hover:bg-gray-50"
              }`}>{n}</button>
            ))}
            <span className="px-1 text-slate-400 text-xs">...</span>
            <button className="w-8 h-8 rounded-lg border border-gray-100 text-xs font-bold text-slate-500 hover:bg-gray-50 transition-colors">1,248</button>
            <button className="w-8 h-8 rounded-lg border border-gray-100 text-slate-400 hover:bg-gray-50 flex items-center justify-center transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
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
                    u.status === "suspended" ? "bg-red-100 text-red-500" : "bg-brand-blue/10 text-brand-blue"
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === "active" ? "text-green-600" : "text-red-500"}`}>
                    <span className={`w-2 h-2 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                    {u.status === "active" ? "Active" : "Suspended"}
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
                <button onClick={() => deleteUser(u.id)} className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  Delete User
                </button>
                <div className="flex items-center gap-2">
                  {u.status === "suspended" ? (
                    <button onClick={() => restore(u.id)} className="px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors">
                      Restore Access
                    </button>
                  ) : (
                    <>
                      <button onClick={() => suspend(u.id)} className="px-5 py-2.5 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-50 transition-colors">
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
