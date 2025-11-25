
import { query, closePool } from './src/config/database.js';

async function dropTables() {
    try {
        console.log('Dropping all tables...');

        // Drop tables in correct order to avoid foreign key constraints
        await query('DROP TABLE IF EXISTS inventory_reservations CASCADE');
        await query('DROP TABLE IF EXISTS refunds CASCADE');
        await query('DROP TABLE IF EXISTS payments CASCADE');
        await query('DROP TABLE IF EXISTS order_items CASCADE');
        await query('DROP TABLE IF EXISTS orders CASCADE');
        await query('DROP TABLE IF EXISTS carts CASCADE');
        await query('DROP TABLE IF EXISTS product_images CASCADE');
        await query('DROP TABLE IF EXISTS product_variants CASCADE');
        await query('DROP TABLE IF EXISTS products CASCADE');
        await query('DROP TABLE IF EXISTS categories CASCADE');
        await query('DROP TABLE IF EXISTS sessions CASCADE');
        await query('DROP TABLE IF EXISTS users CASCADE');
        await query('DROP TABLE IF EXISTS coupons CASCADE');
        await query('DROP TABLE IF EXISTS audit_logs CASCADE');
        await query('DROP TABLE IF EXISTS webhook_events CASCADE');
        await query('DROP TABLE IF EXISTS schema_migrations CASCADE');

        console.log('All tables dropped successfully.');
    } catch (err) {
        console.error('Error dropping tables:', err);
    } finally {
        // await closePool();
        process.exit(0);
    }
}

dropTables();
