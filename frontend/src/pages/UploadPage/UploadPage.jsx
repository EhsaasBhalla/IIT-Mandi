import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../../components/UploadZone/UploadZone';
import { FileUp, FileText, Activity } from 'lucide-react';
import './UploadPage.css';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

const UploadPage = () => {
  const [primaryFile, setPrimaryFile] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [docType, setDocType] = useState('unknown');
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!primaryFile) {
      toast.error('Please upload a primary document (e.g. PDF).');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', primaryFile);
    if (referenceFile) {
      formData.append('reference_file', referenceFile);
    }
    
    formData.append('language', language);
    formData.append('doc_type', docType);

    try {
      toast.loading('Analyzing document and initializing AI models...', { id: 'upload' });
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Document processed! Generating curriculum...', { id: 'upload' });
        navigate(`/progress/${data.job_id}`);
      } else {
        toast.error(`Error: ${data.error}`, { id: 'upload' });
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect to backend server.', { id: 'upload' });
      setLoading(false);
    }
  };

  return (
    <div className="upload-page animate-fade-in">
      <div className="upload-header">
        <h1>Generate Teacher Knowledge Package</h1>
        <p className="subtitle">Upload a textbook chapter, syllabus, or research paper to autonomously generate a full 10-stage lesson plan.</p>
      </div>
      
      <div className="upload-container">
        
        <div className="config-panel">
          <div className="config-group">
            <label><FileText size={16} /> Document Profile</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="unknown">Auto-detect</option>
              <option value="text">Mostly Text</option>
              <option value="tables">Text with Tables</option>
              <option value="diagrams">Text with Diagrams / Figures</option>
              <option value="equations">Text with Equations</option>
            </select>
          </div>
          
          <div className="config-group">
            <label><Activity size={16} /> Target Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Mandarin">Mandarin</option>
            </select>
          </div>
        </div>

        <div className="upload-zones">
          <div className="zone-wrapper">
            <h3>Source Document</h3>
            <UploadZone onFileSelect={setPrimaryFile} selectedFile={primaryFile} />
          </div>
        </div>

        <button 
          className={`generate-btn ${loading || !primaryFile ? 'disabled' : ''}`}
          onClick={handleUpload}
          disabled={loading || !primaryFile}
        >
          <FileUp size={20} />
          {loading ? 'Initializing AI Pipeline...' : 'Generate Curriculum'}
        </button>

      </div>
    </div>
  );
};

export default UploadPage;
