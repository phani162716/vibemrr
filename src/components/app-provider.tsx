"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Bid,
  BidMessage,
  BidStatus,
  Currency,
  Notice,
  Order,
  Product,
  ProductStatus,
  Review,
  Role,
  Session,
} from "@/lib/types";
import { SEED_PRODUCTS } from "@/lib/products-seed";
import {
  localBids,
  localBumpView,
  localDeleteProduct,
  localInterests,
  localNotices,
  localOrders,
  localProducts,
  localReviews,
  localSaveBids,
  localSaveInterests,
  localSaveNotices,
  localSaveOrders,
  localSaveReviews,
  localUpsertProduct,
  localViewMap,
} from "@/lib/local-market";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type Ctx = {
  ready: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  products: Product[];
  upsertProduct: (p: Product) => Promise<void>;
  deleteProduct: (slug: string) => Promise<void>;
  setStatus: (slug: string, status: ProductStatus) => Promise<void>;
  recordView: (slug: string) => void;
  interestedSlugs: string[];
  toggleInterest: (product: Product) => Promise<void>;
  bids: Bid[];
  placeBid: (product: Product, amountInr: number, message: string) => Promise<void>;
  respondBid: (bidId: string, kind: "accept" | "reject" | "counter", amountInr?: number, message?: string) => Promise<void>;
  orders: Order[];
  checkout: (product: Product, amountInr: number, bidId?: string) => Promise<Order>;
  markPaid: (orderId: string) => Promise<void>;
  saveHandover: (orderId: string, handover: Record<string, string>) => Promise<void>;
  reviews: Review[];
  addReview: (productId: string, orderId: string, rating: number, comment: string) => Promise<void>;
  notices: Notice[];
  markNoticesRead: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

function mergeProducts(remote: Product[], extra: Product[]): Product[] {
  const map = new Map<string, Product>();
  for (const p of SEED_PRODUCTS) map.set(p.slug, p);
  for (const p of remote) map.set(p.slug, p);
  for (const p of extra) map.set(p.slug, p);
  return [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [bids, setBids] = useState<Bid[]>([]);
  const [interested, setInterested] = useState<Record<string, string[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const persist = isSupabaseConfigured() ? "sb" : "local";

  const interestedSlugs = session?.email ? interested[session.email] ?? [] : [];

  const refreshSb = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const sb = createClient();
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const remote: Product[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      slug: String(row.slug),
      ownerId: row.owner_id ? String(row.owner_id) : undefined,
      ownerName: String(row.owner_name ?? "Seller"),
      name: String(row.name),
      shortDescription: String(row.short_description ?? ""),
      fullDescription: String(row.full_description ?? ""),
      productType: row.product_type as Product["productType"],
      niche: String(row.niche ?? "Other"),
      tags: (row.tags as string[]) ?? [],
      askingInr: Number(row.asking_inr ?? 0),
      thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : undefined,
      images: (row.images as string[]) ?? [],
      demoUrl: row.demo_url ? String(row.demo_url) : undefined,
      websiteUrl: row.website_url ? String(row.website_url) : undefined,
      status: (row.status as Product["status"]) ?? "available",
      isDemo: Boolean(row.is_demo),
      createdAt: String(row.created_at),
      views: 0,
      interested: 0,
      bidCount: 0,
      reviewCount: 0,
    }));
    setProducts(mergeProducts(remote, localProducts().filter((p) => !p.isDemo)));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("vibemrr.currency");
    setCurrencyState(stored === "USD" ? "USD" : "INR");
    try {
      const raw = localStorage.getItem("vibemrr.session");
      if (raw && !isSupabaseConfigured()) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    const views = localViewMap();
    const extras = localProducts();
    const withViews = mergeProducts([], extras).map((p) => ({
      ...p,
      views: p.views + (views[p.slug] ?? 0),
    }));
    setProducts(withViews);
    setBids(localBids());
    setInterested(localInterests());
    setOrders(localOrders());
    setReviews(localReviews());
    setNotices(localNotices());

    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const sb = createClient();
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!alive) return;
        if (user) {
          const { data: profile } = await sb
            .from("profiles")
            .select("name, whatsapp, avatar_url, primary_role, handle, bio")
            .eq("id", user.id)
            .maybeSingle();
          setSession({
            id: user.id,
            email: user.email ?? "",
            name: profile?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            whatsapp: profile?.whatsapp ?? undefined,
            avatarUrl: profile?.avatar_url ?? undefined,
            role: (profile?.primary_role as Role) || undefined,
            handle: profile?.handle ?? undefined,
            bio: profile?.bio ?? undefined,
          });
        }
        await refreshSb().catch(() => undefined);
      } finally {
        if (alive) setReady(true);
      }
    })();
    const { data: sub } = sb.auth.onAuthStateChange((_e, authSession) => {
      const user = authSession?.user;
      if (!user) return;
      setSession((cur) => ({
        id: user.id,
        email: user.email ?? cur?.email ?? "",
        name: cur?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: cur?.role,
      }));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshSb]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("vibemrr.currency", c);
  }, []);

  const signIn = useCallback((s: Session) => {
    setSession(s);
    localStorage.setItem("vibemrr.session", JSON.stringify(s));
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    localStorage.removeItem("vibemrr.session");
    setSession(null);
  }, []);

  const setRole = useCallback(
    async (role: Role) => {
      if (!session) return;
      const next = { ...session, role };
      setSession(next);
      localStorage.setItem("vibemrr.session", JSON.stringify(next));
      if (session.id && isSupabaseConfigured()) {
        await createClient().from("profiles").upsert({
          id: session.id,
          email: session.email,
          name: session.name,
          primary_role: role,
          updated_at: new Date().toISOString(),
        });
      }
    },
    [session]
  );

  const notify = useCallback((n: Omit<Notice, "id" | "createdAt" | "read">) => {
    const row: Notice = { ...n, id: uid(), createdAt: new Date().toISOString(), read: false };
    setNotices((cur) => {
      const next = [row, ...cur];
      localSaveNotices(next);
      return next;
    });
  }, []);

  const upsertProduct = useCallback(
    async (p: Product) => {
      localUpsertProduct(p);
      setProducts((cur) => mergeProducts([], [p, ...cur.filter((x) => x.slug !== p.slug)]));
      if (persist === "sb" && session?.id) {
        await createClient().from("products").upsert({
          id: p.id.match(/^[0-9a-f-]{36}$/i) ? p.id : undefined,
          slug: p.slug,
          owner_id: session.id,
          owner_name: session.name,
          name: p.name,
          short_description: p.shortDescription,
          full_description: p.fullDescription,
          product_type: p.productType,
          niche: p.niche,
          tags: p.tags,
          asking_inr: p.askingInr,
          thumbnail_url: p.thumbnailUrl ?? null,
          images: p.images,
          demo_url: p.demoUrl ?? null,
          website_url: p.websiteUrl ?? null,
          status: p.status,
          is_demo: false,
          updated_at: new Date().toISOString(),
        });
      }
    },
    [persist, session]
  );

  const deleteProduct = useCallback(async (slug: string) => {
    localDeleteProduct(slug);
    setProducts((cur) => cur.filter((p) => p.slug !== slug));
    if (persist === "sb") await createClient().from("products").delete().eq("slug", slug);
  }, [persist]);

  const setStatus = useCallback(
    async (slug: string, status: ProductStatus) => {
      setProducts((cur) => {
        const next = cur.map((p) => (p.slug === slug ? { ...p, status } : p));
        const hit = next.find((p) => p.slug === slug);
        if (hit && !hit.isDemo) localUpsertProduct(hit);
        return next;
      });
      if (persist === "sb") await createClient().from("products").update({ status }).eq("slug", slug);
    },
    [persist]
  );

  const recordView = useCallback((slug: string) => {
    localBumpView(slug);
    setProducts((cur) => cur.map((p) => (p.slug === slug ? { ...p, views: p.views + 1 } : p)));
  }, []);

  const toggleInterest = useCallback(
    async (product: Product) => {
      if (!session?.email) throw new Error("Sign in to show interest");
      setInterested((cur) => {
        const mine = cur[session.email] ?? [];
        const on = mine.includes(product.slug);
        const nextMine = on ? mine.filter((s) => s !== product.slug) : [product.slug, ...mine];
        const next = { ...cur, [session.email]: nextMine };
        localSaveInterests(next);
        return next;
      });
      setProducts((cur) =>
        cur.map((p) =>
          p.slug === product.slug
            ? { ...p, interested: p.interested + (interestedSlugs.includes(product.slug) ? -1 : 1) }
            : p
        )
      );
      if (product.ownerId && product.ownerId !== session.id) {
        notify({
          userId: product.ownerId,
          title: "New interested buyer",
          body: `${session.name} is interested in ${product.name}`,
          href: `/product/${product.slug}`,
        });
      }
    },
    [session, interestedSlugs, notify]
  );

  const placeBid = useCallback(
    async (product: Product, amountInr: number, message: string) => {
      if (!session) throw new Error("Sign in to bid");
      const msg: BidMessage = {
        id: uid(),
        role: "buyer",
        actorName: session.name,
        amountInr,
        message,
        kind: "bid",
        createdAt: new Date().toISOString(),
      };
      const bid: Bid = {
        id: uid(),
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        askingInr: product.askingInr,
        buyerId: session.id,
        buyerName: session.name,
        buyerEmail: session.email,
        sellerId: product.ownerId,
        amountInr,
        status: "pending",
        createdAt: new Date().toISOString(),
        messages: [msg],
      };
      setBids((cur) => {
        const next = [bid, ...cur];
        localSaveBids(next);
        return next;
      });
      setProducts((cur) =>
        cur.map((p) => (p.slug === product.slug ? { ...p, bidCount: p.bidCount + 1, status: p.status === "available" ? "negotiation" : p.status } : p))
      );
      if (product.ownerId) {
        notify({
          userId: product.ownerId,
          title: "New bid",
          body: `${session.name} bid ${amountInr} on ${product.name}`,
          href: `/dashboard?tab=bids`,
        });
      }
      if (persist === "sb" && session.id) {
        await createClient().from("bids").insert({
          id: bid.id,
          product_id: product.id.match(/^[0-9a-f-]{36}$/i) ? product.id : null,
          buyer_id: session.id,
          buyer_name: session.name,
          buyer_email: session.email,
          amount_inr: amountInr,
          status: "pending",
        });
      }
    },
    [session, persist, notify]
  );

  const respondBid = useCallback(
    async (bidId: string, kind: "accept" | "reject" | "counter", amountInr?: number, message?: string) => {
      if (!session) throw new Error("Sign in");
      setBids((cur) => {
        const next = cur.map((b) => {
          if (b.id !== bidId) return b;
          const status: BidStatus = kind === "accept" ? "accepted" : kind === "reject" ? "rejected" : "counter";
          const row: BidMessage = {
            id: uid(),
            role: session.id && b.sellerId === session.id ? "seller" : "buyer",
            actorName: session.name,
            amountInr: amountInr ?? b.amountInr,
            message: message || kind,
            kind,
            createdAt: new Date().toISOString(),
          };
          return {
            ...b,
            status,
            amountInr: amountInr ?? b.amountInr,
            messages: [...b.messages, row],
          };
        });
        localSaveBids(next);
        return next;
      });
    },
    [session]
  );

  const checkout = useCallback(
    async (product: Product, amountInr: number, bidId?: string) => {
      if (!session) throw new Error("Sign in to buy");
      const order: Order = {
        id: uid(),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        buyerId: session.id,
        sellerId: product.ownerId,
        bidId,
        amountInr,
        paymentStatus: "pending",
        handover: {},
        createdAt: new Date().toISOString(),
      };
      setOrders((cur) => {
        const next = [order, ...cur];
        localSaveOrders(next);
        return next;
      });
      return order;
    },
    [session]
  );

  const markPaid = useCallback(
    async (orderId: string) => {
      setOrders((cur) => {
        const next = cur.map((o) => (o.id === orderId ? { ...o, paymentStatus: "paid" as const } : o));
        localSaveOrders(next);
        const paid = next.find((o) => o.id === orderId);
        if (paid?.productSlug) {
          setProducts((ps) =>
            ps.map((p) => (p.slug === paid.productSlug ? { ...p, status: "sold" as const } : p))
          );
        }
        return next;
      });
      setBids((cur) => {
        const next = cur.map((b) => {
          const o = orders.find((x) => x.id === orderId);
          return o && b.id === o.bidId ? { ...b, status: "purchased" as const } : b;
        });
        localSaveBids(next);
        return next;
      });
    },
    [orders]
  );

  const saveHandover = useCallback(async (orderId: string, handover: Record<string, string>) => {
    setOrders((cur) => {
      const next = cur.map((o) => (o.id === orderId ? { ...o, handover } : o));
      localSaveOrders(next);
      return next;
    });
  }, []);

  const addReview = useCallback(
    async (productId: string, orderId: string, rating: number, comment: string) => {
      if (!session) throw new Error("Sign in");
      const row: Review = {
        id: uid(),
        productId,
        orderId,
        buyerId: session.id,
        buyerName: session.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setReviews((cur) => {
        const next = [row, ...cur];
        localSaveReviews(next);
        return next;
      });
    },
    [session]
  );

  const markNoticesRead = useCallback(() => {
    setNotices((cur) => {
      const next = cur.map((n) => ({ ...n, read: true }));
      localSaveNotices(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      currency,
      setCurrency,
      session,
      signIn,
      signOut,
      setRole,
      products,
      upsertProduct,
      deleteProduct,
      setStatus,
      recordView,
      interestedSlugs,
      toggleInterest,
      bids,
      placeBid,
      respondBid,
      orders,
      checkout,
      markPaid,
      saveHandover,
      reviews,
      addReview,
      notices,
      markNoticesRead,
    }),
    [
      ready,
      currency,
      setCurrency,
      session,
      signIn,
      signOut,
      setRole,
      products,
      upsertProduct,
      deleteProduct,
      setStatus,
      recordView,
      interestedSlugs,
      toggleInterest,
      bids,
      placeBid,
      respondBid,
      orders,
      checkout,
      markPaid,
      saveHandover,
      reviews,
      addReview,
      notices,
      markNoticesRead,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
