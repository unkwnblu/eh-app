"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Persists form state + current step to sessionStorage so multi-step
 * registration progress survives accidental page refreshes.
 *
 * - Uses sessionStorage (auto-clears when the tab closes).
 * - Debounces writes to avoid thrashing on every keystroke.
 * - Provides a `clear()` to wipe storage on successful submit.
 */
export function useFormPersist<T extends Record<string, unknown>>(
  key: string,
  initialData: T,
  initialStep: number = 1,
) {
  // Hydrate from storage on first render (SSR-safe)
  const [form, setForm] = useState<T>(() => {
    if (typeof window === "undefined") return initialData;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...initialData, ...parsed.form } as T;
      }
    } catch { /* corrupt data — start fresh */ }
    return initialData;
  });

  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return initialStep;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return typeof parsed.step === "number" ? parsed.step : initialStep;
      }
    } catch { /* start fresh */ }
    return initialStep;
  });

  // Persist to sessionStorage whenever form or step changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify({ form, step }));
      } catch { /* storage full — silently degrade */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [key, form, step]);

  // Wipe storage (call on successful submit)
  const clear = useCallback(() => {
    try { sessionStorage.removeItem(key); } catch { /* noop */ }
  }, [key]);

  return { form, setForm, step, setStep, clear } as const;
}
