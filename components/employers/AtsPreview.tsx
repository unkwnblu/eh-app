const features = [
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
    label: "Drag-and-drop pipeline management",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
    label: "Mandatory compliance review gate",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    label: "Real-time RTW & credential status on every card",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
        />
      </svg>
    ),
    label: "One-click interview scheduling",
  },
  {
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    label: "Automated rejection & feedback messaging",
  },
];

type CandidateCardProps = {
  name: string;
  role: string;
  status: "green" | "amber";
  statusLabel: string;
};

function CandidateCard({ name, role, status, statusLabel }: CandidateCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-border p-2.5 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-gray-soft border border-gray-border flex items-center justify-center flex-shrink-0">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <p className="text-[11px] font-semibold text-slate-700 truncate">{name}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] bg-brand-blue/8 text-brand-blue font-medium rounded-full px-1.5 py-0.5 truncate max-w-[70%]">
          {role}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              status === "green" ? "bg-green-400" : "bg-amber-400"
            }`}
          />
          <span className="text-[9px] text-slate-400">{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}

type Column = {
  id: string;
  title: string;
  isGate?: boolean;
  count: number;
  cards: CandidateCardProps[];
};

const columns: Column[] = [
  {
    id: "applied",
    title: "Applied",
    count: 8,
    cards: [
      { name: "Sarah M.", role: "Senior Nurse", status: "green", statusLabel: "RTW Clear" },
      { name: "James T.", role: "Head Chef", status: "green", statusLabel: "Verified" },
    ],
  },
  {
    id: "shortlisted",
    title: "Shortlisted",
    count: 4,
    cards: [
      { name: "Priya S.", role: "Customer Success", status: "green", statusLabel: "Docs OK" },
      { name: "David K.", role: "Data Engineer", status: "amber", statusLabel: "Pending" },
    ],
  },
  {
    id: "compliance",
    title: "Compliance Review",
    isGate: true,
    count: 3,
    cards: [
      { name: "Amir H.", role: "Support Lead", status: "amber", statusLabel: "In review" },
    ],
  },
  {
    id: "interviewing",
    title: "Interviewing",
    count: 2,
    cards: [
      { name: "Lucy B.", role: "Ward Manager", status: "green", statusLabel: "Interview" },
    ],
  },
];

export default function AtsPreview() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div data-gsap="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
            The ATS
          </span>
          <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand leading-tight">
            Your hiring pipeline,{" "}
            <span className="text-brand-blue">visualised.</span>
          </h2>
          <p className="mt-5 text-slate-500 text-base leading-relaxed">
            A drag-and-drop Kanban board purpose-built for compliant UK hiring. The
            Compliance Review gate is mandatory — candidates cannot progress to
            interview without it.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: feature list */}
          <div data-gsap="slide-left">
            <ul className="space-y-5">
              {features.map((feature) => (
                <li key={feature.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/8 border border-brand-blue/12 flex items-center justify-center text-brand-blue flex-shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pt-2">
                    {feature.label}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Verified candidate
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending review
              </div>
            </div>
          </div>

          {/* Right: Kanban mockup */}
          <div data-gsap="slide-right">
            <div className="bg-gray-soft rounded-2xl border border-gray-border p-4">
              {/* Mockup top bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-300" />
                  <div className="w-2 h-2 rounded-full bg-amber-300" />
                  <div className="w-2 h-2 rounded-full bg-green-300" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                  ATS Pipeline — Senior Nurse (Band 6)
                </span>
                <div className="w-14" />
              </div>

              {/* Kanban columns */}
              <div className="grid grid-cols-4 gap-2">
                {columns.map((col) => (
                  <div key={col.id} className="flex flex-col gap-2">
                    {/* Column header */}
                    <div
                      className={`rounded-lg px-2 py-1.5 flex items-center justify-between ${
                        col.isGate
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-white border border-gray-border"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-bold truncate ${
                            col.isGate ? "text-amber-700" : "text-slate-600"
                          }`}
                        >
                          {col.isGate ? "⚠ " : ""}
                          {col.title}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 ml-1 ${
                          col.isGate
                            ? "bg-amber-200 text-amber-800"
                            : "bg-gray-soft text-slate-500"
                        }`}
                      >
                        {col.count}
                      </span>
                    </div>

                    {/* Candidate cards */}
                    <div className="flex flex-col gap-2">
                      {col.cards.map((card) => (
                        <CandidateCard key={card.name} {...card} />
                      ))}
                    </div>

                    {/* Add card placeholder */}
                    <div className="rounded-lg border border-dashed border-gray-border h-8 flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mockup footer note */}
              <div className="mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-600 flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <p className="text-[10px] text-amber-700 font-medium">
                  Compliance Review gate is mandatory. Candidates cannot skip to Interviewing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
