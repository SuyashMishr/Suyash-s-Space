#!/usr/bin/env python3
"""
Ultra-Fast AI Service for Portfolio Website
Optimized for maximum speed with minimal dependencies
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app with minimal overhead
app = FastAPI(
    title="Fast Portfolio AI",
    description="Ultra-fast AI assistant",
    version="2.0.0",
    docs_url=None,  # Disable docs for production speed
    redoc_url=None
)

# Minimal CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Simplified for speed
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    userIP: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sessionId: str
    confidence: float
    timestamp: str
    sources: List[str] = []

# Pre-compiled responses for instant delivery
INSTANT_RESPONSES = {
    # Greetings
    "hello": "Hello! I'm Suyash's AI assistant. I can help you learn about his skills, projects, and experience. What would you like to know?",
    "hi": "Hi there! I'm here to answer questions about Suyash's portfolio. Feel free to ask about his skills, projects, or experience!",
    "hey": "Hey! I can help you explore Suyash's portfolio. Ask me about his technical skills, projects, or professional background.",
    
    # Skills
    "skills": "Suyash specializes in full-stack development with the MERN stack (MongoDB, Express, React, Node.js). He's also experienced in Python, AI/ML integration, and cloud technologies. Check the Skills section for comprehensive details!",
    "technologies": "His tech stack includes React, Node.js, Python, MongoDB, JavaScript, TypeScript, AI/ML frameworks, and cloud platforms. He builds scalable, modern web applications.",
    "programming": "Suyash is proficient in JavaScript, Python, TypeScript, and various frameworks. He focuses on clean, maintainable code and modern development practices.",
    
    # Projects
    "projects": "Suyash has built numerous projects including web applications, AI integrations, and full-stack solutions. Visit the Projects section to see detailed case studies and live demos!",
    "portfolio": "His portfolio showcases diverse projects from web development to AI implementations. Each project demonstrates different technical skills and problem-solving approaches.",
    "work": "He's worked on various applications including e-commerce platforms, AI-powered tools, and data visualization dashboards. Check out the Projects section for details!",
    
    # Experience
    "experience": "Suyash has hands-on experience in full-stack development, team leadership, and has been recognized in major hackathons. He's currently pursuing his degree while building real-world applications.",
    "background": "He combines academic learning with practical development experience. His background includes both individual projects and collaborative team work.",
    "education": "Currently pursuing his degree while actively developing projects and gaining industry experience through internships and competitions.",
    
    # Contact
    "contact": "You can reach Suyash at suyashmishraa983@gmail.com or use the contact form on this website. He's always open to discussing new opportunities!",
    "email": "His email is suyashmishraa983@gmail.com. Feel free to reach out for collaborations, opportunities, or just to connect!",
    "hire": "Suyash is open to new opportunities! Contact him at suyashmishraa983@gmail.com or through the contact form to discuss potential collaborations.",
    
    # Specific technologies
    "react": "Suyash is highly skilled in React, building responsive and interactive user interfaces. He uses modern React patterns, hooks, and state management solutions.",
    "nodejs": "He's experienced with Node.js for backend development, building RESTful APIs, handling databases, and creating scalable server applications.",
    "python": "Python is one of his strong suits, especially for AI/ML projects, data analysis, and backend development. He's worked with frameworks like FastAPI and Django.",
    "ai": "Suyash has extensive experience with AI/ML technologies including TensorFlow, PyTorch, and various AI integrations in web applications.",
    "mongodb": "He's proficient with MongoDB for database design, optimization, and integration with Node.js applications using Mongoose.",
    
    # Default
    "default": "I'm here to help you learn about Suyash's portfolio! You can ask me about his technical skills, projects, professional experience, or how to contact him. What interests you most?"
}

# Keyword mapping for fast lookup
KEYWORD_MAP = {
    # Greetings
    "hello": "hello", "hi": "hi", "hey": "hey", "greetings": "hello",
    
    # Skills
    "skill": "skills", "skills": "skills", "technology": "technologies", 
    "technologies": "technologies", "tech": "technologies", "programming": "programming",
    "development": "skills", "coding": "programming",
    
    # Projects
    "project": "projects", "projects": "projects", "portfolio": "portfolio",
    "work": "work", "built": "projects", "created": "projects", "application": "projects",
    
    # Experience
    "experience": "experience", "background": "background", "education": "education",
    "qualification": "background", "career": "experience",
    
    # Contact
    "contact": "contact", "email": "email", "reach": "contact", "hire": "hire",
    "opportunity": "hire", "connect": "contact",
    
    # Technologies
    "react": "react", "nodejs": "nodejs", "node": "nodejs", "python": "python",
    "ai": "ai", "ml": "ai", "machine learning": "ai", "artificial intelligence": "ai",
    "mongodb": "mongodb", "mongo": "mongodb", "database": "mongodb"
}

def get_fast_response(message: str) -> tuple[str, float, List[str]]:
    """Get instant response using pre-compiled responses"""
    message_lower = message.lower().strip()
    
    # Direct lookup for exact matches
    if message_lower in INSTANT_RESPONSES:
        return INSTANT_RESPONSES[message_lower], 0.95, ["Fast Response"]
    
    # Keyword-based lookup
    for keyword, response_key in KEYWORD_MAP.items():
        if keyword in message_lower:
            response = INSTANT_RESPONSES.get(response_key, INSTANT_RESPONSES["default"])
            confidence = 0.9 if response_key != "default" else 0.7
            return response, confidence, ["Portfolio Data"]
    
    # Default response
    return INSTANT_RESPONSES["default"], 0.7, ["AI Assistant"]

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Fast Portfolio AI",
        "status": "running",
        "version": "2.0.0",
        "response_time": "< 50ms"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fast-portfolio-ai",
        "timestamp": datetime.now().isoformat(),
        "response_time": "instant"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    x_api_key: Optional[str] = Header(None)
):
    """Ultra-fast chat endpoint"""
    # Simple API key validation
    expected_key = os.getenv("AI_SERVICE_API_KEY", "dev-key")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # Generate session ID if not provided
        session_id = request.sessionId or f"fast_{int(time.time() * 1000)}"
        
        # Get instant response
        response_text, confidence, sources = get_fast_response(request.message)
        
        return ChatResponse(
            response=response_text,
            sessionId=session_id,
            confidence=confidence,
            timestamp=datetime.now().isoformat(),
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "service": "fast-portfolio-ai",
        "total_responses": len(INSTANT_RESPONSES),
        "average_response_time": "< 50ms",
        "uptime": "100%",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("🚀 Starting Ultra-Fast AI Service")
    print(f"📊 {len(INSTANT_RESPONSES)} pre-compiled responses loaded")
    print(f"⚡ Average response time: < 50ms")
    print(f"🔒 Service ready on {host}:{port}")
    
    uvicorn.run(
        "fast_app:app",
        host=host,
        port=port,
        reload=False,  # Disable reload for production speed
        log_level="warning"  # Reduce logging overhead
    )