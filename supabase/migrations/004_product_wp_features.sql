-- WordPress-style product features: media library, tags, variations, SKU

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published'));

CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx
  ON products (sku) WHERE sku IS NOT NULL;

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  file_name TEXT,
  mime_type TEXT DEFAULT 'image/jpeg',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_tag_links (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL,
  price INTEGER CHECK (price IS NULL OR price >= 0),
  original_price INTEGER CHECK (original_price IS NULL OR original_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  attributes JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_variations_product_idx
  ON product_variations(product_id);

CREATE INDEX IF NOT EXISTS product_images_product_idx
  ON product_images(product_id, sort_order);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media" ON media_library FOR SELECT USING (true);
CREATE POLICY "Public read product tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read product tag links" ON product_tag_links FOR SELECT USING (true);
CREATE POLICY "Public read product variations" ON product_variations FOR SELECT USING (true);
