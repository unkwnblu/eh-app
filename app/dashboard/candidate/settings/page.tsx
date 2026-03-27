"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = "Profile" | "Experience" | "Account Settings";

type Experience = {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skills: string[];
  verified: boolean;
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_EXPERIENCES: Experience[] = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "Innovatech Solutions",
    location: "London, UK",
    startDate: "January 2021",
    endDate: "Present",
    current: true,
    description:
      "Leading the end-to-end design process for the flagship SaaS platform. Improved user retention by 24% through a complete navigation overhaul and accessibility audit.",
    skills: ["Product Design", "Team Leadership", "Design Systems"],
    verified: true,
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "BrightPath Agency",
    location: "Manchester, UK",
    startDate: "June 2018",
    endDate: "December 2020",
    current: false,
    description:
      "Crafted high-fidelity prototypes and marketing assets for diverse clients in fintech and healthcare. Managed multiple stakeholders and project timelines effectively.",
    skills: [],
    verified: false,
  },
];

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-brand-blue" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Experience card ───────────────────────────────────────────────────────────

function ExperienceCard({
  exp,
  onEdit,
  isEditing,
}: {
  exp: Experience;
  onEdit: () => void;
  isEditing: boolean;
}) {
  const duration = exp.current
    ? `${exp.startDate} — Present (3 years 2 months)`
    : `${exp.startDate} — ${exp.endDate} (2 years 6 months)`;

  return (
    <div className={`bg-white border rounded-2xl p-5 transition-all ${isEditing ? "border-brand-blue shadow-sm" : "border-gray-100"}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-brand">{exp.title}</h3>
              <p className="text-xs mt-0.5">
                <span className="font-semibold text-brand-blue">{exp.company}</span>
                <span className="text-slate-400"> · {exp.location}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {exp.verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Verified</span>
                </span>
              )}
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-slate-400 hover:text-brand-blue"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">{duration}</p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{exp.description}</p>

          {exp.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {exp.skills.map((skill) => (
                <span key={skill} className="px-2.5 py-0.5 bg-gray-100 text-slate-500 text-[11px] font-medium rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit panel ────────────────────────────────────────────────────────────────

function EditPanel({
  exp,
  hasUnsaved,
  onSave,
  onCancel,
}: {
  exp: Experience;
  hasUnsaved: boolean;
  onSave: (updated: Experience) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...exp });

  function update<K extends keyof Experience>(key: K, value: Experience[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-brand">Edit Experience</h3>
        {hasUnsaved && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Unsaved Changes</span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brand mb-1.5">Job Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand mb-1.5">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand mb-1.5">Location (UK)</label>
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-brand mb-1.5">Start Date</label>
            <input
              type="text"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand mb-1.5">End Date</label>
            <input
              type="text"
              value={form.current ? "Present" : form.endDate}
              disabled={form.current}
              onChange={(e) => update("endDate", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors disabled:opacity-50"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <div
                onClick={() => update("current", !form.current)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${form.current ? "bg-brand-blue border-brand-blue" : "border-gray-300"}`}
              >
                {form.current && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-slate-500">I currently work here</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full px-3.5 py-2.5 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors resize-none leading-relaxed"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  // Profile tab state
  const [fullName, setFullName] = useState("Alex Thompson");
  const [contact, setContact] = useState("+44 7700 900000");
  const [bio, setBio] = useState(
    "Senior Product Designer with over 8 years of experience building high-scale healthcare platforms and fintech solutions. Focused on user-centric design systems and accessible web interfaces."
  );

  // Account Settings tab state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [accountPrivacy, setAccountPrivacy] = useState(true);

  // Experience tab state
  const [experiences, setExperiences] = useState(INITIAL_EXPERIENCES);
  const [editingId, setEditingId] = useState<number | null>(1);
  const [hasUnsaved, setHasUnsaved] = useState(true);

  const TABS: Tab[] = ["Profile", "Experience", "Account Settings"];

  function saveExperience(updated: Experience) {
    setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingId(null);
    setHasUnsaved(false);
  }

  return (
    <main className="flex-1 px-8 py-8">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-8" data-gsap="fade-down">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? "text-brand-blue" : "text-slate-500 hover:text-brand"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === "Profile" && (
        <>
          <div className="flex items-start justify-between mb-6" data-gsap="fade-down">
            <div>
              <h1 className="text-[28px] font-black text-brand tracking-tight">Profile &amp; Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your professional identity and account preferences.</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-green-700">RTW Verified</span>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-5" data-gsap="fade-up">
              {/* Personal Information */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <h2 className="text-sm font-bold text-brand">Personal Information</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contact Number</label>
                    <input type="text" value={contact} onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Professional Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                    className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm text-brand outline-none focus:border-brand-blue transition-colors resize-none leading-relaxed" />
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                  <h2 className="text-sm font-bold text-brand">Professional Details</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Current Role</p>
                    <p className="text-sm font-bold text-brand">Product Designer</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Experience</p>
                    <p className="text-sm font-bold text-brand">8+ Years</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Primary Sector</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-brand-blue">Healthcare</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-[280px] shrink-0 space-y-4" data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <h2 className="text-sm font-bold text-brand">Account Settings</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand">Email Notifications</p>
                      <p className="text-xs text-slate-400 mt-0.5">Daily job alerts &amp; updates</p>
                    </div>
                    <Toggle on={emailNotifs} onChange={() => setEmailNotifs((v) => !v)} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand">Account Privacy</p>
                      <p className="text-xs text-slate-400 mt-0.5">Visible to verified recruiters</p>
                    </div>
                    <Toggle on={accountPrivacy} onChange={() => setAccountPrivacy((v) => !v)} />
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-1">
                    <button className="w-full flex items-center justify-between px-1 py-2 hover:bg-gray-50 rounded-lg transition-colors group">
                      <span className="text-sm font-semibold text-brand">Update Password</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 group-hover:text-brand-blue transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                    <button className="w-full flex items-center justify-between px-1 py-2 hover:bg-red-50 rounded-lg transition-colors">
                      <span className="text-sm font-semibold text-red-500">Deactivate Account</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-brand-blue rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="white">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.399-.195-2.76-.554-4.035a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.761-3.08z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-base font-black text-white">100% Verified</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Your compliance status is fully up to date for the Healthcare sector.</p>
                <button className="mt-4 px-4 py-2 bg-white text-brand-blue text-xs font-bold rounded-xl hover:bg-white/90 transition-colors">
                  Download Badge
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100" data-gsap="fade-up">
            <button className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-brand transition-colors">Discard Changes</button>
            <button className="px-7 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">Save Profile</button>
          </div>
        </>
      )}

      {/* ── Experience tab ── */}
      {activeTab === "Experience" && (
        <>
          <div className="flex items-start justify-between mb-6" data-gsap="fade-down">
            <div>
              <h1 className="text-[28px] font-black text-brand tracking-tight">Professional Experience</h1>
              <p className="text-sm text-slate-500 mt-1">Showcase your career journey and key achievements.</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Experience
            </button>
          </div>

          <div className="flex gap-6 items-start">
            {/* Experience list */}
            <div className="flex-1 space-y-4" data-gsap="fade-up">
              {experiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  exp={exp}
                  isEditing={editingId === exp.id}
                  onEdit={() => { setEditingId(exp.id); setHasUnsaved(false); }}
                />
              ))}
            </div>

            {/* Right panel */}
            <div className="w-[300px] shrink-0 space-y-4" data-gsap="fade-up">
              {editingId !== null ? (
                <EditPanel
                  exp={experiences.find((e) => e.id === editingId)!}
                  hasUnsaved={hasUnsaved}
                  onSave={saveExperience}
                  onCancel={() => setEditingId(null)}
                />
              ) : null}

              {/* Verification CTA */}
              <div className="bg-brand-blue rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 opacity-10">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.399-.195-2.76-.554-4.035a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.761-3.08z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Verification Needed</span>
                </div>
                <h3 className="text-base font-black text-white">Get your experience badge</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Verified profiles are 3x more likely to be contacted by top recruiters.
                </p>
                <button className="mt-4 px-4 py-2 bg-white text-brand-blue text-xs font-bold rounded-xl hover:bg-white/90 transition-colors">
                  Start Verification
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Account Settings tab ── */}
      {activeTab === "Account Settings" && (
        <>
          <div className="mb-6" data-gsap="fade-down">
            <h1 className="text-[28px] font-black text-brand tracking-tight">Account Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your security, notifications, and privacy preferences.</p>
          </div>

          <div className="space-y-4" data-gsap="fade-up">
            {/* Row 1: Security + Privacy */}
            <div className="grid grid-cols-[1fr_320px] gap-4">
              {/* Security */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <h2 className="text-base font-bold text-brand">Security</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand mb-1.5">Current Password</label>
                    <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm outline-none focus:border-brand-blue transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-brand mb-1.5">New Password</label>
                      <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm outline-none focus:border-brand-blue transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand mb-1.5">Confirm New Password</label>
                      <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm outline-none focus:border-brand-blue transition-colors" />
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-base font-bold text-brand">Privacy</h2>
                </div>

                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-bold text-brand">Profile Visibility</p>
                    <p className="text-xs text-slate-400 mt-0.5">Control who can see your profile and activity.</p>
                  </div>
                  <Toggle on={accountPrivacy} onChange={() => setAccountPrivacy((v) => !v)} />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-brand-blue leading-relaxed">
                    <span className="font-bold">Pro-tip:</span> Keeping your profile &quot;Visible&quot; increases your chances of being headhunted by recruiters by 40%.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Notifications + Danger Zone */}
            <div className="grid grid-cols-[1fr_320px] gap-4">
              {/* Notifications */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                  </svg>
                  <h2 className="text-base font-bold text-brand">Notifications</h2>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Email Alerts */}
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-brand">Email Alerts</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Get updates on application status via email.</p>
                    <div className="mt-3">
                      <Toggle on={emailNotifs} onChange={() => setEmailNotifs((v) => !v)} />
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-brand">SMS Notifications</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Receive interview reminders via text.</p>
                    <div className="mt-3">
                      <Toggle on={false} onChange={() => {}} />
                    </div>
                  </div>

                  {/* Marketing */}
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-brand">Marketing</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">News and special offers from partners.</p>
                    <div className="mt-3">
                      <Toggle on={false} onChange={() => {}} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white border border-red-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h2 className="text-base font-bold text-red-500">Danger Zone</h2>
                </div>

                <p className="text-sm font-bold text-brand mb-2">Deactivate Account</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-5">
                  Once you deactivate your account, your profile will be hidden from recruiters. This action can be undone later by logging back in.
                </p>

                <button className="w-full py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8" data-gsap="fade-up">
            Last security audit: October 24, 2023. Managed by Portal Secure™ Engine.
          </p>
        </>
      )}
    </main>
  );
}
