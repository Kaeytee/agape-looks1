-- Migration: 011_update_currency_to_ghs
-- Description: Updates default currency from NGN to GHS (Ghana Cedis)

-- Update existing records in products table to use GHS
UPDATE products 
SET currency = 'GHS' 
WHERE currency = 'NGN' OR currency IS NULL;

-- Update existing records in orders table to use GHS
UPDATE orders 
SET currency = 'GHS' 
WHERE currency = 'NGN' OR currency IS NULL;

-- Update existing records in payments table to use GHS
UPDATE payments 
SET currency = 'GHS' 
WHERE currency = 'NGN' OR currency IS NULL;

-- Alter default values for future records
ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'GHS';
ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'GHS';
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'GHS';
