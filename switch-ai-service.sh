#!/bin/bash

# AI Service Switcher Script
# Allows switching between different AI service implementations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "ai-service" ]; then
    print_error "ai-service directory not found. Please run this script from the project root."
    exit 1
fi

# Function to show current service
show_current_service() {
    if [ -f "ai-service/current_service.txt" ]; then
        current=$(cat ai-service/current_service.txt)
        print_status "Current AI service: $current"
    else
        print_warning "No current service set"
    fi
}

# Function to switch to fast service
switch_to_fast() {
    print_status "Switching to Ultra-Fast AI Service..."
    
    # Copy fast_app.py to app.py
    cp ai-service/fast_app.py ai-service/app.py
    
    # Update current service marker
    echo "fast" > ai-service/current_service.txt
    
    print_success "Switched to Ultra-Fast AI Service"
    print_status "Features:"
    echo "  ✓ < 50ms response time"
    echo "  ✓ Pre-compiled responses"
    echo "  ✓ Minimal dependencies"
    echo "  ✓ Instant startup"
}

# Function to switch to simple service
switch_to_simple() {
    print_status "Switching to Simple AI Service..."
    
    # Copy simple_app.py to app.py
    cp ai-service/simple_app.py ai-service/app.py
    
    # Update current service marker
    echo "simple" > ai-service/current_service.txt
    
    print_success "Switched to Simple AI Service"
    print_status "Features:"
    echo "  ✓ Rule-based responses"
    echo "  ✓ Portfolio data integration"
    echo "  ✓ Response caching"
    echo "  ✓ Fast startup"
}

# Function to switch to full service
switch_to_full() {
    print_status "Switching to Full AI Service..."
    
    # Check if backup exists
    if [ ! -f "ai-service/app_full.py" ]; then
        # Create backup of original app.py
        if [ -f "ai-service/app.py" ] && [ "$(cat ai-service/current_service.txt 2>/dev/null)" != "fast" ] && [ "$(cat ai-service/current_service.txt 2>/dev/null)" != "simple" ]; then
            cp ai-service/app.py ai-service/app_full.py
        fi
    fi
    
    if [ -f "ai-service/app_full.py" ]; then
        cp ai-service/app_full.py ai-service/app.py
    else
        print_error "Full AI service backup not found. Using current app.py"
    fi
    
    # Update current service marker
    echo "full" > ai-service/current_service.txt
    
    print_success "Switched to Full AI Service"
    print_status "Features:"
    echo "  ✓ LLM integration"
    echo "  ✓ Context embeddings"
    echo "  ✓ Advanced responses"
    echo "  ✓ Session management"
}

# Function to restart services
restart_services() {
    print_status "Restarting AI service..."
    
    # Kill existing AI service processes
    pkill -f "uvicorn.*app:app" 2>/dev/null || true
    pkill -f "python.*app.py" 2>/dev/null || true
    
    # Wait a moment
    sleep 2
    
    # Start AI service in background
    cd ai-service
    python app.py &
    AI_PID=$!
    cd ..
    
    print_success "AI service restarted (PID: $AI_PID)"
    
    # Optionally restart backend
    read -p "Restart backend service? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restarting backend service..."
        
        # Kill existing backend processes
        pkill -f "node.*server.js" 2>/dev/null || true
        
        # Wait a moment
        sleep 2
        
        # Start backend in background
        cd backend
        npm start &
        BACKEND_PID=$!
        cd ..
        
        print_success "Backend service restarted (PID: $BACKEND_PID)"
    fi
}

# Function to show performance comparison
show_performance() {
    print_status "AI Service Performance Comparison:"
    echo
    echo "┌─────────────────┬──────────────┬─────────────┬──────────────┐"
    echo "│ Service         │ Response Time│ Startup Time│ Features     │"
    echo "├─────────────────┼──────────────┼─────────────┼──────────────┤"
    echo "│ Ultra-Fast      │ < 50ms       │ < 1s        │ Basic        │"
    echo "│ Simple          │ < 200ms      │ < 3s        │ Enhanced     │"
    echo "│ Full            │ 1-5s         │ 10-30s      │ Complete     │"
    echo "└─────────────────┴──────────────┴─────────────┴──────────────┘"
    echo
}

# Function to test current service
test_service() {
    print_status "Testing current AI service..."
    
    # Check if service is running
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "AI service is running"
        
        # Test chat endpoint
        response=$(curl -s -X POST http://localhost:8000/chat \
            -H "Content-Type: application/json" \
            -H "X-API-Key: dev-key" \
            -d '{"message": "hello"}' | jq -r '.response' 2>/dev/null || echo "Test failed")
        
        if [ "$response" != "Test failed" ]; then
            print_success "Chat endpoint working"
            echo "Sample response: $response"
        else
            print_error "Chat endpoint test failed"
        fi
    else
        print_error "AI service is not running on port 8000"
    fi
}

# Main menu
show_menu() {
    echo
    print_status "AI Service Switcher"
    echo "=================="
    show_current_service
    echo
    echo "1) Switch to Ultra-Fast Service (< 50ms responses)"
    echo "2) Switch to Simple Service (< 200ms responses)"
    echo "3) Switch to Full Service (1-5s responses)"
    echo "4) Show performance comparison"
    echo "5) Test current service"
    echo "6) Restart services"
    echo "7) Exit"
    echo
}

# Main script logic
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Choose an option (1-7): " choice
        
        case $choice in
            1)
                switch_to_fast
                ;;
            2)
                switch_to_simple
                ;;
            3)
                switch_to_full
                ;;
            4)
                show_performance
                ;;
            5)
                test_service
                ;;
            6)
                restart_services
                ;;
            7)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-7."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case $1 in
        "fast")
            switch_to_fast
            ;;
        "simple")
            switch_to_simple
            ;;
        "full")
            switch_to_full
            ;;
        "restart")
            restart_services
            ;;
        "test")
            test_service
            ;;
        "status")
            show_current_service
            ;;
        "performance")
            show_performance
            ;;
        *)
            echo "Usage: $0 [fast|simple|full|restart|test|status|performance]"
            echo "Or run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi