"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Prevent admin/moderator staff from using the candidate portal
  const role = data.user?.app_metadata?.role;
  if (role === "admin" || role === "moderator") {
    await supabase.auth.signOut();
    return { error: "Please use the admin login portal." };
  }

  // Check if the candidate's account has been verified by an admin
  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status === "pending") {
    redirect("/auth/candidate/pending");
  }

  redirect("/dashboard/candidate");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/candidate/login");
}
