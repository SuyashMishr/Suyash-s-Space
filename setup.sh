#!/bin/bash

# Portfolio Website Setup Script
# This script sets up the complete MERN stack portfolio with AI integration

echo "🚀 Setting up Confidential Portfolio Website..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB service."
    print_info "On macOS: brew services start mongodb-community"
    print_info "On Ubuntu: sudo systemctl start mongod"
fi

print_info "Installing dependencies..."

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install AI service dependencies
print_status "Installing AI service dependencies..."
cd ai-service
pip3 install -r requirements.txt
cd ..

# Create environment files
print_status "Creating environment files..."

# Create backend .env file
cat > backend/.env << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Registration Key
ADMIN_REGISTRATION_KEY=$(openssl rand -base64 16)

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=dev-key-$(openssl rand -base64 8)

# Security
HELMET_CSP_ENABLED=true
HELMET_HSTS_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:3000
EOF

# Create frontend .env file
cat > frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development

# Features
REACT_APP_ENABLE_CHATBOT=true
REACT_APP_ENABLE_ANALYTICS=false
EOF

# Create AI service .env file
cat > ai-service/.env << EOF
# AI Service Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Model Configuration
MODEL_NAME=microsoft/DialoGPT-medium
MAX_LENGTH=512
TEMPERATURE=0.7

# API Security
AI_SERVICE_API_KEY=dev-key-$(openssl rand -base64 8)

# Logging
LOG_LEVEL=info
EOF

print_status "Environment files created successfully!"

# Create data directory with sample data if it doesn't exist
if [ ! -d "frontend/public/data" ]; then
    print_status "Creating data directory..."
    mkdir -p frontend/public/data
    
    # Copy data files to public directory for frontend access
    cp data/*.json frontend/public/data/
fi

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

print_status "Project setup completed successfully!"
echo ""
print_info "🔐 SECURITY NOTICE:"
print_warning "This is a CONFIDENTIAL portfolio website with the following security features:"
echo "   • JWT-based authentication"
echo "   • Rate limiting on all endpoints"
echo "   • Encrypted passwords with bcrypt"
echo "   • CORS protection"
echo "   • Security headers with Helmet"
echo "   • robots.txt to prevent indexing"
echo "   • Confidential watermarks"
echo ""
print_info "📝 ADMIN REGISTRATION:"
echo "   To create an admin account, you'll need the ADMIN_REGISTRATION_KEY"
echo "   Check backend/.env file for the generated key"
echo ""
print_info "🚀 TO START THE APPLICATION:"
echo "   1. Start MongoDB service"
echo "   2. Run: npm run dev (starts all services)"
echo "   3. Frontend: http://localhost:3000"
echo "   4. Backend API: http://localhost:5000"
echo "   5. AI Service: http://localhost:8000"
echo ""
print_info "🤖 AI FEATURES:"
echo "   • Local LLM integration with Hugging Face Transformers"
echo "   • RAG (Retrieval Augmented Generation) with portfolio context"
echo "   • Session management for chat conversations"
echo "   • Fallback responses when AI service is unavailable"
echo ""
print_warning "⚠️  IMPORTANT NOTES:"
echo "   • This website is marked as CONFIDENTIAL"
echo "   • All access attempts are logged"
echo "   • Search engines are blocked via robots.txt"
echo "   • Admin access requires strong authentication"
echo ""
print_status "Setup complete! Your confidential portfolio is ready to use."
EOF
