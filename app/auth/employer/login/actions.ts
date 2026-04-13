"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Prevent non-employer accounts from using the employer portal
  const role = data.user?.app_metadata?.role;
  if (role === "admin" || role === "moderator" || role === "candidate") {
    await supabase.auth.signOut();
    return { error: "No employer account found for these credentials." };
  }

  // Check employer profile status (status lives in profiles, not employers)
  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "No employer account found for these credentials." };
  }

  if (profile.status === "pending" || profile.status === "resubmission") {
    redirect("/auth/employer/pending");
  }

  redirect("/dashboard/employer");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/employer/login");
}
