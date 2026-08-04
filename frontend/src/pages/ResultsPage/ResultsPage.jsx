import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TKPViewer from '../../components/TKPViewer/TKPViewer';
import ABTestView from '../../components/ABTestView/ABTestView';
import './ResultsPage.css';

const ResultsPage = () => {
  const { jobId } = useParams();
  const [activeTab, setActiveTab] = useState('tkp');

  return (
    <div className="results-page animate-fade-in">
      <div className="results-header">
        <h2>Job Results</h2>
        <p className="subtitle">Review the generated knowledge graph and tests</p>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'tkp' ? 'active' : ''}`}
          onClick={() => setActiveTab('tkp')}
        >
          Knowledge Graph (TKP)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'abtest' ? 'active' : ''}`}
          onClick={() => setActiveTab('abtest')}
        >
          A/B Test View
        </button>
      </div>

      <div className="tab-content glass-panel">
        {activeTab === 'tkp' ? <TKPViewer /> : <ABTestView />}
      </div>
    </div>
  );
};

export default ResultsPage;
