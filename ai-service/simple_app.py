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

# Pre-compiled response cache for instant responses
RESPONSE_CACHE = {}

def generate_response(message: str) -> tuple[str, float, List[str]]:
    """Generate a response based on the input message with caching"""
    message_lower = message.lower().strip()
    
    # Check cache first for instant response
    if message_lower in RESPONSE_CACHE:
        return RESPONSE_CACHE[message_lower]

    # Enhanced keyword matching with more specific responses
    if any(word in message_lower for word in ["hello", "hi", "hey", "greetings", "start"]):
        response = random.choice(RESPONSE_TEMPLATES["greeting"])
        confidence = 0.95
        sources = ["AI Assistant"]

    elif any(word in message_lower for word in ["skill", "technology", "tech", "programming", "development", "language", "framework"]):
        # Get specific skills from portfolio data
        skills_info = []
        if PORTFOLIO_DATA.get('skills', {}).get('technical'):
            for category, skills in PORTFOLIO_DATA['skills']['technical'].items():
                if skills:
                    skill_names = [skill.get('name', skill) if isinstance(skill, dict) else skill for skill in skills]
                    skills_info.append(f"{category}: {', '.join(skill_names[:3])}")
        
        if skills_info:
            response = f"Suyash's technical skills include {'; '.join(skills_info[:3])}. He specializes in full-stack development with modern technologies."
        else:
            response = random.choice(RESPONSE_TEMPLATES["skills"])
        confidence = 0.9
        sources = ["Skills Section"]

    elif any(word in message_lower for word in ["project", "work", "portfolio", "application", "app", "built", "created"]):
        # Get specific project info
        if PORTFOLIO_DATA.get('projects') and len(PORTFOLIO_DATA['projects']) > 0:
            project_count = len(PORTFOLIO_DATA['projects'])
            featured_project = PORTFOLIO_DATA['projects'][0]
            response = f"Suyash has worked on {project_count} projects. One notable project is '{featured_project.get('title', 'a web application')}' - {featured_project.get('description', 'a full-stack application')[:100]}... Visit the Projects section for complete details."
        else:
            response = random.choice(RESPONSE_TEMPLATES["projects"])
        confidence = 0.9
        sources = ["Projects Section"]

    elif any(word in message_lower for word in ["experience", "background", "education", "qualification", "career", "job"]):
        # Get specific experience info
        if PORTFOLIO_DATA.get('experience') and len(PORTFOLIO_DATA['experience']) > 0:
            exp = PORTFOLIO_DATA['experience'][0]
            response = f"Suyash has experience as {exp.get('position', 'a developer')} at {exp.get('company', 'various organizations')}. {exp.get('description', 'He has worked on various projects and gained valuable experience.')[:100]}... Check the Resume section for complete details."
        else:
            response = random.choice(RESPONSE_TEMPLATES["experience"])
        confidence = 0.9
        sources = ["Resume Section"]

    elif any(word in message_lower for word in ["contact", "email", "reach", "connect", "linkedin", "hire", "opportunity"]):
        contact_email = PORTFOLIO_DATA.get('general', {}).get('email', 'suyashmishraa983@gmail.com')
        response = f"You can contact Suyash at {contact_email} or use the contact form on this website. He's always open to discussing new opportunities and collaborations!"
        confidence = 0.95
        sources = ["Contact Section"]

    elif any(word in message_lower for word in ["ai", "artificial intelligence", "machine learning", "ml", "data science"]):
        response = "Suyash has extensive experience with AI/ML technologies including Python, TensorFlow, PyTorch, and data analysis. He's worked on various AI projects and integrations. Check his projects for AI-related work!"
        confidence = 0.9
        sources = ["Skills Section", "Projects Section"]

    elif any(word in message_lower for word in ["react", "javascript", "node", "python", "mongodb", "web development"]):
        response = "Suyash is proficient in modern web development technologies including React, Node.js, Python, MongoDB, and the full MERN stack. He builds scalable, responsive web applications with clean, maintainable code."
        confidence = 0.9
        sources = ["Skills Section"]

    else:
        response = random.choice(RESPONSE_TEMPLATES["default"])
        confidence = 0.7
        sources = ["AI Assistant"]

    # Cache the response for future use
    result = (response, confidence, sources)
    RESPONSE_CACHE[message_lower] = result
    
    # Keep cache size manageable
    if len(RESPONSE_CACHE) > 100:
        # Remove oldest entries
        keys_to_remove = list(RESPONSE_CACHE.keys())[:25]
        for key in keys_to_remove:
            del RESPONSE_CACHE[key]

    return result

# In-memory session storage (for demo purposes)
sessions = {}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Portfolio AI Assistant",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "stats": "/stats"
        }
    }

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
    expected_key = os.getenv("AI_SERVICE_API_KEY", "dev-key")
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
