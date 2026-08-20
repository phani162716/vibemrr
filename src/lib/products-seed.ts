import type { Product } from "./types";

/** No fake listings. Marketplace starts empty for real founders. */
export const SEED_PRODUCTS: Product[] = [];

/** Test listings from development — never show these. */
export const RETIRED_TEST_SLUGS = new Set(["somthing"]);
