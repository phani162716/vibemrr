import type { Offer, Session, Startup } from "./types";
import { mergeCatalog } from "./catalog";

const K = {
  session: "vibemrr.session",
  extra: "vibemrr.extraStartups",
  offers: "vibemrr.offers",
  saved: "vibemrr.saved",
  currency: "vibemrr.currency",
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

export function getSession(): Session | null {
  return read<Session | null>(K.session, null);
}

export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(K.session);
  else write(K.session, session);
}

export function getExtraStartups(): Startup[] {
  return read<Startup[]>(K.extra, []);
}

export function upsertStartup(startup: Startup) {
  const extra = getExtraStartups().filter((s) => s.slug !== startup.slug);
  extra.unshift(startup);
  write(K.extra, extra);
}

export function deleteExtraStartup(slug: string) {
  write(
    K.extra,
    getExtraStartups().filter((s) => s.slug !== slug)
  );
}

export function allStartups(): Startup[] {
  return mergeCatalog(getExtraStartups());
}

export function findStartup(slug: string): Startup | undefined {
  return allStartups().find((s) => s.slug === slug);
}

export function getOffers(): Offer[] {
  return read<Offer[]>(K.offers, []);
}

export function addOffer(offer: Offer) {
  write(K.offers, [offer, ...getOffers()]);
}

export function getSaved(): string[] {
  return read<string[]>(K.saved, []);
}

export function toggleSaved(slug: string): string[] {
  const cur = getSaved();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [slug, ...cur];
  write(K.saved, next);
  return next;
}
