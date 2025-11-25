/**
 * JWT Key Generation Utility
 * Automatically generates RSA key pairs if they don't exist
 * @module utils/generate-jwt-keys
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const KEYS_DIR = path.join(__dirname, '../../keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'jwt-private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'jwt-public.pem');

/**
 * Checks if JWT keys exist
 */
export function keysExist() {
  return fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH);
}

/**
 * Generates JWT RSA key pair
 */
export function generateJWTKeys() {
  try {
    console.log('🔑 Generating JWT RSA keys...');

    // Create keys directory if it doesn't exist
    if (!fs.existsSync(KEYS_DIR)) {
      fs.mkdirSync(KEYS_DIR, { recursive: true });
    }

    // Generate private key using ssh-keygen
    execSync(
      `ssh-keygen -t rsa -b 4096 -m PEM -f ${PRIVATE_KEY_PATH} -N ""`,
      { stdio: 'inherit' }
    );

    // Generate public key from private key
    execSync(
      `openssl rsa -in ${PRIVATE_KEY_PATH} -pubout -outform PEM -out ${PUBLIC_KEY_PATH}`,
      { stdio: 'inherit' }
    );

    // Set proper permissions
    fs.chmodSync(PRIVATE_KEY_PATH, 0o600);
    fs.chmodSync(PUBLIC_KEY_PATH, 0o644);

    console.log('✅ JWT keys generated successfully!');
    console.log(`📁 Private key: ${PRIVATE_KEY_PATH}`);
    console.log(`📁 Public key: ${PUBLIC_KEY_PATH}`);

    return true;
  } catch (error) {
    console.error('❌ Failed to generate JWT keys:', error.message);
    return false;
  }
}

/**
 * Ensures JWT keys exist, generates them if they don't
 */
export function ensureJWTKeys() {
  if (!keysExist()) {
    console.log('⚠️  JWT keys not found. Generating new keys...');
    return generateJWTKeys();
  }
  console.log('✅ JWT keys already exist');
  return true;
}

export default { keysExist, generateJWTKeys, ensureJWTKeys };
