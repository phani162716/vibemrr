import { NextResponse } from "next/server";
import { mergeCatalog } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { rowToStartup, type StartupRow } from "@/lib/supabase/map";
import type { Startup } from "@/lib/types";

function publicCard(s: Startup) {
  return {
    slug: s.slug,
    name: s.anonymous ? "Anonymous startup" : s.name,
    city: s.city,
    category: s.category,
    mrrInr: s.mrrInr,
    revenue30dInr: s.revenue30dInr,
    allTimeInr: s.allTimeInr,
    forSale: s.forSale,
    askingInr: s.askingInr ?? null,
    vibeCoded: s.vibeCoded,
    provider: s.provider,
    website: s.anonymous ? null : s.website ?? null,
    isDemo: Boolean(s.isDemo),
  };
}

export async function GET() {
  let remote: Startup[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("startups").select("*");
      remote = ((data ?? []) as StartupRow[]).map(rowToStartup);
    } catch {
      remote = [];
    }
  }
  const startups = mergeCatalog(remote).map(publicCard);
  return NextResponse.json({
    source: "VibeMRR",
    currency: "INR",
    persistence: isSupabaseConfigured() ? "supabase" : "local",
    count: startups.length,
    startups,
  });
}
