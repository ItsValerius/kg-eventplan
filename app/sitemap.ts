import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
