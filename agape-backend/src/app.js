/**
 * Express Application Configuration
 * @module app
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import { requestLogger, correlationId } from './middleware/logging.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { rateLimit } from './middleware/ratelimit.middleware.js';

// Import routes
import authRoutes from './services/auth/auth.routes.js';
import paymentsRoutes from './services/payments/payments.routes.js';
import ordersRoutes from './services/orders/orders.routes.js';
import productsRoutes from './services/products/products.routes.js';
import cartRoutes from './services/cart/cart.routes.js';
import mediaRoutes from './services/media/media.routes.js';
import adminRoutes from './services/admin/admin.routes.js';
import wishlistRoutes from './services/wishlist/wishlist.routes.js';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.app.env === 'production',
  hsts: config.app.env === 'production',
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin images
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging middleware
app.use(requestLogger);
app.use(correlationId);

// Global rate limiting
app.use(rateLimit());

// Serve static files (images, etc.)
app.use(express.static('public'));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
  });
});

// API routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/products', productsRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/admin', adminRoutes);

app.use(`/api/${config.app.apiVersion}`, apiRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
