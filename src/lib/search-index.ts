import type { Product } from "./types";

export type SearchSort =
  | "relevance"
  | "new"
  | "views"
  | "interest"
  | "bids"
  | "rating"
  | "price-asc"
  | "price-desc";

export type SearchQuery = {
  q?: string;
  type?: string;
  niche?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SearchSort;
};

const STOP = new Set(["the", "and", "for", "with", "from", "this", "that", "you", "are", "can"]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

export type ProductIndex = {
  byToken: Map<string, Map<string, number>>;
  tokens: string[];
};

function bump(map: Map<string, number>, slug: string, weight: number) {
  map.set(slug, (map.get(slug) ?? 0) + weight);
}

export function buildProductIndex(products: Product[]): ProductIndex {
  const byToken = new Map<string, Map<string, number>>();
  const add = (slug: string, text: string, weight: number) => {
    for (const tok of tokenize(text)) {
      let posting = byToken.get(tok);
      if (!posting) {
        posting = new Map();
        byToken.set(tok, posting);
      }
      bump(posting, slug, weight);
    }
  };

  for (const p of products) {
    if (p.status === "paused") continue;
    add(p.slug, p.name, 10);
    add(p.slug, p.tags.join(" "), 7);
    add(p.slug, p.productType, 6);
    add(p.slug, p.niche, 6);
    add(p.slug, p.shortDescription, 3);
    add(p.slug, p.fullDescription, 1);
    add(p.slug, p.ownerName, 2);
  }

  return { byToken, tokens: [...byToken.keys()].sort() };
}

function postingsForToken(index: ProductIndex, token: string): Map<string, number> {
  const out = new Map<string, number>();
  const exact = index.byToken.get(token);
  if (exact) {
    for (const [slug, w] of exact) bump(out, slug, w);
  }
  if (token.length < 3) return out;
  for (const key of index.tokens) {
    if (key === token || !key.startsWith(token)) continue;
    const posting = index.byToken.get(key);
    if (!posting) continue;
    for (const [slug, w] of posting) bump(out, slug, w * 0.6);
  }
  return out;
}

function scoreQuery(index: ProductIndex, q: string): Map<string, number> {
  const tokens = tokenize(q);
  if (!tokens.length) return new Map();
  let scores: Map<string, number> | null = null;
  for (const tok of tokens) {
    const part = postingsForToken(index, tok);
    if (!scores) {
      scores = part;
      continue;
    }
    const next = new Map<string, number>();
    for (const [slug, s] of scores) {
      const w = part.get(slug);
      if (w != null) next.set(slug, s + w);
    }
    scores = next;
  }
  return scores ?? new Map();
}

export function searchProducts(products: Product[], query: SearchQuery = {}): Product[] {
  const live = products.filter((p) => p.status !== "paused");
  const q = (query.q ?? "").trim();
  const index = q ? buildProductIndex(live) : null;
  const scores = q && index ? scoreQuery(index, q) : null;

  let rows = live;
  if (scores) {
    rows = live.filter((p) => scores.has(p.slug));
  }
  if (query.type && query.type !== "All") {
    rows = rows.filter((p) => p.productType === query.type);
  }
  if (query.niche && query.niche !== "All") {
    rows = rows.filter((p) => p.niche === query.niche);
  }
  if (query.minPrice != null && Number.isFinite(query.minPrice)) {
    rows = rows.filter((p) => p.askingInr >= query.minPrice!);
  }
  if (query.maxPrice != null && Number.isFinite(query.maxPrice) && query.maxPrice > 0) {
    rows = rows.filter((p) => p.askingInr <= query.maxPrice!);
  }

  const sort = query.sort || (q ? "relevance" : "new");
  return [...rows].sort((a, b) => {
    if (sort === "relevance" && scores) {
      const d = (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0);
      if (d) return d;
    }
    if (sort === "views") return b.views - a.views;
    if (sort === "interest") return b.interested - a.interested;
    if (sort === "bids") return b.bidCount - a.bidCount;
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === "price-asc") return a.askingInr - b.askingInr;
    if (sort === "price-desc") return b.askingInr - a.askingInr;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}
