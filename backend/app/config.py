import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(basedir, '.env'), override=True)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-123'
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or os.path.join(os.getcwd(), 'storage', 'uploads')
    OUTPUT_FOLDER = os.environ.get('OUTPUT_FOLDER') or os.path.join(os.getcwd(), 'storage', 'outputs')
    CACHE_FOLDER = os.environ.get('CACHE_FOLDER') or os.path.join(os.getcwd(), 'storage', 'cache')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # LLM Settings
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'huggingface') # 'gemini', 'openai', 'groq', or 'huggingface'
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
    
    # Database Settings
    MONGODB_URI = os.environ.get('MONGODB_URI')
    
    @staticmethod
    def init_app(app):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)
        os.makedirs(Config.CACHE_FOLDER, exist_ok=True)
