-- E-commerce template schema
-- Run once per Neon branch (dev / prod / CI). Safe to re-run: uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  estado TEXT NOT NULL,
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  locale TEXT NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'bank_transfer_proof',
  payment_proof_method TEXT CHECK (
    payment_proof_method IS NULL
    OR payment_proof_method IN ('upload', 'whatsapp')
  ),
  payment_proof_url TEXT,
  payment_verified_at TIMESTAMPTZ,
  CONSTRAINT orders_estado_not_empty CHECK (char_length(trim(estado)) > 0),
  CONSTRAINT orders_buyer_name_not_empty CHECK (char_length(trim(buyer_name)) > 0),
  CONSTRAINT orders_buyer_email_not_empty CHECK (char_length(trim(buyer_email)) > 0),
  CONSTRAINT orders_buyer_phone_not_empty CHECK (char_length(trim(buyer_phone)) > 0)
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  CONSTRAINT order_items_product_id_not_empty CHECK (char_length(trim(product_id)) > 0)
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_estado_idx ON orders (estado);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

COMMENT ON TABLE orders IS 'Customer orders; estado stores canonical status keys';
COMMENT ON COLUMN orders.buyer_phone IS 'Normalized digits only for WhatsApp links';
COMMENT ON COLUMN orders.estado IS 'Canonical key e.g. payment_confirmation_pending, confirmed';
COMMENT ON COLUMN orders.payment_proof_method IS 'upload | whatsapp | null until customer acts';
COMMENT ON COLUMN orders.payment_proof_url IS 'Private Vercel Blob URL or path';
COMMENT ON COLUMN order_items.variants IS 'Canonical variant keys JSON e.g. {"size":"m","color":"black"}';
COMMENT ON COLUMN order_items.product_name IS 'Snapshot of localized product name at checkout';
