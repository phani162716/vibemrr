"use client";

import Link from "next/link";
import { useApp } from "@/components/app-provider";

export default function NotificationsPage() {
  const { session, notices, markNoticesRead } = useApp();
  const mine = notices.filter((n) => !session?.id || n.userId === session.id || n.userId === session?.email);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Inbox</h1>
        <button onClick={markNoticesRead} className="text-xs text-muted">
          Mark all read
        </button>
      </div>
      <div className="mt-8 space-y-3">
        {mine.length === 0 && <p className="text-sm text-muted">No notifications yet.</p>}
        {mine.map((n) => (
          <Link
            key={n.id}
            href={n.href || "/dashboard"}
            className={`block rounded-2xl border p-4 ${n.read ? "border-border" : "border-saffron/30 bg-accent/10"}`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted">{n.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
