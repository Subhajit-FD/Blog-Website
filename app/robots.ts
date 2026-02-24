import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow private/functional pages from being indexed
        disallow: [
          "/dashboard/",
          "/api/",
          "/settings/",
          "/bookmarks/",
          "/login/",
          "/register/",
          "/forgot-password/",
          "/verify-otp/",
          "/preview/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
