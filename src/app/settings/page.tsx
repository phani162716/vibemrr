"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/app-provider";

export default function SettingsPage() {
  const { session, setRole, updateProfile, signOut } = useApp();
  const router = useRouter();
  const [name, setName] = useState(session?.name ?? "");
  const [handle, setHandle] = useState(session?.handle ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [bio, setBio] = useState(session?.bio ?? "");
  const [saved, setSaved] = useState(false);

  if (!session) {
    return (
      <div className="px-4 py-16 text-center">
        <Link href="/dashboard" className="text-saffron">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-zinc-500">{session.email}</p>
      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void updateProfile({ name, handle, whatsapp, bio }).then(() => setSaved(true));
        }}
      >
        <label className="block text-xs text-zinc-400">
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-zinc-400">
          Handle
          <input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-zinc-400">
          WhatsApp
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-zinc-400">
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-zinc-400">
          Primary role
          <select
            value={session.role ?? "buyer"}
            onChange={(e) => void setRole(e.target.value as "buyer" | "seller")}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>
        <button className="w-full rounded-xl bg-saffron py-2.5 text-sm font-semibold text-zinc-950">Save profile</button>
        {saved && <p className="text-xs text-emerald-400">Saved</p>}
      </form>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="mt-8 w-full rounded-xl border border-red-400/40 py-2.5 text-sm font-medium text-red-400"
      >
        Sign out
      </button>
    </div>
  );
}
