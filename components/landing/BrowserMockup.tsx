export default function BrowserMockup({ variant = "candidate" }: { variant?: "candidate" | "employer" }) {
  return (
    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-border">
      {/* Browser chrome */}
      <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b border-gray-border">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono border border-gray-border">
          app.edgeharbour.co.uk
        </div>
      </div>

      {/* Content area */}
      <div className="bg-peach p-6">
        {variant === "candidate" ? <CandidateMockContent /> : <EmployerMockContent />}
      </div>
    </div>
  );
}

function CandidateMockContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-brand">Candidate Profile</p>
          <p className="text-[10px] text-slate-400">Healthcare · Registered Nurse</p>
        </div>
        <span className="text-[9px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          Verified
        </span>
      </div>
      <div className="space-y-2">
        {["Right to Work", "DBS Certificate", "NMC PIN"].map((doc) => (
          <div key={doc} className="flex items-center justify-between bg-gray-soft rounded-lg px-3 py-2">
            <span className="text-[10px] text-slate-600 font-medium">{doc}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        ))}
      </div>
      <div className="h-1.5 w-full bg-gray-soft rounded-full overflow-hidden">
        <div className="h-full w-4/5 bg-brand-blue rounded-full" />
      </div>
      <p className="text-[9px] text-slate-400 text-center">Profile 80% complete</p>
    </div>
  );
}

function EmployerMockContent() {
  const stages = ["Applied", "Compliance Review", "Interviewing", "Offer"];
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <p className="text-xs font-bold text-brand">ATS Pipeline</p>
      <div className="grid grid-cols-4 gap-2">
        {stages.map((stage, i) => (
          <div key={stage} className="flex flex-col gap-1.5">
            <p className="text-[8px] font-semibold text-slate-500 truncate">{stage}</p>
            {[...Array(i === 1 ? 2 : 1)].map((_, j) => (
              <div key={j} className={`rounded-md p-2 border ${i === 1 ? "border-brand-blue/30 bg-brand-blue/5" : "border-gray-border bg-gray-soft"}`}>
                <div className="w-full h-1.5 bg-gray-border rounded mb-1" />
                <div className="w-2/3 h-1.5 bg-gray-border rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
