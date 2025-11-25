-- Create wishlists table
-- Migration: 007_create_wishlists_table
-- Description: Creates table for storing user wishlist items

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique combination of user, product, and variant
  UNIQUE(user_id, product_id, variant_id)
);

-- Create indexes for better performance
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX idx_wishlists_created_at ON wishlists(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE wishlists IS 'User wishlist items';
COMMENT ON COLUMN wishlists.id IS 'Unique wishlist item identifier';
COMMENT ON COLUMN wishlists.user_id IS 'User who saved the item';
COMMENT ON COLUMN wishlists.product_id IS 'Product saved to wishlist';
COMMENT ON COLUMN wishlists.variant_id IS 'Specific product variant (optional)';
COMMENT ON COLUMN wishlists.created_at IS 'When item was added to wishlist';
