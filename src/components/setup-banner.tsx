"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-200">
      Listings currently save only in this browser.{" "}
      <Link href="/setup" className="font-semibold underline underline-offset-2">
        Connect free Supabase auth
      </Link>{" "}
      so founders persist across devices.
    </div>
  );
}
