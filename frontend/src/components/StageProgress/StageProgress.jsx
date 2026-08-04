import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import './StageProgress.css';

const stages = [
  { id: 1, title: 'Stage 1: Document Intelligence', desc: 'Parsing PDF text and layout structure (PyPDF2)' },
  { id: 2, title: 'Stage 2: Educational Classification', desc: 'Classifying subject, grade level, and curriculum' },
  { id: 3, title: 'Stage 3: Knowledge Extraction', desc: 'Extracting concepts, objectives, formulas & misconceptions' },
  { id: 4, title: 'Stage 4: Lesson Planning', desc: 'Sequencing multi-period lesson plan and timing' },
  { id: 5, title: 'Stage 5: Content Generation', desc: 'Generating teacher scripts, blackboard diagrams & tickets' },
  { id: 6, title: 'Stage 6: Activity Design', desc: 'Designing in-class debates, experiments & exercises' },
  { id: 7, title: 'Stage 7: Assessment Engine', desc: 'Synthesizing A/B testing assessment variants' },
  { id: 8, title: 'Stage 8: Gap Analysis', desc: 'Formulating diagnostic checks and remedial interventions' },
  { id: 9, title: 'Stage 9: Quality Validation', desc: 'Running completeness checks and schema validation' },
  { id: 10, title: 'Stage 10: Publishing & TKP Build', desc: 'Synthesizing master Teacher Knowledge Package' },
];

const StageProgress = ({ currentStage, progressPercent, currentStageText }) => {
  return (
    <div className="stage-progress-wrapper">
      {/* Top Progress Bar */}
      <div className="progress-bar-container" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--primary-color, #38bdf8)' }}>{currentStageText || 'Processing...'}</span>
          <span style={{ color: '#94a3b8' }}>{progressPercent || 5}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent || 5}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>
      </div>

      {/* Stage Items List */}
      <div className="stage-list">
        {stages.map((stage) => {
          const isCompleted = currentStage > stage.id;
          const isActive = currentStage === stage.id;
          
          return (
            <div key={stage.id} className={`stage-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="stage-icon-container">
                {isCompleted ? (
                  <CheckCircle className="stage-icon completed-icon" size={24} style={{ color: '#10b981' }} />
                ) : isActive ? (
                  <Loader className="stage-icon active-icon spin" size={24} style={{ color: '#38bdf8' }} />
                ) : (
                  <Circle className="stage-icon pending-icon" size={24} style={{ color: '#64748b' }} />
                )}
                {stage.id < stages.length && <div className="connector-line"></div>}
              </div>
              
              <div className="stage-content">
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem' }}>{stage.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageProgress;
