-- Product inventory (run once on existing branches after 002_products.sql)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0);

COMMENT ON COLUMN products.stock_quantity IS 'Units available for sale; decremented on checkout';

-- Seed demo stock when column was just added with default 0
UPDATE products SET stock_quantity = 100 WHERE stock_quantity = 0;
