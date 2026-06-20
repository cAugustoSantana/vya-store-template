-- Orders shipping fields (Phase: checkout UI refresh)
-- Run on existing branches after schema.sql has been applied.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_city TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN orders.shipping_address IS 'Shipping street address (required at checkout)';
COMMENT ON COLUMN orders.shipping_city IS 'Shipping city (required at checkout)';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Shipping postal code (required at checkout)';

