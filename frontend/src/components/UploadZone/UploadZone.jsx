import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import './UploadZone.css';

const UploadZone = ({ onFileSelect, selectedFile, onReferenceSelect, referenceFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (onFileSelect) onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      if (onFileSelect) onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="upload-zone-wrapper glass-panel">
      <div className="upload-section">
        <div 
          className={`drop-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud size={48} className="upload-icon" />
          <p>
            {selectedFile ? selectedFile.name : (
              <>Drag & drop or <span>browse</span></>
            )}
          </p>
          <input type="file" onChange={handleChange} className="file-input" />
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
