import os
import json
import logging
from typing import Dict, List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class ContextService:
    def __init__(self):
        self.context_data = []
        self.embeddings = None
        self.embedding_model = None
        self.model_name = "all-MiniLM-L6-v2"  # Lightweight sentence transformer
        
    async def load_context(self):
        """Load context data and create embeddings"""
        try:
            logger.info("Loading context data...")
            
            # Load embedding model
            self.embedding_model = SentenceTransformer(self.model_name)
            logger.info(f"✅ Embedding model loaded: {self.model_name}")
            
            # Load context from files
            await self._load_portfolio_data()
            
            # Create embeddings
            if self.context_data:
                await self._create_embeddings()
                logger.info(f"✅ Context loaded: {len(self.context_data)} items")
            else:
                logger.warning("⚠️ No context data found")
                
        except Exception as e:
            logger.error(f"❌ Failed to load context: {e}")
            raise
    
    async def _load_portfolio_data(self):
        """Load portfolio data from various sources"""
        # Load from data directory
        data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
        
        # Load skills data
        skills_file = os.path.join(data_dir, "skills.json")
        if os.path.exists(skills_file):
            with open(skills_file, 'r') as f:
                skills_data = json.load(f)
                self._process_skills_data(skills_data)
        
        # Load projects data
        projects_file = os.path.join(data_dir, "projects.json")
        if os.path.exists(projects_file):
            with open(projects_file, 'r') as f:
                projects_data = json.load(f)
                self._process_projects_data(projects_data)
        
        # Load experience data
        experience_file = os.path.join(data_dir, "experience.json")
        if os.path.exists(experience_file):
            with open(experience_file, 'r') as f:
                experience_data = json.load(f)
                self._process_experience_data(experience_data)
        
        # Load general info
        info_file = os.path.join(data_dir, "general_info.json")
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                info_data = json.load(f)
                self._process_general_info(info_data)
        
        # Add default context if no files found
        if not self.context_data:
            self._add_default_context()
    
    def _process_skills_data(self, skills_data: Dict):
        """Process skills data into context items"""
        for category, skills in skills_data.get("technical", {}).items():
            content = f"Technical skills in {category}: " + ", ".join([
                f"{skill['name']} ({skill.get('level', 'intermediate')})" 
                for skill in skills
            ])
            
            self.context_data.append({
                "content": content,
                "type": "skills",
                "category": category,
                "source": "Skills Section"
            })
        
        # Add soft skills
        soft_skills = skills_data.get("soft", [])
        if soft_skills:
            content = f"Soft skills: {', '.join(soft_skills)}"
            self.context_data.append({
                "content": content,
                "type": "skills",
                "category": "soft",
                "source": "Skills Section"
            })
    
    def _process_projects_data(self, projects_data: List[Dict]):
        """Process projects data into context items"""
        for project in projects_data:
            # Main project description
            content = f"Project: {project.get('title', '')}. "
            content += f"Description: {project.get('description', '')}. "
            
            if project.get('technologies'):
                content += f"Technologies used: {', '.join(project['technologies'])}. "
            
            if project.get('challenges'):
                content += f"Challenges: {'. '.join(project['challenges'])}. "
            
            if project.get('solutions'):
                content += f"Solutions: {'. '.join(project['solutions'])}. "
            
            self.context_data.append({
                "content": content,
                "type": "project",
                "title": project.get('title', ''),
                "category": project.get('category', ''),
                "source": "Projects Section"
            })
    
    def _process_experience_data(self, experience_data: List[Dict]):
        """Process experience data into context items"""
        for exp in experience_data:
            content = f"Experience at {exp.get('company', '')}: "
            content += f"Position: {exp.get('position', '')}. "
            content += f"Description: {exp.get('description', '')}. "
            
            if exp.get('achievements'):
                content += f"Achievements: {'. '.join(exp['achievements'])}. "
            
            if exp.get('technologies'):
                content += f"Technologies used: {', '.join(exp['technologies'])}. "
            
            self.context_data.append({
                "content": content,
                "type": "experience",
                "company": exp.get('company', ''),
                "position": exp.get('position', ''),
                "source": "Resume Section"
            })
    
    def _process_general_info(self, info_data: Dict):
        """Process general information into context items"""
        for key, value in info_data.items():
            if isinstance(value, str):
                self.context_data.append({
                    "content": f"{key}: {value}",
                    "type": "general",
                    "category": key,
                    "source": "General Information"
                })
            elif isinstance(value, list):
                self.context_data.append({
                    "content": f"{key}: {', '.join(value)}",
                    "type": "general",
                    "category": key,
                    "source": "General Information"
                })
    
    def _add_default_context(self):
        """Add default context when no data files are found"""
        default_context = [
            {
                "content": "I am a full-stack developer with experience in React, Node.js, Python, and MongoDB.",
                "type": "skills",
                "category": "technical",
                "source": "Default Information"
            },
            {
                "content": "I have worked on various web applications, AI projects, and data analysis tools.",
                "type": "projects",
                "category": "general",
                "source": "Default Information"
            },
            {
                "content": "I have experience in software development, machine learning, and cloud technologies.",
                "type": "experience",
                "category": "general",
                "source": "Default Information"
            }
        ]
        
        self.context_data.extend(default_context)
    
    async def _create_embeddings(self):
        """Create embeddings for all context items"""
        try:
            texts = [item["content"] for item in self.context_data]
            self.embeddings = self.embedding_model.encode(texts)
            logger.info(f"✅ Created embeddings for {len(texts)} context items")
        except Exception as e:
            logger.error(f"❌ Failed to create embeddings: {e}")
            raise
    
    async def get_relevant_context(self, query: str, top_k: int = 3) -> List[Dict]:
        """Get relevant context for a query"""
        try:
            if not self.embeddings or not self.context_data:
                return []
            
            # Encode query
            query_embedding = self.embedding_model.encode([query])
            
            # Calculate similarities
            similarities = cosine_similarity(query_embedding, self.embeddings)[0]
            
            # Get top-k most similar items
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            relevant_context = []
            for idx in top_indices:
                if similarities[idx] > 0.3:  # Minimum similarity threshold
                    context_item = self.context_data[idx].copy()
                    context_item["similarity"] = float(similarities[idx])
                    relevant_context.append(context_item)
            
            return relevant_context
            
        except Exception as e:
            logger.error(f"Error getting relevant context: {e}")
            return []
    
    def is_loaded(self) -> bool:
        """Check if context is loaded"""
        return len(self.context_data) > 0 and self.embeddings is not None
    
    def get_context_info(self) -> Dict:
        """Get context information"""
        return {
            "total_items": len(self.context_data),
            "types": list(set(item.get("type", "") for item in self.context_data)),
            "categories": list(set(item.get("category", "") for item in self.context_data)),
            "embedding_model": self.model_name,
            "loaded": self.is_loaded()
        }
    
    def add_context_item(self, content: str, item_type: str, category: str = "", source: str = ""):
        """Add a new context item"""
        new_item = {
            "content": content,
            "type": item_type,
            "category": category,
            "source": source
        }
        
        self.context_data.append(new_item)
        
        # Re-create embeddings if model is loaded
        if self.embedding_model:
            texts = [item["content"] for item in self.context_data]
            self.embeddings = self.embedding_model.encode(texts)
    
    def remove_context_item(self, index: int):
        """Remove a context item by index"""
        if 0 <= index < len(self.context_data):
            self.context_data.pop(index)
            
            # Re-create embeddings
            if self.embedding_model and self.context_data:
                texts = [item["content"] for item in self.context_data]
                self.embeddings = self.embedding_model.encode(texts)
