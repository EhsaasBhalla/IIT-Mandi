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
        self.api_key = custom_key
        
        # Determine available providers based on keys
        self.available_providers = []
        if Config.GEMINI_API_KEY or (provider == 'gemini' and custom_key):
            self.available_providers.append('gemini')
        if Config.GROQ_API_KEY or (provider == 'groq' and custom_key):
            self.available_providers.append('groq')
        if Config.OPENAI_API_KEY or (provider == 'openai' and custom_key):
            self.available_providers.append('openai')
        if Config.HUGGINGFACE_API_KEY or (provider == 'huggingface' and custom_key):
            self.available_providers.append('huggingface')
            
        # Default fallback order if auto
        default_order = ['groq', 'gemini', 'openai', 'huggingface']
        
        # Determine primary provider
        if provider and provider in self.available_providers:
            self.primary_provider = provider
        elif provider and provider != 'auto':
            # Provider requested but no key, try anyway (might be in env)
            self.primary_provider = provider
            self.available_providers.insert(0, provider)
        elif self.available_providers:
            # Auto-select best available
            for p in default_order:
                if p in self.available_providers:
                    self.primary_provider = p
                    break
        else:
            # Fallback to config default
            self.primary_provider = Config.LLM_PROVIDER

        # Reorder available providers to start with primary
        if self.primary_provider in self.available_providers:
            self.available_providers.remove(self.primary_provider)
        self.available_providers.insert(0, self.primary_provider)

    def _setup_client_for_provider(self, provider: str):
        if provider == 'gemini':
            os.environ["GEMINI_API_KEY"] = self.api_key if self.primary_provider == 'gemini' and self.api_key else (Config.GEMINI_API_KEY or "")
            return instructor.from_litellm(litellm.completion), "gemini/gemini-2.0-flash", "gemini/gemini-2.0-flash-lite"
        elif provider == 'groq':
            groq_key = self.api_key if self.primary_provider == 'groq' and self.api_key else (Config.GROQ_API_KEY or "")
            os.environ["GROQ_API_KEY"] = groq_key
            groq_client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
            # Use MD_JSON instead of JSON to bypass Groq's strict server-side JSON validation which aborts with 400 errors
            return instructor.from_openai(groq_client, mode=instructor.Mode.MD_JSON), "llama-3.1-8b-instant", "llama-3.3-70b-versatile"
        elif provider == 'openai':
            os.environ["OPENAI_API_KEY"] = self.api_key if self.primary_provider == 'openai' and self.api_key else (Config.OPENAI_API_KEY or "")
            return instructor.from_litellm(litellm.completion), "gpt-4o-mini", None
        elif provider == 'huggingface':
            hf_key = self.api_key if self.primary_provider == 'huggingface' and self.api_key else (Config.HUGGINGFACE_API_KEY or "")
            hf_client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=hf_key)
            return instructor.from_openai(hf_client, mode=instructor.Mode.JSON), "deepseek-ai/DeepSeek-V4-Pro:novita", None
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    def generate_structured(
        self, 
        prompt: str, 
        response_model: Type[T], 
        system_prompt: str = "You are an expert educational AI assistant. Provide comprehensive, detailed, and pedagogically sound responses.",
        temperature: float = 0.3,
        language: str = "English"
    ) -> T:
        """
        Generates a structured Pydantic model response from the LLM, with cross-provider fallback.
        """
        if language and language.lower() != "english":
            system_prompt += f"\n\nCRITICAL: Generate ALL output exclusively in {language}. Localize educational terminology."

        system_prompt += "\n\nIMPORTANT: Provide DETAILED, COMPREHENSIVE responses. Each field should contain substantial, useful content — not placeholder text. For teacher scripts, write full multi-paragraph lecture guides. For questions, write complete questions with thorough explanations. For activities, include full step-by-step instructions."

        last_error = None

        # Try each available provider in order (primary first, then fallbacks)
        for current_provider in self.available_providers:
            logger.info(f"Attempting generation with provider: {current_provider}")
            
            try:
                client, model_name, fallback_model = self._setup_client_for_provider(current_provider)
            except Exception as e:
                logger.error(f"Setup error for {current_provider}: {e}")
                continue

            if current_provider == 'groq':
                max_prompt_chars, max_tokens_val, pace_seconds = 6000, 2500, 30
            elif current_provider == 'gemini':
                max_prompt_chars, max_tokens_val, pace_seconds = 30000, 8192, 5
            elif current_provider == 'openai':
                max_prompt_chars, max_tokens_val, pace_seconds = 30000, 16000, 30
            elif current_provider == 'huggingface':
                max_prompt_chars, max_tokens_val, pace_seconds = 20000, 4096, 2
            else:
                max_prompt_chars, max_tokens_val, pace_seconds = 15000, 4096, 1

            time.sleep(pace_seconds)

            current_prompt = prompt
            if len(current_prompt) > max_prompt_chars:
                current_prompt = current_prompt[:max_prompt_chars] + "\n\n[Content truncated for processing efficiency. Focus on the material above.]"
                logger.info(f"Prompt truncated to {max_prompt_chars} chars for {current_provider}")

            kwargs = {
                "model": model_name,
                "response_model": response_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": current_prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens_val
            }

            models_to_try = [model_name]
            if fallback_model and fallback_model != model_name:
                models_to_try.append(fallback_model)
            
            provider_success = False
            for model in models_to_try:
                kwargs["model"] = model
                for attempt in range(3):
                    try:
                        response = client.chat.completions.create(**kwargs)
                        return response
                    except Exception as e:
                        last_error = e
                        error_str = str(e)
                        is_rate_limit = any(k in error_str.lower() for k in ["429", "413", "rate_limit", "resource_exhausted", "tokens per minute", "tpm"])
                        
                        if is_rate_limit:
                            if "413" in error_str or ("requested" in error_str.lower() and "limit" in error_str.lower()):
                                logger.warning(f"Hard TPM limit exceeded on {model} (Payload too large). Skipping retries.")
                                break # Do not retry 413s, it will never fit. Break to fallback.
                                
                            wait = 30 * (attempt + 1)
                            logger.warning(f"{model} rate limit (attempt {attempt+1}/3). Waiting {wait}s...")
                            time.sleep(wait)
                        else:
                            logger.error(f"{model} error: {error_str[:200]}")
                            break # Break retry loop, try next model for this provider
                
                if provider_success:
                    break
                if fallback_model and model != fallback_model:
                    logger.warning(f"Switching to intra-provider fallback: {fallback_model}")
                    time.sleep(5)
            
            # If we reach here and provider_success is False, it means this provider failed completely.
            # The outer loop will continue to the next provider.
            logger.warning(f"Provider {current_provider} exhausted. Moving to next provider...")

        raise Exception(f"All available LLM providers failed. Last error: {last_error}")
