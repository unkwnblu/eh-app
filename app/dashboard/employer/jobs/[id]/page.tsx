"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GsapAnimations from "@/components/landing/GsapAnimations";
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

type ComplianceStatus = "rtw-verified" | "dbs-verified" | "in-pipeline";
type ColumnKey = "new" | "interviewing" | "offers" | "rejected";

type Candidate = {
  id: string;         // application id (used for dnd-kit)
  candidateId: string;
  name: string;
  appliedAt: string;
  compliance: ComplianceStatus;
  column: ColumnKey;
};

type JobDetail = {
  id: string;
  title: string;
  sector: string;
  employmentType: string;
  location: string;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  status: "draft" | "review" | "live" | "closed";
  createdAt: string;
  closesAt: string | null;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "new",          label: "New Applications" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offers",       label: "Offers" },
  { key: "rejected",     label: "Rejected" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Salary not specified";
  const fmt = (n: number) => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function statusColor(status: JobDetail["status"]): string {
  switch (status) {
    case "live":   return "text-green-600";
    case "review": return "text-amber-600";
    case "closed": return "text-slate-400";
    default:       return "text-slate-400";
  }
}

function statusDot(status: JobDetail["status"]): string {
  switch (status) {
    case "live":   return "bg-green-500";
    case "review": return "bg-amber-400";
    case "closed": return "bg-slate-300";
    default:       return "bg-slate-300";
  }
}

// ─── Compliance badge ──────────────────────────────────────────────────────────

function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  if (status === "rtw-verified") return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">RTW Verified</span>
    </div>
  );
  if (status === "dbs-verified") return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-blue shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-blue">DBS Verified</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">In Pipeline</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonPipeline() {
  return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-gray-200 rounded-xl" />
          <div className="flex gap-4">
            <div className="h-4 w-28 bg-gray-100 rounded-lg" />
            <div className="h-4 w-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-3">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-8 w-10 bg-gray-200 rounded" />
            <div className="h-0.5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      {/* Columns skeleton */}
      <div className="flex gap-4 flex-1 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col w-[300px] shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="w-5 h-5 rounded-full bg-gray-200" />
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-3 space-y-3 min-h-[400px]">
              {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                <div key={j} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-8 bg-gray-50 rounded-lg border border-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
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

  const initials = candidate.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-brand-blue">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand truncate">{candidate.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Applied {relativeTime(candidate.appliedAt)}</p>
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

  const [job,        setJob]        = useState<JobDetail | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [overColumn,  setOverColumn]  = useState<ColumnKey | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Load data ───────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${id}`);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to load job");
      }
      const data = await res.json() as {
        job: JobDetail;
        pipeline: Array<{
          id: string;
          candidateId: string;
          name: string;
          stage: ColumnKey;
          appliedAt: string;
          compliance: ComplianceStatus;
        }>;
      };
      setJob(data.job);
      setCandidates(
        data.pipeline.map((p) => ({
          id:          p.id,
          candidateId: p.candidateId,
          name:        p.name,
          appliedAt:   p.appliedAt,
          compliance:  p.compliance,
          column:      p.stage,
        }))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ─── Drag helpers ─────────────────────────────────────────────────────────────

  const activeCandidate = candidates.find((c) => c.id === activeId) ?? null;

  function getColumn(overId: string): ColumnKey | null {
    if (COLUMNS.some((col) => col.key === overId)) return overId as ColumnKey;
    return candidates.find((c) => c.id === overId)?.column ?? null;
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const overCol  = getColumn(over.id as string);
    setOverColumn(overCol);
    const activeCol = getColumn(active.id as string);
    if (!overCol || activeCol === overCol) return;
    setCandidates((prev) =>
      prev.map((c) => c.id === active.id ? { ...c, column: overCol } : c)
    );
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;
    const overCol = getColumn(over.id as string);
    if (!overCol) return;

    const candidate = candidates.find((c) => c.id === active.id);
    if (!candidate || candidate.column === overCol) return;

    // Optimistic update already applied in onDragOver — persist to API
    setCandidates((prev) =>
      prev.map((c) => c.id === active.id ? { ...c, column: overCol } : c)
    );

    try {
      await fetch(`/api/employer/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: active.id, stage: overCol }),
      });
    } catch {
      // Silently revert on failure
      load();
    }
  }

  // ─── Computed stats ───────────────────────────────────────────────────────────

  const totalApplied   = candidates.length;
  const newCount       = candidates.filter((c) => c.column === "new").length;
  const interviewCount = candidates.filter((c) => c.column === "interviewing").length;
  const offersCount    = candidates.filter((c) => c.column === "offers").length;

  const stats = [
    { label: "Total Applied",  value: totalApplied },
    { label: "New",            value: newCount },
    { label: "Interviewing",   value: interviewCount },
    { label: "Offers",         value: offersCount },
  ];

  const lastUpdated = candidates.length > 0
    ? relativeTime(candidates.reduce((latest, c) =>
        c.appliedAt > latest ? c.appliedAt : latest,
        candidates[0].appliedAt
      ))
    : "—";

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <SkeletonPipeline />;

  if (error) return (
    <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-bold text-brand">{error}</p>
        <button onClick={load} className="text-sm font-semibold text-brand-blue underline">Try again</button>
      </div>
    </main>
  );

  if (!job) return null;

  return (
    <>
      <GsapAnimations />
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col">

        {/* Back + Job header */}
        <div data-gsap="fade-down" className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            {/* Breadcrumb */}
            <Link
              href="/dashboard/employer/jobs"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-blue mb-3 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Jobs
            </Link>

            {/* Title + status */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-brand tracking-tight">{job.title}</h1>
              <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${statusColor(job.status)}`}>
                <span className={`w-2 h-2 rounded-full ${statusDot(job.status)}`} />
                {job.status}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {job.location}{job.remote ? " · Remote" : ""}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.employmentType}
              </span>
              {job.closesAt && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Closes {new Date(job.closesAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/dashboard/employer/jobs/${id}/edit`}
            className="self-start bg-brand text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-brand-blue transition-colors"
          >
            Edit Job
          </Link>
        </div>

        {/* Stats */}
        <div data-gsap="fade-up" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-brand leading-none">{stat.value}</p>
              </div>
              <div className="mt-3 h-0.5 bg-brand-blue/20 rounded-full">
                <div
                  className="h-full bg-brand-blue rounded-full transition-all"
                  style={{ width: totalApplied > 0 ? `${(stat.value / totalApplied) * 100}%` : "0%" }}
                />
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
            <span className="w-2 h-2 rounded-full bg-green-500" /> RTW Verified
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-blue" /> DBS Verified
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> In Pipeline
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Total Candidates: {String(totalApplied).padStart(2, "0")}</span>
          <span className="text-slate-200">|</span>
          <span>Last Activity: {lastUpdated}</span>
        </div>
      </footer>
    </>
  );
}
