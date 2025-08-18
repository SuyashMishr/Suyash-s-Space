#!/bin/bash

# Portfolio Deployment Preparation Script
echo "🚀 Preparing Portfolio for Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================
   Portfolio Deployment Helper
=====================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Portfolio ready for deployment"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << EOF
# Dependencies
**/node_modules/
**/.pnp
**/.pnp.js

# Production builds
**/build/
**/dist/

# Environment variables
**/.env
**/.env.local
**/.env.development.local
**/.env.test.local
**/.env.production.local
**/.env.production
**/.env.prod

# Logs
**/npm-debug.log*
**/yarn-debug.log*
**/yarn-error.log*
**/lerna-debug.log*

# Runtime data
**/pids
**/*.pid
**/*.seed
**/*.pid.lock

# Python
**/__pycache__/
**/*.py[cod]
**/*$py.class
**/*.so
**/.Python
**/venv/
**/env/
**/ENV/

# IDE
**/.vscode/
**/.idea/
**/*.swp
**/*.swo
**/*~

# OS
**/.DS_Store
**/Thumbs.db

# Temporary files
**/tmp/
**/temp/

# Database
**/*.db
**/*.sqlite
**/*.sqlite3

# Deployment
**/deploy.log
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Check package.json files
echo -e "${YELLOW}Validating package.json files...${NC}"

for dir in "frontend" "backend" "admin-panel"; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        echo -e "${GREEN}✅ $dir/package.json found${NC}"
        cd "$dir"
        npm audit fix --force 2>/dev/null || echo -e "${YELLOW}⚠️  Some dependencies may need updating in $dir${NC}"
        cd ..
    else
        echo -e "${RED}❌ $dir/package.json not found${NC}"
    fi
done

# Check AI service requirements
if [ -f "ai-service/requirements-simple.txt" ]; then
    echo -e "${GREEN}✅ AI service requirements found${NC}"
else
    echo -e "${RED}❌ AI service requirements not found${NC}"
fi

# Check environment files
echo -e "${YELLOW}Checking environment files...${NC}"

for env_file in "backend/.env.production" "ai-service/.env.production" "frontend/.env.prod" "admin-panel/.env.production"; do
    if [ -f "$env_file" ]; then
        echo -e "${GREEN}✅ $env_file created${NC}"
    else
        echo -e "${RED}❌ $env_file missing${NC}"
    fi
done

# Final checks
echo -e "${BLUE}=====================================
   Pre-Deployment Checklist
=====================================${NC}"

echo "Before deploying, make sure you have:"
echo "📋 MongoDB Atlas database set up"
echo "📋 GitHub repository created and pushed"
echo "📋 Vercel account created"
echo "📋 Render account created"
echo "📋 All environment variables configured"
echo "📋 Domain names ready (optional)"

echo -e "${YELLOW}
Next Steps:
1. Push your code to GitHub: ${GREEN}git add . && git commit -m 'Ready for deployment' && git push${YELLOW}
2. Follow the DEPLOYMENT_GUIDE.md for detailed instructions
3. Deploy in this order: Backend → AI Service → Frontend → Admin Panel

${GREEN}🎉 Your portfolio is ready for deployment!${NC}"
