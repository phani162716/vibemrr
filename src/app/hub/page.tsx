"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-provider";
import { AuthPanel } from "@/components/auth-panel";
import { moneyFull } from "@/lib/format";
import {
  isListedViber,
  loadHub,
  postHubMessage,
  postHubOffer,
  postHubRequest,
  setHubOfferStatus,
} from "@/lib/hub";
import type { HubMessage, HubOffer, HubRequest } from "@/lib/types";

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `hub-${Date.now()}`;
}

export default function HubPage() {
  const router = useRouter();
  const { session, products, currency, pushNotice, acceptHubOffer } = useApp();
  const [tab, setTab] = useState<"chat" | "requests">("requests");
  const [messages, setMessages] = useState<HubMessage[]>([]);
  const [requests, setRequests] = useState<HubRequest[]>([]);
  const [offers, setOffers] = useState<HubOffer[]>([]);
  const [remoteOk, setRemoteOk] = useState(true);
  const [chat, setChat] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [offerDraft, setOfferDraft] = useState<Record<string, { amount: string; message: string }>>({});
  const scroller = useRef<HTMLDivElement>(null);
  const viber = isListedViber(products, session?.id);

  async function refresh() {
    const data = await loadHub();
    setMessages(data.messages);
    setRequests(data.requests);
    setOffers(data.offers);
    setRemoteOk(data.remoteOk);
  }

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const offersByRequest = useMemo(() => {
    const map = new Map<string, HubOffer[]>();
    for (const o of offers) {
      const list = map.get(o.requestId) ?? [];
      list.push(o);
      map.set(o.requestId, list);
    }
    return map;
  }, [offers]);

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-2">VibersHub</p>
        <h1 className="font-serif mt-1 text-4xl">Sign in to use the Hub</h1>
        <p className="mt-2 text-sm text-muted">
          Buyers post custom-work requests. Vibers (anyone who listed a product) chat and send offers.
        </p>
        <div className="mt-6">
          <AuthPanel next="/hub" />
        </div>
      </div>
    );
  }
  const user = session;

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!user.id) {
      setErr("Sign in again so your account id is saved, then retry.");
      return;
    }
    if (!viber) {
      setErr("List at least one product to chat in VibersHub.");
      return;
    }
    const body = chat.trim();
    if (body.length < 2) return;
    const row: HubMessage = {
      id: uid(),
      authorId: user.id,
      authorName: user.name,
      body: body.slice(0, 800),
      createdAt: new Date().toISOString(),
    };
    setChat("");
    setMessages((cur) => [...cur, row]);
    try {
      await postHubMessage(row);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not send");
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!user.id) {
      setErr("Sign in again so your account id is saved, then retry.");
      return;
    }
    const t = title.trim();
    const d = description.trim();
    const b = Number(budget);
    if (t.length < 4) {
      setErr("Add a short title for what you need.");
      return;
    }
    if (d.length < 10) {
      setErr("Describe how you want it built.");
      return;
    }
    if (!Number.isFinite(b) || b <= 0) {
      setErr("Enter a budget in ₹.");
      return;
    }
    const row: HubRequest = {
      id: uid(),
      buyerId: user.id,
      buyerName: user.name,
      title: t.slice(0, 120),
      description: d.slice(0, 2000),
      budgetInr: Math.round(b),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setTitle("");
    setDescription("");
    setBudget("");
    setRequests((cur) => [row, ...cur]);
    setTab("requests");
    try {
      await postHubRequest(row);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not post request");
    }
  }

  async function sendOffer(request: HubRequest) {
    setErr(null);
    if (!user.id) {
      setErr("Sign in again so your account id is saved, then retry.");
      return;
    }
    if (!viber) {
      setErr("List a product first, then you can send offers.");
      return;
    }
    if (user.id === request.buyerId) {
      setErr("You cannot offer on your own request.");
      return;
    }
    const draft = offerDraft[request.id] || { amount: "", message: "" };
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErr("Enter your offer amount in ₹.");
      return;
    }
    const row: HubOffer = {
      id: uid(),
      requestId: request.id,
      sellerId: user.id,
      sellerName: user.name,
      amountInr: Math.round(amount),
      message: (draft.message || "").trim().slice(0, 500),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setOffers((cur) => [...cur, row]);
    setOfferDraft((cur) => ({ ...cur, [request.id]: { amount: "", message: "" } }));
    try {
      await postHubOffer(row);
      pushNotice({
        userId: request.buyerId,
        title: "New Hub offer",
        body: `${user.name} offered ${moneyFull(row.amountInr, currency)} on “${request.title}”.`,
        href: "/hub",
      });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not send offer");
    }
  }

  async function onAccept(request: HubRequest, offer: HubOffer) {
    setErr(null);
    try {
      const order = await acceptHubOffer(request, offer);
      await setHubOfferStatus(offer.id, "accepted", request.id);
      setOffers((cur) =>
        cur.map((o) =>
          o.requestId === request.id ? { ...o, status: o.id === offer.id ? "accepted" : o.status === "pending" ? "rejected" : o.status } : o
        )
      );
      setRequests((cur) => cur.map((r) => (r.id === request.id ? { ...r, status: "awarded" } : r)));
      router.push(`/checkout/${order.id}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not accept offer");
    }
  }

  async function onReject(offer: HubOffer) {
    await setHubOfferStatus(offer.id, "rejected");
    setOffers((cur) => cur.map((o) => (o.id === offer.id ? { ...o, status: "rejected" } : o)));
  }

  const chatPane = (
    <div className="flex h-[560px] flex-col rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-4 py-3">
        <p className="font-medium">Viber chat</p>
        <p className="text-xs text-muted">Only people who listed a product can post here.</p>
      </div>
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && <p className="text-sm text-muted">No messages yet. Vibers, say hello.</p>}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl bg-[#F8F9FB] px-3 py-2">
            <p className="text-xs text-muted">
              <span className="font-medium text-foreground">{m.authorName}</span> ·{" "}
              {new Date(m.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
          </div>
        ))}
      </div>
      {viber ? (
        <form onSubmit={(e) => void sendChat(e)} className="flex gap-2 border-t border-border p-3">
          <input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Message other Vibers…"
            className="field"
            maxLength={800}
          />
          <button className="btn-primary shrink-0">Send</button>
        </form>
      ) : (
        <p className="border-t border-border px-4 py-3 text-sm text-muted">
          Buyers cannot chat here.{" "}
          <Link href="/add" className="font-medium text-indigo-2">
            List a product
          </Link>{" "}
          to join as a Viber, or post a custom request instead.
        </p>
      )}
    </div>
  );

  const requestPane = (
    <div className="space-y-4">
      <form onSubmit={(e) => void sendRequest(e)} className="rounded-2xl border border-border bg-white p-4">
        <p className="font-medium">Post a custom request</p>
        <p className="mt-1 text-xs text-muted">Example: I need a customized website to say happy birthday.</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need?"
          className="field mt-3"
          maxLength={120}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="How should it look and work? Any pages, colours, deadline…"
          rows={4}
          className="field mt-2"
          maxLength={2000}
        />
        <input
          type="number"
          min={1}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget you can pay (₹)"
          className="field mt-2"
        />
        <button className="btn-accent mt-3 w-full">Send request</button>
      </form>
      {requests.length === 0 && <p className="text-sm text-muted">No requests yet. Buyers, post what you want built.</p>}
      {requests.map((r) => {
        const mine = offersByRequest.get(r.id) ?? [];
        const draft = offerDraft[r.id] || { amount: "", message: "" };
        const isBuyer = user.id === r.buyerId;
        return (
          <article key={r.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {r.buyerName} · budget {moneyFull(r.budgetInr, currency)} · {r.status}
                </p>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{r.description}</p>
            <div className="mt-3 space-y-2">
              {mine.map((o) => (
                <div key={o.id} className="rounded-xl border border-border bg-[#F8F9FB] p-3 text-sm">
                  <p className="font-medium">
                    {o.sellerName} · {moneyFull(o.amountInr, currency)} · {o.status}
                  </p>
                  {o.message && <p className="mt-1 text-muted">{o.message}</p>}
                  {isBuyer && r.status === "open" && o.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="btn-primary text-xs" onClick={() => void onAccept(r, o)}>
                        Accept offer
                      </button>
                      <button type="button" className="btn-ghost text-xs" onClick={() => void onReject(o)}>
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {viber && r.status === "open" && !isBuyer && (
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <input
                  type="number"
                  min={1}
                  value={draft.amount}
                  onChange={(e) => setOfferDraft((cur) => ({ ...cur, [r.id]: { ...draft, amount: e.target.value } }))}
                  placeholder="Your offer ₹"
                  className="field"
                />
                <input
                  value={draft.message}
                  onChange={(e) => setOfferDraft((cur) => ({ ...cur, [r.id]: { ...draft, message: e.target.value } }))}
                  placeholder="How you’ll build it"
                  className="field"
                />
                <button type="button" className="btn-primary" onClick={() => void sendOffer(r)}>
                  Send offer
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-2">Community</p>
      <h1 className="font-serif mt-1 text-4xl">VibersHub</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Vibers who listed a product can chat. Buyers cannot post in chat — they send a request (what they want and what
        they can pay). Any Viber who can build it sends an offer.
      </p>
      {!remoteOk && (
        <p className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs">
          Hub is saving in this browser. To sync across devices, run <code className="font-mono">supabase/hub.sql</code>{" "}
          once in the Supabase SQL editor.
        </p>
      )}
      {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      <div className="mt-6 flex gap-2 lg:hidden">
        <button type="button" onClick={() => setTab("requests")} className={tab === "requests" ? "btn-primary" : "btn-ghost"}>
          Requests
        </button>
        <button type="button" onClick={() => setTab("chat")} className={tab === "chat" ? "btn-primary" : "btn-ghost"}>
          Chat
        </button>
      </div>
      <div className="mt-6 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 lg:grid">
        {chatPane}
        {requestPane}
      </div>
      <div className="mt-4 lg:hidden">{tab === "chat" ? chatPane : requestPane}</div>
    </div>
  );
}
