-- Advanced order management: tracking, timeline events, invoices

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'void')),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  snapshot JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_order_unique ON invoices(order_id);
CREATE INDEX IF NOT EXISTS invoices_number_idx ON invoices(invoice_number);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read order events" ON order_events FOR SELECT USING (true);
CREATE POLICY "Anyone can read invoices" ON invoices FOR SELECT USING (true);

-- Backfill timeline for existing orders
INSERT INTO order_events (order_id, event_type, message)
SELECT o.id, 'order_placed', 'Order placed successfully'
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM order_events e WHERE e.order_id = o.id
);
