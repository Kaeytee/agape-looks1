import { query, closePool } from './src/config/database.js';

async function updateProductImages() {
    try {
        console.log('Fetching existing products...');
        const productsResult = await query('SELECT id, title, sku FROM products ORDER BY created_at');
        console.log(`Found ${productsResult.rows.length} products\n`);
        
        // Delete existing images first
        console.log('Clearing existing product images...');
        await query('DELETE FROM product_images');
        console.log('✓ Cleared\n');
        
        // Define image mappings for each product
        const imageMapping = {
            'KNT-001': { // Royal Asante Kente
                images: [
                    { url: '/gold-black-kente-fabric-pattern.jpg', alt: 'Royal Asante Kente - Pattern', type: 'main', position: 1 },
                    { url: '/red-green-gold-kente-stole.jpg', alt: 'Royal Asante Kente - Detail', type: 'detail', position: 2 }
                ]
            },
            'KNT-002': { // Ewe Kente Masterpiece
                images: [
                    { url: '/african-model-wearing-colorful-kente-fabric.jpg', alt: 'Ewe Kente Masterpiece - Style', type: 'main', position: 1 },
                    { url: '/african-model-wearing-kente.jpg', alt: 'Ewe Kente Masterpiece - Detail', type: 'detail', position: 2 }
                ]
            },
            'KNT-003': { // Contemporary Gold Kente
                images: [
                    { url: '/red-green-gold-kente-stole.jpg', alt: 'Contemporary Gold Kente - Style', type: 'main', position: 1 },
                    { url: '/gold-black-kente-fabric-pattern.jpg', alt: 'Contemporary Gold Kente - Detail', type: 'detail', position: 2 }
                ]
            },
            'KNT-004': { // Traditional Wedding Kente
                images: [
                    { url: '/african-model-wearing-kente.jpg', alt: 'Traditional Wedding Kente - Style', type: 'main', position: 1 },
                    { url: '/ghanaian-weaver-making-kente-loom.jpg', alt: 'Traditional Wedding Kente - Craftsmanship', type: 'detail', position: 2 }
                ]
            },
            'KNT-005': { // Classic Blue & White Kente
                images: [
                    { url: '/african-model-wearing-colorful-kente-fabric.jpg', alt: 'Classic Blue & White Kente - Style', type: 'main', position: 1 },
                    { url: '/gold-black-kente-fabric-pattern.jpg', alt: 'Classic Blue & White Kente - Pattern', type: 'detail', position: 2 }
                ]
            },
            'LACE-001': { // Beaded Lace Black
                images: [
                    { url: '/beaded-lace-style-black1.jpeg', alt: 'Beaded Lace Black - Style', type: 'main', position: 1 },
                    { url: '/beaded-lace-material-black1.jpeg', alt: 'Beaded Lace Black - Material', type: 'detail', position: 2 }
                ]
            }
        };
        
        // Add new products with the new images
        const newProducts = [
            {
                sku: 'LACE-002',
                title: 'Beaded Lace Gold',
                description: 'Luxurious gold beaded lace with shimmering details',
                price: 1500.00,
                images: [
                    { url: '/beaded-lace-style-gold.jpeg', alt: 'Beaded Lace Gold - Style', type: 'main', position: 1 },
                    { url: '/beaded-lace-material-gold.jpeg', alt: 'Beaded Lace Gold - Material', type: 'detail', position: 2 }
                ]
            },
            {
                sku: 'LACE-003',
                title: 'Beaded Lace Purple',
                description: 'Elegant purple beaded lace with intricate patterns',
                price: 1400.00,
                images: [
                    { url: '/beaded-lace-style-purple.jpeg', alt: 'Beaded Lace Purple - Style', type: 'main', position: 1 },
                    { url: '/beaded-lace-material-purple.jpeg', alt: 'Beaded Lace Purple - Material', type: 'detail', position: 2 }
                ]
            },
            {
                sku: 'BRCD-001',
                title: 'Brocade Green',
                description: 'Rich green brocade fabric with elegant patterns',
                price: 1800.00,
                images: [
                    { url: '/brocade-style-green.jpeg', alt: 'Brocade Green - Style', type: 'main', position: 1 },
                    { url: '/brocade-material-green.jpeg', alt: 'Brocade Green - Material', type: 'detail', position: 2 }
                ]
            },
            {
                sku: 'BRCD-002',
                title: 'Champagne Brocade',
                description: 'Sophisticated champagne brown brocade',
                price: 2000.00,
                images: [
                    { url: '/champagne-brocade-style-brown.jpeg', alt: 'Champagne Brocade - Style', type: 'main', position: 1 },
                    { url: '/champagne-brocade-material-brown.jpeg', alt: 'Champagne Brocade - Material', type: 'detail', position: 2 }
                ]
            },
            {
                sku: 'LACE-004',
                title: 'Two-Toned Lace Pink',
                description: 'Beautiful two-toned pink and white lace',
                price: 1600.00,
                images: [
                    { url: '/two-toned-lace-style-pink.jpeg', alt: 'Two-Toned Lace Pink - Style', type: 'main', position: 1 },
                    { url: '/tow-toned-lace-material-pink-white.jpeg', alt: 'Two-Toned Lace Pink - Material', type: 'detail', position: 2 }
                ]
            }
        ];
        
        // Update existing products
        for (const product of productsResult.rows) {
            const mapping = imageMapping[product.sku];
            if (mapping) {
                console.log(`Updating images for: ${product.title} (${product.sku})`);
                for (const img of mapping.images) {
                    await query(
                        `INSERT INTO product_images (id, product_id, url, alt_text, type, position)
                         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
                        [product.id, img.url, img.alt, img.type, img.position]
                    );
                    console.log(`  ✓ Added: ${img.url}`);
                }
            }
        }
        
        console.log('\n--- Creating New Products ---\n');
        
        // Create new products
        for (const prod of newProducts) {
            console.log(`Creating: ${prod.title} (${prod.sku})`);
            
            const productResult = await query(
                `INSERT INTO products (
                    id, sku, title, slug, short_description, full_story, 
                    price, currency, weave_origin, care_instructions, 
                    dimensions, tags, inventory, dispatch_time, 
                    rating, review_count, is_featured, is_limited
                )
                VALUES (
                    gen_random_uuid(), $1, $2, $3, $4, $5, 
                    $6, 'GHS', 'Imported', 'Dry clean only. Handle with care.',
                    '{"unit": "cm", "width": 150, "length": 500}', 
                    ARRAY['Luxury', 'Premium', 'Evening Wear'], 
                    20, '1-2 business days', 
                    5.0, 0, true, false
                )
                RETURNING id`,
                [
                    prod.sku,
                    prod.title,
                    prod.title.toLowerCase().replace(/\s+/g, '-'),
                    prod.description,
                    prod.description,
                    prod.price
                ]
            );
            
            const productId = productResult.rows[0].id;
            
            for (const img of prod.images) {
                await query(
                    `INSERT INTO product_images (id, product_id, url, alt_text, type, position)
                     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
                    [productId, img.url, img.alt, img.type, img.position]
                );
                console.log(`  ✓ Added: ${img.url}`);
            }
        }
        
        // Show summary
        const totalProducts = await query('SELECT COUNT(*) FROM products');
        const totalImages = await query('SELECT COUNT(*) FROM product_images');
        
        console.log('\n=== Summary ===');
        console.log(`Total Products: ${totalProducts.rows[0].count}`);
        console.log(`Total Images: ${totalImages.rows[0].count}`);
        console.log('\n✅ Database updated successfully!');
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await closePool();
        process.exit(0);
    }
}

updateProductImages();
