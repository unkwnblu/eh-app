import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── POST /api/contact ────────────────────────────────────────────────────────
// Body: { firstName, lastName, email, role, message }
// No authentication required — public contact form.

export async function POST(request: NextRequest) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = body.firstName?.trim();
  const lastName  = body.lastName?.trim();
  const email     = body.email?.trim().toLowerCase();
  const role      = body.role?.trim();
  const message   = body.message?.trim();

  // Validate required fields
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (!role || !["employer", "candidate", "other"].includes(role)) {
    return NextResponse.json({ error: "Please select a role" }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: "Please enter a message (min 10 characters)" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service.from("contact_submissions").insert({
    first_name: firstName,
    last_name:  lastName,
    email,
    role,
    message,
    status:     "unread",
  });

  if (error) {
    console.error("[api/contact] insert error:", error.message);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
