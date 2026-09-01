-- Manual product ordering for admin drag-and-drop (WordPress-style menu order)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS products_sort_order_idx
  ON products (sort_order ASC, created_at DESC);

-- Backfill existing rows by newest-first order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS rn
  FROM products
)
UPDATE products p
SET sort_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;
