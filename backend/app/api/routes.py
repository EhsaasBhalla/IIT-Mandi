import os
import hashlib
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from ..config import Config
from ..orchestrator.job_manager import job_manager

api_bp = Blueprint('api', __name__, url_prefix='/api')

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.CACHE_FOLDER, exist_ok=True)
os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)

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


def _generate_if_missing(job_id):
    """On-demand generate all export formats if they don't exist."""
    status_data = job_manager.get_job_status(job_id)
    if status_data.get("status") == "completed" and status_data.get("result"):
        from ..stages.s10_publishing import PublishingStage
        s10 = PublishingStage(job_id)
        s10.execute(status_data.get("result"))
        return True
    return False


@api_bp.route('/download/<job_id>/pdf', methods=['GET'])
def download_pdf(job_id):
    pdf_path = os.path.join(Config.OUTPUT_FOLDER, f"TKP_{job_id}.pdf")
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=True, download_name=f"Teacher_Knowledge_Package_{job_id[:8]}.pdf")
    
    if _generate_if_missing(job_id):
        if os.path.exists(pdf_path):
            return send_file(pdf_path, as_attachment=True, download_name=f"Teacher_Knowledge_Package_{job_id[:8]}.pdf")
            
    return jsonify({"error": "PDF not ready or job incomplete"}), 404


@api_bp.route('/download/<job_id>/docx', methods=['GET'])
def download_docx(job_id):
    docx_path = os.path.join(Config.OUTPUT_FOLDER, f"TKP_{job_id}.docx")
    if os.path.exists(docx_path):
        return send_file(docx_path, as_attachment=True, download_name=f"Teacher_Guide_{job_id[:8]}.docx")
    
    if _generate_if_missing(job_id):
        if os.path.exists(docx_path):
            return send_file(docx_path, as_attachment=True, download_name=f"Teacher_Guide_{job_id[:8]}.docx")
            
    return jsonify({"error": "DOCX not ready or job incomplete"}), 404


@api_bp.route('/download/<job_id>/pptx', methods=['GET'])
def download_pptx(job_id):
    pptx_path = os.path.join(Config.OUTPUT_FOLDER, f"TKP_{job_id}.pptx")
    if os.path.exists(pptx_path):
        return send_file(pptx_path, as_attachment=True, download_name=f"Teacher_Presentation_{job_id[:8]}.pptx")
    
    if _generate_if_missing(job_id):
        if os.path.exists(pptx_path):
            return send_file(pptx_path, as_attachment=True, download_name=f"Teacher_Presentation_{job_id[:8]}.pptx")
            
    return jsonify({"error": "PPTX not ready or job incomplete"}), 404


@api_bp.route('/download/<job_id>/json', methods=['GET'])
def download_json(job_id):
    json_path = os.path.join(Config.OUTPUT_FOLDER, f"TKP_{job_id}.json")
    if os.path.exists(json_path):
        return send_file(json_path, as_attachment=True, download_name=f"TeacherKnowledgePackage_{job_id[:8]}.json")
    
    if _generate_if_missing(job_id):
        if os.path.exists(json_path):
            return send_file(json_path, as_attachment=True, download_name=f"TeacherKnowledgePackage_{job_id[:8]}.json")
            
    return jsonify({"error": "JSON not ready or job incomplete"}), 404
