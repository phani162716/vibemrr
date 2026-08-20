import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function digits(phone?: string | null): string | null {
  const n = (phone ?? "").replace(/\D/g, "");
  return n.length >= 10 ? n : null;
}

function anon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function GET(req: NextRequest) {
  const sb = anon();
  if (!sb) return NextResponse.json({ whatsapp: null });

  const q = req.nextUrl.searchParams;
  const slug = q.get("slug")?.trim() || "";
  const id = q.get("id")?.trim() || "";
  const userId = q.get("userId")?.trim() || "";
  let ownerId = q.get("ownerId")?.trim() || "";
  let ownerName = q.get("ownerName")?.trim() || "";
  const productName = q.get("productName")?.trim() || "";

  if (userId) {
    const { data } = await sb.from("profiles").select("id, name, whatsapp").eq("id", userId).maybeSingle();
    return NextResponse.json({
      whatsapp: digits(data?.whatsapp),
      ownerId: data?.id ?? userId,
      ownerName: data?.name ?? null,
    });
  }

  if (slug) {
    const { data } = await sb.from("products").select("owner_id, owner_name").eq("slug", slug).maybeSingle();
    if (data?.owner_id) ownerId = String(data.owner_id);
    if (data?.owner_name) ownerName = String(data.owner_name);
  }

  if (!ownerId && id && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data } = await sb.from("products").select("owner_id, owner_name").eq("id", id).maybeSingle();
    if (data?.owner_id) ownerId = String(data.owner_id);
    if (data?.owner_name) ownerName = String(data.owner_name);
  }

  if (!ownerId && productName) {
    const { data } = await sb.from("products").select("owner_id, owner_name").eq("name", productName).limit(1);
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.owner_id) ownerId = String(row.owner_id);
    if (row?.owner_name) ownerName = String(row.owner_name);
  }

  if (ownerId) {
    const { data } = await sb.from("profiles").select("id, name, whatsapp").eq("id", ownerId).maybeSingle();
    const wa = digits(data?.whatsapp);
    if (wa) {
      return NextResponse.json({
        whatsapp: wa,
        ownerId,
        ownerName: data?.name || ownerName || null,
      });
    }
  }

  if (ownerName) {
    const { data } = await sb.from("profiles").select("id, name, whatsapp").eq("name", ownerName).limit(1);
    const row = Array.isArray(data) ? data[0] : data;
    const wa = digits(row?.whatsapp);
    if (wa) {
      return NextResponse.json({
        whatsapp: wa,
        ownerId: row?.id || ownerId || null,
        ownerName: row?.name || ownerName,
      });
    }
  }

  return NextResponse.json({ whatsapp: null, ownerId: ownerId || null, ownerName: ownerName || null });
}
