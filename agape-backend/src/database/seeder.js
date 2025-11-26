/**
 * Database Seeder
 * Seeds initial data for development/testing
 */

import { query, getPool, closePool } from '../config/database.js'
import logger from '../utils/logger.js'

// Sample products data
const sampleProducts = [
  {
    sku: 'KNT-001',
    title: 'Royal Asante Kente',
    slug: 'royal-asante-kente',
    shortDescription: 'Traditional Asante pattern with gold and black weave',
    fullStory: 'This exquisite Kente cloth represents the rich heritage of the Asante people. Handwoven by master craftsmen in Bonwire, Ghana, each thread tells a story of royalty and tradition.',
    price: 450.00,
    currency: 'GHS',
    weaveOrigin: 'Bonwire, Ashanti Region',
    careInstructions: 'Dry clean only. Store in a cool, dry place away from direct sunlight.',
    dimensions: { width: 200, length: 300, unit: 'cm' },
    tags: ['Handwoven', 'Traditional', 'Royal', 'Asante'],
    inventory: 8,
    dispatchTime: '2-4 business days',
    rating: 4.8,
    reviewCount: 24,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Gold', 'Black'],
      fabric_type: 'Beaded Lace',
      materials: 'Cotton, Silk',
      stock: 8,
      is_featured: true,
      is_limited: false,
      color: 'Gold'
    }
  },
  {
    sku: 'KNT-002',
    title: 'Ewe Kente Masterpiece',
    slug: 'ewe-kente-masterpiece',
    shortDescription: 'Intricate Ewe design with vibrant multicolor patterns',
    fullStory: 'Crafted by skilled Ewe weavers from the Volta Region, this Kente showcases the distinctive geometric patterns and vibrant colors that characterize Ewe textiles.',
    price: 520.00,
    currency: 'GHS',
    weaveOrigin: 'Kpetoe, Volta Region',
    careInstructions: 'Hand wash with cold water. Air dry flat.',
    dimensions: { width: 180, length: 280, unit: 'cm' },
    tags: ['Handwoven', 'Traditional', 'Ewe', 'Multicolor'],
    inventory: 5,
    dispatchTime: '3-5 business days',
    rating: 4.9,
    reviewCount: 18,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Multicolor', 'Red', 'Green'],
      fabric_type: 'Beaded Lush Lace',
      materials: 'Cotton',
      stock: 5,
      is_featured: true,
      is_limited: false,
      color: 'Multicolor'
    }
  },
  {
    sku: 'KNT-003',
    title: 'Contemporary Gold Kente',
    slug: 'contemporary-gold-kente',
    shortDescription: 'Modern interpretation of classic Kente with gold accents',
    fullStory: 'A contemporary take on traditional Kente, blending modern aesthetics with time-honored weaving techniques. Perfect for special occasions.',
    price: 680.00,
    currency: 'GHS',
    weaveOrigin: 'Bonwire, Ashanti Region',
    careInstructions: 'Dry clean recommended. Keep away from moisture.',
    dimensions: { width: 220, length: 320, unit: 'cm' },
    tags: ['Modern', 'Handwoven', 'Gold', 'Premium'],
    inventory: 3,
    dispatchTime: '2-3 business days',
    rating: 5.0,
    reviewCount: 12,
    isFeatured: true,
    isLimited: true,
    status: 'active',
    metadata: {
      colors: ['Gold'],
      fabric_type: 'Crystallized Luxury Lace',
      materials: 'Silk, Gold Thread',
      stock: 3,
      is_featured: true,
      is_limited: true,
      color: 'Gold'
    }
  },
  {
    sku: 'KNT-004',
    title: 'Traditional Wedding Kente',
    slug: 'traditional-wedding-kente',
    shortDescription: 'Ceremonial Kente perfect for weddings and celebrations',
    fullStory: 'This ceremonial Kente is specially woven for weddings and important celebrations. Its intricate patterns symbolize love, unity, and prosperity.',
    price: 850.00,
    currency: 'GHS',
    weaveOrigin: 'Bonwire, Ashanti Region',
    careInstructions: 'Professional dry cleaning only. Store in breathable fabric bag.',
    dimensions: { width: 250, length: 350, unit: 'cm' },
    tags: ['Wedding', 'Ceremonial', 'Premium', 'Traditional'],
    inventory: 4,
    dispatchTime: '5-7 business days',
    rating: 4.9,
    reviewCount: 8,
    isFeatured: false,
    isLimited: true,
    status: 'active',
    metadata: {
      colors: ['White', 'Gold'],
      fabric_type: 'Ivory Beaded Fringe Lace',
      materials: 'Cotton, Silk',
      stock: 4,
      is_featured: false,
      is_limited: true,
      color: 'White'
    }
  },
  {
    sku: 'KNT-005',
    title: 'Classic Blue & White Kente',
    slug: 'classic-blue-white-kente',
    shortDescription: 'Elegant blue and white traditional pattern',
    fullStory: 'A timeless classic featuring the serene combination of blue and white. This pattern represents peace, harmony, and purity in Ghanaian culture.',
    price: 420.00,
    currency: 'GHS',
    weaveOrigin: 'Kpetoe, Volta Region',
    careInstructions: 'Hand wash cold. Line dry in shade.',
    dimensions: { width: 190, length: 290, unit: 'cm' },
    tags: ['Traditional', 'Blue', 'Handwoven', 'Classic'],
    inventory: 10,
    dispatchTime: '2-4 business days',
    rating: 4.7,
    reviewCount: 15,
    isFeatured: false,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Blue', 'White'],
      fabric_type: 'Two Toned Lace',
      materials: 'Cotton',
      stock: 10,
      is_featured: false,
      is_limited: false,
      color: 'Blue'
    }
  },
  {
    sku: 'LACE-001',
    title: 'Beaded Lace Black',
    slug: 'beaded-lace-black',
    shortDescription: 'Elegant black beaded lace with intricate details',
    fullStory: 'This luxurious black beaded lace features exquisite craftsmanship, perfect for evening wear and special occasions. The delicate beads catch the light beautifully, adding a touch of glamour to any outfit.',
    price: 1200.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Beaded Lace', 'Black', 'Luxury', 'Evening Wear'],
    inventory: 15,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 3,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Black'],
      fabric_type: 'Beaded Lace',
      materials: 'Lace, Beads',
      stock: 15,
      is_featured: true,
      is_limited: false,
      color: 'Black'
    },
    images: [
      { url: '/beaded-lace-style-black1.jpeg', alt: 'Beaded Lace Black - Style', type: 'main' },
      { url: '/beaded-lace-material-black1.jpeg', alt: 'Beaded Lace Black - Material', type: 'detail' }
    ]
  },
  {
    sku: 'LACE-002',
    title: 'Beaded Lace Gold',
    slug: 'beaded-lace-gold',
    shortDescription: 'Luxurious gold beaded lace with shimmering details',
    fullStory: 'Luxurious gold beaded lace with shimmering details, perfect for making a statement at any event.',
    price: 1500.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Luxury', 'Premium', 'Evening Wear', 'Gold'],
    inventory: 20,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 0,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Gold'],
      fabric_type: 'Beaded Lace',
      materials: 'Lace, Beads',
      stock: 20,
      is_featured: true,
      is_limited: false,
      color: 'Gold'
    },
    images: [
      { url: '/beaded-lace-style-gold.jpeg', alt: 'Beaded Lace Gold - Style', type: 'main' },
      { url: '/beaded-lace-material-gold.jpeg', alt: 'Beaded Lace Gold - Material', type: 'detail' }
    ]
  },
  {
    sku: 'LACE-003',
    title: 'Beaded Lace Purple',
    slug: 'beaded-lace-purple',
    shortDescription: 'Elegant purple beaded lace with intricate patterns',
    fullStory: 'Elegant purple beaded lace with intricate patterns. A royal choice for weddings and special occasions.',
    price: 1400.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Luxury', 'Premium', 'Evening Wear', 'Purple'],
    inventory: 20,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 0,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Other'],
      fabric_type: 'Beaded Lace',
      materials: 'Lace, Beads',
      stock: 20,
      is_featured: true,
      is_limited: false,
      color: 'Other'
    },
    images: [
      { url: '/beaded-lace-style-purple.jpeg', alt: 'Beaded Lace Purple - Style', type: 'main' },
      { url: '/beaded-lace-material-purple.jpeg', alt: 'Beaded Lace Purple - Material', type: 'detail' }
    ]
  },
  {
    sku: 'BRCD-001',
    title: 'Brocade Green',
    slug: 'brocade-green',
    shortDescription: 'Rich green brocade fabric with elegant patterns',
    fullStory: 'Rich green brocade fabric with elegant patterns. Durable and stylish for various traditional styles.',
    price: 1800.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Luxury', 'Premium', 'Brocade', 'Green'],
    inventory: 20,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 0,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Other'],
      fabric_type: 'Brocade',
      materials: 'Brocade',
      stock: 20,
      is_featured: true,
      is_limited: false,
      color: 'Other'
    },
    images: [
      { url: '/brocade-style-green.jpeg', alt: 'Brocade Green - Style', type: 'main' },
      { url: '/brocade-material-green.jpeg', alt: 'Brocade Green - Material', type: 'detail' }
    ]
  },
  {
    sku: 'BRCD-002',
    title: 'Champagne Brocade',
    slug: 'champagne-brocade',
    shortDescription: 'Sophisticated champagne brown brocade',
    fullStory: 'Sophisticated champagne brown brocade. A subtle yet stunning choice for elegant wear.',
    price: 2000.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Luxury', 'Premium', 'Brocade', 'Champagne'],
    inventory: 20,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 0,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Gold'],
      fabric_type: 'Brocade',
      materials: 'Brocade',
      stock: 20,
      is_featured: true,
      is_limited: false,
      color: 'Gold'
    },
    images: [
      { url: '/champagne-brocade-style-brown.jpeg', alt: 'Champagne Brocade - Style', type: 'main' },
      { url: '/champagne-brocade-material-brown.jpeg', alt: 'Champagne Brocade - Material', type: 'detail' }
    ]
  },
  {
    sku: 'LACE-004',
    title: 'Two-Toned Lace Pink',
    slug: 'two-toned-lace-pink',
    shortDescription: 'Beautiful two-toned pink and white lace',
    fullStory: 'Beautiful two-toned pink and white lace. Soft, feminine, and perfect for celebratory occasions.',
    price: 1600.00,
    currency: 'GHS',
    weaveOrigin: 'Imported',
    careInstructions: 'Dry clean only. Handle with care.',
    dimensions: { width: 150, length: 500, unit: 'cm' },
    tags: ['Luxury', 'Premium', 'Lace', 'Pink'],
    inventory: 20,
    dispatchTime: '1-2 business days',
    rating: 5.0,
    reviewCount: 0,
    isFeatured: true,
    isLimited: false,
    status: 'active',
    metadata: {
      colors: ['Multicolor'],
      fabric_type: 'Two Toned Lace',
      materials: 'Lace',
      stock: 20,
      is_featured: true,
      is_limited: false,
      color: 'Multicolor'
    },
    images: [
      { url: '/two-toned-lace-style-pink.jpeg', alt: 'Two-Toned Lace Pink - Style', type: 'main' },
      { url: '/tow-toned-lace-material-pink-white.jpeg', alt: 'Two-Toned Lace Pink - Material', type: 'detail' }
    ]
  }
]

