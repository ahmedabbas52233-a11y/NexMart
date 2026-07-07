import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://nexmart.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cart", "/auth"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
