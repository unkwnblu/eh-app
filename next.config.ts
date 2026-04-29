import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — signed URLs for candidate avatars and documents
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
  // ── Private-route hardening ──────────────────────────────────────────────
  // Sets X-Robots-Tag: noindex, nofollow on every dashboard and API response
  // so authenticated pages are excluded from search indexes even if a crawler
  // somehow bypasses robots.txt.
  async headers() {
    const noIndex = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/dashboard/:path*", headers: noIndex },
      { source: "/api/:path*",       headers: noIndex },
      { source: "/auth/:path*",      headers: noIndex },
    ];
  },
};

export default nextConfig;
