# ===========================
# AGAPE LOOKS Backend Dockerfile
# Multi-stage build for optimized production image
# ===========================

# ===========================
# Stage 1: Base image with Node.js
# ===========================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# ===========================
# Stage 2: Dependencies installation
# ===========================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci --include=dev

# ===========================
# Stage 3: Production dependencies
# ===========================
FROM base AS production-dependencies

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ===========================
# Stage 4: Build stage (if needed for transpilation)
# ===========================
FROM dependencies AS build

# Copy source code
COPY . .

# Run linting and tests (comment out if not needed during build)
# RUN npm run lint
# RUN npm run test

# ===========================
# Stage 5: Production image
# ===========================
FROM base AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=production-dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p logs keys uploads && \
    chown -R nodejs:nodejs logs keys uploads

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Expose metrics port
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]
