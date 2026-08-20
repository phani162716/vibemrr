# VibeMRR — session handoff (continue tomorrow)

Owner: Phanindra Rayapudi. Stopped 19 Aug 2026; pick up here.

## What this is

India-first TrustMRR-style **verified rupee revenue marketplace** for vibe-coded SaaS. Not a broker, escrow, or bank. Deals close on WhatsApp / NEFT. **Free for everyone this year** — no listing fee, no sale fee, no cut.

## Live links

- Canonical domain (chosen): https://vibers.co — register it, then point DNS to Vercel
- Fallback: https://vibemrr.vercel.app
- Add listing: https://vibemrr.vercel.app/add
- Invite: https://vibemrr.vercel.app/invite
- GitHub: https://github.com/phani162716/vibemrr
- Local: `C:\Users\rayap\OneDrive\Desktop\vibemrr` → `npm run dev` → http://localhost:3000

## Accounts

- GitHub: `phani162716`
- Vercel: `rayapudiphanindra-3541` (team `ph-ani`, project `vibemrr`)
- Supabase project: `omokvloeumvgwjedslsx` → `https://omokvloeumvgwjedslsx.supabase.co`
- Auth: email + password (Google Cloud **not** used). Confirm email **off**.
- Supabase Site URL: `https://vibemrr.vercel.app`
- Redirects: `https://vibemrr.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

Secrets live in `vibemrr/.env.local` and Vercel env. **Never commit `.env.local`.** Do not paste `service_role` or `sbp_` tokens in chat.

## Product decisions

- Demo-verify (hashed fake MRR) is **gone**. Live pull from Razorpay, Cashfree, or Stripe via `POST /api/verify-revenue`. Keys used once on the server, **not stored**.
- Unverified listings show ₹0 + Unverified copy. Verified badge only after a successful API pull.
- Seed demo cards (FilGST, Whatsly, …) hidden unless `NEXT_PUBLIC_SHOW_DEMOS=true`.
- Extra buyer fields persist in `tech.details` JSON (no extra SQL column).
- First growth: 5 personal founder invites, not ads.

## Listing form (current)

Steps: **Basics → Verify → For buyers → Publish**

- Basics: name, site, pitch, description, category, city, audience, funding, founded, team, vibe-coded, stealth
- Verify: Razorpay Key Id + Secret with **why** copy; Cashfree / Stripe equivalents
- For buyers: contact, GSTIN, value prop, problem, pricing, users, profit %, hours/week, monthly costs, churn, traffic, stack, GitHub, competitors, risk, channels
- Publish: for sale, asking ₹, why selling, assets included, handover weeks

Public listing page shows those insights when filled.

## Existing data

- At least one real listing: slug `picsart` (created before live verify — still unverified / old numbers until re-listed or Edit gets verify).
- Tables: `profiles`, `startups`, `offers`, `saved`

## Tomorrow — pick up here

1. Sign in on https://vibemrr.vercel.app/dashboard and confirm login works.
2. Re-publish or extend **Edit** so `picsart` can **Pull live revenue** and get the Verified badge.
3. Optional: same extra buyer fields on `/startup/[slug]/edit`.
4. Invite 5 real founders via `/invite` (WhatsApp copy).
5. Do **not** add paid plans, escrow, or ads until later.

## Deploy

```powershell
cd C:\Users\rayap\OneDrive\Desktop\vibemrr
git add -A
git commit -m "message"
git push origin master
npx vercel --prod --yes
```

Vercel GitHub link may still be missing (Login Connection). CLI deploy is the path that works.
