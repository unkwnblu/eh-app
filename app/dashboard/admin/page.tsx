"use client";

import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────

const VERIFICATION_QUEUE = [
  { id: 1, name: "Sarah Jenkins",   sector: "FinTech / SaaS",  files: 4 },
  { id: 2, name: "Marcus Osei",     sector: "Healthcare",       files: 4 },
  { id: 3, name: "Priya Kapoor",    sector: "Logistics",        files: 3 },
  { id: 4, name: "Tom Whitfield",   sector: "Hospitality",      files: 4 },
];

const MODERATION_QUEUE = [
  { id: 1, employer: "Global Nexus Corp",    title: "Senior Project Lead",  posted: "2h ago"    },
  { id: 2, employer: "Arcane Dynamics",      title: "Cloud Architect",      posted: "5h ago"    },
  { id: 3, employer: "Swift Logistics",      title: "Operations Manager",   posted: "Yesterday" },
  { id: 4, employer: "Heritage Care Homes",  title: "Senior Care Assistant",posted: "Yesterday" },
];

const USERS = [
  { id: 1, name: "Linda Thompson", role: "Content Moderator",  avatar: "LT", status: "active"    },
  { id: 2, name: "Robert King",    role: "Security Auditor",   avatar: "RK", status: "active"    },
  { id: 3, name: "Samira Aziz",    role: "Profile Suspended",  avatar: "SA", status: "suspended" },
];

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, badge, badgeVariant, trend,
}: {
  label: string;
  value: string;
  badge?: string;
  badgeVariant?: "urgent" | "live" | "positive";
  trend?: string;
}) {
  const badgeStyles = {
    urgent:   "bg-amber-100 text-amber-700",
    live:     "bg-green-100 text-green-700",
    positive: "bg-blue-50 text-brand-blue",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5" data-gsap="fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        {badge && badgeVariant && (
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${badgeStyles[badgeVariant]}`}>
            {badge}
          </span>
        )}
        {trend && (
          <span className="text-xs font-bold text-green-600">{trend}</span>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-3xl font-black text-brand mt-1">{value}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-gsap="fade-down">
        <StatCard label="Total Active Jobs"       value="1,482" trend="+12.5%"  />
        <StatCard label="Pending Verifications"   value="86"    badge="Urgent"  badgeVariant="urgent" />
        <StatCard label="Registered Employers"    value="432"   badge="Live"    badgeVariant="live"   />
        <StatCard label="Total Placements"        value="2,904" trend="+5.2%"   />
      </div>

      {/* Main row: Verification + Moderation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Candidate Verification Tagging */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Candidate Verification Tagging</h2>
            </div>
            <Link href="/dashboard/admin/verification" className="text-xs font-semibold text-brand-blue hover:underline">
              View All
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2 px-2">
          <div className="min-w-[420px]">
          <div className="grid grid-cols-[1fr_1fr_80px_100px] gap-3 px-3 mb-2">
            {["Candidate Name", "Target Sector", "Docs", "Action"].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</p>
            ))}
          </div>

          <div className="space-y-2">
            {VERIFICATION_QUEUE.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_80px_100px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue text-[10px] font-bold shrink-0">
                    {row.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-sm font-semibold text-brand truncate">{row.name}</span>
                </div>
                <span className="text-sm text-slate-500">{row.sector}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-brand-blue text-[11px] font-bold rounded-lg w-fit">
                  {row.files} Files
                </span>
                <Link
                  href={`/dashboard/admin/verification/${row.id}`}
                  className="px-3 py-1.5 bg-brand-blue text-white text-[11px] font-bold rounded-lg hover:bg-brand-blue-dark transition-colors text-center"
                >
                  Review &amp; Tag
                </Link>
              </div>
            ))}
          </div>
          </div>{/* min-w */}
          </div>{/* overflow-x-auto */}
        </div>

        {/* Job Moderation Queue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <h2 className="text-sm font-bold text-brand">Job Moderation Queue</h2>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded-lg">
              {MODERATION_QUEUE.length * 3 + 2} Pending
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2 px-2">
          <div className="min-w-[400px]">
          <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 px-3 mb-2">
            {["Employer Name", "Job Title", "Posted", "Actions"].map((h) => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</p>
            ))}
          </div>

          <div className="space-y-1">
            {MODERATION_QUEUE.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-sm font-semibold text-brand truncate">{row.employer}</span>
                <span className="text-sm text-slate-500 truncate">{row.title}</span>
                <span className="text-xs text-slate-400">{row.posted}</span>
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors" title="Approve">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                  <button className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors" title="Reject">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>{/* min-w */}
          </div>{/* overflow-x-auto */}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-brand">User Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage administrative access and system level permissions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/admin/users/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Create New User Profile
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Manage All Roles
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {USERS.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                user.status === "suspended" ? "border-red-100 bg-red-50/40" : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                user.status === "suspended" ? "bg-red-100 text-red-500" : "bg-brand-blue/10 text-brand-blue"
              }`}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-brand truncate">{user.name}</p>
                <p className={`text-xs mt-0.5 font-medium truncate ${user.status === "suspended" ? "text-red-500" : "text-slate-400"}`}>
                  {user.role}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {user.status === "suspended" ? (
                  <>
                    <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="Restore">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="p-1.5 rounded-lg hover:bg-gray-200 text-slate-400 transition-colors" title="Edit">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-200 text-slate-400 transition-colors" title="Suspend">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
