#!/usr/bin/env python3
"""
Simple AI Service for Portfolio Website
A fallback AI service that provides basic responses without complex dependencies
"""

import json
import os
import random
import time
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(
    title="Portfolio AI Service",
    description="Simple AI assistant for portfolio website",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://suyashspace.netlify.app",
        "https://suyash-s-space-1.onrender.com", 
        "http://localhost:4000", 
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
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

# Load portfolio data
def load_portfolio_data():
    """Load portfolio data from JSON files"""
    data = {}
    data_dir = "../data"

    try:
        # Load general info
        with open(f"{data_dir}/general_info.json", "r") as f:
            data["general"] = json.load(f)

        # Load projects
        with open(f"{data_dir}/projects.json", "r") as f:
            data["projects"] = json.load(f)

        # Load skills
        with open(f"{data_dir}/skills.json", "r") as f:
            data["skills"] = json.load(f)

        # Load experience
        with open(f"{data_dir}/experience.json", "r") as f:
            data["experience"] = json.load(f)

    except Exception as e:
        print(f"Warning: Could not load portfolio data: {e}")
        data = {
            "general": {"name": "Suyash Mishra", "title": "Full-Stack Developer"},
            "projects": [],
            "skills": {"technical": {}, "soft": []},
            "experience": []
        }

    return data

# Global portfolio data
PORTFOLIO_DATA = load_portfolio_data()

# Simple response templates
RESPONSE_TEMPLATES = {
    "greeting": [
        "Hello! I'm Suyash's AI assistant. I can help you learn about his skills, projects, and experience.",
        "Hi there! I'm here to answer questions about Suyash's portfolio. What would you like to know?",
        "Welcome! I can provide information about Suyash's work, skills, and projects. How can I help?"
    ],
    "skills": [
        f"Suyash is skilled in {', '.join(PORTFOLIO_DATA['general'].get('specializations', ['Full-Stack Development', 'AI/ML', 'MERN Stack']))}. He has experience with various technologies including React, Node.js, Python, and MongoDB.",
        "His technical expertise includes full-stack development with the MERN stack, AI/ML integration, and building scalable web applications.",
        "Suyash specializes in modern web development technologies and has a strong background in both frontend and backend development."
    ],
    "projects": [
        f"Suyash has worked on {len(PORTFOLIO_DATA['projects'])} projects including web applications, AI integrations, and full-stack solutions.",
        "His project portfolio includes various web applications built with modern technologies like React, Node.js, and AI integrations.",
        "You can find detailed information about his projects in the Projects section of this website."
    ],
    "experience": [
        f"Suyash is currently pursuing {PORTFOLIO_DATA['general'].get('education', {}).get('degree', 'his degree')} and has hands-on experience in software development.",
        "He has practical experience in full-stack development, team leadership, and has been recognized in various hackathons.",
        "His experience includes both academic projects and real-world applications in web development and AI."
    ],
    "contact": [
        f"You can reach Suyash at {PORTFOLIO_DATA['general'].get('email', 'suyashmishraa983@gmail.com')} or connect with him on LinkedIn.",
        "Feel free to use the contact form on this website to get in touch with Suyash directly.",
        "Suyash is open to new opportunities and collaborations. You can contact him through the contact section."
    ],
    "default": [
        "I'm here to help you learn about Suyash's portfolio. You can ask me about his skills, projects, experience, or how to contact him.",
        "I can provide information about Suyash's technical skills, project experience, and background. What specific area interests you?",
        "Feel free to ask me about Suyash's work, education, skills, or any specific projects you'd like to know more about."
    ]
}

def generate_response(message: str) -> tuple[str, float, List[str]]:
    """Generate a response based on the input message"""
    message_lower = message.lower()

    # Simple keyword matching
    if any(word in message_lower for word in ["hello", "hi", "hey", "greetings"]):
        response = random.choice(RESPONSE_TEMPLATES["greeting"])
        confidence = 0.9
        sources = ["greeting_template"]

    elif any(word in message_lower for word in ["skill", "technology", "tech", "programming", "development"]):
        response = random.choice(RESPONSE_TEMPLATES["skills"])
        confidence = 0.8
        sources = ["skills_data", "general_info"]

    elif any(word in message_lower for word in ["project", "work", "portfolio", "application", "app"]):
        response = random.choice(RESPONSE_TEMPLATES["projects"])
        confidence = 0.8
        sources = ["projects_data"]

    elif any(word in message_lower for word in ["experience", "background", "education", "qualification"]):
        response = random.choice(RESPONSE_TEMPLATES["experience"])
        confidence = 0.8
        sources = ["experience_data", "education_data"]

    elif any(word in message_lower for word in ["contact", "email", "reach", "connect", "linkedin"]):
        response = random.choice(RESPONSE_TEMPLATES["contact"])
        confidence = 0.9
        sources = ["contact_info"]

    else:
        response = random.choice(RESPONSE_TEMPLATES["default"])
        confidence = 0.6
        sources = ["default_template"]

    return response, confidence, sources

# In-memory session storage (for demo purposes)
sessions = {}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "portfolio-ai-service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    x_api_key: Optional[str] = Header(None)
):
    """Main chat endpoint"""
    # Validate API key
    expected_key = os.getenv("AI_SERVICE_API_KEY", "maQNMghEg5rknGdTfsqjbDwSOVBeW-_FjNcPESHuH0w")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # Generate session ID if not provided
        session_id = request.sessionId or f"session_{int(time.time())}_{random.randint(1000, 9999)}"

        # Generate response
        response_text, confidence, sources = generate_response(request.message)

        # Store in session (simple in-memory storage)
        if session_id not in sessions:
            sessions[session_id] = []

        sessions[session_id].append({
            "user_message": request.message,
            "ai_response": response_text,
            "timestamp": datetime.now().isoformat(),
            "confidence": confidence
        })

        return ChatResponse(
            response=response_text,
            sessionId=session_id,
            confidence=confidence,
            timestamp=datetime.now().isoformat(),
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session history"""
    if session_id in sessions:
        return {
            "sessionId": session_id,
            "messages": sessions[session_id],
            "timestamp": datetime.now().isoformat()
        }
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    total_sessions = len(sessions)
    total_messages = sum(len(session) for session in sessions.values())

    return {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "active_sessions": total_sessions,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/context/reload")
async def reload_context():
    """Reload portfolio context data"""
    global PORTFOLIO_DATA
    try:
        PORTFOLIO_DATA = load_portfolio_data()
        return {
            "status": "success",
            "message": "Portfolio context reloaded successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reloading context: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"🤖 Starting Simple AI Service on {host}:{port}")
    print("📊 Portfolio data loaded successfully")
    print("🔒 Service ready for confidential portfolio queries")

    uvicorn.run(
        "simple_app:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
