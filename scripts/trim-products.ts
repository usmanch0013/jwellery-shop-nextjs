#!/usr/bin/env npx tsx
/**
 * Remove bulk-generated demo products from Supabase (keeps curated seed catalog).
 * Usage: npm run db:trim-products
 */
import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require("ws") as typeof import("ws");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

async function trim() {
  const { count: before } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .like("legacy_id", "bulk-%");

  if (error) {
    console.error("Delete failed:", error.message);
    process.exit(1);
  }

  console.log(`Removed ${count ?? 0} bulk products.`);

  const keepLegacyIds = new Set(products.map((p) => p.id));
  const { data: rows, error: listError } = await supabase
    .from("products")
    .select("id, legacy_id");

  if (!listError && rows) {
    const extraIds = rows
      .filter((row) => row.legacy_id && !keepLegacyIds.has(row.legacy_id))
      .map((row) => row.id);

    if (extraIds.length > 0) {
      const { count: extraCount, error: extraError } = await supabase
        .from("products")
        .delete({ count: "exact" })
        .in("id", extraIds);

      if (extraError) {
        console.warn("Extra cleanup:", extraError.message);
      } else {
        console.log(`Removed ${extraCount ?? 0} old demo products.`);
      }
    }
  }

  const { count: after } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  console.log(`Products: ${before ?? "?"} → ${after ?? "?"}`);
}

trim().catch((err) => {
  console.error(err);
  process.exit(1);
});
