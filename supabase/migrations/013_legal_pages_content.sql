-- Long-form legal page content (also applied via npm run db:seed-legal)

INSERT INTO cms_pages (slug, title, eyebrow, content, seo_title, seo_description, hero_image, blocks)
VALUES (
  'cookie-policy',
  'Cookie Policy',
  'Legal',
  'See live site — full content synced via seed script.',
  'Cookie Policy | Lumière Jewellery',
  'How Lumière.pk uses cookies and similar technologies on our website.',
  NULL,
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cms_nav_links (location, label, href, sort_order, is_visible)
SELECT 'footer_legal', 'Cookie Policy', '/cookie-policy', 5, true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_nav_links
  WHERE location = 'footer_legal' AND href = '/cookie-policy'
);

-- Run locally to push full legal text into cms_pages:
-- npm run db:seed-legal
