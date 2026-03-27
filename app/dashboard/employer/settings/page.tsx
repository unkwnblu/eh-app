"use client";

import { useState } from "react";

type TabKey = "account" | "business";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("account");

  // Account fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  // Business fields
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState("");

  return (
        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="mb-6" data-gsap="fade-down">
            <h1 className="text-[28px] font-black text-brand tracking-tight">Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Manage your recruiter profile and company information</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 mb-6" data-gsap="fade-down">
            {(["account", "business"] as TabKey[]).map((t) => {
              const labels: Record<TabKey, string> = {
                account: "Account Information",
                business: "Business Information",
              };
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-1 pb-3 mr-6 text-sm font-semibold border-b-2 transition-all -mb-px ${
                    tab === t
                      ? "border-brand-blue text-brand-blue"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* ── Account Information ──────────────────────────────────────── */}
          {tab === "account" && (
            <div data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6">
                <h3 className="text-base font-bold text-brand mb-1">Account Information</h3>
                <p className="text-sm text-slate-400 mb-6">Update your personal and company details.</p>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="name@company.co.uk"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.co.uk"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="name@company.co.uk"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Business Information ─────────────────────────────────────── */}
          {tab === "business" && (
            <div data-gsap="fade-up">
              <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6">
                <h3 className="text-base font-bold text-brand mb-1">Business Information</h3>
                <p className="text-sm text-slate-400 mb-6">Update your company profile and contact details.</p>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. EdgeHarbour Ltd"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="hello@company.co.uk"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+44 000 000 0000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://yourcompany.co.uk"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Healthcare, Logistics"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="123 Business Road, London"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue-dark transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
  );
}
