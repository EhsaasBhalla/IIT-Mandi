import litellm
import instructor
import time
import os
import logging
from typing import Type, TypeVar, Any
from openai import OpenAI
from pydantic import BaseModel
from ..config import Config

T = TypeVar('T', bound=BaseModel)
logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self, provider=None, custom_key=None):
        self.provider = provider or Config.LLM_PROVIDER
        self.api_key = custom_key
        
        if self.provider == 'gemini':
            os.environ["GEMINI_API_KEY"] = Config.GEMINI_API_KEY or ""
            self.model_name = "gemini/gemini-2.0-flash"
            self.fallback_model = "gemini/gemini-2.0-flash-lite"
            self.client = instructor.from_litellm(litellm.completion)
        elif self.provider == 'groq':
            groq_key = self.api_key or Config.GROQ_API_KEY or ""
            os.environ["GROQ_API_KEY"] = groq_key
            self.model_name = "llama-3.1-8b-instant"
            self.fallback_model = "llama-3.3-70b-versatile"
            # Use direct OpenAI-compatible Groq client with JSON mode for rock-solid reliability
            groq_client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=groq_key
            )
            self.client = instructor.from_openai(groq_client, mode=instructor.Mode.JSON)
        elif self.provider == 'openai':
            self.model_name = "gpt-4o-mini"
            self.fallback_model = None
            self.client = instructor.from_litellm(litellm.completion)
        elif self.provider == 'huggingface':
            self.model_name = "deepseek-ai/DeepSeek-V4-Pro:novita"
            self.fallback_model = None
            hf_client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=self.api_key or Config.HUGGINGFACE_API_KEY
            )
            self.client = instructor.from_openai(hf_client, mode=instructor.Mode.JSON)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    def generate_structured(
        self, 
        prompt: str, 
        response_model: Type[T], 
        system_prompt: str = "You are an expert educational AI.",
        temperature: float = 0.2,
        language: str = "English"
    ) -> T:
        """
        Generates a structured Pydantic model response from the LLM.
        Built-in: pacing, truncation, fallback, and retry.
        """
        pace = 2 if self.provider == 'groq' else 6
        time.sleep(pace)
        
        # Inject Multilingual Support
        if language and language.lower() != "english":
            system_prompt += f"\n\nCRITICAL INSTRUCTION: You MUST generate all output exclusively in {language}. Ensure educational terminology is accurately localized."

        max_prompt_chars = 6000
        if len(prompt) > max_prompt_chars:
            prompt = prompt[:max_prompt_chars] + "\n\n[Content truncated for processing efficiency]"
            logger.info(f"Prompt truncated to {max_prompt_chars} chars")

        kwargs = {
            "model": self.model_name,
            "response_model": response_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": 4096
        }

        # Try primary model, then fallback, with retries
        models_to_try = [self.model_name]
        if self.fallback_model and self.fallback_model != self.model_name:
            models_to_try.append(self.fallback_model)
        
        last_error = None
        for model in models_to_try:
            kwargs["model"] = model
            for attempt in range(3):
                try:
                    response = self.client.chat.completions.create(**kwargs)
                    return response
                except Exception as e:
                    last_error = e
                    error_str = str(e)
                    is_rate_limit = "429" in error_str or "rate_limit" in error_str or "RESOURCE_EXHAUSTED" in error_str
                    
                    if is_rate_limit:
                        wait = 10 * (attempt + 1)
                        logger.warning(f"{model} rate limited (attempt {attempt+1}/3). Waiting {wait}s...")
                        time.sleep(wait)
                    else:
                        logger.error(f"{model} error: {error_str[:150]}")
                        break
            
            if self.fallback_model and model != self.fallback_model:
                logger.warning(f"Switching to fallback model: {self.fallback_model}")
                time.sleep(3)
        
        raise last_error
