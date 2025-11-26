-- Migration: 010_update_coupons_table
-- Description: Updates coupons table to support free shipping type

-- Drop existing check constraint
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_type_check;

-- Update type column to support percentage, fixed, and free_shipping
ALTER TABLE coupons 
  ADD CONSTRAINT coupons_type_check 
  CHECK (type IN ('percentage', 'fixed', 'free_shipping'));

-- Add description field for better coupon management
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;

-- Add per_user_limit for limiting usage per customer
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT 1;

-- Add updated_at column for tracking changes
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Apply updated_at trigger
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create coupon_usage table to track individual usage
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);

-- Add discount field to orders table to track applied discount
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0 CHECK (discount >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
