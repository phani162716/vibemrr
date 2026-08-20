"use client";

import type { HubMessage, HubOffer, HubRequest, Product } from "./types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const K = {
  messages: "vibers.hub.messages",
  requests: "vibers.hub.requests",
  offers: "vibers.hub.offers",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function isMissingTable(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("schema cache") || m.includes("does not exist") || m.includes("could not find the table");
}

function mergeById<T extends { id: string; createdAt: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of local) map.set(row.id, row);
  for (const row of remote) map.set(row.id, { ...map.get(row.id), ...row });
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function isListedViber(products: Product[], userId?: string): boolean {
  if (!userId) return false;
  return products.some((p) => p.ownerId === userId && !p.isDemo);
}

export function localHub() {
  return {
    messages: read<HubMessage[]>(K.messages, []),
    requests: read<HubRequest[]>(K.requests, []),
    offers: read<HubOffer[]>(K.offers, []),
  };
}

function saveLocal(part: { messages?: HubMessage[]; requests?: HubRequest[]; offers?: HubOffer[] }) {
  if (part.messages) write(K.messages, part.messages);
  if (part.requests) write(K.requests, part.requests);
  if (part.offers) write(K.offers, part.offers);
}

export async function loadHub(): Promise<{
  messages: HubMessage[];
  requests: HubRequest[];
  offers: HubOffer[];
  remoteOk: boolean;
}> {
  const local = localHub();
  if (!isSupabaseConfigured()) {
    return { ...local, remoteOk: false };
  }
  try {
    const sb = createClient();
    const [msgRes, reqRes, offRes] = await Promise.all([
      sb.from("hub_messages").select("*").order("created_at", { ascending: true }).limit(300),
      sb.from("hub_requests").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("hub_offers").select("*").order("created_at", { ascending: true }).limit(400),
    ]);
    if (msgRes.error || reqRes.error || offRes.error) {
      return { ...local, remoteOk: false };
    }
    const messages = mergeById(
      local.messages,
      (msgRes.data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        authorId: String(row.author_id ?? ""),
        authorName: String(row.author_name ?? "Viber"),
        body: String(row.body ?? ""),
        createdAt: String(row.created_at),
      }))
    );
    const requests = mergeById(
      local.requests,
      (reqRes.data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        buyerId: String(row.buyer_id ?? ""),
        buyerName: String(row.buyer_name ?? "Buyer"),
        title: String(row.title ?? ""),
        description: String(row.description ?? ""),
        budgetInr: Number(row.budget_inr ?? 0),
        status: (row.status as HubRequest["status"]) || "open",
        createdAt: String(row.created_at),
      }))
    ).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const offers = mergeById(
      local.offers,
      (offRes.data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        requestId: String(row.request_id ?? ""),
        sellerId: String(row.seller_id ?? ""),
        sellerName: String(row.seller_name ?? "Seller"),
        amountInr: Number(row.amount_inr ?? 0),
        message: String(row.message ?? ""),
        status: (row.status as HubOffer["status"]) || "pending",
        createdAt: String(row.created_at),
      }))
    );
    saveLocal({ messages, requests, offers });
    return { messages, requests, offers, remoteOk: true };
  } catch {
    return { ...local, remoteOk: false };
  }
}

export async function postHubMessage(row: HubMessage): Promise<void> {
  const cur = localHub();
  saveLocal({ messages: [...cur.messages, row] });
  if (!isSupabaseConfigured()) return;
  const { error } = await createClient().from("hub_messages").insert({
    id: row.id,
    author_id: row.authorId,
    author_name: row.authorName,
    body: row.body,
    created_at: row.createdAt,
  });
  if (error && !isMissingTable(error.message)) throw new Error(error.message);
}

export async function postHubRequest(row: HubRequest): Promise<void> {
  const cur = localHub();
  saveLocal({ requests: [row, ...cur.requests] });
  if (!isSupabaseConfigured()) return;
  const { error } = await createClient().from("hub_requests").insert({
    id: row.id,
    buyer_id: row.buyerId,
    buyer_name: row.buyerName,
    title: row.title,
    description: row.description,
    budget_inr: row.budgetInr,
    status: row.status,
    created_at: row.createdAt,
  });
  if (error && !isMissingTable(error.message)) throw new Error(error.message);
}

export async function postHubOffer(row: HubOffer): Promise<void> {
  const cur = localHub();
  saveLocal({ offers: [...cur.offers, row] });
  if (!isSupabaseConfigured()) return;
  const { error } = await createClient().from("hub_offers").insert({
    id: row.id,
    request_id: row.requestId,
    seller_id: row.sellerId,
    seller_name: row.sellerName,
    amount_inr: row.amountInr,
    message: row.message,
    status: row.status,
    created_at: row.createdAt,
  });
  if (error && !isMissingTable(error.message)) throw new Error(error.message);
}

export async function setHubOfferStatus(offerId: string, status: HubOffer["status"], requestId?: string): Promise<void> {
  const cur = localHub();
  const offers = cur.offers.map((o) => {
    if (o.id === offerId) return { ...o, status };
    if (status === "accepted" && requestId && o.requestId === requestId && o.id !== offerId && o.status === "pending") {
      return { ...o, status: "rejected" as const };
    }
    return o;
  });
  const requests =
    status === "accepted" && requestId
      ? cur.requests.map((r) => (r.id === requestId ? { ...r, status: "awarded" as const } : r))
      : cur.requests;
  saveLocal({ offers, requests });
  if (!isSupabaseConfigured()) return;
  const sb = createClient();
  await sb.from("hub_offers").update({ status }).eq("id", offerId);
  if (status === "accepted" && requestId) {
    await sb.from("hub_requests").update({ status: "awarded" }).eq("id", requestId);
    await sb.from("hub_offers").update({ status: "rejected" }).eq("request_id", requestId).neq("id", offerId).eq("status", "pending");
  }
}
