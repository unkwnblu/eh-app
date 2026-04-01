import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user: error ? null : user };
}

// ─── GET — list all experiences for the logged-in candidate ───────────────────

export async function GET() {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data, error } = await service
    .from("candidate_experiences")
    .select("id, title, company, location, start_date, end_date, current, description, skills, verified")
    .eq("candidate_id", user.id)
    .order("current", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map snake_case → camelCase for the frontend
  const experiences = (data ?? []).map((r) => ({
    id:          r.id,
    title:       r.title,
    company:     r.company,
    location:    r.location,
    startDate:   r.start_date,
    endDate:     r.end_date,
    current:     r.current,
    description: r.description,
    skills:      r.skills ?? [],
    verified:    r.verified,
  }));

  return NextResponse.json({ experiences });
}

// ─── POST — create a new experience ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { title, company, location, startDate, endDate, current, description, skills } = body;

  if (!title || !company) {
    return NextResponse.json({ error: "Title and company are required" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data, error } = await service
    .from("candidate_experiences")
    .insert({
      candidate_id: user.id,
      title,
      company,
      location:    location ?? "",
      start_date:  startDate ?? "",
      end_date:    endDate ?? "",
      current:     current ?? false,
      description: description ?? "",
      skills:      skills ?? [],
    })
    .select("id, title, company, location, start_date, end_date, current, description, skills, verified")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    experience: {
      id:          data.id,
      title:       data.title,
      company:     data.company,
      location:    data.location,
      startDate:   data.start_date,
      endDate:     data.end_date,
      current:     data.current,
      description: data.description,
      skills:      data.skills ?? [],
      verified:    data.verified,
    },
  });
}

// ─── PATCH — update an existing experience ────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await request.json();
  const { id, title, company, location, startDate, endDate, current, description, skills } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();

  const { error } = await service
    .from("candidate_experiences")
    .update({
      title,
      company,
      location:    location ?? "",
      start_date:  startDate ?? "",
      end_date:    endDate ?? "",
      current:     current ?? false,
      description: description ?? "",
      skills:      skills ?? [],
    })
    .eq("id", id)
    .eq("candidate_id", user.id); // ensure ownership

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove an experience ───────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user } = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = createServiceClient();

  const { error } = await service
    .from("candidate_experiences")
    .delete()
    .eq("id", id)
    .eq("candidate_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
