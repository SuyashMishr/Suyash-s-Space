#!/bin/bash

# Build script for Netlify deployment
echo "🚀 Building portfolio for Netlify deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building React app..."
npm run build

# Copy additional files
echo "📋 Copying configuration files..."
cp netlify.toml build/
cp public/_redirects build/

# Create a simple health check file
echo '{"status":"healthy","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","version":"1.0.0"}' > build/health.json

echo "✅ Build complete! Ready for Netlify deployment."
echo "📁 Build files are in: frontend/build/"
echo ""
echo "Next steps:"
echo "1. Create a new site on Netlify"
echo "2. Connect your GitHub repository"
echo "3. Set build command: 'npm run build'"
echo "4. Set publish directory: 'frontend/build'"
echo "5. Add environment variables in Netlify dashboard"
