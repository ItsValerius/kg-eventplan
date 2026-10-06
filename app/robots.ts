import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/structured-data";

export default function robots(): MetadataRoute.Robots {
  return {
    // The admin stays crawlable so Google sees its noindex; blocking it would hide that.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
