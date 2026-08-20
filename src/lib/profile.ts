"use client";

import { createClient } from "@/lib/supabase/client";

export async function saveMyProfile(input: {
  name?: string;
  whatsapp?: string;
  handle?: string;
  bio?: string;
  role?: string;
}) {
  const sb = createClient();
  const { data, error } = await sb.rpc("save_my_profile", {
    p_name: input.name ?? null,
    p_whatsapp: input.whatsapp ?? null,
    p_handle: input.handle ?? null,
    p_bio: input.bio ?? null,
    p_role: input.role ?? null,
  });
  if (error) throw new Error(error.message);
  if (input.whatsapp || input.name) {
    const { error: metaErr } = await sb.auth.updateUser({
      data: { full_name: input.name, whatsapp: input.whatsapp },
    });
    if (metaErr) throw new Error(metaErr.message);
  }
  return data;
}
