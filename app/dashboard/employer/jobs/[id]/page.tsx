"use client";

import { useState } from "react";
import Link from "next/link";
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
    <>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col">
        {/* Job header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      <footer className="border-t border-gray-100 bg-white px-6 py-3 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
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
    </>
  );
}
