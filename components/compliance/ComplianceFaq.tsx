const faqs = [
  {
    question: "Who reviews candidate documents?",
    answer:
      "Our in-house Super Admin compliance team reviews every document submission manually. No document is auto-approved — a human always makes the final call.",
  },
  {
    question: "How long does candidate verification take?",
    answer:
      "Most candidates are verified within 24–48 working hours of submitting their complete document set. Incomplete submissions are flagged immediately with guidance on what's missing.",
  },
  {
    question: "What happens if a document is rejected?",
    answer:
      "The candidate is notified with a clear explanation and given the opportunity to resubmit. Employers never see unverified candidates — the rejection is handled entirely within our compliance pipeline.",
  },
  {
    question: "Can employers access candidate documents directly?",
    answer:
      "Yes. Once a candidate passes compliance review, employers can view the full verified dossier from within the ATS before making any hiring decision.",
  },
  {
    question: "How are Right to Work checks performed?",
    answer:
      "We verify RTW documents against UK Home Office standards. For candidates with biometric residence permits or share codes, we perform online verification. All checks are documented and timestamped.",
  },
  {
    question: "Is Edge Harbour GDPR compliant?",
    answer:
      "Yes. We are registered with the ICO, process all personal data lawfully under UK GDPR, and maintain a full data processing register. Candidates can request data deletion at any time.",
  },
  {
    question: "What DBS level do you check?",
    answer:
      "The level of DBS check depends on the role. Healthcare and roles involving vulnerable adults or children require Enhanced DBS. Other sectors typically require Standard DBS. We apply the appropriate level automatically based on sector.",
  },
  {
    question: "How do you handle expired credentials?",
    answer:
      "Candidate profiles include credential expiry tracking. Candidates are notified in advance of expiry and prompted to resubmit. Expired credentials are flagged in the ATS so employers always see current compliance status.",
  },
];

export default function ComplianceFaq() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div data-gsap="fade-up" className="max-w-xl mb-14">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-brand tracking-tight leading-[1.08]">
            Common compliance questions.
          </h2>
        </div>

        {/* FAQ list */}
        <div className="max-w-3xl">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              data-gsap="stagger-item"
              className="border-b border-gray-border py-6"
            >
              <p className="text-brand font-bold text-base">{faq.question}</p>
              <p className="text-slate-500 text-sm leading-relaxed mt-2">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
