import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = ["", "/acquire", "/stats", "/search", "/add", "/invite", "/faq", "/terms", "/privacy"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
    })
  );

  if (!isSupabaseConfigured()) return staticRoutes;

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("startups").select("slug, updated_at").eq("is_demo", false);
    const extra = (data ?? []).map((row: { slug: string; updated_at?: string }) => ({
      url: `${base}/startup/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
    }));
    return [...staticRoutes, ...extra];
  } catch {
    return staticRoutes;
  }
}
