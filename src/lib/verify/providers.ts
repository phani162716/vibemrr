import { USD_INR } from "@/lib/format";
import type { VerifyMetrics } from "./types";

const PAISA = 100;

function toInr(amount: number, currency: string): number {
  const cur = currency.toUpperCase();
  if (cur === "INR") return amount / PAISA;
  if (cur === "USD") return (amount / 100) * USD_INR;
  if (cur === "EUR") return (amount / 100) * USD_INR * 1.08;
  return amount / PAISA;
}

async function razorpayGet(path: string, keyId: string, keySecret: string) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof json.error === "object" && json.error && "description" in (json.error as object)
      ? String((json.error as { description?: string }).description)
      : "Razorpay rejected this key. Use Key Id + Key Secret from Razorpay → API Keys.");
  }
  return json;
}

export async function verifyRazorpay(keyId: string, keySecret: string): Promise<VerifyMetrics> {
  const now = Math.floor(Date.now() / 1000);
  const d30 = now - 30 * 24 * 3600;
  const d60 = now - 60 * 24 * 3600;

  type Pay = { amount: number; currency?: string; status: string; created_at: number; email?: string };
  const payments: Pay[] = [];
  for (let skip = 0; skip < 1000; skip += 100) {
    const page = (await razorpayGet(`payments?count=100&skip=${skip}`, keyId, keySecret)) as {
      items?: Pay[];
    };
    const items = page.items ?? [];
    payments.push(...items);
    if (items.length < 100) break;
  }

  const captured = payments.filter((p) => p.status === "captured");
  const allTimeInr = captured.reduce((s, p) => s + toInr(p.amount, p.currency ?? "INR"), 0);
  const last30 = captured.filter((p) => p.created_at >= d30);
  const prev30 = captured.filter((p) => p.created_at >= d60 && p.created_at < d30);
  const revenue30dInr = last30.reduce((s, p) => s + toInr(p.amount, p.currency ?? "INR"), 0);
  const prevInr = prev30.reduce((s, p) => s + toInr(p.amount, p.currency ?? "INR"), 0);
  const momGrowth = prevInr > 0 ? Math.round(((revenue30dInr - prevInr) / prevInr) * 100) : 0;

  type Sub = { status: string; plan_id?: string; quantity?: number };
  const subsPage = (await razorpayGet("subscriptions?count=100", keyId, keySecret)) as { items?: Sub[] };
  const active = (subsPage.items ?? []).filter((s) => s.status === "active" || s.status === "authenticated");
  const plans = (await razorpayGet("plans?count=100", keyId, keySecret)) as {
    items?: { id: string; item?: { amount?: number; currency?: string; period?: string; interval?: number } }[];
  };
  const planMap = new Map((plans.items ?? []).map((p) => [p.id, p]));
  let mrrInr = 0;
  for (const sub of active) {
    const plan = sub.plan_id ? planMap.get(sub.plan_id) : undefined;
    const amount = plan?.item?.amount ?? 0;
    const currency = plan?.item?.currency ?? "INR";
    const qty = sub.quantity ?? 1;
    let monthly = toInr(amount, currency) * qty;
    const period = plan?.item?.period;
    const interval = plan?.item?.interval ?? 1;
    if (period === "yearly") monthly = monthly / (12 * interval);
    else if (period === "weekly") monthly = monthly * (52 / 12) / interval;
    else if (period === "daily") monthly = monthly * 30 / interval;
    else monthly = monthly / interval;
    mrrInr += monthly;
  }
  if (mrrInr === 0 && revenue30dInr > 0) mrrInr = revenue30dInr;

  const emails = new Set(captured.map((p) => p.email).filter(Boolean));
  return {
    mrrInr: Math.round(mrrInr),
    revenue30dInr: Math.round(revenue30dInr),
    allTimeInr: Math.round(allTimeInr),
    activeSubs: active.length,
    customers: emails.size || captured.length,
    momGrowth,
  };
}

async function stripeGet(path: string, secret: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      typeof json.error === "object" && json.error && "message" in (json.error as object)
        ? String((json.error as { message?: string }).message)
        : "Stripe rejected this key. Use a restricted rk_live_ or secret sk_ key."
    );
  }
  return json;
}

