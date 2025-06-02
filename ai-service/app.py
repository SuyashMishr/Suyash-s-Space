import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.llm_service import LLMService
from services.context_service import ContextService
from services.session_service import SessionService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Portfolio AI Assistant",
    description="AI-powered chatbot for portfolio website",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://suyashspace.netlify.app",
        "https://suyashspace.netlify.app",
        os.getenv("FRONTEND_URL", "https://suyashspace.netlify.app")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    userIP: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sessionId: str
    confidence: float
    timestamp: str
    sources: Optional[List[str]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    model_loaded: bool
    context_loaded: bool

# Global services
llm_service = None
context_service = None
session_service = None

# API Key validation
async def validate_api_key(x_api_key: str = Header(None)):
    expected_key = os.getenv("AI_SERVICE_API_KEY", "dev-key")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global llm_service, context_service, session_service
    
    try:
        logger.info("🚀 Starting AI service...")
        
        # Initialize context service
        context_service = ContextService()
        await context_service.load_context()
        logger.info("✅ Context service initialized")
        
        # Initialize LLM service
        llm_service = LLMService()
        await llm_service.load_model()
        logger.info("✅ LLM service initialized")
        
        # Initialize session service
        session_service = SessionService()
        logger.info("✅ Session service initialized")
        
        logger.info("🎉 AI service startup complete")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="OK",
        timestamp=datetime.now().isoformat(),
        model_loaded=llm_service is not None and llm_service.is_loaded(),
        context_loaded=context_service is not None and context_service.is_loaded()
    )

@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(validate_api_key)])
async def chat(request: ChatRequest):
    """Main chat endpoint"""
    try:
        if not llm_service or not context_service:
            raise HTTPException(status_code=503, detail="Services not initialized")
        
        # Get or create session
        session_id = request.sessionId or session_service.create_session(request.userIP)
        
        # Get relevant context
        relevant_context = await context_service.get_relevant_context(request.message)
        
        # Generate response
        response_data = await llm_service.generate_response(
            message=request.message,
            context=relevant_context,
            session_id=session_id
        )
        
        # Update session
        session_service.update_session(session_id, request.message, response_data["response"])
        
        return ChatResponse(
            response=response_data["response"],
            sessionId=session_id,
            confidence=response_data["confidence"],
            timestamp=datetime.now().isoformat(),
            sources=response_data.get("sources", [])
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/context/reload", dependencies=[Depends(validate_api_key)])
async def reload_context():
    """Reload context data"""
    try:
        if context_service:
            await context_service.load_context()
            return {"message": "Context reloaded successfully"}
        else:
            raise HTTPException(status_code=503, detail="Context service not initialized")
    except Exception as e:
        logger.error(f"Context reload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reload context")

@app.get("/sessions/{session_id}")
async def get_session(session_id: str, api_key: str = Depends(validate_api_key)):
    """Get session history"""
    try:
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        logger.error(f"Get session error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/stats", dependencies=[Depends(validate_api_key)])
async def get_stats():
    """Get service statistics"""
    try:
        return {
            "total_sessions": session_service.get_total_sessions(),
            "active_sessions": session_service.get_active_sessions(),
            "total_messages": session_service.get_total_messages(),
            "model_info": llm_service.get_model_info() if llm_service else None,
            "context_info": context_service.get_context_info() if context_service else None
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Portfolio AI Assistant",
        "status": "running",
        "version": "1.0.0",
        "confidential": True
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )
