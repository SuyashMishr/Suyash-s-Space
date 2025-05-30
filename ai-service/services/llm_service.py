import os
import logging
from typing import Dict, List, Optional
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    pipeline,
    BitsAndBytesConfig
)

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.model_name = os.getenv("MODEL_NAME", "microsoft/DialoGPT-medium")
        self.max_length = int(os.getenv("MAX_LENGTH", "512"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    async def load_model(self):
        """Load the LLM model"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            
            # Configure quantization for memory efficiency
            quantization_config = None
            if self.device == "cuda":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16
                )
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                padding_side="left"
            )
            
            # Add pad token if it doesn't exist
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=quantization_config,
                device_map="auto" if self.device == "cuda" else None,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                low_cpu_mem_usage=True
            )
            
            # Create pipeline
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device == "cuda" else -1,
                return_full_text=False,
                do_sample=True,
                temperature=self.temperature,
                max_new_tokens=150,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            logger.info(f"✅ Model loaded successfully on {self.device}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            # Fallback to a smaller model
            await self._load_fallback_model()
    
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
    
    async def generate_response(
        self, 
        message: str, 
        context: List[Dict], 
        session_id: str
    ) -> Dict:
        """Generate response using the LLM"""
        try:
            if not self.is_loaded():
                raise Exception("Model not loaded")
            
            # Build prompt with context
            prompt = self._build_prompt(message, context)
            
            # Generate response
            response = self.pipeline(
                prompt,
                max_new_tokens=150,
                num_return_sequences=1,
                temperature=self.temperature,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1
            )
            
            generated_text = response[0]["generated_text"].strip()
            
            # Post-process response
            processed_response = self._post_process_response(generated_text, message)
            
            # Calculate confidence (simple heuristic)
            confidence = self._calculate_confidence(processed_response, context)
            
            # Extract sources
            sources = [item.get("source", "") for item in context if item.get("source")]
            
            return {
                "response": processed_response,
                "confidence": confidence,
                "sources": sources[:3]  # Limit to top 3 sources
            }
            
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
            "confidence": 0.5,
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
