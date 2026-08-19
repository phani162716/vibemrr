import { NextResponse } from "next/server";
import { verifyCashfree, verifyRazorpay, verifyStripe } from "@/lib/verify/providers";

export async function POST(request: Request) {
  let body: { provider?: string; keyId?: string; keySecret?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provider = (body.provider ?? "").toLowerCase();
  const keySecret = (body.keySecret ?? "").trim();
  const keyId = (body.keyId ?? "").trim();

  if (!keySecret) {
    return NextResponse.json({ error: "Paste your payment secret / key." }, { status: 400 });
  }

  try {
    let metrics;
    if (provider === "razorpay") {
      if (!keyId.startsWith("rzp_")) {
        return NextResponse.json(
          { error: "Razorpay Key Id looks like rzp_live_… (from Dashboard → Account & Settings → API Keys)." },
          { status: 400 }
        );
      }
      metrics = await verifyRazorpay(keyId, keySecret);
    } else if (provider === "stripe") {
      if (!keySecret.startsWith("sk_") && !keySecret.startsWith("rk_")) {
        return NextResponse.json(
          { error: "Stripe key should start with rk_live_ (restricted) or sk_live_." },
          { status: 400 }
        );
      }
      metrics = await verifyStripe(keySecret);
    } else if (provider === "cashfree") {
      if (!keyId) {
        return NextResponse.json({ error: "Cashfree needs Client ID + Client Secret." }, { status: 400 });
      }
      metrics = await verifyCashfree(keyId, keySecret);
    } else {
      return NextResponse.json(
        {
          error:
            "Live verify currently supports Razorpay, Cashfree, and Stripe. List unverified, or pick one of those three.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, verified: true, metrics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
