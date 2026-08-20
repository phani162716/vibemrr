export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#F97316" />
      <path
        d="M8 21.5V10.5h3.1c2.7 0 4.3 1.4 4.3 3.6 0 1.4-.7 2.5-2 3.1l2.6 4.3h-2.5l-2.3-3.9h-1.1v3.9H8zm3.1-5.7c1.3 0 2.1-.7 2.1-1.8s-.8-1.8-2.1-1.8H10.2v3.6h.9zM22.4 21.7c-2.6 0-4.3-1.9-4.3-4.7s1.7-4.7 4.3-4.7 4.3 1.9 4.3 4.7-1.7 4.7-4.3 4.7zm0-1.9c1.3 0 2.1-1 2.1-2.8s-.8-2.8-2.1-2.8-2.1 1-2.1 2.8.8 2.8 2.1 2.8z"
        fill="#1E2A5A"
      />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Logo className="h-8 w-8" />
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Vibers
        {!compact && (
          <span className="ml-2 hidden rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 sm:inline">
            India
          </span>
        )}
      </span>
    </span>
  );
}
