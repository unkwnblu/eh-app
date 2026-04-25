import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { toJobSlug, extractUuid } from "./utils";
import PublicJobDetail from "./PublicJobDetail";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PublicJob = {
  id: string;
  title: string;
  company: string;
  companyWebsite: string | null;
  companyIndustries: string[];
  sector: string;
  location: string;
  remote: boolean;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  type: string;
  experienceLevel: string | null;
  description: string | null;
  responsibilities: string | null;
  requiredCertifications: string[];
  closesAt: string | null;
  createdAt: string;
  posted: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `£${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `From ${fmt(min)} / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "1 day ago";
  if (days < 30)  return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function toSchemaEmploymentType(type: string): string {
  const map: Record<string, string> = {
    "Full-time":          "FULL_TIME",
    "Part-time":          "PART_TIME",
    "Contract":           "CONTRACTOR",
    "Temporary / Ad-hoc": "TEMPORARY",
    "Internship":         "INTERN",
  };
  return map[type] ?? "OTHER";
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function fetchJob(slug: string): Promise<PublicJob | null> {
  const lookupId = extractUuid(slug);
  if (!lookupId) return null;

  const service = createServiceClient();

  const { data: job } = await service
    .from("jobs")
    .select(`
      id, title, sector, employment_type, location, remote,
      salary_min, salary_max, live_salary_min, live_salary_max,
      description, responsibilities, required_certifications,
      experience_level, closes_at, created_at, employer_id
    `)
    .eq("id", lookupId)
    .eq("status", "live")
    .single();

  if (!job) return null;

  const { data: employer } = await service
    .from("employers")
    .select("company_name, company_website, industries")
    .eq("id", job.employer_id)
    .single();

  const displayMin = job.live_salary_min ?? job.salary_min;
  const displayMax = job.live_salary_max ?? job.salary_max;

  return {
    id:                     job.id,
    title:                  job.title,
    company:                employer?.company_name ?? "Unknown Employer",
    companyWebsite:         employer?.company_website ?? null,
    companyIndustries:      employer?.industries ?? [],
    sector:                 job.sector,
    location:               job.location,
    remote:                 job.remote,
    salary:                 formatSalary(displayMin, displayMax),
    salaryMin:              displayMin,
    salaryMax:              displayMax,
    type:                   job.employment_type,
    experienceLevel:        job.experience_level ?? null,
    description:            job.description ?? null,
    responsibilities:       job.responsibilities ?? null,
    requiredCertifications: job.required_certifications ?? [],
    closesAt:               job.closes_at ?? null,
    createdAt:              job.created_at,
    posted:                 relativeTime(job.created_at),
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function buildJobPostingJsonLd(job: PublicJob, pageUrl: string) {
  const descriptionParts: string[] = [];
  if (job.description) descriptionParts.push(job.description);
  if (job.responsibilities) {
    descriptionParts.push("Responsibilities:\n" + job.responsibilities);
  }
  if (job.requiredCertifications.length > 0) {
    descriptionParts.push("Required Certifications: " + job.requiredCertifications.join(", "));
  }
  const fullDescription =
    descriptionParts.join("\n\n") || `${job.title} role at ${job.company}.`;

  const schema: Record<string, unknown> = {
    "@context":   "https://schema.org",
    "@type":      "JobPosting",
    title:        job.title,
    description:  fullDescription,
    url:          pageUrl,
    datePosted:   new Date(job.createdAt).toISOString().slice(0, 10),
    hiringOrganization: {
      "@type": "Organization",
      name:    job.company,
      ...(job.companyWebsite ? { sameAs: job.companyWebsite } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type":           "PostalAddress",
        addressLocality:   job.location,
        addressCountry:    "GB",
      },
    },
    employmentType: toSchemaEmploymentType(job.type),
    industry:       job.sector,
  };

  if (job.remote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = { "@type": "Country", name: "United Kingdom" };
  }
  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      "@type":   "MonetaryAmount",
      currency:  "GBP",
      value: {
        "@type":   "QuantitativeValue",
        unitText:  "YEAR",
        ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
        ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
      },
    };
  }
  if (job.closesAt) schema.validThrough = new Date(job.closesAt).toISOString().slice(0, 10);
  if (job.experienceLevel) schema.experienceRequirements = job.experienceLevel;
  if (job.requiredCertifications.length > 0)
    schema.qualifications = job.requiredCertifications.join(", ");

  return schema;
}

// ─── OG Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJob(slug);

  if (!job) {
    return {
      title: "Job Not Found",
      description: "This job listing is no longer available.",
      robots: { index: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";
  const pageUrl = `${siteUrl}/jobs/${toJobSlug(job.title, job.id)}`;

  const locationLine = job.remote ? `${job.location} · Remote` : job.location;
  const salaryLine   = job.salary ? ` · ${job.salary}` : "";
  const tagline      = `${job.type} · ${locationLine}${salaryLine}`;

  const metaDescription = [
    `${job.title} at ${job.company}.`,
    tagline,
    job.description
      ? job.description.replace(/\n/g, " ").slice(0, 100).trimEnd() + "…"
      : "Apply now on Edge Harbour.",
  ].join(" ");

  return {
    title:       `${job.title} at ${job.company}`,
    description: metaDescription,
    keywords: [
      job.title,
      job.company,
      job.sector,
      job.location,
      "jobs UK",
      "Edge Harbour",
      ...(job.remote ? ["remote jobs UK"] : []),
    ],
    openGraph: {
      title:       `${job.title} at ${job.company}`,
      description: `${tagline}. Apply now on Edge Harbour — the UK's compliance-first recruitment platform.`,
      url:         pageUrl,
      type:        "website",
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${job.title} at ${job.company}`,
      description: `${tagline}. Apply on Edge Harbour.`,
    },
    alternates: { canonical: pageUrl },
    robots:     { index: true, follow: true },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicJobPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const job = await fetchJob(slug);

  if (!job) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";
  const pageUrl = `${siteUrl}/jobs/${toJobSlug(job.title, job.id)}`;
  const jsonLd  = buildJobPostingJsonLd(job, pageUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicJobDetail job={job} />
    </>
  );
}
