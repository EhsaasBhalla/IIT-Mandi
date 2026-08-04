import React from 'react';
import './ABTestView.css';

const ABTestView = () => {
  return (
    <div className="ab-test-view">
      <h3>Assessment Variations</h3>
      <p className="ab-desc">Compare generated variants (Standard vs Complex)</p>
      
      <div className="variants-grid">
        <div className="variant-card">
          <div className="variant-header">
            <h4>Variant A: Standard</h4>
            <span className="badge">Baseline</span>
          </div>
          <div className="question-list">
            <div className="q-item">
              <strong>Q1.</strong> What is an AI agent?
            </div>
            <div className="q-item">
              <strong>Q2.</strong> Define Machine Learning.
            </div>
          </div>
          <button className="btn btn-primary w-full mt-auto">Select Variant</button>
        </div>
        
        <div className="variant-card">
          <div className="variant-header">
            <h4>Variant B: Complex</h4>
            <span className="badge new">Modified</span>
          </div>
          <div className="question-list">
            <div className="q-item">
              <strong>Q1.</strong> Compare and contrast reactive and deliberative AI agents.
            </div>
            <div className="q-item">
              <strong>Q2.</strong> How does ML differ from traditional algorithmic approaches?
            </div>
          </div>
          <button className="btn btn-primary w-full mt-auto">Select Variant</button>
        </div>
      </div>
    </div>
  );
};

export default ABTestView;
