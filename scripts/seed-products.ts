#!/usr/bin/env npx tsx
/**
 * Seed categories and coupons only (no demo products).
 * Optional: SEED_DEMO_PRODUCTS=1 to load static samples from src/data/products.ts
 */
import { createClient } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require("ws") as typeof import("ws");
import { categories, products } from "../src/data/products";
import { slugify } from "../src/lib/products/mappers";

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

async function removeBulkProducts() {
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .like("legacy_id", "bulk-%");

  if (error) {
    console.warn("Could not remove bulk products:", error.message);
    return;
  }

  if (count) {
    console.log(`Removed ${count} bulk-generated products.`);
  }
}

async function seed() {
  await removeBulkProducts();

  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          product_count: 0,
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();

    if (error) {
      console.error("Category error:", cat.slug, error.message);
      continue;
    }
    categoryMap.set(cat.slug, data.id);
  }

  console.log(
    process.env.SEED_DEMO_PRODUCTS === "1"
      ? `Seeding ${products.length} demo products...`
      : "Skipping demo products (client catalog only)."
  );
  const counts = new Map<string, number>();

  if (process.env.SEED_DEMO_PRODUCTS !== "1") {
    const demoIds = products.map((p) => p.id);
    if (demoIds.length) {
      await supabase.from("products").delete().in("legacy_id", demoIds);
    }
  }

  if (process.env.SEED_DEMO_PRODUCTS === "1") {
  for (const p of products) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) continue;

    const slug = slugify(p.name);
    const { error } = await supabase.from("products").upsert(
      {
        legacy_id: p.id,
        slug,
        name: p.name,
        description: p.description,
        price: p.price,
        original_price: p.originalPrice ?? null,
        category_id: categoryId,
        material: p.material,
        stock: p.soldOut ? 0 : 50,
        is_new: p.isNew ?? false,
        is_bestseller: p.isBestseller ?? false,
        sold_out: p.soldOut ?? false,
        review_count: p.reviews,
        rating_avg: p.rating ?? 4.5,
        image: p.image,
        hover_image: p.hoverImage ?? null,
      },
      { onConflict: "slug" }
    );

    if (error) console.error("Product error:", p.name, error.message);
    else counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  for (const [slug, count] of counts) {
    await supabase
      .from("categories")
      .update({ product_count: count })
      .eq("slug", slug);
  }
  }

  console.log("Seeding coupons...");
  await supabase.from("coupons").upsert(
    [
      {
        code: "WELCOME10",
        type: "percent",
        value: 10,
        min_order: 1000,
        usage_limit: 1000,
        is_active: true,
      },
      {
        code: "FLAT500",
        type: "fixed",
        value: 500,
        min_order: 3000,
        usage_limit: 500,
        is_active: true,
      },
    ],
    { onConflict: "code" }
  );

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  console.log(`Done! ${count ?? products.length} products in catalog.`);
}

seed().catch(console.error);
