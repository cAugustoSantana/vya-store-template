-- Fix typo column name on branches created from older schema.sql

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'descdeription'
  ) THEN
    ALTER TABLE products RENAME COLUMN descdeription TO description;
  END IF;
END $$;