export async function verifyStripe(secret: string): Promise<VerifyMetrics> {
  const gte = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
  type Charge = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paid?: boolean;
    billing_details?: { email?: string };
  };
  const charges: Charge[] = [];
  let starting: string | undefined;
  for (let i = 0; i < 10; i++) {
    const q = new URLSearchParams({ limit: "100" });
    if (starting) q.set("starting_after", starting);
    const page = (await stripeGet(`charges?${q.toString()}`, secret)) as { data?: Charge[]; has_more?: boolean };
    const data = page.data ?? [];
    charges.push(...data);
    if (!page.has_more || data.length === 0) break;
    starting = data[data.length - 1]?.id;
  }
  const ok = charges.filter((c) => c.status === "succeeded" || c.paid);
  const allTimeInr = ok.reduce((s, c) => s + toInr(c.amount, c.currency), 0);
  const last30 = (await stripeGet(`charges?limit=100&created[gte]=${gte}`, secret)) as { data?: Charge[] };
  const revenue30dInr = (last30.data ?? [])
    .filter((c) => c.status === "succeeded" || c.paid)
    .reduce((s, c) => s + toInr(c.amount, c.currency), 0);

  type Sub = {
    status: string;
    items?: { data?: { price?: { unit_amount?: number; currency?: string; recurring?: { interval?: string; interval_count?: number } } }[] };
  };
  const subs = (await stripeGet("subscriptions?status=active&limit=100", secret)) as { data?: Sub[] };
  let mrrInr = 0;
  for (const sub of subs.data ?? []) {
    for (const item of sub.items?.data ?? []) {
      const price = item.price;
      if (!price?.unit_amount) continue;
      let monthly = toInr(price.unit_amount, price.currency ?? "usd");
      const interval = price.recurring?.interval;
      const count = price.recurring?.interval_count ?? 1;
      if (interval === "year") monthly = monthly / (12 * count);
      else if (interval === "week") monthly = (monthly * 52) / 12 / count;
      else if (interval === "day") monthly = (monthly * 30) / count;
      else monthly = monthly / count;
      mrrInr += monthly;
    }
  }
  if (mrrInr === 0 && revenue30dInr > 0) mrrInr = revenue30dInr;
  return {
    mrrInr: Math.round(mrrInr),
    revenue30dInr: Math.round(revenue30dInr),
    allTimeInr: Math.round(allTimeInr),
    activeSubs: (subs.data ?? []).length,
    customers: new Set(ok.map((c) => c.billing_details?.email).filter(Boolean)).size || ok.length,
    momGrowth: 0,
  };
}

export async function verifyCashfree(clientId: string, clientSecret: string): Promise<VerifyMetrics> {
  const headers = {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "x-api-version": "2023-08-01",
  };
  const end = new Date();
  const start = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(
    `https://api.cashfree.com/pg/orders?start_date=${fmt(start)}&end_date=${fmt(end)}&limit=100`,
    { headers, cache: "no-store" }
  );
  const json = (await res.json()) as { message?: string } | Record<string, unknown>[];
  if (!res.ok) {
    throw new Error(
      typeof json === "object" && json && "message" in json
        ? String((json as { message?: string }).message)
        : "Cashfree rejected this app id/secret. Use Client ID + Client Secret from Cashfree → Developers."
    );
  }
  const orders = (Array.isArray(json) ? json : []) as {
    order_amount?: number;
    order_currency?: string;
    order_status?: string;
    customer_details?: { customer_email?: string };
  }[];
  const paid = orders.filter((o) => ["PAID", "COMPLETED"].includes((o.order_status ?? "").toUpperCase()));
  const revenue30dInr = paid.reduce((s, o) => {
    const amt = o.order_amount ?? 0;
    return s + (o.order_currency === "USD" ? amt * USD_INR : amt);
  }, 0);
  return {
    mrrInr: Math.round(revenue30dInr),
    revenue30dInr: Math.round(revenue30dInr),
    allTimeInr: Math.round(revenue30dInr),
    activeSubs: 0,
    customers: new Set(paid.map((o) => o.customer_details?.customer_email).filter(Boolean)).size || paid.length,
    momGrowth: 0,
  };
}
