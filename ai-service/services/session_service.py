import time
import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class SessionService:
    def __init__(self):
        self.sessions = {}
        self.session_timeout = 3600  # 1 hour in seconds
        
    def create_session(self, user_ip: Optional[str] = None) -> str:
        """Create a new session"""
        session_id = f"session_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        self.sessions[session_id] = {
            "id": session_id,
            "user_ip": user_ip,
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "messages": [],
            "context": {}
        }
        
        # Clean up old sessions
        self._cleanup_old_sessions()
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        session = self.sessions.get(session_id)
        
        if session:
            # Check if session is expired
            if self._is_session_expired(session):
                del self.sessions[session_id]
                return None
            
            return session
        
        return None
    
    def update_session(self, session_id: str, user_message: str, ai_response: str):
        """Update session with new message exchange"""
        session = self.get_session(session_id)
        
        if session:
            session["last_activity"] = datetime.now()
            session["messages"].append({
                "timestamp": datetime.now().isoformat(),
                "user_message": user_message,
                "ai_response": ai_response
            })
            
            # Limit message history to last 20 exchanges
            if len(session["messages"]) > 20:
                session["messages"] = session["messages"][-20:]
    
    def get_session_history(self, session_id: str) -> List[Dict]:
        """Get message history for a session"""
        session = self.get_session(session_id)
        return session["messages"] if session else []
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def get_active_sessions(self) -> int:
        """Get count of active sessions"""
        active_count = 0
        current_time = datetime.now()
        
        for session in self.sessions.values():
            if not self._is_session_expired(session):
                active_count += 1
        
        return active_count
    
    def get_total_sessions(self) -> int:
        """Get total number of sessions"""
        return len(self.sessions)
    
    def get_total_messages(self) -> int:
        """Get total number of messages across all sessions"""
        total = 0
        for session in self.sessions.values():
            total += len(session["messages"])
        return total
    
    def _is_session_expired(self, session: Dict) -> bool:
        """Check if a session is expired"""
        last_activity = session["last_activity"]
        return (datetime.now() - last_activity).seconds > self.session_timeout
    
    def _cleanup_old_sessions(self):
        """Remove expired sessions"""
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if self._is_session_expired(session):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
    
    def get_session_stats(self) -> Dict:
        """Get session statistics"""
        self._cleanup_old_sessions()
        
        total_sessions = len(self.sessions)
        active_sessions = self.get_active_sessions()
        total_messages = self.get_total_messages()
        
        # Calculate average messages per session
        avg_messages = total_messages / total_sessions if total_sessions > 0 else 0
        
        # Get session duration statistics
        durations = []
        for session in self.sessions.values():
            if not self._is_session_expired(session):
                duration = (session["last_activity"] - session["created_at"]).seconds
                durations.append(duration)
        
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        return {
            "total_sessions": total_sessions,
            "active_sessions": active_sessions,
            "total_messages": total_messages,
            "average_messages_per_session": round(avg_messages, 2),
            "average_session_duration_seconds": round(avg_duration, 2)
        }
    
    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        """Get recent sessions"""
        sessions = list(self.sessions.values())
        sessions.sort(key=lambda x: x["last_activity"], reverse=True)
        
        recent = []
        for session in sessions[:limit]:
            recent.append({
                "id": session["id"],
                "created_at": session["created_at"].isoformat(),
                "last_activity": session["last_activity"].isoformat(),
                "message_count": len(session["messages"]),
                "user_ip": session.get("user_ip", "unknown")
            })
        
        return recent
    
    def clear_all_sessions(self):
        """Clear all sessions (admin function)"""
        self.sessions.clear()
    
    def export_sessions(self) -> Dict:
        """Export all sessions for backup/analysis"""
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "total_sessions": len(self.sessions),
            "sessions": []
        }
        
        for session in self.sessions.values():
            session_data = {
                "id": session["id"],
                "created_at": session["created_at"].isoformat(),
                "last_activity": session["last_activity"].isoformat(),
                "message_count": len(session["messages"]),
                "messages": session["messages"]
            }
            export_data["sessions"].append(session_data)
        
        return export_data
