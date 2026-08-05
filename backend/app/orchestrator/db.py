from pymongo import MongoClient
from pymongo.server_api import ServerApi
from ..config import Config
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.jobs_collection = None
        
        uri = Config.MONGODB_URI
        if uri:
            try:
                self.client = MongoClient(uri, server_api=ServerApi('1'))
                self.db = self.client.get_database("teacher_ai")
                self.jobs_collection = self.db.get_collection("jobs")
                
                # Send a ping to confirm a successful connection
                self.client.admin.command('ping')
                logger.info("Pinged your deployment. You successfully connected to MongoDB!")
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
        else:
            logger.warning("MONGODB_URI is not set. Caching will fail.")
            
    def get_jobs_collection(self):
        return self.jobs_collection

# Singleton instance
db_manager = DatabaseManager()
