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
  DealStatus,
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
import { lookupSellerContact, resolveUserWhatsapp, saveMyProfile } from "@/lib/profile";
import { validWhatsApp } from "@/lib/whatsapp";

type Ctx = {
  ready: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
  updateProfile: (patch: Partial<Session>) => Promise<void>;
  products: Product[];
  upsertProduct: (p: Product) => Promise<void>;
  deleteProduct: (slug: string) => Promise<void>;
  setStatus: (slug: string, status: ProductStatus) => Promise<void>;
  recordView: (slug: string) => void;
  interestedSlugs: string[];
  toggleInterest: (product: Product) => Promise<void>;
  bids: Bid[];
  placeBid: (product: Product, amountInr: number, message: string) => Promise<void>;
  respondBid: (
    bidId: string,
    kind: "accept" | "reject" | "counter",
    amountInr?: number,
    message?: string
  ) => Promise<Order | undefined>;
  orders: Order[];
  checkout: (product: Product, amountInr: number, bidId?: string) => Promise<Order>;
  markPaid: (orderId: string) => Promise<void>;
  markDeal: (orderId: string, status: DealStatus) => Promise<void>;
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
  for (const p of extra) map.set(p.slug, p);
  for (const p of remote) {
    const prev = map.get(p.slug);
    map.set(p.slug, {
      ...prev,
      ...p,
      ownerId: p.ownerId || prev?.ownerId,
      sellerWhatsapp: validWhatsApp(p.sellerWhatsapp) || validWhatsApp(prev?.sellerWhatsapp),
    });
  }
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
      sellerWhatsapp: row.seller_whatsapp ? String(row.seller_whatsapp) : undefined,
    }));
    const ownerIds = [...new Set(remote.map((p) => p.ownerId).filter((id): id is string => Boolean(id)))];
    if (ownerIds.length) {
      const { data: waRows } = await sb.from("profiles").select("id, whatsapp").in("id", ownerIds);
      if (waRows) {
        const waMap = new Map<string, string>();
        for (const row of waRows) {
          const rec = row as { id?: string; whatsapp?: string | null };
          const wa = validWhatsApp(rec.whatsapp);
          if (rec.id && wa) waMap.set(String(rec.id), wa);
        }
        for (const p of remote) {
          if (!p.ownerId) continue;
          const fromProfile = waMap.get(p.ownerId);
          if (!validWhatsApp(p.sellerWhatsapp) && fromProfile) p.sellerWhatsapp = fromProfile;
        }
      }
    }
    setProducts(mergeProducts(remote, localProducts().filter((p) => !p.isDemo)));
  }, []);

  const loadRemoteBids = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const sb = createClient();
    const { data: bidRows, error } = await sb.from("bids").select("*").order("updated_at", { ascending: false });
    if (error || !bidRows) return;
    const { data: msgRows } = await sb.from("bid_messages").select("*").order("created_at", { ascending: true });
    const msgs = (msgRows ?? []) as {
      id: string;
      bid_id: string;
      actor_name: string | null;
      role: "buyer" | "seller";
      amount_inr: number | null;
      message: string | null;
      kind: BidMessage["kind"];
      created_at: string;
    }[];
    const remote: Bid[] = (bidRows as Record<string, unknown>[]).map((row) => {
      const id = String(row.id);
      const thread = msgs
        .filter((m) => m.bid_id === id)
        .map((m) => ({
          id: m.id,
          role: m.role,
          actorName: m.actor_name || "User",
          amountInr: m.amount_inr ?? undefined,
          message: m.message || m.kind,
          kind: m.kind,
          createdAt: m.created_at,
        }));
      return {
        id,
        productId: String(row.product_id ?? ""),
        productSlug: String(row.product_slug ?? ""),
        productName: String(row.product_name ?? "Product"),
        askingInr: Number(row.asking_inr ?? 0),
        buyerId: row.buyer_id ? String(row.buyer_id) : undefined,
        buyerName: String(row.buyer_name ?? "Buyer"),
        buyerEmail: String(row.buyer_email ?? ""),
        sellerId: row.seller_id ? String(row.seller_id) : undefined,
        amountInr: Number(row.amount_inr ?? 0),
        status: (row.status as BidStatus) || "pending",
        createdAt: String(row.created_at),
        messages: thread,
      };
    });
    setBids((local) => {
      const map = new Map<string, Bid>();
      for (const b of local) map.set(b.id, b);
      for (const b of remote) {
        const prev = map.get(b.id);
        map.set(b.id, {
          ...prev,
          ...b,
          productSlug: b.productSlug || prev?.productSlug || "",
          productName: b.productName || prev?.productName || "Product",
          messages: b.messages.length ? b.messages : prev?.messages ?? [],
        });
      }
      const next = [...map.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      localSaveBids(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("vibemrr.currency");
    setCurrencyState(stored === "USD" ? "USD" : "INR");
    let localSess: Session | null = null;
    try {
      const raw = localStorage.getItem("vibemrr.session");
      if (raw) localSess = JSON.parse(raw) as Session;
    } catch {
      localSess = null;
    }
    if (localSess) setSession(localSess);
    const views = localViewMap();
    const extras = localProducts();
    const withViews = mergeProducts([], extras).map((p) => ({
      ...p,
      views: p.views + (views[p.slug] ?? 0),
    }));
    setProducts(withViews);
    setBids(localBids());
    setInterested(localInterests());
    setOrders(
      localOrders().map((o) => ({
        ...o,
        dealStatus: o.dealStatus || (o.paymentStatus === "paid" ? "completed" : "accepted"),
        acceptedAt: o.acceptedAt || o.createdAt,
      }))
    );
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
          const next: Session = {
            id: user.id,
            email: user.email ?? localSess?.email ?? "",
            name:
              profile?.name ||
              localSess?.name ||
              (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
              user.email?.split("@")[0] ||
              "User",
            whatsapp:
              profile?.whatsapp ||
              localSess?.whatsapp ||
              (typeof user.user_metadata?.whatsapp === "string" ? user.user_metadata.whatsapp : undefined),
            avatarUrl: profile?.avatar_url ?? localSess?.avatarUrl,
            role: (profile?.primary_role as Role) || localSess?.role,
            handle: profile?.handle ?? localSess?.handle ?? user.email?.split("@")[0],
            bio: profile?.bio ?? localSess?.bio,
          };
          setSession(next);
          localStorage.setItem("vibemrr.session", JSON.stringify(next));
          if (next.whatsapp) {
            await saveMyProfile({
              name: next.name,
              whatsapp: next.whatsapp,
              handle: next.handle,
              bio: next.bio,
              role: next.role,
            }).catch(() => undefined);
          }
        }
        await refreshSb().catch(() => undefined);
        await loadRemoteBids().catch(() => undefined);
      } finally {
        if (alive) setReady(true);
      }
    })();
    const { data: sub } = sb.auth.onAuthStateChange((_e, authSession) => {
      const user = authSession?.user;
      if (!user) return;
      const metaWa =
        typeof user.user_metadata?.whatsapp === "string" ? user.user_metadata.whatsapp : undefined;
      void sb
        .from("profiles")
        .select("name, whatsapp, avatar_url, primary_role, handle, bio")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          setSession((cur) => {
            const next: Session = {
              ...cur,
              id: user.id,
              email: user.email ?? cur?.email ?? "",
              name:
                profile?.name ||
                cur?.name ||
                (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
                user.email?.split("@")[0] ||
                "User",
              whatsapp: profile?.whatsapp || cur?.whatsapp || metaWa,
              avatarUrl: profile?.avatar_url || cur?.avatarUrl,
              role: (profile?.primary_role as Role) || cur?.role,
              handle: profile?.handle || cur?.handle,
              bio: profile?.bio || cur?.bio,
            };
            localStorage.setItem("vibemrr.session", JSON.stringify(next));
            return next;
          });
        });
    });
    const tick = window.setInterval(() => {
      loadRemoteBids().catch(() => undefined);
    }, 4000);
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
      window.clearInterval(tick);
    };
  }, [refreshSb, loadRemoteBids]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("vibemrr.currency", c);
  }, []);

  const signIn = useCallback((s: Session) => {
    const next = { ...s, handle: s.handle || s.email.split("@")[0] };
    setSession(next);
    localStorage.setItem("vibemrr.session", JSON.stringify(next));
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
        await saveMyProfile({
          name: session.name,
          whatsapp: session.whatsapp,
          handle: session.handle,
          bio: session.bio,
          role,
        });
      }
    },
    [session]
  );

  const updateProfile = useCallback(
    async (patch: Partial<Session>) => {
      if (!session) return;
      const wa = (patch.whatsapp ?? session.whatsapp ?? "").replace(/\D/g, "");
      const next = {
        ...session,
        ...patch,
        whatsapp: wa || session.whatsapp,
        handle: (patch.handle || session.handle || session.email.split("@")[0]).replace("@", ""),
      };
      setSession(next);
      localStorage.setItem("vibemrr.session", JSON.stringify(next));
      if (next.whatsapp && session.id) {
        setProducts((cur) => {
          const mapped = cur.map((p) => (p.ownerId === session.id ? { ...p, sellerWhatsapp: next.whatsapp } : p));
          for (const p of mapped) {
            if (p.ownerId === session.id && !p.isDemo) localUpsertProduct(p);
          }
          return mapped;
        });
      }
      if (session.id && isSupabaseConfigured()) {
        await saveMyProfile({
          name: next.name,
          whatsapp: next.whatsapp,
          handle: next.handle,
          bio: next.bio,
          role: next.role,
        });
        if (next.whatsapp) {
          try {
            await createClient()
              .from("products")
              .update({ seller_whatsapp: next.whatsapp })
              .eq("owner_id", session.id);
          } catch {
            /* optional stamp — profile save already succeeded */
          }
        }
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
      const actingAsOwner = !p.ownerId || p.ownerId === session?.id;
      const withWa = {
        ...p,
        sellerWhatsapp: p.sellerWhatsapp || (actingAsOwner ? session?.whatsapp : undefined),
      };
      localUpsertProduct(withWa);
      setProducts((cur) => mergeProducts([], [withWa, ...cur.filter((x) => x.slug !== p.slug)]));
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
          seller_whatsapp: withWa.sellerWhatsapp ?? null,
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
      if (!session.whatsapp) throw new Error("Add WhatsApp in Settings (91XXXXXXXXXX) before bidding.");
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
        buyerWhatsapp: session.whatsapp,
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
        const productId = product.id.match(/^[0-9a-f-]{36}$/i) ? product.id : null;
        const payload: Record<string, unknown> = {
          id: bid.id,
          product_id: productId,
          buyer_id: session.id,
          buyer_name: session.name,
          buyer_email: session.email,
          amount_inr: amountInr,
          status: "pending",
          product_slug: product.slug,
          product_name: product.name,
          asking_inr: product.askingInr,
          seller_id: product.ownerId ?? null,
        };
        const { error } = await createClient().from("bids").insert(payload);
        if (error) {
          await createClient().from("bids").insert({
            id: bid.id,
            product_id: productId,
            buyer_id: session.id,
            buyer_name: session.name,
            buyer_email: session.email,
            amount_inr: amountInr,
            status: "pending",
          });
        }
        await createClient().from("bid_messages").insert({
          id: msg.id,
          bid_id: bid.id,
          actor_name: session.name,
          role: "buyer",
          amount_inr: amountInr,
          message,
          kind: "bid",
        });
      }
    },
    [session, persist, notify]
  );

  const respondBid = useCallback(
    async (bidId: string, kind: "accept" | "reject" | "counter", amountInr?: number, message?: string) => {
      if (!session) throw new Error("Sign in");
      const current = bids.find((b) => b.id === bidId);
      const status: BidStatus = kind === "accept" ? "accepted" : kind === "reject" ? "rejected" : "counter";
      const row: BidMessage = {
        id: uid(),
        role: session.id && current?.sellerId === session.id ? "seller" : current?.buyerId === session.id ? "buyer" : "seller",
        actorName: session.name,
        amountInr: amountInr ?? current?.amountInr,
        message: message || (kind === "counter" ? "Counter offer" : kind),
        kind,
        createdAt: new Date().toISOString(),
      };
      setBids((cur) => {
        const next = cur.map((b) =>
          b.id !== bidId
            ? b
            : {
                ...b,
                status,
                amountInr: amountInr ?? b.amountInr,
                messages: [...b.messages, row],
              }
        );
        localSaveBids(next);
        return next;
      });
      if (kind === "counter" && current) {
        const sellerActing = session.id === current.sellerId;
        const otherId = sellerActing ? current.buyerId : current.sellerId;
        if (otherId) {
          notify({
            userId: otherId,
            title: sellerActing ? "Seller counteroffer" : "Buyer counteroffer",
            body: `${session.name} countered ${current.productName} at ₹${amountInr ?? current.amountInr}`,
            href: "/dashboard?tab=bids",
          });
        }
      }
      if (persist === "sb") {
        const sb = createClient();
        await sb.from("bids").update({ status, amount_inr: amountInr ?? current?.amountInr, updated_at: new Date().toISOString() }).eq("id", bidId);
        await sb.from("bid_messages").insert({
          id: row.id,
          bid_id: bidId,
          actor_name: session.name,
          role: row.role,
          amount_inr: row.amountInr ?? null,
          message: row.message,
          kind,
        });
        if (kind === "counter" && current) {
          const sellerActing = session.id === current.sellerId;
          const otherId = sellerActing ? current.buyerId : current.sellerId;
          if (otherId) {
            await sb.from("notifications").insert({
              user_id: otherId,
              title: sellerActing ? "Seller counteroffer" : "Buyer counteroffer",
              body: `${session.name} countered ${current.productName} at ₹${amountInr ?? current.amountInr}`,
              href: "/dashboard?tab=bids",
            });
          }
        }
      }
      if (kind === "accept" && current) {
        const product = products.find((p) => p.slug === current.productSlug);
        const sellerIsActor = !!session.id && session.id === current.sellerId;
        const own = validWhatsApp(session.whatsapp);
        const sellerId = current.sellerId || product?.ownerId;
        const sellerContact = await lookupSellerContact({
          ownerId: sellerId,
          ownerName: product?.ownerName,
          slug: current.productSlug,
          productId: current.productId || product?.id,
        });
        const sellerWa = sellerIsActor ? own || sellerContact.whatsapp : sellerContact.whatsapp;
        if (!sellerWa) {
          throw new Error(
            sellerIsActor
              ? "Add your WhatsApp in Settings (91XXXXXXXXXX) before accepting. Buyers contact you only after accept."
              : "The seller's WhatsApp is missing. They should add it in Settings (91XXXXXXXXXX)."
          );
        }
        const buyerWa =
          (session.id === current.buyerId ? own : undefined) ||
          (await resolveUserWhatsapp(current.buyerId, current.buyerWhatsapp));
        const now = new Date().toISOString();
        const deal: Order = {
          id: uid(),
          productId: current.productId,
          productName: current.productName,
          productSlug: current.productSlug,
          buyerId: current.buyerId,
          buyerName: current.buyerName,
          buyerEmail: current.buyerEmail,
          sellerId: sellerContact.ownerId || current.sellerId || session.id,
          sellerName: sellerIsActor ? session.name : product?.ownerName,
          sellerWhatsapp: sellerWa,
          buyerWhatsapp: buyerWa,
          bidId: current.id,
          amountInr: amountInr ?? current.amountInr,
          paymentStatus: "pending",
          dealStatus: "accepted",
          acceptedAt: now,
          handover: {},
          createdAt: now,
        };
        setOrders((cur) => {
          const next = [deal, ...cur];
          localSaveOrders(next);
          return next;
        });
        if (current.buyerId) {
          notify({
            userId: current.buyerId,
            title: "Offer accepted",
            body: `Your offer on ${current.productName} was accepted. Continue on WhatsApp.`,
            href: `/checkout/${deal.id}`,
          });
        }
        if (persist === "sb") {
          await createClient().from("orders").insert({
            id: deal.id,
            product_id: current.productId.match(/^[0-9a-f-]{36}$/i) ? current.productId : null,
            product_name: deal.productName,
            buyer_id: deal.buyerId ?? null,
            seller_id: deal.sellerId ?? null,
            bid_id: deal.bidId ?? null,
            amount_inr: deal.amountInr,
            payment_status: "pending",
            deal_status: "accepted",
            accepted_at: now,
            seller_whatsapp: deal.sellerWhatsapp ?? null,
            buyer_whatsapp: deal.buyerWhatsapp ?? null,
            buyer_name: deal.buyerName ?? null,
            seller_name: deal.sellerName ?? null,
            buyer_email: deal.buyerEmail ?? null,
          });
        }
        return deal;
      }
    },
    [session, bids, persist, notify, products]
  );

  const checkout = useCallback(
    async (product: Product, amountInr: number, bidId?: string) => {
      if (!session) throw new Error("Sign in to buy");
      if (!session.whatsapp) throw new Error("Add WhatsApp in Settings (91XXXXXXXXXX) before buying.");
      const own = validWhatsApp(session.whatsapp);
      const seller = await lookupSellerContact({
        ownerId: product.ownerId,
        ownerName: product.ownerName,
        slug: product.slug,
        productId: product.id,
      });
      const now = new Date().toISOString();
      const order: Order = {
        id: uid(),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        buyerId: session.id,
        buyerName: session.name,
        buyerEmail: session.email,
        buyerWhatsapp: own,
        sellerId: seller.ownerId || product.ownerId,
        sellerName: seller.ownerName || product.ownerName,
        sellerWhatsapp: seller.whatsapp,
        bidId,
        amountInr,
        paymentStatus: "pending",
        dealStatus: "accepted",
        acceptedAt: now,
        handover: {},
        createdAt: now,
      };
      setOrders((cur) => {
        const next = [order, ...cur];
        localSaveOrders(next);
        return next;
      });
      if (persist === "sb") {
        const sb = createClient();
        const row: Record<string, unknown> = {
          id: order.id,
          product_id: product.id.match(/^[0-9a-f-]{36}$/i) ? product.id : null,
          product_name: order.productName,
          buyer_id: order.buyerId ?? null,
          seller_id: order.sellerId ?? null,
          bid_id: bidId ?? null,
          amount_inr: amountInr,
          payment_status: "pending",
          deal_status: "accepted",
          accepted_at: now,
          seller_whatsapp: order.sellerWhatsapp ?? null,
          buyer_whatsapp: order.buyerWhatsapp ?? null,
          buyer_name: order.buyerName ?? null,
          seller_name: order.sellerName ?? null,
          buyer_email: order.buyerEmail ?? null,
        };
        const { error } = await sb.from("orders").insert(row);
        if (error) {
          await sb.from("orders").insert({
            id: order.id,
            product_id: row.product_id,
            product_name: order.productName,
            buyer_id: order.buyerId ?? null,
            seller_id: order.sellerId ?? null,
            amount_inr: amountInr,
            payment_status: "pending",
          });
        }
      }
      if (product.ownerId && product.ownerId !== session.id) {
        notify({
          userId: product.ownerId,
          title: "Buy now — deal recorded",
          body: `${session.name} matched your asking price on ${product.name}.`,
          href: `/checkout/${order.id}`,
        });
      }
      return order;
    },
    [session, persist, notify]
  );

  const markDeal = useCallback(async (orderId: string, status: DealStatus) => {
    setOrders((cur) => {
      const next = cur.map((o) =>
        o.id === orderId
          ? {
              ...o,
              dealStatus: status,
              paymentStatus: status === "completed" ? ("paid" as const) : o.paymentStatus,
            }
          : o
      );
      localSaveOrders(next);
      return next;
    });
    if (status === "completed") {
      setOrders((cur) => {
        const paid = cur.find((o) => o.id === orderId);
        if (paid?.productSlug) {
          setProducts((ps) => ps.map((p) => (p.slug === paid.productSlug ? { ...p, status: "sold" as const } : p)));
        }
        if (paid?.bidId) {
          setBids((bs) => {
            const next = bs.map((b) => (b.id === paid.bidId ? { ...b, status: "purchased" as const } : b));
            localSaveBids(next);
            return next;
          });
        }
        return cur;
      });
    }
    if (persist === "sb") {
      await createClient()
        .from("orders")
        .update({ deal_status: status, payment_status: status === "completed" ? "paid" : "pending" })
        .eq("id", orderId);
    }
  }, [persist]);

  const markPaid = useCallback(async (orderId: string) => markDeal(orderId, "completed"), [markDeal]);

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
      updateProfile,
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
      markDeal,
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
      updateProfile,
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
      markDeal,
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
