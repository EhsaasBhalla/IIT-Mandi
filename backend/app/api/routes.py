import os
import hashlib
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from ..orchestrator.job_manager import job_manager
from ..config import Config

api_bp = Blueprint('api', __name__, url_prefix='/api')

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.CACHE_FOLDER, exist_ok=True)

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    # Handle primary file
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    filename = secure_filename(file.filename)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Calculate hash of the file for caching
    with open(file_path, 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    # Handle reference file (optional)
    ref_path = None
    if 'reference_file' in request.files:
        ref_file = request.files['reference_file']
        if ref_file.filename != '':
            ref_filename = secure_filename(ref_file.filename)
            ref_path = os.path.join(Config.UPLOAD_FOLDER, f"ref_{ref_filename}")
            ref_file.save(ref_path)

    # Parse language preference
    language = request.form.get('language', 'English')

    # Start the async job with both paths and the hash
    job_id = job_manager.start_job(file_path, ref_path, language, file_hash)
    return jsonify({"job_id": job_id, "status": "processing"}), 202

@api_bp.route('/jobs', methods=['GET'])
def get_jobs():
    return jsonify(job_manager.get_all_jobs()), 200

@api_bp.route('/status/<job_id>', methods=['GET'])
def get_status(job_id):
    status_data = job_manager.get_job_status(job_id)
    if status_data.get("status") == "not_found":
        return jsonify({"error": "Job not found"}), 404
    return jsonify(status_data), 200

@api_bp.route('/result/<job_id>', methods=['GET'])
def get_result(job_id):
    status_data = job_manager.get_job_status(job_id)
    if status_data.get("status") == "completed":
        return jsonify({"result": status_data.get("result")}), 200
    return jsonify({"error": "Job not completed or not found"}), 400
