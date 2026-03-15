#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "   Local Dev Multi-Service Starter"
echo -e "${BLUE}======================================${NC}"

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Node.js not found. Install Node 18+ first.${NC}"; exit 1; fi
if ! command -v python3 >/dev/null 2>&1; then
  echo -e "${RED}Python3 not found. Install Python 3.11+ first.${NC}"; exit 1; fi

START_SIMPLE_AI=${START_SIMPLE_AI:-1}
FRONTEND_PORT=${FRONTEND_PORT:-3001}
BACKEND_PORT=${BACKEND_PORT:-4000}
AI_PORT=${AI_PORT:-8000}

LOG_DIR=".dev-logs"
mkdir -p "$LOG_DIR"

echo -e "${YELLOW}Checking/installing dependencies...${NC}"

# Backend deps
if [ -f backend/package.json ]; then
  (cd backend && [ -d node_modules ] || npm install --no-audit --no-fund >/dev/null 2>&1)
else
  echo -e "${RED}backend/package.json missing - cannot start backend${NC}"; exit 1; fi

# Frontend deps
if [ -d frontend ] && [ -f frontend/package.json ]; then
  (cd frontend && [ -d node_modules ] || npm install --no-audit --no-fund >/dev/null 2>&1)
fi

# Admin panel optional
if [ -d admin-panel ] && [ -f admin-panel/package.json ]; then
  (cd admin-panel && [ -d node_modules ] || npm install --no-audit --no-fund >/dev/null 2>&1 || true)
fi

# Python virtual env for AI service
if [ -d ai-service ]; then
  if [ ! -d ai-service/.venv ]; then
    python3 -m venv ai-service/.venv
    . ai-service/.venv/bin/activate
    if [ "$START_SIMPLE_AI" = "1" ]; then
      pip install -q -r ai-service/requirements-simple.txt
    else
      pip install -q -r ai-service/requirements.txt
    fi
    deactivate
  fi
fi

echo -e "${GREEN}Dependencies ready.${NC}"

purge_port() { lsof -ti:$1 2>/dev/null | xargs -r kill -9 || true; }
purge_port "$BACKEND_PORT"; purge_port "$FRONTEND_PORT"; purge_port "$AI_PORT"

echo -e "${YELLOW}Starting services...${NC}"

# Start backend
echo -e "${BLUE}Backend -> http://localhost:$BACKEND_PORT${NC}"
(
  cd backend
  PORT=$BACKEND_PORT NODE_ENV=development node server.js >> "../$LOG_DIR/backend.log" 2>&1 &
  echo $! > ../$LOG_DIR/backend.pid
)

# Start AI service
if [ -d ai-service ]; then
  echo -e "${BLUE}AI Service -> http://localhost:$AI_PORT (simple mode: $START_SIMPLE_AI)${NC}"
  (
    cd ai-service
    . .venv/bin/activate
    export PORT=$AI_PORT HOST=0.0.0.0 ENVIRONMENT=development AI_SERVICE_API_KEY=dev-ai-key
    if [ "$START_SIMPLE_AI" = "1" ]; then
      python simple_app.py >> "../$LOG_DIR/ai-service.log" 2>&1 &
    else
      python app.py >> "../$LOG_DIR/ai-service.log" 2>&1 &
    fi
    echo $! > ../$LOG_DIR/ai-service.pid
  )
fi

# Start frontend
if [ -d frontend ]; then
  echo -e "${BLUE}Frontend -> http://localhost:$FRONTEND_PORT${NC}"
  (
    cd frontend
    PORT=$FRONTEND_PORT BROWSER=none npm start >> "../$LOG_DIR/frontend.log" 2>&1 &
    echo $! > ../$LOG_DIR/frontend.pid
  )
fi

# Optional admin panel
if [ -d admin-panel ] && [ -f admin-panel/package.json ]; then
  echo -e "${BLUE}Admin Panel -> http://localhost:3002${NC}"
  (
    cd admin-panel
    PORT=3002 BROWSER=none npm start >> "../$LOG_DIR/admin-panel.log" 2>&1 &
    echo $! > ../$LOG_DIR/admin-panel.pid
  )
fi

sleep 4

echo -e "${GREEN}All launch commands dispatched. Checking health...${NC}"

check() {
  local name=$1 url=$2
  if curl -s -m 3 "$url" >/dev/null; then
    echo -e "${GREEN}✔ $name healthy: $url${NC}"
  else
    echo -e "${YELLOW}… $name not responding yet: $url${NC}"
  fi
}

check "Backend" "http://localhost:$BACKEND_PORT/api/health"
check "AI Service" "http://localhost:$AI_PORT/health"
check "Frontend" "http://localhost:$FRONTEND_PORT"

echo -e "\n${BLUE}Logs tail helper:${NC}"
echo "  tail -f $LOG_DIR/backend.log"
echo "  tail -f $LOG_DIR/ai-service.log"
echo "  tail -f $LOG_DIR/frontend.log"

echo -e "\n${YELLOW}To stop all services run:${NC}"
echo '  pkill -F .dev-logs/backend.pid 2>/dev/null || true'
echo '  pkill -F .dev-logs/ai-service.pid 2>/dev/null || true'
echo '  pkill -F .dev-logs/frontend.pid 2>/dev/null || true'
echo '  pkill -F .dev-logs/admin-panel.pid 2>/dev/null || true'

echo -e "\n${GREEN}✅ Development environment startup sequence completed.${NC}"
echo -e "${BLUE}Use START_SIMPLE_AI=0 ./start-dev.sh to load full model (slower).${NC}"
