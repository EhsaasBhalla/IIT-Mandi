import React from 'react';
import './TKPViewer.css';

const TKPViewer = () => {
  return (
    <div className="tkp-viewer">
      <h3>Target Knowledge Profile</h3>
      <p className="tkp-desc">Interactive visualization of course concepts and relationships.</p>
      
      <div className="graph-placeholder">
        <div className="node node-center">AI Agents</div>
        <div className="node node-1">Machine Learning</div>
        <div className="node node-2">NLP</div>
        <div className="node node-3">Planning</div>
        <svg className="edges">
          <line x1="50%" y1="50%" x2="20%" y2="20%" />
          <line x1="50%" y1="50%" x2="80%" y2="30%" />
          <line x1="50%" y1="50%" x2="50%" y2="80%" />
        </svg>
      </div>
    </div>
  );
};

export default TKPViewer;
