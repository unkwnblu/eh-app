/**
 * Candidate notification helpers
 * ─────────────────────────────────────────────────────────────────────────────
 * All system-generated notifications flow through `insertCandidateNotification`.
 * Import and call it from any API route that triggers a notification event.
 * The function is a fire-and-forget call (errors are swallowed so they never
 * block the main operation).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CandidateNotifType =
  | "application"   // candidate submitted an application
  | "interview"     // moved to interview stage
  | "offer"         // offer extended
  | "rejection"     // not progressed
  | "verification"  // profile approved / rejected / resubmission requested
  | "system"        // admin broadcast
  | "compliance"    // document warning / expiry
  | "shift";        // shift assigned by admin — awaiting candidate confirmation

export interface NotifMetadata {
  jobId?:    string;
  jobTitle?: string;
  company?:  string;
  [key: string]: unknown;
}

/**
 * Insert a single candidate notification.
 * Always call with the service-role client so RLS is bypassed.
 */
export async function insertCandidateNotification(
  service: SupabaseClient,
  candidateId: string,
  type: CandidateNotifType,
  title: string,
  body: string,
  metadata?: NotifMetadata,
): Promise<void> {
  try {
    await service
      .from("candidate_notifications")
      .insert({ candidate_id: candidateId, type, title, body, metadata: metadata ?? null });
  } catch {
    // Notifications are best-effort — never block the main operation
  }
}

/**
 * Fan-out a system broadcast to every active candidate.
 * Called when an admin sends a notification to "Candidates" or "All Users".
 */
export async function broadcastToAllCandidates(
  service: SupabaseClient,
  title: string,
  body: string,
): Promise<void> {
  try {
    // Fetch all active candidate user IDs
    const { data: profiles } = await service
      .from("profiles")
      .select("id")
      .eq("role", "candidate")
      .eq("status", "active");

    if (!profiles || profiles.length === 0) return;

    const rows = profiles.map((p) => ({
      candidate_id: p.id,
      type:         "system" as CandidateNotifType,
      title,
      body,
      metadata:     null,
    }));

    // Batch insert in chunks of 500 to stay within Supabase limits
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await service
        .from("candidate_notifications")
        .insert(rows.slice(i, i + CHUNK));
    }
  } catch {
    // Best-effort
  }
}

// ─── Pre-built notification copy ─────────────────────────────────────────────

export const NOTIF_COPY = {
  applicationSubmitted: (jobTitle: string, company: string) => ({
    title: "Application Submitted",
    body:  `Your application for **${jobTitle}** at ${company} has been received. We'll be in touch with any updates.`,
  }),

  movedToInterview: (jobTitle: string, company: string) => ({
    title: "Interview Invitation",
    body:  `Great news! You've been shortlisted for an interview for **${jobTitle}** at ${company}. An interview date and time will be communicated to you shortly.`,
  }),

  interviewScheduled: (jobTitle: string, company: string, date: string, time: string, meetingLink?: string) => ({
    title: "Interview Scheduled",
    body:  `Your interview for **${jobTitle}** at ${company} has been scheduled for **${date}** at **${time}**.${meetingLink ? ` Join here: ${meetingLink}` : " Our team will be in touch with further details."}`,
  }),

  offerReceived: (jobTitle: string, company: string) => ({
    title: "Offer Received",
    body:  `Congratulations! You've received an offer for **${jobTitle}** at ${company}. Please contact us to discuss the next steps.`,
  }),

  applicationRejected: (jobTitle: string, company: string) => ({
    title: "Application Update",
    body:  `After careful review, your application for **${jobTitle}** at ${company} was not progressed at this time. Thank you for your interest.`,
  }),

  profileVerified: () => ({
    title: "Profile Verified",
    body:  "Your profile has been verified by our compliance team. You're now fully active and can apply for roles across the platform.",
  }),

  resubmissionRequired: (note?: string) => ({
    title: "Documents Required",
    body:  note
      ? `Our compliance team needs additional information: ${note}`
      : "Our compliance team requires additional documents to complete your verification. Please check your profile and upload the requested information.",
  }),

  accountSuspended: () => ({
    title: "Account Update",
    body:  "Your account status has been updated. Please contact our support team if you have any questions.",
  }),
} as const;