/**
 * Seed products into database
 */
async function seedProducts() {
  logger.info('Seeding products...')

  for (const product of sampleProducts) {
    try {
      // Check if product already exists
      const existing = await query(
        'SELECT id FROM products WHERE sku = $1',
        [product.sku]
      )

      if (existing.rows.length > 0) {
        logger.info(`Product ${product.sku} already exists, skipping...`)
        continue
      }

      // Insert product
      console.log(`Attempting to insert product ${product.sku}...`);
      const result = await query(`
        INSERT INTO products (
          sku, title, slug, short_description, full_story, price, currency,
          weave_origin, care_instructions, dimensions, tags, inventory,
          dispatch_time, rating, review_count, is_featured, is_limited, is_active, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING id, title
      `, [
        product.sku,
        product.title,
        product.slug,
        product.shortDescription,
        product.fullStory,
        product.price,
        product.currency,
        product.weaveOrigin,
        product.careInstructions,
        JSON.stringify(product.dimensions),
        product.tags,
        product.inventory,
        product.dispatchTime,
        product.rating,
        product.reviewCount,
        product.isFeatured,
        product.isLimited,
        product.status === 'active',
        JSON.stringify(product.metadata || {})
      ])

      logger.info(`✓ Created product: ${result.rows[0].title}`)

      // Insert images
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          await query(`
            INSERT INTO product_images (product_id, url, alt_text, type, position)
            VALUES ($1, $2, $3, $4, $5)
          `, [result.rows[0].id, img.url, img.alt, img.type, i + 1]);
        }
      } else {
        // Default images (fallback for old products)
        await query(`
          INSERT INTO product_images (product_id, url, alt_text, type, position)
          VALUES 
            ($1, '/images/kente-patterns/default.jpg', $2, 'main', 1),
            ($1, '/images/kente-patterns/detail.jpg', $3, 'detail', 2)
        `, [
          result.rows[0].id,
          `${product.title} - Main view`,
          `${product.title} - Detail view`
        ])
      }

    } catch (error) {
      console.error(`Error seeding product ${product.sku}:`, error)
      logger.error(`Error seeding product ${product.sku}:`, error)
    }
  }

  logger.info('✓ Products seeded successfully')
}

