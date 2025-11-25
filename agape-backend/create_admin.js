import { query } from './src/config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

(async () => {
    try {
        const email = 'admin@agapelooks.com';
        const password = 'Admin123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // Check if user exists
        const checkResult = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkResult.rows.length > 0) {
            console.log('User already exists. Updating password and role...');
            await query(
                'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3',
                [hashedPassword, 'admin', email]
            );
        } else {
            console.log('Creating new admin user...');
            await query(
                `INSERT INTO users (id, email, password_hash, name, role, verified_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
                [userId, email, hashedPassword, 'Admin User', 'admin']
            );
        }

        console.log('\n✅ Admin user created/updated successfully!');
        console.log('----------------------------------------');
        console.log('Email:    ' + email);
        console.log('Password: ' + password);
        console.log('Role:     admin');
        console.log('----------------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error creating user:', err);
        process.exit(1);
    }
})();
