"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Currency, Offer, Session, Startup } from "@/lib/types";
import {
  addOffer as persistOffer,
  allStartups,
  deleteExtraStartup,
  getOffers,
  getSaved,
  getSession,
  setSession as persistSession,
  toggleSaved as persistSaved,
  upsertStartup,
} from "@/lib/store";
import { mergeCatalog } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { rowToOffer, rowToStartup, startupToRow, type OfferRow, type StartupRow } from "@/lib/supabase/map";

type Ctx = {
  ready: boolean;
  persistence: "supabase" | "local";
  currency: Currency;
  setCurrency: (c: Currency) => void;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Session>) => Promise<void>;
  startups: Startup[];
  addStartup: (s: Startup) => Promise<void>;
  deleteStartup: (slug: string) => Promise<void>;
  offers: Offer[];
  sendOffer: (o: Offer) => Promise<void>;
  saved: string[];
  toggleSaved: (slug: string) => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

function sessionFromUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  profile?: { name?: string | null; whatsapp?: string | null; avatar_url?: string | null } | null
): Session {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      profile?.name ||
      (typeof meta.full_name === "string" ? meta.full_name : "") ||
      (typeof meta.name === "string" ? meta.name : "") ||
      (user.email?.split("@")[0] ?? "Founder"),
    whatsapp: profile?.whatsapp ?? undefined,
    avatarUrl:
      profile?.avatar_url ||
      (typeof meta.avatar_url === "string" ? meta.avatar_url : undefined),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const persistence: "supabase" | "local" = isSupabaseConfigured() ? "supabase" : "local";
  const [ready, setReady] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [session, setSession] = useState<Session | null>(null);
  const [startups, setStartups] = useState<Startup[]>(() => mergeCatalog([]));
  const [offers, setOffers] = useState<Offer[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  const refreshRemote = useCallback(async (userId?: string | null) => {
    const supabase = createClient();
    const { data: startupData, error } = await supabase
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setStartups(mergeCatalog(((startupData ?? []) as StartupRow[]).map(rowToStartup)));

    if (!userId) {
      setOffers([]);
      setSaved([]);
      return;
    }

    const [{ data: offerData }, { data: savedData }] = await Promise.all([
      supabase.from("offers").select("*").order("created_at", { ascending: false }),
      supabase.from("saved").select("startup_slug").eq("user_id", userId),
    ]);
    setOffers(((offerData ?? []) as OfferRow[]).map(rowToOffer));
    setSaved(((savedData ?? []) as { startup_slug: string }[]).map((r) => r.startup_slug));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("vibemrr.currency");
    setCurrencyState(stored === "USD" ? "USD" : "INR");

    if (persistence === "local") {
      setSession(getSession());
      setStartups(allStartups());
      setOffers(getOffers());
      setSaved(getSaved());
      setReady(true);
      return;
    }

    const supabase = createClient();
    let alive = true;

    async function boot() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, whatsapp, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (!alive) return;
        setSession(sessionFromUser(user, profile));
        await refreshRemote(user.id);
      } else {
        setSession(null);
        await refreshRemote(null);
      }
      if (alive) setReady(true);
    }

    boot().catch((err) => {
      console.error(err);
      setStartups(mergeCatalog([]));
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, authSession) => {
      const user = authSession?.user;
      void (async () => {
        try {
          if (!user) {
            setSession(null);
            await refreshRemote(null);
            return;
          }
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, whatsapp, avatar_url")
            .eq("id", user.id)
            .maybeSingle();
          setSession(sessionFromUser(user, profile));
          await refreshRemote(user.id);
        } catch (err) {
          console.error(err);
        }
      })();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [persistence, refreshRemote]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("vibemrr.currency", c);
  }, []);

  const signIn = useCallback(
    (s: Session) => {
      if (persistence === "supabase") {
        setSession((cur) => ({ ...cur, ...s, id: cur?.id ?? s.id }));
        return;
      }
      persistSession(s);
      setSession(s);
    },
    [persistence]
  );

  const signOut = useCallback(async () => {
    if (persistence === "supabase") {
      await createClient().auth.signOut();
      setSession(null);
      setOffers([]);
      setSaved([]);
      return;
    }
    persistSession(null);
    setSession(null);
  }, [persistence]);

  const updateProfile = useCallback(
    async (patch: Partial<Session>) => {
      const next = { ...(session ?? { email: "", name: "Founder" }), ...patch };
      setSession(next);
      if (persistence === "local") {
        persistSession(next);
        return;
      }
      if (!next.id) return;
      await createClient()
        .from("profiles")
        .upsert({
          id: next.id,
          email: next.email,
          name: next.name,
          whatsapp: next.whatsapp ?? null,
          avatar_url: next.avatarUrl ?? null,
          updated_at: new Date().toISOString(),
        });
    },
    [persistence, session]
  );

  const addStartup = useCallback(
    async (s: Startup) => {
      if (persistence === "local") {
        upsertStartup(s);
        setStartups(allStartups());
        return;
      }
      if (!session?.id) throw new Error("Sign in to publish a listing");
      const row = startupToRow(s, session.id, session.email);
      const { error } = await createClient()
        .from("startups")
        .upsert(row, { onConflict: "slug" });
      if (error) throw error;
      await refreshRemote(session.id);
    },
    [persistence, session, refreshRemote]
  );

  const deleteStartup = useCallback(
    async (slug: string) => {
      if (persistence === "local") {
        deleteExtraStartup(slug);
        setStartups(allStartups());
        return;
      }
      if (!session?.id) throw new Error("Sign in to delete a listing");
      const { error } = await createClient()
        .from("startups")
        .delete()
        .eq("slug", slug)
        .eq("owner_id", session.id);
      if (error) throw error;
      await refreshRemote(session.id);
    },
    [persistence, session, refreshRemote]
  );

  const sendOffer = useCallback(
    async (o: Offer) => {
      if (persistence === "local") {
        persistOffer(o);
        setOffers(getOffers());
        return;
      }
      if (!session?.id) throw new Error("Sign in to send an offer");
      const { error } = await createClient().from("offers").insert({
        startup_slug: o.startupSlug,
        buyer_id: session.id,
        buyer_name: o.buyerName,
        buyer_email: o.buyerEmail,
        buyer_whatsapp: o.buyerWhatsapp ?? null,
        amount_inr: o.amountInr,
        message: o.message,
      });
      if (error) throw error;
      await refreshRemote(session.id);
    },
    [persistence, session, refreshRemote]
  );

  const toggleSaved = useCallback(
    async (slug: string) => {
      if (persistence === "local") {
        setSaved(persistSaved(slug));
        return;
      }
      if (!session?.id) throw new Error("Sign in to save listings");
      const supabase = createClient();
      if (saved.includes(slug)) {
        await supabase.from("saved").delete().eq("user_id", session.id).eq("startup_slug", slug);
        setSaved((cur) => cur.filter((s) => s !== slug));
      } else {
        await supabase.from("saved").insert({ user_id: session.id, startup_slug: slug });
        setSaved((cur) => [slug, ...cur]);
      }
    },
    [persistence, session, saved]
  );

  const value = useMemo(
    () => ({
      ready,
      persistence,
      currency,
      setCurrency,
      session,
      signIn,
      signOut,
      updateProfile,
      startups,
      addStartup,
      deleteStartup,
      offers,
      sendOffer,
      saved,
      toggleSaved,
    }),
    [
      ready,
      persistence,
      currency,
      setCurrency,
      session,
      signIn,
      signOut,
      updateProfile,
      startups,
      addStartup,
      deleteStartup,
      offers,
      sendOffer,
      saved,
      toggleSaved,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
