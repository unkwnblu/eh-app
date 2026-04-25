import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/service";

function toJobSlug(title: string, id: string): string {
  const titlePart = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${titlePart}-${id}`;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

// ─── Static routes ────────────────────────────────────────────────────────────

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${siteUrl}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/candidates`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/employers`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/sectors`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/compliance`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${siteUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.5,
  },
  {
    url: `${siteUrl}/legal`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/legal/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/legal/terms`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

// ─── Dynamic job routes ───────────────────────────────────────────────────────

async function getLiveJobRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const service = createServiceClient();

    const { data: jobs } = await service
      .from("jobs")
      .select("id, title, created_at, updated_at")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    if (!jobs || jobs.length === 0) return [];

    return jobs.map((job) => ({
      url: `${siteUrl}/jobs/${toJobSlug(job.title, job.id)}`,
      lastModified: new Date(job.updated_at ?? job.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Don't fail the build if DB is unreachable during static generation
    return [];
  }
}

// ─── Sitemap export ───────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobRoutes = await getLiveJobRoutes();
  return [...staticRoutes, ...jobRoutes];
}
