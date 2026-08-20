import { SPONSORS } from "@/lib/providers";

export function SponsorRail() {
  const loop = [...SPONSORS, ...SPONSORS];
  return (
    <div className="border-b border-border bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-hidden px-4 py-2">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Advertise · 5/20
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max gap-6">
            {loop.map((s, i) => (
              <a
                key={`${s.name}-${i}`}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs text-muted hover:text-foreground"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