// Sample collections data
const sampleCollections = [
  {
    name: 'Brocade Patterns',
    slug: 'brocade-patterns',
    description: 'Brocade with classic patterns passed down through generations',
    image: '/brocade-material-red-purple.jpeg',
    featured: true,
    color: 'from-amber-500 to-amber-700',
  },
  {
    name: 'Royal Collection',
    slug: 'royal-collection',
    description: 'Premium Two Toned lace featuring gold and intricate patterns for special occasions',
    image: '/royal-collection-lace.jpg',
    featured: true,
    color: 'from-yellow-600 to-amber-800',
  },
  {
    name: 'Wedding Collection',
    slug: 'wedding',
    description: 'Elegant pieces perfect for weddings, engagements, and celebrations',
    image: '/beaded-lace-style-purple.jpeg',
    color: 'from-rose-500 to-pink-700',
  },
  {
    name: 'Festival Wear',
    slug: 'festival',
    description: 'Vibrant and colorful Lace designs for festivals and cultural events',
    image: '/brocade-style-red.jpeg',
    color: 'from-purple-500 to-purple-700',
  },
  {
    name: 'Graduation Collection',
    slug: 'graduation',
    description: 'Sophisticated Lace stoles and sashes for academic ceremonies',
    image: '/brocade-style-blue.jpeg',
    color: 'from-blue-500 to-blue-700',
  },
  {
    name: 'Modern Fusion',
    slug: 'modern-fusion',
    description: 'Contemporary designs blending traditional wear with modern aesthetics',
    image: '/modern-fusion-collection.jpg',
    color: 'from-emerald-500 to-teal-700',
  },
  {
    name: 'Limited Edition',
    slug: 'limited-edition',
    description: 'Exclusive, rare patterns available in limited quantities',
    image: '/embroided-lace-collection.jpeg',
    featured: true,
    color: 'from-red-500 to-red-700',
  },
  {
    name: 'Everyday Elegance',
    slug: 'everyday',
    description: 'Comfortable and stylish woven pieces for daily wear',
    image: '/two-toned-lace-style-pink-white-bg.png',
    color: 'from-slate-500 to-slate-700',
  },
]

