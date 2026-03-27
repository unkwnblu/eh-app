"use client";

import Link from "next/link";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Mock data ──────────────────────────────────────────────────────────────

const PROFILE = {
  name: "Candidate Name",
  initials: "CN",
  title: "Senior Product Designer",
  location: "London, UK",
  email: "jeddy123@gmail.com",
  bio: "Passionate designer with 6+ years of experience building digital products for healthcare and fintech. I thrive in compliance-heavy environments and bring a research-driven approach to every project.",
  completeness: 82,
  skills: [
    "Product Design", "Figma", "UX Research", "Design Systems",
    "Prototyping", "Accessibility", "Healthcare Tech",
  ],
};

const EXPERIENCE = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "Innovatech Solutions",
    location: "London, UK",
    period: "Jan 2021 — Present",
    current: true,
    verified: true,
    description: "Leading end-to-end design for the flagship SaaS platform. Improved user retention by 24% through a full navigation overhaul and accessibility audit.",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "BrightPath Agency",
    location: "Manchester, UK",
    period: "Jun 2018 — Dec 2020",
    current: false,
    verified: false,
    description: "Crafted high-fidelity prototypes and marketing assets for fintech and healthcare clients across multiple concurrent projects.",
  },
];

const DOCUMENTS = [
  { label: "DBS Check",        status: "verified",  expiry: "Expires Nov 2026" },
  { label: "Right to Work",    status: "verified",  expiry: "Indefinite"       },
  { label: "NMC Registration", status: "pending",   expiry: "Awaiting review"  },
  { label: "Reference Letter", status: "missing",   expiry: "Not submitted"    },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusChip(status: string) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Verified
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
      Missing
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CandidateProfilePage() {
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
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue text-2xl font-black shrink-0">
            {PROFILE.initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-xl font-black text-brand">{PROFILE.name}</h2>
              <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-wide rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-0.5">{PROFILE.title}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {PROFILE.location}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {PROFILE.email}
              </span>
            </div>

            {/* Completeness */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Profile Completeness</span>
                <span className="text-xs font-bold text-brand-blue">{PROFILE.completeness}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full transition-all"
                  style={{ width: `${PROFILE.completeness}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Add more experience and documents to reach 100%</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 pt-5 border-t border-gray-50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">About</p>
          <p className="text-sm text-slate-500 leading-relaxed">{PROFILE.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column — Skills + Experience */}
        <div className="md:col-span-2 space-y-6">

          {/* Skills */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {PROFILE.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-5">Experience</h3>
            <div className="space-y-6">
              {EXPERIENCE.map((exp, i) => (
                <div key={exp.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${exp.current ? "bg-brand-blue" : "bg-gray-300"}`} />
                    {i < EXPERIENCE.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div>
                        <p className="text-sm font-bold text-brand">{exp.title}</p>
                        <p className="text-xs text-slate-500">{exp.company} · {exp.location}</p>
                      </div>
                      {exp.verified
                        ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 shrink-0">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Verified
                          </span>
                        : <span className="text-[10px] font-bold text-slate-300 shrink-0">Unverified</span>
                      }
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-2">{exp.period}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Compliance docs */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Compliance Documents</h3>
            <div className="space-y-3">
              {DOCUMENTS.map((doc) => (
                <div key={doc.label} className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">{doc.label}</p>
                    <p className="text-[11px] text-slate-400">{doc.expiry}</p>
                  </div>
                  {statusChip(doc.status)}
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/candidate/settings"
              className="block w-full mt-4 text-center text-xs font-semibold text-brand-blue hover:underline"
            >
              Manage documents →
            </Link>
          </div>

          {/* Quick stats */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6" data-gsap="fade-up">
            <h3 className="text-sm font-bold text-brand mb-4">Activity</h3>
            <div className="space-y-3">
              {[
                { label: "Applications sent",  value: "24" },
                { label: "Profile views",       value: "138" },
                { label: "Saved by employers",  value: "7"  },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className="text-sm font-bold text-brand">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
