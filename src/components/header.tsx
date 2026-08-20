"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "./app-provider";
import { Wordmark } from "./logo";
import { IconPlus, IconX } from "./icons";

const NAV = [
  { href: "/market", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { currency, setCurrency, session, notices, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unread = notices.filter((n) => !n.read && (!session?.id || n.userId === session.id)).length;
  const initial = (session?.name || session?.email || "?").charAt(0).toUpperCase();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function onSignOut() {
    setMenu(false);
    setOpen(false);
    await signOut();
    router.push("/");
  }

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
          </Link>
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 py-0.5 pl-0.5 pr-2 hover:bg-white/8"
                aria-label="Account menu"
              >
                {session.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-zinc-950">
                    {initial}
                  </span>
                )}
                <span className="hidden max-w-[120px] truncate text-sm text-zinc-200 sm:inline">{session.name}</span>
                {unread > 0 && <span className="h-2 w-2 rounded-full bg-saffron" />}
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#121216] py-1 shadow-xl">
                  <div className="border-b border-white/8 px-3 py-2">
                    <p className="truncate text-sm font-medium">{session.name}</p>
                    <p className="truncate text-xs text-zinc-500">{session.email}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-saffron">{session.role ?? "no role"}</p>
                  </div>
                  <Link href="/profile" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/6">
                    My profile
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/6">
                    Dashboard
                  </Link>
                  <Link href="/notifications" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/6">
                    Inbox {unread > 0 ? `(${unread})` : ""}
                  </Link>
                  <Link href="/settings" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm text-zinc-200 hover:bg-white/6">
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => void onSignOut()}
                    className="w-full border-t border-white/8 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/6"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/dashboard" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-200">
              Sign in
            </Link>
          )}
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
          {session && (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300">
                My profile
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300">
                Settings
              </Link>
              <button type="button" onClick={() => void onSignOut()} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400">
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
