from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize app components (creates storage directories)
    config_class.init_app(app)
    
    # Register API blueprint (all routes in api/routes.py)
    from .api.routes import api_bp
    app.register_blueprint(api_bp)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "version": "1.0.0"})

    return app
