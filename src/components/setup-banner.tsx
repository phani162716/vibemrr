"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="border-b border-accent/20 bg-accent/10 px-4 py-2 text-center text-xs text-foreground">
      Listings currently save only in this browser.{" "}
      <Link href="/setup" className="font-semibold underline underline-offset-2">
        Connect free Supabase auth
      </Link>{" "}
      so founders persist across devices.
    </div>
  );
}
