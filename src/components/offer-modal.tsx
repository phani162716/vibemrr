"use client";

import { useState } from "react";
import type { Startup } from "@/lib/types";
import { moneyFull } from "@/lib/format";
import { useApp } from "./app-provider";
import { IconWhatsApp, IconX } from "./icons";

export function OfferModal({
  startup,
  onClose,
}: {
  startup: Startup;
  onClose: () => void;
}) {
  const { currency, session, sendOffer, persistence } = useApp();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [amount, setAmount] = useState(startup.askingInr ? String(startup.askingInr) : "");
  const [message, setMessage] = useState(
    `Hi ${startup.founder.name.split(" ")[0]}, I'm interested in acquiring ${startup.anonymous ? "this startup" : startup.name}. I can close on UPI / NEFT / escrow and I'm happy to sign an NDA first.`
  );
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (persistence === "supabase" && !session?.id) {
      setError("Sign in from the dashboard before sending an offer.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendOffer({
        id: crypto.randomUUID(),
        startupSlug: startup.slug,
        buyerName: name,
        buyerEmail: email,
        buyerWhatsapp: whatsapp,
        amountInr: Number(amount) || 0,
        message,
        createdAt: new Date().toISOString(),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send offer");
    } finally {
      setSending(false);
    }
  }

  const wa = startup.founder.whatsapp
    ? `https://wa.me/${startup.founder.whatsapp}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111114] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contact seller</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:text-white">
            <IconX />
          </button>
        </div>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Offer sent. The founder will see it in their dashboard. On VibeMRR, most Indian deals
              still close faster on WhatsApp.
            </p>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-zinc-950"
              >
                <IconWhatsApp /> Continue on WhatsApp
              </a>
            )}
            <button onClick={onClose} className="block text-sm text-zinc-500 hover:text-white">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Field label="Your name" value={name} onChange={setName} required />
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="91XXXXXXXXXX" />
            <Field
              label={`Offer amount (${currency})`}
              value={amount}
              onChange={setAmount}
              type="number"
            />
            {amount && (
              <p className="text-xs text-zinc-500">
                {moneyFull(Number(amount) || 0, currency)} · asking{" "}
                {startup.askingInr ? moneyFull(startup.askingInr, currency) : "open"}
              </p>
            )}
            <label className="block text-xs text-zinc-400">
              Message
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-saffron/50"
              />
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send offer"}
              </button>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-200"
                >
                  <IconWhatsApp /> WhatsApp first
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs text-zinc-400">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-saffron/50"
      />
    </label>
  );
}
