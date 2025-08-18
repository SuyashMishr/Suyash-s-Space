import os
import logging
import asyncio
from typing import Dict, List, Optional
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    pipeline,
    BitsAndBytesConfig
)
from functools import lru_cache

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        # Use a much lighter model for faster responses
        self.model_name = os.getenv("MODEL_NAME", "distilgpt2")
        self.max_length = int(os.getenv("MAX_LENGTH", "256"))  # Reduced for speed
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.response_cache = {}  # Simple response cache
        
    async def load_model(self):
        """Load the LLM model"""
        try:
            logger.info(f"Loading lightweight model: {self.model_name}")
            
            # Load tokenizer (faster loading)
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                padding_side="left"
            )
            
            # Add pad token if it doesn't exist
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model with minimal configuration for speed
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float32,  # Use float32 for CPU compatibility
                low_cpu_mem_usage=True
            )
            
            # Create optimized pipeline
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=-1,  # Force CPU for consistency
                return_full_text=False,
                do_sample=True,
                temperature=self.temperature,
                max_new_tokens=80,  # Reduced for faster generation
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            logger.info(f"✅ Lightweight model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            # Use rule-based fallback instead
            self.model = None
            self.tokenizer = None
            self.pipeline = None
            logger.info("Using rule-based responses for maximum speed")
    
    async def _load_fallback_model(self):
        """Load a smaller fallback model"""
        try:
            logger.info("Loading fallback model: distilgpt2")
            
            self.tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
            self.tokenizer.pad_token = self.tokenizer.eos_token
            
            self.model = AutoModelForCausalLM.from_pretrained("distilgpt2")
            
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=-1,  # CPU only for fallback
                return_full_text=False,
                do_sample=True,
                temperature=self.temperature,
                max_new_tokens=100,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            logger.info("✅ Fallback model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load fallback model: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None and self.tokenizer is not None
    
    @lru_cache(maxsize=100)
    def _get_cached_response(self, message_hash: str, context_hash: str) -> Optional[Dict]:
        """Get cached response if available"""
        cache_key = f"{message_hash}_{context_hash}"
        return self.response_cache.get(cache_key)
    
    def _cache_response(self, message_hash: str, context_hash: str, response: Dict):
        """Cache response for future use"""
        cache_key = f"{message_hash}_{context_hash}"
        self.response_cache[cache_key] = response
        # Keep cache size manageable
        if len(self.response_cache) > 200:
            # Remove oldest entries
            keys_to_remove = list(self.response_cache.keys())[:50]
            for key in keys_to_remove:
                del self.response_cache[key]

    async def generate_response(
        self, 
        message: str, 
        context: List[Dict], 
        session_id: str
    ) -> Dict:
        """Generate response using the LLM with caching and optimizations"""
        try:
            # Create hashes for caching
            message_hash = str(hash(message.lower().strip()))
            context_hash = str(hash(str(sorted([item.get('content', '') for item in context]))))
            
            # Check cache first
            cached_response = self._get_cached_response(message_hash, context_hash)
            if cached_response:
                logger.info("Returning cached response")
                return cached_response
            
            # Use rule-based responses for common queries (fastest)
            rule_based_response = self._get_rule_based_response(message, context)
            if rule_based_response:
                self._cache_response(message_hash, context_hash, rule_based_response)
                return rule_based_response
            
            # If model is loaded, use it for complex queries
            if self.is_loaded():
                # Build prompt with context
                prompt = self._build_prompt(message, context)
                
                # Generate response with timeout
                response = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, 
                        lambda: self.pipeline(
                            prompt,
                            max_new_tokens=60,  # Further reduced for speed
                            num_return_sequences=1,
                            temperature=self.temperature,
                            do_sample=True,
                            top_p=0.9,
                            repetition_penalty=1.1
                        )
                    ),
                    timeout=5.0  # 5 second timeout for generation
                )
                
                generated_text = response[0]["generated_text"].strip()
                
                # Post-process response
                processed_response = self._post_process_response(generated_text, message)
                
                # Calculate confidence (simple heuristic)
                confidence = self._calculate_confidence(processed_response, context)
                
                # Extract sources
                sources = [item.get("source", "") for item in context if item.get("source")]
                
                result = {
                    "response": processed_response,
                    "confidence": confidence,
                    "sources": sources[:3]  # Limit to top 3 sources
                }
                
                # Cache the result
                self._cache_response(message_hash, context_hash, result)
                return result
            else:
                # Fallback to rule-based response
                fallback = self._get_fallback_response(message)
                self._cache_response(message_hash, context_hash, fallback)
                return fallback
            
        except asyncio.TimeoutError:
            logger.warning("Model generation timed out, using fallback")
            fallback = self._get_fallback_response(message)
            return fallback
        except Exception as e:
            logger.error(f"Response generation error: {e}")
            return self._get_fallback_response(message)
    
    def _build_prompt(self, message: str, context: List[Dict]) -> str:
        """Build prompt with context"""
        # System prompt
        system_prompt = """You are an AI assistant for a professional portfolio website. 
You help visitors learn about the portfolio owner's skills, experience, and projects.
Be helpful, professional, and concise. Base your answers on the provided context.
If you don't have specific information, acknowledge it and suggest where to find more details.

Context information:"""
        
        # Add context
        context_text = ""
        for item in context[:3]:  # Limit context to prevent token overflow
            context_text += f"\n- {item.get('content', '')}"
        
        # Build full prompt
        prompt = f"{system_prompt}{context_text}\n\nUser: {message}\nAssistant:"
        
        return prompt
    
    def _post_process_response(self, response: str, original_message: str) -> str:
        """Post-process the generated response"""
        # Remove any unwanted prefixes/suffixes
        response = response.strip()
        
        # Remove common artifacts
        artifacts = ["User:", "Assistant:", "Human:", "AI:"]
        for artifact in artifacts:
            if response.startswith(artifact):
                response = response[len(artifact):].strip()
        
        # Ensure response is not too long
        if len(response) > 500:
            sentences = response.split('. ')
            response = '. '.join(sentences[:3]) + '.'
        
        # Ensure response ends properly
        if not response.endswith(('.', '!', '?')):
            response += '.'
        
        return response
    
    def _calculate_confidence(self, response: str, context: List[Dict]) -> float:
        """Calculate confidence score for the response"""
        base_confidence = 0.7
        
        # Increase confidence if response uses context
        if context:
            context_words = set()
            for item in context:
                context_words.update(item.get('content', '').lower().split())
            
            response_words = set(response.lower().split())
            overlap = len(context_words.intersection(response_words))
            
            if overlap > 0:
                base_confidence += min(0.2, overlap * 0.05)
        
        # Decrease confidence for very short responses
        if len(response) < 50:
            base_confidence -= 0.1
        
        # Ensure confidence is between 0 and 1
        return max(0.0, min(1.0, base_confidence))
    
    def _get_rule_based_response(self, message: str, context: List[Dict]) -> Optional[Dict]:
        """Get rule-based response for common queries (fastest response)"""
        message_lower = message.lower().strip()
        
        # Enhanced rule-based responses with context integration
        if any(word in message_lower for word in ['skill', 'technology', 'tech', 'programming', 'language']):
            context_skills = [item for item in context if item.get('type') == 'skills']
            if context_skills:
                skills_content = context_skills[0].get('content', '')
                return {
                    "response": f"Based on the portfolio, {skills_content}. You can find more detailed information in the Skills section.",
                    "confidence": 0.85,
                    "sources": ["Skills Section"]
                }
            return {
                "response": "Suyash has experience in full-stack development with React, Node.js, Python, MongoDB, and AI/ML technologies. Check the Skills section for comprehensive details.",
                "confidence": 0.8,
                "sources": ["Skills Section"]
            }
        
        if any(word in message_lower for word in ['project', 'work', 'built', 'developed', 'created']):
            context_projects = [item for item in context if item.get('type') == 'project']
            if context_projects:
                project_info = context_projects[0].get('content', '')[:200] + "..."
                return {
                    "response": f"Here's one of the notable projects: {project_info} You can explore all projects in the Projects section.",
                    "confidence": 0.85,
                    "sources": ["Projects Section"]
                }
            return {
                "response": "Suyash has worked on various projects including web applications, AI systems, and data analysis tools. Visit the Projects section to see detailed case studies.",
                "confidence": 0.8,
                "sources": ["Projects Section"]
            }
        
        if any(word in message_lower for word in ['experience', 'job', 'work', 'career', 'professional']):
            context_exp = [item for item in context if item.get('type') == 'experience']
            if context_exp:
                exp_info = context_exp[0].get('content', '')[:200] + "..."
                return {
                    "response": f"Professional experience includes: {exp_info} Check the Resume section for complete work history.",
                    "confidence": 0.85,
                    "sources": ["Resume Section"]
                }
            return {
                "response": "Suyash has professional experience in software development, AI/ML, and full-stack technologies. The Resume section contains detailed work history.",
                "confidence": 0.8,
                "sources": ["Resume Section"]
            }
        
        if any(word in message_lower for word in ['contact', 'reach', 'email', 'connect', 'hire']):
            return {
                "response": "You can contact Suyash through the Contact section of this portfolio. He's always open to discussing new opportunities and collaborations.",
                "confidence": 0.9,
                "sources": ["Contact Section"]
            }
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greet']):
            return {
                "response": "Hello! I'm Suyash's AI assistant. I can help you learn about his skills, projects, and experience. What would you like to know?",
                "confidence": 0.9,
                "sources": []
            }
        
        if any(word in message_lower for word in ['ai', 'artificial intelligence', 'machine learning', 'ml', 'data science']):
            return {
                "response": "Suyash has extensive experience with AI/ML technologies including Python, TensorFlow, PyTorch, and data analysis. He's worked on various AI projects and implementations.",
                "confidence": 0.85,
                "sources": ["Skills Section", "Projects Section"]
            }
        
        # Return None if no rule matches (will use model or fallback)
        return None

    def _get_fallback_response(self, message: str) -> Dict:
        """Get fallback response when model fails"""
        fallback_responses = {
            "skills": "I have experience in full-stack development, AI/ML, and various programming languages. Please check the Skills section for detailed information.",
            "projects": "I've worked on various interesting projects. You can find detailed information in the Projects section of this portfolio.",
            "experience": "I have professional experience in software development. Please check the Resume section for my complete work history.",
            "contact": "You can reach out through the Contact section of this portfolio.",
            "default": "I'm here to help you learn about this portfolio. Please explore the different sections or ask specific questions about skills, projects, or experience."
        }
        
        message_lower = message.lower()
        response_key = "default"
        
        for key in fallback_responses:
            if key in message_lower:
                response_key = key
                break
        
        return {
            "response": fallback_responses[response_key],
            "confidence": 0.6,
            "sources": []
        }
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "max_length": self.max_length,
            "temperature": self.temperature,
            "loaded": self.is_loaded()
        }
