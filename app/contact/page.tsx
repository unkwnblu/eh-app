import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GsapAnimations from "@/components/landing/GsapAnimations";

export const metadata: Metadata = {
  title: "Contact Us – Edge Harbour",
};

const contactDetails = [
  {
    label: "Registered Address",
    value: "Edge Harbour Ltd\n124 City Road\nLondon, EC1V 2NX\nUnited Kingdom",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: "General Enquiries",
    value: "hello@edgeharbour.co.uk",
    href: "mailto:hello@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Employer Support",
    value: "employers@edgeharbour.co.uk",
    href: "mailto:employers@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    label: "Candidate Support",
    value: "candidates@edgeharbour.co.uk",
    href: "mailto:candidates@edgeharbour.co.uk",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+44 (0) 20 7946 0800",
    href: "tel:+442079460800",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "Company Registration",
    value: "Registered in England & Wales\nCompany No. 15XXXXXX",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <GsapAnimations />
      <Navbar />

      <main className="w-full bg-white">
        {/* Hero */}
        <section className="w-full border-b border-gray-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
            <div data-gsap="fade-up" className="max-w-2xl">
              <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
                Get in Touch
              </span>
              <h1 className="mt-4 text-5xl lg:text-6xl font-black tracking-tight text-brand leading-tight">
                We&apos;d love to{" "}
                <span className="text-brand-blue">hear</span> from you.
              </h1>
              <p className="mt-5 text-slate-500 text-base leading-relaxed max-w-lg">
                Whether you&apos;re an employer looking to hire or a candidate exploring
                opportunities, our team is here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact grid */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16">

              {/* Left — contact details */}
              <div data-gsap="fade-up">
                <h2 className="text-brand font-black text-2xl tracking-tight mb-8">
                  Company Information
                </h2>
                <div className="space-y-6">
                  {contactDetails.map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-soft border border-gray-border flex items-center justify-center flex-shrink-0 text-brand-blue">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-brand font-medium hover:text-brand-blue transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-brand font-medium whitespace-pre-line">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Office hours */}
                <div className="mt-10 p-6 rounded-2xl bg-gray-soft border border-gray-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Office Hours
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monday – Friday</span>
                      <span className="text-brand font-medium">09:00 – 18:00 GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Saturday</span>
                      <span className="text-brand font-medium">10:00 – 14:00 GMT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sunday</span>
                      <span className="text-slate-400">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — enquiry form */}
              <div data-gsap="fade-up">
                <h2 className="text-brand font-black text-2xl tracking-tight mb-8">
                  Send an Enquiry
                </h2>
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Jane"
                        className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Smith"
                        className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="jane@company.co.uk"
                      className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      I am a
                    </label>
                    <select defaultValue="" className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white appearance-none">
                      <option value="" disabled>Select one…</option>
                      <option value="employer">Employer / Hiring Manager</option>
                      <option value="candidate">Candidate / Job Seeker</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us how we can help…"
                      className="w-full border border-gray-border rounded-xl px-4 py-3 text-sm text-brand placeholder-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand text-white text-sm font-semibold rounded-full py-3.5 hover:bg-brand-blue transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
