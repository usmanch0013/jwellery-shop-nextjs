/**
 * Seeds long-form legal page content into cms_pages.
 * Run: npm run db:seed-legal
 */
import { createClient } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require("ws") as typeof import("ws");
import { LEGAL_PAGE_SLUGS, LEGAL_PAGES } from "../src/lib/cms/legal-content";
import { ABOUT_PAGE_CONTENT, ABOUT_PAGE_SEO } from "../src/lib/cms/about-content";
import { DEFAULT_SITE, DEFAULT_HERO } from "../src/lib/cms/defaults";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

async function main() {
  const { error: aboutError } = await admin.from("cms_pages").upsert(
    {
      slug: "about",
      title: "About SHE Collection",
      eyebrow: "Our Story",
      content: ABOUT_PAGE_CONTENT,
      seo_title: ABOUT_PAGE_SEO.title,
      seo_description: ABOUT_PAGE_SEO.description,
      hero_image: null,
      blocks: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );
  if (aboutError) {
    console.error("Failed to upsert about:", aboutError.message);
    process.exit(1);
  }
  console.log("✓ about");

  for (const slug of LEGAL_PAGE_SLUGS) {
    const page = LEGAL_PAGES[slug];
    const { error } = await admin.from("cms_pages").upsert(
      {
        slug,
        title: page.title,
        eyebrow: page.eyebrow,
        content: page.content,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
        hero_image: null,
        blocks: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`Failed to upsert ${slug}:`, error.message);
      process.exit(1);
    }
    console.log(`✓ ${slug}`);
  }

  const { data: existingCookieLink } = await admin
    .from("cms_nav_links")
    .select("id")
    .eq("location", "footer_legal")
    .eq("href", "/cookie-policy")
    .maybeSingle();

  if (!existingCookieLink) {
    await admin.from("cms_nav_links").insert({
      location: "footer_legal",
      label: "Cookie Policy",
      href: "/cookie-policy",
      sort_order: 5,
      is_visible: true,
    });
  }

  for (const row of [
    { key: "site", value: DEFAULT_SITE },
    { key: "homepage.hero", value: DEFAULT_HERO },
  ]) {
    const { error } = await admin.from("cms_settings").upsert(
      {
        key: row.key,
        value: row.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (error) {
      console.error(`Failed to upsert ${row.key}:`, error.message);
      process.exit(1);
    }
    console.log(`✓ ${row.key}`);
  }

  console.log("Legal pages seeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
