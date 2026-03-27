"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ─── Data ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard/employer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Job Management",
    href: "/dashboard/employer/jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    label: "Shift Management",
    href: "/dashboard/employer/shifts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Legal",
    href: "/dashboard/employer/legal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/employer/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Active label helper ────────────────────────────────────────────────────────

function getActiveLabel(pathname: string): string {
  if (pathname === "/dashboard/employer") return "Dashboard";
  if (pathname.startsWith("/dashboard/employer/jobs")) return "Job Management";
  if (pathname.startsWith("/dashboard/employer/shifts")) return "Shift Management";
  if (pathname.startsWith("/dashboard/employer/legal")) return "Legal";
  if (pathname.startsWith("/dashboard/employer/settings")) return "Settings";
  if (pathname.startsWith("/dashboard/employer/support")) return "Support";
  return "";
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const pathname = usePathname();
  const active = getActiveLabel(pathname);
  const isSupport = active === "Support";

  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen flex flex-col bg-white border-r border-gray-100 z-40">
      <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/eh-logo.svg" alt="Edge Harbour" width={28} height={28} priority />
          <span className="text-brand font-bold text-base tracking-tight leading-none">
            Edge<span className="text-brand-blue">Harbour</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-500 hover:bg-gray-50 hover:text-brand"
              }`}
            >
              <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-0.5 border-t border-gray-100 pt-4">
        <Link
          href="/dashboard/employer/support"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isSupport
              ? "bg-brand-blue text-white shadow-sm"
              : "text-slate-500 hover:bg-gray-50 hover:text-brand"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={isSupport ? "text-white" : "text-slate-400"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Support
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          LogOut
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <div className="h-[72px] flex items-center gap-4 px-8 bg-white border-b border-gray-100">
      <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search candidates, jobs, or shifts..."
          className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
        />
      </div>
      <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </button>
      <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
        <div className="text-right">
          <p className="text-sm font-semibold text-brand leading-none">John Doe</p>
          <p className="text-xs text-slate-400 mt-0.5">Company Name</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-slate-500 text-sm font-semibold">
          JD
        </div>
      </div>
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <div className="ml-[260px] flex flex-col min-h-screen flex-1">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
