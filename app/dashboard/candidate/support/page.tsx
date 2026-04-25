"use client";

import { useState } from "react";
import GsapAnimations from "@/components/landing/GsapAnimations";

// ─── Data ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    id: 1,
    question: "How do I apply for a job?",
    answer: "Browse jobs from the Job Listings page, open a job detail, and click 'Apply Now'. You'll be guided through the application steps. Make sure your profile is complete before applying to improve your chances.",
  },
  {
    id: 2,
    question: "How do I track my application status?",
    answer: "Go to the Applications page from the sidebar. Each application shows a progress timeline with stages: Applied, Reviewing, Interview, and Offer. The status badge on the right shows the current state.",
  },
  {
    id: 3,
    question: "What documents do I need to upload for compliance?",
    answer: "Required documents vary by role, but typically include proof of Right to Work (passport or visa), an Enhanced DBS certificate, and any role-specific certifications (e.g. NMC Pin for nursing roles). You'll see a Compliance Checklist on each job detail page.",
  },
  {
    id: 4,
    question: "How do I update my profile and experience?",
    answer: "Navigate to Settings in the sidebar. Use the Profile tab to update personal information and bio, and the Experience tab to add or edit work history. Changes are saved when you click 'Save Profile' or 'Save Changes'.",
  },
  {
    id: 5,
    question: "Why has my compliance status changed to 'Renewal Needed'?",
    answer: "This means one or more of your verified credentials (e.g. DBS certificate, mandatory training) is approaching or has passed its expiry date. Go to Settings to upload a renewed document. Your profile will be re-verified within 24 hours.",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email Support",
    value: "candidates@edgeharbour.co.uk",
    description: "We respond within 24 hours",
    colour: "bg-blue-50 text-brand-blue",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: "Phone Support",
    value: "+44 (0) 800 123 4567",
    description: "Mon – Fri, 9am – 6pm GMT",
    colour: "bg-green-50 text-green-600",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    label: "Live Chat",
    value: "Start a conversation",
    description: "Typically replies in minutes",
    colour: "bg-purple-50 text-purple-600",
  },
];

// ─── FAQ accordion item ────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-brand-blue transition-colors"
      >
        <span className="text-sm font-semibold text-brand">{question}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <p className="text-sm text-slate-500 leading-relaxed pb-4">{answer}</p>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateSupportPage() {
  const [subject,   setSubject]   = useState("");
  const [message,   setMessage]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/candidate/support", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subject, message }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6">
      <GsapAnimations />

      {/* Page header */}
      <div data-gsap="fade-down">
        <h1 className="text-[28px] font-black text-brand tracking-tight">Support</h1>
        <p className="text-sm text-slate-400 mt-1">Get help, browse common questions, or send us a message.</p>
      </div>

      {/* Contact channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-gsap="fade-up">
        {CONTACT_CHANNELS.map((ch) => (
          <div key={ch.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ch.colour}`}>
              {ch.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-brand">{ch.label}</p>
              <p className="text-sm text-brand-blue font-medium mt-0.5">{ch.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{ch.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main row: FAQ + contact form */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* FAQ */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-7" data-gsap="fade-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-brand">Frequently Asked Questions</h2>
          </div>
          <p className="text-sm text-slate-400 mb-5 ml-11">Quick answers to common candidate questions.</p>
          <div>
            {FAQS.map((faq) => (
              <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="w-full lg:w-[340px] lg:shrink-0" data-gsap="fade-up">
          <div className="bg-white border border-gray-100 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-brand">Send a Message</h2>
            </div>
            <p className="text-sm text-slate-400 mb-5 ml-11">Our team will get back to you within 24 hours.</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-brand">Message sent!</p>
                <p className="text-xs text-slate-400">We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Issue with my application"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-600 placeholder:text-slate-300 outline-none focus:border-brand-blue transition-colors resize-none"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500 font-semibold -mt-1">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Sending…
                    </>
                  ) : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
