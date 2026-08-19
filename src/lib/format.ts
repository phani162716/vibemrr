import type { Currency } from "./types";

export const USD_INR = 86.5;

export function trimNum(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function formatInrCompact(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_00_00_000) return `${sign}₹${trimNum(abs / 1_00_00_000)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trimNum(abs / 1_00_000)}L`;
  if (abs >= 1_000) return `${sign}₹${trimNum(abs / 1_000)}k`;
  return `${sign}₹${Math.round(abs)}`;
}

export function formatInrFull(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatUsdCompact(nInr: number): string {
  const usd = nInr / USD_INR;
  const sign = usd < 0 ? "-" : "";
  const abs = Math.abs(usd);
  if (abs >= 1_000_000) return `${sign}$${trimNum(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trimNum(abs / 1_000)}k`;
  return `${sign}$${Math.round(abs)}`;
}

export function money(nInr: number, currency: Currency): string {
  return currency === "USD" ? formatUsdCompact(nInr) : formatInrCompact(nInr);
}

export function moneyFull(nInr: number, currency: Currency): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.round(nInr / USD_INR));
  }
  return formatInrFull(nInr);
}

export function multiple(askingInr?: number, revenue30dInr?: number): number | null {
  if (!askingInr || !revenue30dInr) return null;
  const annual = revenue30dInr * 12;
  if (annual <= 0) return null;
  return askingInr / annual;
}

export function formatMultiple(askingInr?: number, revenue30dInr?: number): string {
  const m = multiple(askingInr, revenue30dInr);
  if (m === null) return "—";
  return `${m.toFixed(1)}x`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function hashMetrics(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h);
  const mrr = 8_000 + (n % 1_80_000);
  const subs = 6 + (n % 240);
  return {
    mrrInr: mrr,
    revenue30dInr: Math.round(mrr * (0.92 + (n % 20) / 100)),
    allTimeInr: mrr * (4 + (n % 18)),
    activeSubs: subs,
    customers: Math.round(subs * 1.4),
    momGrowth: (n % 27) - 4,
    profitMargin: 28 + (n % 42),
  };
}
