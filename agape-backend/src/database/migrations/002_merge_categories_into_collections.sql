-- Migration: Merge categories into collections
-- This migration removes the categories table and uses collections instead

BEGIN;

-- Step 1: Migrate any data from categories to collections (if categories table has data)
-- Match only the columns that exist in both tables
INSERT INTO collections (id, name, slug, description, created_at, updated_at)
SELECT id, name, slug, description, created_at, updated_at
FROM categories
WHERE id NOT IN (SELECT id FROM collections)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop the old foreign key constraint on products table
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Step 3: Rename the column from category_id to collection_id
ALTER TABLE products 
RENAME COLUMN category_id TO collection_id;

-- Step 4: Add new foreign key constraint pointing to collections table
ALTER TABLE products 
ADD CONSTRAINT products_collection_id_fkey 
FOREIGN KEY (collection_id) 
REFERENCES collections(id) 
ON DELETE SET NULL;

-- Step 5: Drop the categories table as it's no longer needed
DROP TABLE IF EXISTS categories CASCADE;

-- Step 6: Create an index on collection_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON products(collection_id);

COMMIT;
