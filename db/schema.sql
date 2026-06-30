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
  shipping_address TEXT NOT NULL DEFAULT '',
  shipping_city TEXT NOT NULL DEFAULT '',
  shipping_postal_code TEXT NOT NULL DEFAULT '',
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
COMMENT ON COLUMN orders.shipping_address IS 'Shipping street address (required at checkout)';
COMMENT ON COLUMN orders.shipping_city IS 'Shipping city (required at checkout)';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Shipping postal code (required at checkout)';
COMMENT ON COLUMN order_items.variants IS 'Canonical variant keys JSON e.g. {"size":"m","color":"black"}';
COMMENT ON COLUMN order_items.product_name IS 'Snapshot of localized product name at checkout';

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  variant_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_id_not_empty CHECK (char_length(trim(id)) > 0)
);

CREATE INDEX IF NOT EXISTS products_active_sort_idx ON products (active, sort_order, id);

COMMENT ON TABLE products IS 'Store catalog; name/description are localized JSONB { es, en }';
COMMENT ON COLUMN products.variant_options IS 'Variant groups JSON matching shared Product.variantOptions shape';
COMMENT ON COLUMN products.variants IS 'Per option-combination price/stock rows; empty uses product-level stock only';
COMMENT ON COLUMN products.stock_quantity IS 'Units available for sale; sum of variants or product-level stock';

CREATE TABLE IF NOT EXISTS store_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE store_settings IS 'Single-row store metadata overrides; merged with shared/store.config.ts defaults';
