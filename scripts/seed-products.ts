#!/usr/bin/env npx tsx
/**
 * Seed Supabase with categories, products (18 real + bulk generated), and sample coupons.
 * Usage: npm run db:seed
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { categories, products } from "../src/data/products";
import { slugify } from "../src/lib/products/mappers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const MATERIALS = [
  "American Diamond",
  "Gold Plated",
  "Pearl",
  "Zirconia",
  "Crystal",
  "Gemstone",
];

const NAME_PREFIXES = [
  "Royal",
  "Elegant",
  "Classic",
  "Vintage",
  "Modern",
  "Heritage",
  "Luxe",
  "Dainty",
  "Statement",
  "Bridal",
];

const NAME_SUFFIXES = [
  "Necklace Set",
  "Earrings",
  "Bangle",
  "Bracelet",
  "Ring",
  "Chain",
  "Anklet",
  "Jhumka",
  "Hasli Set",
  "Choker",
];

async function seed() {
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
          product_count: cat.productCount,
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

  console.log("Seeding base products...");
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
  }

  console.log("Generating bulk products (1000+)...");
  const categorySlugs = [...categoryMap.keys()];
  const batch: Record<string, unknown>[] = [];
  const TARGET = 1000;

  for (let i = 0; i < TARGET; i++) {
    const catSlug = categorySlugs[i % categorySlugs.length];
    const categoryId = categoryMap.get(catSlug)!;
    const prefix = NAME_PREFIXES[i % NAME_PREFIXES.length];
    const suffix = NAME_SUFFIXES[i % NAME_SUFFIXES.length];
    const name = `${prefix} ${suffix} #${i + 100}`;
    const price = 500 + (i % 50) * 200;
    const material = MATERIALS[i % MATERIALS.length];

    batch.push({
      legacy_id: `bulk-${i}`,
      slug: slugify(name),
      name,
      description: `Beautiful ${material.toLowerCase()} ${suffix.toLowerCase()} from Lumière collection.`,
      price,
      original_price: i % 5 === 0 ? price + 500 : null,
      category_id: categoryId,
      material,
      stock: 20 + (i % 30),
      is_new: i % 7 === 0,
      is_bestseller: i % 11 === 0,
      sold_out: false,
      review_count: i % 40,
      rating_avg: 3.5 + (i % 15) / 10,
      image: products[i % products.length].image,
      hover_image: products[(i + 1) % products.length].image,
    });

    if (batch.length >= 100) {
      const { error } = await supabase.from("products").upsert(batch, {
        onConflict: "slug",
      });
      if (error) console.error("Batch error:", error.message);
      batch.length = 0;
      console.log(`  ...${i + 1} products`);
    }
  }

  if (batch.length) {
    await supabase.from("products").upsert(batch, { onConflict: "slug" });
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

  console.log("Done! Run SELECT count(*) FROM products; to verify.");
}

seed().catch(console.error);
