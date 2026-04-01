"use server";

import { createClient } from "@/lib/supabase/server";
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

  // Allow admin and moderator roles only
  const role = data.user?.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") {
    await supabase.auth.signOut();
    return { error: "Access denied. Admin credentials required." };
  }

  redirect("/dashboard/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/admin/login");
}
