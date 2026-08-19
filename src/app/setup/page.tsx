import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupClient } from "./setup-client";

export default function SetupPage() {
  return <SetupClient configured={isSupabaseConfigured()} />;
}
