"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ComplianceStatus = "rtw-verified" | "awaiting-dbs" | "in-pipeline";
type ColumnKey = "new" | "interviewing" | "offers" | "rejected";

type Candidate = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  isNew: boolean;
  compliance: ComplianceStatus;
  column: ColumnKey;
};

// ─── Initial data ──────────────────────────────────────────────────────────────

const JOB = {
  title: "Senior Support Worker",
  breadcrumb: "Healthcare Assistant - London",
  location: "Central London",
  salary: "£28k–£32k",
  type: "Full-time",
};

const STATS = [
  { label: "Applied", value: 12, delta: "+4" },
  { label: "Shortlisted", value: 8, delta: "+2" },
  { label: "Interviewing", value: 5, delta: "+1" },
  { label: "Offers", value: 2, delta: "+1" },
];

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "new", label: "New Applications" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offers", label: "Offers" },
  { key: "rejected", label: "Rejected" },
];

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Sarah Jenkins", specialty: "Healthcare / Nursing", experience: "3 YRS", isNew: true, compliance: "rtw-verified", column: "new" },
  { id: "c2", name: "Marcus Wright", specialty: "Healthcare / Support", experience: "5 YRS", isNew: true, compliance: "awaiting-dbs", column: "new" },
  { id: "c3", name: "Priya Sharma", specialty: "Healthcare / Nursing", experience: "4 YRS", isNew: false, compliance: "rtw-verified", column: "interviewing" },
  { id: "c4", name: "David Park", specialty: "Healthcare / Nursing", experience: "2 YRS", isNew: false, compliance: "awaiting-dbs", column: "interviewing" },
  { id: "c5", name: "Amara Osei", specialty: "Healthcare / Nursing", experience: "6 YRS", isNew: true, compliance: "in-pipeline", column: "offers" },
];

// ─── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/employer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
  { label: "Job Management", href: "/dashboard/employer/jobs", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
  { label: "Shift Management", href: "/dashboard/employer/shifts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "Messaging", href: "/dashboard/employer/messages", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> },
  { label: "Legal", href: "/dashboard/employer/legal", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg> },
  { label: "Settings", href: "/dashboard/employer/settings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
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
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-brand-blue text-white shadow-sm" : "text-slate-500 hover:bg-gray-50 hover:text-brand"}`}>
              <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-5 space-y-0.5 border-t border-gray-100 pt-4">
        <Link href="/dashboard/employer/support" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-gray-50 hover:text-brand transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
          Support
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          LogOut
        </button>
      </div>
    </aside>
  );
}

// ─── Compliance badge ──────────────────────────────────────────────────────────

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  if (status === "rtw-verified") return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">RTW Verified</span>
    </div>
  );
  if (status === "awaiting-dbs") return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Awaiting DBS</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-blue shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-blue">In Pipeline</span>
    </div>
  );
}

// ─── Sortable candidate card ───────────────────────────────────────────────────

function CandidateCard({ candidate, isDragging = false }: { candidate: Candidate; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl p-4 select-none ${isDragging ? "shadow-2xl rotate-1 border-brand-blue/30" : "border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col gap-[3px] pt-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          {[0, 1].map((r) => (
            <div key={r} className="flex gap-[3px]">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1 h-1 rounded-full bg-slate-300" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand">{candidate.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{candidate.specialty}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-blue text-white rounded-full px-2.5 py-1">
              Experience: {candidate.experience}
            </span>
            {candidate.isNew && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-brand text-white rounded-full px-2.5 py-1">
                New
              </span>
            )}
          </div>
        </div>
      </div>
      <ComplianceBadge status={candidate.compliance} />
    </div>
  );
}

// ─── Droppable column ──────────────────────────────────────────────────────────

function KanbanColumn({ col, candidates, isOver }: { col: { key: ColumnKey; label: string }; candidates: Candidate[]; isOver: boolean }) {
  const isRejected = col.key === "rejected";
  const { setNodeRef } = useDroppable({ id: col.key });

  return (
    <div className="flex flex-col w-[300px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className={`text-sm font-bold ${isRejected ? "text-red-500" : "text-brand"}`}>{col.label}</h3>
        <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center ${isRejected ? "bg-red-400" : "bg-brand"}`}>
          {candidates.length}
        </span>
      </div>
      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`flex-1 rounded-2xl p-3 space-y-3 min-h-[400px] transition-colors ${
          isOver
            ? isRejected ? "bg-red-100 ring-2 ring-red-200" : "bg-brand-blue/8 ring-2 ring-brand-blue/20"
            : isRejected ? "bg-red-50/70" : "bg-[#F0F2F5]"
        }`}>
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c} />
          ))}
          {candidates.length === 0 && (
            <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-300 font-medium">Drop here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ColumnKey | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeCandidate = candidates.find((c) => c.id === activeId) ?? null;

  function getColumn(id: string): ColumnKey | null {
    // id is a column key directly (dropped onto column background)
    if (COLUMNS.some((col) => col.key === id)) return id as ColumnKey;
    // id is a candidate — return its current column
    return candidates.find((c) => c.id === id)?.column ?? null;
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const overCol = getColumn(over.id as string);
    setOverColumn(overCol);

    const activeCol = getColumn(active.id as string);
    if (!overCol || activeCol === overCol) return;

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, column: overCol } : c
      )
    );
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;
    const overCol = getColumn(over.id as string);
    if (!overCol) return;

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, column: overCol } : c
      )
    );
  }

  const totalCandidates = candidates.length;

  return (
    <div className="flex-1 bg-[#F7F8FA]">
      <Sidebar active="Job Management" />

      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/employer/jobs" className="text-xs font-semibold text-slate-400 hover:text-brand-blue transition-colors uppercase tracking-wider">
              Active Roles
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">{JOB.breadcrumb}</span>
          </div>
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search candidates, jobs, or shifts..." className="w-full bg-[#F7F8FA] border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:bg-white transition-colors" />
          </div>
          <button className="relative w-10 h-10 rounded-xl border border-gray-100 bg-[#F7F8FA] flex items-center justify-center text-slate-400 hover:text-brand transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          </button>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-semibold text-brand leading-none">John Doe</p>
              <p className="text-xs text-slate-400 mt-0.5">Company Name</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200" />
          </div>
        </header>

        <main className="flex-1 px-8 py-8 flex flex-col">
          {/* Job header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-brand tracking-tight">{JOB.title}</h1>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Live
                </span>
              </div>
              <div className="flex items-center gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {JOB.location}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                  {JOB.salary}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {JOB.type}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/employer/jobs/${id}/edit`} className="bg-brand text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-brand-blue transition-colors">
              Edit Job
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-brand leading-none">{stat.value}</p>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-brand-blue mb-0.5">
                    {stat.delta}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                  </span>
                </div>
                <div className="mt-3 h-0.5 bg-brand-blue/20 rounded-full">
                  <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(stat.value / 12) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Kanban board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.key}
                  col={col}
                  candidates={candidates.filter((c) => c.column === col.key)}
                  isOver={overColumn === col.key}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activeCandidate && (
                <CandidateCard candidate={activeCandidate} isDragging />
              )}
            </DragOverlay>
          </DndContext>
        </main>

        {/* Status bar */}
        <footer className="border-t border-gray-100 bg-white px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Ready for Deployment
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Action Required
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="w-2 h-2 rounded-full bg-brand-blue" /> In Pipeline
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Total Candidates: {String(totalCandidates).padStart(2, "0")}</span>
            <span className="text-slate-200">|</span>
            <span>Last Updated: 2m ago</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
