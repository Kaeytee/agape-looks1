#!/bin/bash

# Script to generate JWT RS256 keys for production use
# Run this before first deployment

set -e

echo "🔑 Generating JWT RS256 keys..."

# Create keys directory
mkdir -p keys

# Generate private key
ssh-keygen -t rsa -b 4096 -m PEM -f keys/jwt-private.pem -N ""

# Generate public key from private key
openssl rsa -in keys/jwt-private.pem -pubout -outform PEM -out keys/jwt-public.pem

# Set proper permissions
chmod 600 keys/jwt-private.pem
chmod 644 keys/jwt-public.pem

echo "✅ JWT keys generated successfully!"
echo "📁 Private key: keys/jwt-private.pem"
echo "📁 Public key: keys/jwt-public.pem"
echo ""
echo "⚠️  IMPORTANT: Keep jwt-private.pem secure and never commit to version control!"
