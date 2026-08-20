"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { sameWhatsApp, validWhatsApp } from "@/lib/whatsapp";

/** Other user's WhatsApp from profiles. Never returns your own number. */
export async function lookupProfileWhatsapp(userId?: string | null): Promise<string | undefined> {
  if (!userId || !isSupabaseConfigured()) return undefined;
  try {
    const sb = createClient();
    const { data, error } = await sb.from("profiles").select("whatsapp").eq("id", userId).maybeSingle();
    if (error || !data?.whatsapp) return undefined;
    return validWhatsApp(String(data.whatsapp));
  } catch {
    return undefined;
  }
}

export async function resolveUserWhatsapp(
  userId?: string | null,
  fallback?: string | null,
  not?: string | null
): Promise<string | undefined> {
  const fb = validWhatsApp(fallback);
  if (fb && !sameWhatsApp(fb, not)) return fb;
  const looked = await lookupProfileWhatsapp(userId);
  if (looked && !sameWhatsApp(looked, not)) return looked;
  return undefined;
}

export async function saveMyProfile(input: {
  name?: string;
  whatsapp?: string;
  handle?: string;
  bio?: string;
  role?: string;
}) {
  const sb = createClient();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr || !user) throw new Error("Not signed in");

  const whatsapp = (input.whatsapp ?? "").replace(/\D/g, "") || null;
  const payload = {
    p_name: input.name ?? null,
    p_whatsapp: whatsapp,
    p_handle: input.handle ?? null,
    p_bio: input.bio ?? null,
    p_role: input.role ?? null,
  };

  const { error: rpcError } = await sb.rpc("save_my_profile", payload);
  if (!rpcError) {
    await sb.auth.updateUser({ data: { full_name: input.name, whatsapp } });
    return;
  }

  const row = {
    name: input.name ?? null,
    whatsapp,
    handle: input.handle ?? null,
    bio: input.bio ?? null,
    primary_role: input.role ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: upErr } = await sb.from("profiles").update(row).eq("id", user.id).select("id");
  if (upErr) {
    throw new Error(
      rpcError.message.includes("schema cache")
        ? `${upErr.message}. If this persists, run supabase/profile-whatsapp.sql in the SQL editor.`
        : upErr.message
    );
  }
  if (!updated?.length) {
    const { error: insErr } = await sb.from("profiles").insert({
      id: user.id,
      email: user.email,
      ...row,
    });
    if (insErr) {
      throw new Error(
        `${insErr.message}. Run the full file supabase/profile-whatsapp.sql in Supabase → SQL Editor, then Save again.`
      );
    }
  }

  await sb.auth.updateUser({ data: { full_name: input.name, whatsapp } });
}
