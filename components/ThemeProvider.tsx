"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: "system",
  resolved: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(Ctx);
}

/**
 * Provides a theme context and toggles the `dark` class on <html>.
 *
 * - Persists user choice to localStorage.
 * - Falls back to the OS preference via `prefers-color-scheme`.
 * - Injects a blocking <script> to avoid FOUC (flash of unstyled content).
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Resolve the effective theme (accounting for "system")
  const resolve = useCallback((t: Theme): "light" | "dark" => {
    if (t !== "system") return t;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Apply the resolved theme to the DOM
  const apply = useCallback(
    (t: Theme) => {
      const r = resolve(t);
      setResolved(r);
      document.documentElement.classList.toggle("dark", r === "dark");
    },
    [resolve],
  );

  // Initialise from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("eh-theme") as Theme | null;
    const initial = stored ?? "system";
    setThemeState(initial);
    apply(initial);
  }, [apply]);

  // Listen for OS preference changes when in "system" mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") apply("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, apply]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem("eh-theme", t);
      apply(t);
    },
    [apply],
  );

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

/**
 * Inline script to prevent flash of wrong theme on page load.
 * Must be rendered inside <head> or at the very top of <body>.
 */
export function ThemeScript() {
  const script = `
    (function(){
      try {
        var t = localStorage.getItem("eh-theme") || "system";
        var d = t === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : t === "dark";
        if (d) document.documentElement.classList.add("dark");
      } catch(e){}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
