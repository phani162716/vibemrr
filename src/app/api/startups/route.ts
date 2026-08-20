import { NextResponse } from "next/server";
import { SEED_PRODUCTS } from "@/lib/products-seed";

export async function GET() {
  return NextResponse.json({
    source: "Vibers",
    products: SEED_PRODUCTS.map((p) => ({
      slug: p.slug,
      name: p.name,
      type: p.productType,
      niche: p.niche,
      askingInr: p.askingInr,
      status: p.status,
    })),
  });
}
