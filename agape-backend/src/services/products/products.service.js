/**
 * Products Service
 * Handles product catalog CRUD, search, and caching
 * @module services/products
 */

import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import { query, transaction } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import logger from '../../utils/logger.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

const PRODUCT_CACHE_TTL = 900; // 15 minutes
const CATEGORY_CACHE_TTL = 3600; // 1 hour

/**
 * Creates a new product
 */
export async function createProduct({
  sku,
  title,
  slug,
  description,
  price,
  currency = 'NGN',
  weight,
  dimensions,
  collectionId,
  images = [],
  variants = [],
  metadata = {},
}, adminId) {
  return await transaction(async (client) => {
    // Check for duplicate SKU
    const existingSku = await client.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (existingSku.rows.length > 0) {
      throw new ValidationError('Product with this SKU already exists');
    }

    // Check for duplicate Slug
    if (slug) {
      const existingSlug = await client.query('SELECT id FROM products WHERE slug = $1', [slug]);
      if (existingSlug.rows.length > 0) {
        throw new ValidationError('Product with this Slug already exists');
      }
    }

    // Log and verify collectionId if provided
    if (collectionId) {
      logger.info('Attempting to create product with collectionId', { collectionId });
      const collectionCheck = await client.query('SELECT id, name FROM collections WHERE id = $1', [collectionId]);
      if (collectionCheck.rows.length === 0) {
        logger.error('Collection not found in database', { collectionId });
        throw new ValidationError(`Collection with ID ${collectionId} does not exist`);
      }
      logger.info('Collection verified', { collection: collectionCheck.rows[0] });
    }

    // Create product
    const productResult = await client.query(
      `INSERT INTO products (id, sku, title, slug, description, price, currency, weight, dimensions, collection_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        uuidv4(),
        sku,
        title,
        slug,
        description,
        price,
        currency,
        weight,
        JSON.stringify(dimensions || {}),
        collectionId,
        JSON.stringify(metadata),
      ]
    );

    const product = productResult.rows[0];

    // Create variants
    const createdVariants = [];
    for (const variant of variants) {
      const variantResult = await client.query(
        `INSERT INTO product_variants (id, product_id, variant_name, sku, price_delta, stock, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          uuidv4(),
          product.id,
          variant.variantName,
          variant.sku,
          variant.priceDelta || 0,
          variant.stock || 0,
          JSON.stringify(variant.metadata || {}),
        ]
      );
      createdVariants.push(variantResult.rows[0]);
    }

    // Add images
    const createdImages = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageResult = await client.query(
        `INSERT INTO product_images (id, product_id, url, public_id, alt_text, position)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [uuidv4(), product.id, image.url, image.publicId, image.altText || title, i]
      );
      createdImages.push(imageResult.rows[0]);
    }

    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'product_created', 'product', $2, $3)`,
      [adminId, product.id, JSON.stringify({ sku, title, price })]
    );

    // Invalidate product cache
    await invalidateProductCache();

    logger.info('Product created', { productId: product.id, sku, title });

    return {
      ...product,
      variants: createdVariants,
      images: createdImages,
    };
  });
}

/**
 * Gets product details
 */
