# Backend Dockerfile
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S portfolio -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R portfolio:nodejs /app

# Switch to non-root user
USER portfolio

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
