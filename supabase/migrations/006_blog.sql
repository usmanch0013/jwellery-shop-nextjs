-- WordPress-style blog: posts, categories, tags

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  author_email TEXT,
  author_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx
  ON blog_posts (status, published_at DESC);

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read blog tags" ON blog_tags FOR SELECT USING (true);
CREATE POLICY "Public read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read blog post categories" ON blog_post_categories FOR SELECT USING (true);
CREATE POLICY "Public read blog post tags" ON blog_post_tags FOR SELECT USING (true);

-- Default categories
INSERT INTO blog_categories (slug, name, description) VALUES
  ('jewellery-care', 'Jewellery Care', 'Tips for maintaining your jewellery'),
  ('styling-guides', 'Styling Guides', 'How to style jewellery for every occasion')
ON CONFLICT (slug) DO NOTHING;

-- Seed starter posts (from homepage blog section)
INSERT INTO blog_posts (
  title, slug, excerpt, content, featured_image, status, author_name, published_at
) VALUES
  (
    'How to Store Bracelets to Prevent Tarnish and Scratches',
    'how-to-store-bracelets',
    'A bracelet spends less time on your wrist than it does in a drawer. Here''s how to store them properly...',
    '<p>A bracelet spends less time on your wrist than it does in a drawer. Between seasons, travel, and everyday rotation, most pieces end up tangled in a box or tossed on a dresser. That is when scratches, tarnish, and bent clasps usually start.</p><p>Store each bracelet separately in a soft pouch or compartment. Keep pieces away from humidity and direct sunlight. For gold-plated and artificial jewellery, a silica gel packet in the drawer helps reduce moisture.</p>',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&h=800&fit=crop',
    'published',
    'Lumière Team',
    '2026-02-12T10:00:00Z'
  ),
  (
    'How to Clean Artificial Rings at Home Without Tarnish',
    'how-to-clean-artificial-rings',
    'Most people who wear artificial rings regularly hit the same point. Here''s how to keep them shining...',
    '<p>Artificial rings pick up lotion, sweat, and dust quickly. A gentle routine keeps them bright without damaging plating.</p><p>Use lukewarm water with a drop of mild soap. Soft brush the setting, rinse, and pat dry with a lint-free cloth. Avoid harsh chemicals and ultrasonic cleaners on plated pieces.</p>',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=800&fit=crop',
    'published',
    'Lumière Team',
    '2026-02-08T10:00:00Z'
  ),
  (
    'Jhumka Styling Guide: Traditional Looks That Feel Modern',
    'jhumka-styling-guide',
    'Jhumkas are probably the most underused earrings in a Pakistani woman''s collection. Here''s how to style them...',
    '<p>Jhumkas work beyond wedding season. Pair medium-sized jhumkas with a solid kurta for daytime events, or layer hair back to let statement jhumkas frame your face.</p><p>Match metal tone with your necklace when building a set, or deliberately mix metals for a modern contrast look.</p>',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&h=800&fit=crop',
    'published',
    'Lumière Team',
    '2026-02-05T10:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
