import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "moderator") return null;
  return user;
}

// ─── GET /api/admin/candidates/[id] ──────────────────────────────────────────
// Returns full candidate profile for the pipeline card modal.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();

  // Profile
  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, email, status, created_at")
    .eq("id", id)
    .single();

  if (!profile) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  // Candidate detail
  const { data: candidate } = await service
    .from("candidates")
    .select(`
      id, phone, nationality, sector, job_types, locations,
      cv_file_path, cv_file_name, dbs_file_path, dbs_file_name, dbs_level,
      share_code, share_code_expiry, gender, verified_docs, skills, bio
    `)
    .eq("id", id)
    .single();

  // Experiences
  const { data: experiences } = await service
    .from("candidate_experiences")
    .select("id, title, company, location, start_date, end_date, current, description, skills, verified")
    .eq("candidate_id", id)
    .order("current", { ascending: false })
    .order("created_at", { ascending: false });

  // Certificates
  const { data: certs } = await service
    .from("candidate_certificates")
    .select("id, name, issuer, expiry_date, verified")
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });

  // References
  const { data: refs } = await service
    .from("candidate_references")
    .select("id, full_name, job_title, company, email, phone, relationship")
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });

  // Legal documents
  const { data: legalDocs } = await service
    .from("candidate_legal_documents")
    .select("id, doc_type, label, file_name, file_path, expiry_date, uploaded_at")
    .eq("candidate_id", id)
    .order("uploaded_at", { ascending: false });

  // Applications
  const { data: applications } = await service
    .from("job_applications")
    .select(`
      id, stage, applied_at,
      job:jobs!job_applications_job_id_fkey (
        id, title, location, employment_type, status
      )
    `)
    .eq("candidate_id", id)
    .order("applied_at", { ascending: false })
    .limit(10);

  // Generate signed URL for CV (60-minute expiry)
  let cvUrl: string | null = null;
  if (candidate?.cv_file_path) {
    const { data: signed } = await service.storage
      .from("candidate-documents")
      .createSignedUrl(candidate.cv_file_path, 3600);
    cvUrl = signed?.signedUrl ?? null;
  }

  // Generate signed URLs for legal docs
  const legalDocsWithUrls = await Promise.all(
    (legalDocs ?? []).map(async (doc) => {
      let url: string | null = null;
      if (doc.file_path) {
        const { data: signed } = await service.storage
          .from("candidate-documents")
          .createSignedUrl(doc.file_path, 3600);
        url = signed?.signedUrl ?? null;
      }
      return {
        id:         doc.id,
        docType:    doc.doc_type,
        label:      doc.label,
        fileName:   doc.file_name,
        fileUrl:    url,
        expiryDate: doc.expiry_date,
        uploadedAt: doc.uploaded_at,
      };
    })
  );

  return NextResponse.json({
    candidate: {
      id:             profile.id,
      fullName:       profile.full_name,
      email:          profile.email,
      status:         profile.status,
      joinedAt:       profile.created_at,
      // Detail
      phone:           candidate?.phone ?? null,
      nationality:     candidate?.nationality ?? null,
      sector:          candidate?.sector ?? null,
      jobTypes:        candidate?.job_types ?? [],
      locations:       candidate?.locations ?? [],
      bio:             candidate?.bio ?? null,
      gender:          candidate?.gender ?? null,
      hasCv:           !!candidate?.cv_file_path,
      cvFileName:      candidate?.cv_file_name ?? null,
      cvUrl,
      hasDbs:          !!candidate?.dbs_file_path,
      hasShareCode:    !!candidate?.share_code,
      shareCodeExpiry: candidate?.share_code_expiry ?? null,
      verifiedDocs:    candidate?.verified_docs ?? {},
      skills:          candidate?.skills ?? [],
      experiences:    (experiences ?? []).map((e) => ({
        id:          e.id,
        title:       e.title,
        company:     e.company,
        location:    e.location,
        startDate:   e.start_date,
        endDate:     e.end_date,
        current:     e.current,
        description: e.description,
        skills:      e.skills ?? [],
        verified:    e.verified,
      })),
      certificates:   (certs ?? []).map((c) => ({
        id:         c.id,
        name:       c.name,
        issuer:     c.issuer,
        expiryDate: c.expiry_date,
        verified:   c.verified,
      })),
      references: (refs ?? []).map((r) => ({
        id:           r.id,
        fullName:     r.full_name,
        jobTitle:     r.job_title,
        company:      r.company,
        email:        r.email,
        phone:        r.phone,
        relationship: r.relationship,
      })),
      legalDocs: legalDocsWithUrls,
      applications: (applications ?? []).map((a) => {
        const job = a.job as unknown as { id: string; title: string; location: string; employment_type: string; status: string } | null;
        return {
          id:        a.id,
          stage:     a.stage,
          appliedAt: a.applied_at,
          job:       job ? {
            id:             job.id,
            title:          job.title,
            location:       job.location,
            employmentType: job.employment_type,
            status:         job.status,
          } : null,
        };
      }),
    },
  });
}
