import type { Bid, Notice, Order, Product, Review } from "./types";
import { RETIRED_TEST_SLUGS } from "./products-seed";

const K = {
  extra: "vibers.products",
  bids: "vibers.bids",
  interests: "vibers.interests",
  orders: "vibers.orders",
  reviews: "vibers.reviews",
  notices: "vibers.notices",
  views: "vibers.views",
};

const LEGACY_KEYS = [
  "vibers.products",
  "vibers.bids",
  "vibers.interests",
  "vibers.orders",
  "vibers.reviews",
  "vibers.notices",
  "vibers.views",
  "vibers.hub.messages",
  "vibers.hub.requests",
  "vibers.hub.offers",
];

/** Drop local demo/test listings, bids, orders and Hub posts once. Keeps the signed-in session. */
export function wipeLegacyLocalData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("vibers.data.v2") === "1") return;
  for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  localStorage.setItem("vibers.data.v2", "1");
}

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

export function localProducts(): Product[] {
  return read<Product[]>(K.extra, []).filter((p) => !p.isDemo && !RETIRED_TEST_SLUGS.has(p.slug));
}

export function localUpsertProduct(p: Product) {
  const extra = read<Product[]>(K.extra, []).filter((x) => x.slug !== p.slug);
  extra.unshift(p);
  write(K.extra, extra);
}

export function localDeleteProduct(slug: string) {
  write(
    K.extra,
    read<Product[]>(K.extra, []).filter((p) => p.slug !== slug)
  );
}

export function localBids(): Bid[] {
  return read<Bid[]>(K.bids, []);
}

export function localSaveBids(rows: Bid[]) {
  write(K.bids, rows);
}

export function localInterests(): Record<string, string[]> {
  return read<Record<string, string[]>>(K.interests, {});
}

export function localSaveInterests(v: Record<string, string[]>) {
  write(K.interests, v);
}

export function localOrders(): Order[] {
  return read<Order[]>(K.orders, []);
}

export function localSaveOrders(rows: Order[]) {
  write(K.orders, rows);
}

export function localReviews(): Review[] {
  return read<Review[]>(K.reviews, []);
}

export function localSaveReviews(rows: Review[]) {
  write(K.reviews, rows);
}

export function localNotices(): Notice[] {
  return read<Notice[]>(K.notices, []);
}

export function localSaveNotices(rows: Notice[]) {
  write(K.notices, rows);
}

export function localBumpView(slug: string) {
  const views = read<Record<string, number>>(K.views, {});
  views[slug] = (views[slug] ?? 0) + 1;
  write(K.views, views);
  return views[slug];
}

export function localViewMap(): Record<string, number> {
  return read<Record<string, number>>(K.views, {});
}
