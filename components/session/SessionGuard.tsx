"use client";

/**
 * SessionGuard
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles three session-safety concerns for every authenticated dashboard:
 *
 *  1. IDLE TIMEOUT — tracks mouse/keyboard/touch activity and signs the user
 *     out after `idleMinutes` of inactivity, showing a 2-minute countdown
 *     warning before doing so.
 *
 *  2. SESSION EXPIRY / TOKEN REFRESH FAILURE — listens to Supabase's
 *     onAuthStateChange. If a SIGNED_OUT event fires unexpectedly (i.e. the
 *     server-side token refresh failed), the user is redirected to the login
 *     page with ?reason=expired.
 *
 *  3. CROSS-TAB LOGOUT SYNC — because Supabase broadcasts SIGNED_OUT to every
 *     tab via the same onAuthStateChange mechanism, all open tabs are signed
 *     out immediately when any one tab signs out.
 *
 * To prevent #2 and #3 from firing on an intentional logout (triggered by the
 * user clicking the sidebar logout button), DashboardLayout sets the
 * `eh_logout` localStorage key to "intentional" before calling signOut().
 * SessionGuard checks and clears that flag in its event handler.
 *
 * Usage — mount once inside each dashboard layout:
 *   <SessionGuard idleMinutes={20} logoutHref="/auth/admin/login" />
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Show warning this many seconds before auto-logout */
const WARNING_SECONDS = 120;

/** How often to poll for idle state (ms) */
const IDLE_POLL_MS = 10_000;

/** Minimum ms between activity-reset calls (throttle heavy events) */
const ACTIVITY_THROTTLE_MS = 30_000;

/** DOM events that count as user activity */
const ACTIVITY_EVENTS = [
  "mousemove", "mousedown", "keydown", "scroll", "touchstart", "click",
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SessionGuardProps {
  /** Minutes of inactivity before auto-logout */
  idleMinutes: number;
  /** Where to send the user after an idle/expired sign-out */
  logoutHref: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SessionGuard({ idleMinutes, logoutHref }: SessionGuardProps) {
  const idleThresholdMs  = idleMinutes * 60 * 1_000;
  const warningThresholdMs = idleThresholdMs - WARNING_SECONDS * 1_000;

  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsLeft,    setSecondsLeft]    = useState(WARNING_SECONDS);

  // Refs that can be read inside intervals without stale closure issues.
  // Initialized to 0; set to Date.now() in the mount effect (not during render).
  const lastActivityRef    = useRef<number>(0);
  const lastThrottleRef    = useRef<number>(0);
  const warningVisibleRef  = useRef(false);
  const countdownRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const idlePollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const signingOutRef      = useRef(false);

  // Keep warningVisibleRef in sync with state
  useEffect(() => { warningVisibleRef.current = warningVisible; }, [warningVisible]);

  // ── Sign-out helper ──────────────────────────────────────────────────────────

  const doSignOut = useCallback(async (reason: "idle" | "expired") => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;

    // Mark as intentional so the onAuthStateChange listener doesn't fire a
    // duplicate redirect for this same sign-out event.
    try { localStorage.setItem("eh_logout", "intentional"); } catch {}

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `${logoutHref}?reason=${reason}`;
  }, [logoutHref]);

  // ── Stay-signed-in handler ────────────────────────────────────────────────────

  const staySignedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    setWarningVisible(false);
    setSecondsLeft(WARNING_SECONDS);

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // ── Activity tracking ────────────────────────────────────────────────────────

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
    lastThrottleRef.current = now;
    lastActivityRef.current = now;

    // If the warning was showing, dismiss it (user came back)
    if (warningVisibleRef.current) {
      staySignedIn();
    }
  }, [staySignedIn]);

  // ── Idle poll ────────────────────────────────────────────────────────────────

  const startIdlePoll = useCallback(() => {
    if (idlePollRef.current) clearInterval(idlePollRef.current);

    idlePollRef.current = setInterval(() => {
      if (signingOutRef.current) return;

      const idle = Date.now() - lastActivityRef.current;

      // Time is up — sign out
      if (idle >= idleThresholdMs) {
        doSignOut("idle");
        return;
      }

      // Show warning
      if (idle >= warningThresholdMs && !warningVisibleRef.current) {
        setWarningVisible(true);
        setSecondsLeft(WARNING_SECONDS);

        if (countdownRef.current) clearInterval(countdownRef.current);

        countdownRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              doSignOut("idle");
              return 0;
            }
            return s - 1;
          });
        }, 1_000);
      }
    }, IDLE_POLL_MS);
  }, [idleThresholdMs, warningThresholdMs, doSignOut]);

  // ── Auth state listener ──────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      if (signingOutRef.current) return; // We triggered this sign-out ourselves

      // Check for intentional logout flag (set by DashboardLayout or doSignOut)
      try {
        const flag = localStorage.getItem("eh_logout");
        if (flag === "intentional") {
          localStorage.removeItem("eh_logout");
          return; // DashboardLayout handles the redirect
        }
      } catch {}

      // Unexpected sign-out: token expired or another tab logged out
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = `${logoutHref}?reason=expired`;
      }
    });

    return () => subscription.unsubscribe();
  }, [logoutHref]);

  // ── Mount activity listeners + idle poll ─────────────────────────────────────

  useEffect(() => {
    // Stamp "now" as the baseline so the idle clock starts from mount, not epoch.
    const now = Date.now();
    lastActivityRef.current = now;
    lastThrottleRef.current = now;

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );

    startIdlePoll();

    return () => {
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
      if (idlePollRef.current)   clearInterval(idlePollRef.current);
      if (countdownRef.current)  clearInterval(countdownRef.current);
    };
  }, [handleActivity, startIdlePoll]);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!warningVisible) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}`
    : `${secondsLeft}s`;

  const pct = (secondsLeft / WARNING_SECONDS) * 100;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Countdown bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full transition-all duration-1000 ${pct > 50 ? "bg-amber-400" : "bg-red-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 id="session-warning-title" className="text-base font-bold text-brand leading-tight">
                Still there?
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                You&apos;ve been inactive for a while
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 mb-5 text-center">
            <p id="session-warning-desc" className="text-xs text-slate-400 mb-1">
              Signing out in
            </p>
            <p className={`text-3xl font-black tabular-nums ${pct > 50 ? "text-amber-500" : "text-red-500"}`}>
              {timeStr}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your session will be closed to keep your account secure.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => doSignOut("idle")}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-500 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={staySignedIn}
              className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:opacity-90 transition-opacity"
              autoFocus
            >
              Stay Signed In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
