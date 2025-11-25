/**
 * Central Configuration Management
 * 
 * This module loads and validates all environment variables and provides
 * a centralized configuration object for the entire application.
 * Follows the 12-factor app methodology for configuration management.
 * 
 * @module config
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
dotenv.config();

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration object containing all application settings
 * All values are loaded from environment variables with sensible defaults
 */
const config = {
  // ===========================
  // Application Configuration
  // ===========================
  app: {
  name: process.env.APP_NAME || 'AGAPE LOOKS Backend',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiVersion: process.env.API_VERSION || 'v1',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // ===========================
  // Database Configuration (PostgreSQL)
  // ===========================
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  name: process.env.DB_NAME || 'agape_looks',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 30000,
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 10000,
    },
  },

  // ===========================
  // Redis Configuration
  // ===========================
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    tls: process.env.REDIS_TLS === 'true',
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'agape_looks:',
    // Connection retry strategy
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  },

  // ===========================
  // JWT Configuration
  // ===========================
  jwt: {
    privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || join(__dirname, '../../keys/jwt-private.pem'),
    publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || join(__dirname, '../../keys/jwt-public.pem'),
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '30d',
  issuer: process.env.JWT_ISSUER || 'agape-looks',
  audience: process.env.JWT_AUDIENCE || 'agape-looks-api',
    algorithm: 'RS256',
  },

  // ===========================
  // Security Configuration
  // ===========================
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
    passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    passwordRequireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
    passwordRequireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    loginLockoutDuration: parseInt(process.env.LOGIN_LOCKOUT_DURATION, 10) || 15, // minutes
    enable2FA: process.env.ENABLE_2FA === 'true',
  },

  // ===========================
  // Rate Limiting Configuration
  // ===========================
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5,
    adminMax: parseInt(process.env.RATE_LIMIT_ADMIN_MAX, 10) || 200,
  },

  // ===========================
  // Paystack Configuration
  // ===========================
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
    baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || '',
    webhookUrl: process.env.PAYSTACK_WEBHOOK_URL || '',
  },

  // ===========================
  // Cloudinary Configuration
  // ===========================
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'agape-wone',
    secure: process.env.CLOUDINARY_SECURE !== 'false',
  },

  // ===========================
  // Resend Configuration
  // ===========================
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@agapelooks.com',
  fromName: process.env.RESEND_FROM_NAME || 'AGAPE LOOKS',
  replyTo: process.env.RESEND_REPLY_TO || 'support@agapelooks.com',
  },

  // ===========================
  // Email Configuration
  // ===========================
  email: {
  frontendUrl: process.env.FRONTEND_URL || 'https://agapelooks.com',
  verificationUrl: process.env.EMAIL_VERIFICATION_URL || 'https://agapelooks.com/verify-email',
  passwordResetUrl: process.env.PASSWORD_RESET_URL || 'https://agapelooks.com/reset-password',
  },

  // ===========================
  // Session Configuration
  // ===========================
  session: {
  cookieName: process.env.SESSION_COOKIE_NAME || 'agape_looks_refresh_token',
    cookieSecure: process.env.SESSION_COOKIE_SECURE !== 'false',
    cookieHttpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
    cookieSameSite: process.env.SESSION_COOKIE_SAME_SITE || 'strict',
    cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) || 2592000000, // 30 days
  },

  // ===========================
  // Cart Configuration
  // ===========================
  cart: {
    expiryHours: parseInt(process.env.CART_EXPIRY_HOURS, 10) || 24,
    itemMaxQuantity: parseInt(process.env.CART_ITEM_MAX_QUANTITY, 10) || 10,
    syncIntervalMs: parseInt(process.env.CART_SYNC_INTERVAL_MS, 10) || 300000, // 5 minutes
  },

  // ===========================
  // Inventory Configuration
  // ===========================
  inventory: {
    reservationTTLMinutes: parseInt(process.env.INVENTORY_RESERVATION_TTL_MINUTES, 10) || 15,
    lowStockThreshold: parseInt(process.env.INVENTORY_LOW_STOCK_THRESHOLD, 10) || 10,
  },

  // ===========================
  // Order Configuration
  // ===========================
  order: {
    numberPrefix: process.env.ORDER_NUMBER_PREFIX || 'AGP',
    timeoutMinutes: parseInt(process.env.ORDER_TIMEOUT_MINUTES, 10) || 30,
    enableAutoCancelUnpaid: process.env.ENABLE_AUTO_CANCEL_UNPAID_ORDERS !== 'false',
  },

  // ===========================
  // Payment Configuration
  // ===========================
  payment: {
    webhookRetryAttempts: parseInt(process.env.PAYMENT_WEBHOOK_RETRY_ATTEMPTS, 10) || 3,
    webhookRetryDelayMs: parseInt(process.env.PAYMENT_WEBHOOK_RETRY_DELAY_MS, 10) || 5000,
    reconciliationSchedule: process.env.PAYMENT_RECONCILIATION_SCHEDULE || '0 2 * * *', // 2 AM daily
    currency: process.env.PAYMENT_CURRENCY || 'NGN',
  },

  // ===========================
  // Queue Configuration (BullMQ)
  // ===========================
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5,
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES, 10) || 3,
    backoffType: process.env.QUEUE_BACKOFF_TYPE || 'exponential',
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY, 10) || 5000,
  },

  // ===========================
  // Monitoring Configuration
  // ===========================
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
    enableTracing: process.env.ENABLE_TRACING !== 'false',
    sentryDsn: process.env.SENTRY_DSN || '',
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT || 'development',
    sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  },

  // ===========================
  // Feature Flags
  // ===========================
  features: {
    twoFactorAuth: process.env.FEATURE_2FA_ENABLED !== 'false',
    smsNotifications: process.env.FEATURE_SMS_NOTIFICATIONS === 'true',
    whatsappNotifications: process.env.FEATURE_WHATSAPP_NOTIFICATIONS === 'true',
    promotionalEmails: process.env.FEATURE_PROMOTIONAL_EMAILS !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
  },

  // ===========================
  // Backup Configuration
  // ===========================
  backup: {
    enableAutoBackup: process.env.ENABLE_AUTO_BACKUP !== 'false',
    schedule: process.env.BACKUP_SCHEDULE || '0 0 * * *', // Daily at midnight
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
  },

  // ===========================
  // Maintenance Configuration
  // ===========================
  maintenance: {
    mode: process.env.MAINTENANCE_MODE === 'true',
  },

  // ===========================
  // CORS Configuration
  // ===========================
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS !== 'false',
  },

  // ===========================
  // File Upload Configuration
  // ===========================
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES 
      ? process.env.ALLOWED_IMAGE_TYPES.split(',') 
      : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxImagesPerProduct: parseInt(process.env.MAX_IMAGES_PER_PRODUCT, 10) || 10,
  },
};

/**
 * Validates critical configuration values
 * Throws an error if any required configuration is missing
 */
export function validateConfig() {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'REDIS_HOST',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Warn about missing optional but important variables
  const warnings = [];
  
  if (!config.paystack.secretKey) {
    warnings.push('PAYSTACK_SECRET_KEY is not set - payment processing will not work');
  }
  
  if (!config.cloudinary.cloudName) {
    warnings.push('CLOUDINARY_CLOUD_NAME is not set - media uploads will not work');
  }
  
  if (!config.resend.apiKey) {
    warnings.push('RESEND_API_KEY is not set - email notifications will not work');
  }

  if (warnings.length > 0 && config.app.env !== 'test') {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
}

/**
 * Returns true if the application is running in production mode
 */
export function isProduction() {
  return config.app.env === 'production';
}

/**
 * Returns true if the application is running in development mode
 */
export function isDevelopment() {
  return config.app.env === 'development';
}

/**
 * Returns true if the application is running in test mode
 */
export function isTest() {
  return config.app.env === 'test';
}

export default config;
