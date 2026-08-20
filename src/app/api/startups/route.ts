import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    source: "Vibers",
    products: [] as { slug: string }[],
  });
}
