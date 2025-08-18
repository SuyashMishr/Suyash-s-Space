# Render Build Script for Backend
#!/bin/bash
echo "🚀 Starting Backend Build Process..."

# Install dependencies
npm ci --only=production

echo "✅ Backend build completed successfully!"
