-- Per-variant inventory and optional price overrides (Shopify-style)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.variants IS
  'Per option-combination rows: [{ key, options, price, stockQuantity }]; empty uses product-level stock';
