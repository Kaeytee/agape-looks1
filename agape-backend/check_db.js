import { query, closePool } from './src/config/database.js';

async function check() {
    try {
        console.log('Checking products...');

        console.log('Checking product_images...');
        const res = await query('SELECT * FROM product_images');
        console.log('Count:', res.rows.length);
        console.log('Rows:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // await closePool();
        process.exit(0);
    }
}

check();
