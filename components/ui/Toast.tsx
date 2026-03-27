"use client";

import { createContext, useCallback, useContext, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

// ─── Context ────────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Toast item ─────────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string; iconBg: string }> = {
  success: { bar: "bg-green-500",   icon: "text-green-600",   iconBg: "bg-green-50"  },
  error:   { bar: "bg-red-500",     icon: "text-red-500",     iconBg: "bg-red-50"    },
  info:    { bar: "bg-brand-blue",  icon: "text-brand-blue",  iconBg: "bg-blue-50"   },
};

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const s = VARIANT_STYLES[item.variant];
  return (
    <div className="pointer-events-auto bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden flex items-stretch min-w-[280px] max-w-[360px]">
      {/* Left color bar */}
      <div className={`w-1 shrink-0 ${s.bar}`} />
      <div className="flex items-center gap-3 px-4 py-3.5 flex-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg} ${s.icon}`}>
          {ICONS[item.variant]}
        </div>
        <p className="text-sm font-semibold text-brand flex-1 leading-snug">{item.message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