export async function getProduct(productIdOrSlug, includeInactive = false) {
  // Try cache first
  const redis = getRedisClient();
  const cacheKey = `product:${productIdOrSlug}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug('Product cache hit', { productId: productIdOrSlug });
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.warn('Redis cache read failed', { error: error.message });
  }

  const isUuid = validateUuid(productIdOrSlug);
  let whereClause;

  if (isUuid) {
    whereClause = 'p.id = $1';
  } else {
    // Try to match by SKU or slug (if it exists)
    // We'll check if the 'slug' column exists by handling the error or just assuming SKU for now since we saw SKU in create
    // But to be robust, let's try SKU first.
    whereClause = 'p.sku = $1';
  }

  // Fetch from database
  const result = await query(
    `SELECT p.*,
            json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) as variants,
            json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) as images,
            c.name as collection_name
     FROM products p
     LEFT JOIN product_variants pv ON p.id = pv.product_id
     LEFT JOIN product_images pi ON p.id = pi.product_id
     LEFT JOIN collections c ON p.collection_id = c.id
     WHERE ${whereClause} ${includeInactive ? '' : 'AND p.is_active = TRUE'}
     GROUP BY p.id, c.name`,
    [productIdOrSlug]
  );

  if (result.rows.length === 0) {
    // If not found by SKU, and it wasn't a UUID, maybe it's a slug?
    // If we really want to support 'slug' column, we'd need to know if it exists.
    // For now, let's assume if it's not found by SKU, it's not found.
    throw new NotFoundError('Product');
  }

  const product = result.rows[0];

  // Cache the result
  try {
    await redis.setex(cacheKey, PRODUCT_CACHE_TTL, JSON.stringify(product));
    // Also cache by ID if we fetched by SKU
    if (!isUuid) {
      await redis.setex(`product:${product.id}`, PRODUCT_CACHE_TTL, JSON.stringify(product));
    }
  } catch (error) {
    logger.warn('Redis cache write failed', { error: error.message });
  }

  return product;
}

/**
 * Lists products with filters and pagination
 */
export async function listProducts(filters = {}) {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    isFeatured,
    tags,
    colors,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  const offset = (page - 1) * limit;

  let whereClause = 'WHERE p.is_active = TRUE';
  const params = [];
  let paramIndex = 1;

  if (categoryId) {
    whereClause += ` AND p.collection_id = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (
      p.search_vector @@ plainto_tsquery('english', $${paramIndex})
      OR p.title ILIKE $${paramIndex + 1}
    )`;
    params.push(search, `%${search}%`);
    paramIndex += 2;
  }

  if (minPrice !== undefined) {
    whereClause += ` AND p.price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    whereClause += ` AND p.price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  if (isFeatured !== undefined) {
    whereClause += ` AND (p.metadata->>'is_featured')::boolean = $${paramIndex}`;
    params.push(isFeatured);
    paramIndex++;
  }

  // Filter by tags (array overlap)
  // Ensure tags is an array (could be string from query params)
  let tagsArray = tags;
  if (tags && typeof tags === 'string') {
    tagsArray = tags.split(',').map(t => t.trim());
  }
  if (tagsArray && tagsArray.length > 0) {
    // Cast the parameter as text array for PostgreSQL
    whereClause += ` AND p.tags && $${paramIndex}::text[]`;
    params.push(tagsArray);
    paramIndex++;
  }

  // Filter by colors (if stored in metadata or tags)
  // Ensure colors is an array (could be string from query params)
  let colorsArray = colors;
  if (colors && typeof colors === 'string') {
    colorsArray = colors.split(',').map(c => c.trim());
  }
  if (colorsArray && colorsArray.length > 0) {
    // Cast the parameter as text array for PostgreSQL
    whereClause += ` AND p.tags && $${paramIndex}::text[]`;
    params.push(colorsArray);
    paramIndex++;
  }

  // Validate sort column
  const validSortColumns = ['created_at', 'price', 'title'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  params.push(limit, offset);

  const sqlQuery = `SELECT p.*,
            c.name as collection_name,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as thumbnail,
            (SELECT json_agg(pi.* ORDER BY pi.position) 
             FROM product_images pi 
             WHERE pi.product_id = p.id) as images
     FROM products p
     LEFT JOIN collections c ON p.collection_id = c.id
     ${whereClause}
     ORDER BY p.${sortColumn} ${sortDirection}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

  console.log('SQL Query:', sqlQuery);
  console.log('SQL Params:', params);

  try {
    const result = await query(sqlQuery, params);
    return result.rows;
  } catch (error) {
    console.error('SQL Error:', error.message);
    console.error('SQL Query:', sqlQuery);
    console.error('SQL Params:', params);
    throw error;
  }
}

/**
 * Updates a product
 */
export async function updateProduct(productId, updates, adminId) {
  return await transaction(async (client) => {
    // Get existing product
    const existing = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (existing.rows.length === 0) {
      throw new NotFoundError('Product');
    }

    const oldProduct = existing.rows[0];

    // Build update query
    const updateFields = [];
    const params = [productId];
    let paramIndex = 2;

    const allowedFields = ['title', 'description', 'price', 'weight', 'dimensions', 'collection_id', 'is_active', 'metadata'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(['dimensions', 'metadata'].includes(field) ? JSON.stringify(updates[field]) : updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Update product
    const result = await client.query(
      `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      params
    );

    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'product_updated', 'product', $2, $3)`,
      [adminId, productId, JSON.stringify({ before: oldProduct, after: updates })]
    );

    // Invalidate cache
    await invalidateProductCache(productId);

    logger.info('Product updated', { productId, adminId });

    return result.rows[0];
  });
}

/**
 * Deletes a product (soft delete)
 */
export async function deleteProduct(productId, adminId) {
  return await transaction(async (client) => {
    const result = await client.query(
      'UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [productId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Product');
    }

    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'product_deleted', 'product', $2, '{}')`,
      [adminId, productId]
    );

    // Invalidate cache
    await invalidateProductCache(productId);

    logger.info('Product deleted', { productId, adminId });

    return result.rows[0];
  });
}

/**
 * Search products with full-text search
 */
export async function searchProducts(searchQuery, filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT p.*,
            c.name as collection_name,
            ts_rank(p.search_vector, query) as rank,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as thumbnail,
            (SELECT json_agg(pi.* ORDER BY pi.position) 
             FROM product_images pi 
             WHERE pi.product_id = p.id) as images
     FROM products p
     LEFT JOIN collections c ON p.collection_id = c.id,
     plainto_tsquery('english', $1) query
     WHERE p.search_vector @@ query AND p.is_active = TRUE
     ORDER BY rank DESC, p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [searchQuery, limit, offset]
  );

  return result.rows;
}

/**
 * Invalidates product cache
 */
async function invalidateProductCache(productId = null) {
  try {
    const redis = getRedisClient();

    if (productId) {
      await redis.del(`product:${productId}`);
    } else {
      // Invalidate all product caches (pattern matching)
      const keys = await redis.keys('product:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    logger.debug('Product cache invalidated', { productId });
  } catch (error) {
    logger.warn('Cache invalidation failed', { error: error.message });
  }
}

/**
 * Gets categories
 */
export async function getCategories() {
  // Try cache first
  const redis = getRedisClient();
  const cacheKey = 'categories:all';

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.warn('Redis cache read failed', { error: error.message });
  }

  const result = await query(
    'SELECT * FROM categories ORDER BY name ASC'
  );

  try {
    await redis.setex(cacheKey, CATEGORY_CACHE_TTL, JSON.stringify(result.rows));
  } catch (error) {
    logger.warn('Redis cache write failed', { error: error.message });
  }

  return result.rows;
}

export default {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  getCategories,
};
