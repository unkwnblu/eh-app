import { createServiceClient } from "./service";

/**
 * Sets a candidate's profile status to "resubmission" — but only when they
 * are currently "active". Candidates in "pending" state (initial review) are
 * left unchanged so the admin flow isn't disrupted.
 */
export async function setResubmissionIfActive(userId: string): Promise<void> {
  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  if (profile?.status === "active") {
    await service
      .from("profiles")
      .update({ status: "resubmission" })
      .eq("id", userId);
  }
}
