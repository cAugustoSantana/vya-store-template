-- Ordered product gallery. image_url stays the cover (first image).

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE products
SET image_urls = jsonb_build_array(image_url)
WHERE image_url <> ''
  AND image_urls = '[]'::jsonb;

COMMENT ON COLUMN products.image_urls IS 'Ordered gallery URLs. Empty falls back to image_url when read.';
COMMENT ON COLUMN products.image_url IS 'Cover image. Kept in sync with the first gallery URL.';
