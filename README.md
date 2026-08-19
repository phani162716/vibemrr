# VibeMRR

INR-first replica of a TrustMRR-style **verified revenue marketplace**, rebuilt for Indian SaaS founders and vibe coders.

Not affiliated with TrustMRR.

## Why this exists

TrustMRR is excellent if you invoice on Stripe and think in dollars. Most Indian indie products collect on **Razorpay / Cashfree / PhonePe**, price in **₹**, and close deals on **WhatsApp**. VibeMRR copies the product loop and changes the defaults:

| TrustMRR | VibeMRR |
|---|---|
| USD | INR primary, USD toggle |
| Stripe / Polar / Paddle | Razorpay, Cashfree, PhonePe, PayU, Stripe India, Dodo, Lemon Squeezy |
| Email + Escrow.com | WhatsApp-first + Indian escrow / CA notes |
| $29 / $199 / $499 listing | ₹2,499 / ₹14,999 / ₹39,999 |
| Stripe key required to exist | 60s **demo-verify**, then swap a real key |
| Generic SaaS | GSTIN, entity type, Indian cities, vibe-coded badge |

## Run it

```bash
cd vibemrr
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Persist listings (free auth — no Google Cloud)

The preview works without this. Connect it before you onboard real founders.

Auth is **email + password** (included in Supabase free) or optional **GitHub OAuth** (also free). You do not need Google Cloud.

1. Create a free Supabase project (Mumbai if possible).
2. Run `supabase/schema.sql` in the SQL editor.
3. Leave Email provider enabled. Add `http://localhost:3000/auth/callback` under Authentication → URL Configuration.
4. Copy `env.example` → `.env.local` and paste the project URL + anon key.
5. Restart `npm run dev` and open `/setup`.

Until keys exist, listings stay in `localStorage` and a banner on the site points here.

## Publish (Vercel)

See `/launch` in the app or:

1. Push this folder to GitHub (never commit `.env.local`).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. In Supabase Auth URL config, add `https://YOUR-APP.vercel.app/auth/callback`.

## What's included

- Home: recently listed, best deals (lowest multiples), MRR leaderboard
- Marketplace with city / category / vibe-coded filters
- Startup + founder pages, save, WhatsApp contact, in-app offers
- Stats: provider mix, city MRR, quiet giants
- Add-startup wizard (demo verify hashes the name into fake-but-stable metrics)
- Dashboard: your listings, inbound offers, saved deals
- Public JSON API at `/api/startups` and `/llms.txt`

Listings you add live in `localStorage` so a refresh keeps them. Seed data is 24 fictional-but-plausible Indian startups (FilGST, Whatsly, ClinicStack, …).

## Production next steps

This is a working front-end product demo, not a payments-live backend.

1. Persist startups in Postgres (Neon / Supabase Mumbai).
2. Verify Razorpay with a **read-only** token; never store write keys.
3. Auth: WhatsApp OTP or Google.
4. Real checkout for listing plans (Razorpay orders).
5. Offer inbox + email/WhatsApp notify.
6. Optional Grok insights (`XAI_API_KEY` + `https://api.x.ai/v1`) to auto-write value prop / problem from the website.

## Stack

Next.js 16 · React 19 · Tailwind 4 · TypeScript · no database
