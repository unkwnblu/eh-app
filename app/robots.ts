import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edgeharbour.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // General crawlers: allow public pages, block everything private
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/candidates",
          "/employers",
          "/sectors",
          "/compliance",
          "/contact",
          "/legal",
          "/legal/privacy",
          "/legal/terms",
          "/jobs/",
        ],
        disallow: [
          "/dashboard/",
          "/api/",
          "/auth/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
