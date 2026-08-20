import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = ["", "/market", "/search", "/add", "/hub", "/faq"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));
  return staticRoutes;
}
