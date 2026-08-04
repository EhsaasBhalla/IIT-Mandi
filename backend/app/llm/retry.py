import time
import functools
import logging
import random
import litellm

logger = logging.getLogger(__name__)

def with_retry(max_retries=10, base_delay=10.0, max_delay=120.0):
    """
    Decorator for exponential backoff on LLM API calls.
    Handles rate limits (429) and transient server errors (500+).
    Uses aggressive delays to respect Gemini free tier limits.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            delay = base_delay
            
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    error_str = str(e)
                    is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or isinstance(e, litellm.exceptions.RateLimitError)
                    is_server_error = "500" in error_str or "503" in error_str or isinstance(e, litellm.exceptions.APIError)
                    
                    if (is_rate_limit or is_server_error) and retries < max_retries:
                        # Extract retryDelay from error if available
                        retry_after = delay
                        if "retryDelay" in error_str:
                            try:
                                import re
                                match = re.search(r"retryDelay.*?'(\d+)s'", error_str)
                                if match:
                                    retry_after = max(int(match.group(1)), delay)
                            except Exception:
                                pass
                        
                        jitter = random.uniform(1.0, 5.0)
                        wait_time = retry_after + jitter
                        logger.warning(f"API rate limit hit (attempt {retries + 1}/{max_retries}). Waiting {wait_time:.0f}s...")
                        time.sleep(wait_time)
                        retries += 1
                        delay = min(delay * 2, max_delay)
                    else:
                        logger.error(f"LLM API failed after {retries} retries: {error_str[:200]}")
                        raise e
        return wrapper
    return decorator