/**
 * Seed collections into database
 */
async function seedCollections() {
  logger.info('Seeding collections...')

  for (const collection of sampleCollections) {
    try {
      // Check if collection already exists
      const existing = await query(
        'SELECT id FROM collections WHERE slug = $1',
        [collection.slug]
      )

      if (existing.rows.length > 0) {
        logger.info(`Collection ${collection.slug} already exists, skipping...`)
        continue
      }

      // Insert collection
      await query(`
        INSERT INTO collections (
          name, slug, description, image, featured, color
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `, [
        collection.name,
        collection.slug,
        collection.description,
        collection.image,
        collection.featured || false,
        collection.color
      ])

      logger.info(`✓ Created collection: ${collection.name}`)

    } catch (error) {
      console.error(`Error seeding collection ${collection.slug}:`, error)
      logger.error(`Error seeding collection ${collection.slug}:`, error)
    }
  }

  logger.info('✓ Collections seeded successfully')
}

/**
 * Link products to collections
 */
async function seedProductCollections() {
  logger.info('Linking products to collections...')

  const products = await query('SELECT id FROM products')
  const collections = await query('SELECT id FROM collections')

  if (products.rows.length === 0 || collections.rows.length === 0) {
    logger.warn('No products or collections found to link')
    return
  }

  for (const product of products.rows) {
    // Assign to 1-3 random collections
    const numCollections = Math.floor(Math.random() * 3) + 1
    const shuffled = [...collections.rows].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, numCollections)

    for (const collection of selected) {
      try {
        await query(`
          INSERT INTO product_collections (product_id, collection_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [product.id, collection.id])
      } catch (error) {
        logger.error('Error linking product to collection:', error)
      }
    }
  }

  logger.info('✓ Products linked to collections successfully')
}

/**
 * Main seeder function
 */
async function seed() {
  try {
    logger.info('Starting database seeding...')

    await seedProducts()
    await seedCollections()
    await seedProductCollections()

    logger.info('✓ Database seeding completed successfully')
    await closePool()
    process.exit(0)
  } catch (error) {
    logger.error('Database seeding failed:', error)
    await closePool()
    process.exit(1)
  }
}

// Run seeder
seed()
