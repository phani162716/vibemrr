"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validWhatsApp } from "@/lib/whatsapp";

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

export async function lookupSellerContact(opts: {
  ownerId?: string | null;
  ownerName?: string | null;
  slug?: string | null;
  productId?: string | null;
}): Promise<{ whatsapp?: string; ownerId?: string; ownerName?: string }> {
  const fallbackName = opts.ownerName || undefined;
  if (!isSupabaseConfigured()) {
    return { ownerId: opts.ownerId || undefined, ownerName: fallbackName };
  }
  try {
    const sb = createClient();
    const productId = opts.productId && /^[0-9a-f-]{36}$/i.test(opts.productId) ? opts.productId : null;

    let ownerId = opts.ownerId || undefined;
    let ownerName = fallbackName;

    if (opts.slug || productId) {
      let q = sb.from("products").select("owner_id, owner_name");
      q = productId ? q.eq("id", productId) : q.eq("slug", opts.slug!);
      const { data: prod } = await q.maybeSingle();
      if (prod?.owner_id) ownerId = String(prod.owner_id);
      if (prod?.owner_name) ownerName = String(prod.owner_name);
    }

    const fromProfile = ownerId ? await lookupProfileWhatsapp(ownerId) : undefined;
    if (fromProfile) {
      return { whatsapp: fromProfile, ownerId, ownerName };
    }

    if (ownerName) {
      const { data: rows } = await sb.from("profiles").select("whatsapp").eq("name", ownerName).limit(3);
      const wa = validWhatsApp(rows?.[0]?.whatsapp ? String(rows[0].whatsapp) : undefined);
      if (wa) return { whatsapp: wa, ownerId, ownerName };
    }

    return { ownerId, ownerName };
  } catch {
    return { ownerId: opts.ownerId || undefined, ownerName: fallbackName };
  }
}

export async function resolveUserWhatsapp(
  userId?: string | null,
  fallback?: string | null,
  _not?: string | null
): Promise<string | undefined> {
  const looked = await lookupProfileWhatsapp(userId);
  if (looked) return looked;
  return validWhatsApp(fallback);
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
