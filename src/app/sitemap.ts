import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { SEED_PRODUCTS } from "@/lib/products-seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = ["", "/market", "/search", "/add", "/faq"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));
  const extra = SEED_PRODUCTS.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
  }));
  return [...staticRoutes, ...extra];
}
