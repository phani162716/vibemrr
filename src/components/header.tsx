"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "./app-provider";
import { Wordmark } from "./logo";
import { IconPlus, IconX } from "./icons";

const NAV = [
  { href: "/market", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Inbox" },
];

export function Header() {
  const path = usePathname();
  const { currency, setCurrency, session, notices } = useApp();
  const [open, setOpen] = useState(false);
  const unread = notices.filter((n) => !n.read && (!session?.id || n.userId === session.id)).length;

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                path.startsWith(n.href) ? "bg-white/8 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              {n.label}
              {n.href === "/notifications" && unread > 0 ? ` (${unread})` : ""}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-white/8 bg-white/4 p-0.5 text-xs sm:flex">
            {(["INR", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-md px-2 py-1 font-medium ${currency === c ? "bg-white/12 text-white" : "text-zinc-500"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <Link
            href="/add"
            className="inline-flex items-center gap-1.5 rounded-lg bg-saffron px-3 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-saffron-2"
          >
            <IconPlus />
            <span className="hidden sm:inline">List product</span>
            <span className="sm:hidden">List</span>
          </Link>
          <Link href="/dashboard" className="hidden text-xs text-zinc-500 hover:text-zinc-200 md:inline">
            {session ? session.name.split(" ")[0] : "Sign in"}
          </Link>
          <button className="rounded-lg p-2 text-zinc-400 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <IconX /> : <span className="text-lg leading-none">☰</span>}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/6 px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300">
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
