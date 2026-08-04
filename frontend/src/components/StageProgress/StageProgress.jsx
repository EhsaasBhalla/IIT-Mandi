import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import './StageProgress.css';

const stages = [
  { id: 0, title: 'Document Parsing', desc: 'Extracting text and structure' },
  { id: 1, title: 'Knowledge Extraction', desc: 'Mapping concepts and objectives' },
  { id: 2, title: 'Lesson Planning', desc: 'Building multi-period plan' },
  { id: 3, title: 'Content Generation', desc: 'Generating scripts and tickets' },
  { id: 4, title: 'Activity Design', desc: 'Designing interactive tasks' },
  { id: 5, title: 'Assessment (A/B Test)', desc: 'Creating dual assessment variants' },
  { id: 6, title: 'Gap Analysis', desc: 'Identifying misconceptions' },
  { id: 7, title: 'Validation & Packaging', desc: 'Quality check and TKP build' },
];

const StageProgress = ({ currentStage }) => {
  return (
    <div className="stage-list">
      {stages.map((stage) => {
        const isCompleted = currentStage > stage.id;
        const isActive = currentStage === stage.id;
        const isPending = currentStage < stage.id;
        
        return (
          <div key={stage.id} className={`stage-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="stage-icon-container">
              {isCompleted ? (
                <CheckCircle className="stage-icon completed-icon" size={28} />
              ) : isActive ? (
                <Loader className="stage-icon active-icon spin" size={28} />
              ) : (
                <Circle className="stage-icon pending-icon" size={28} />
              )}
              {stage.id < stages.length - 1 && <div className="connector-line"></div>}
            </div>
            
            <div className="stage-content">
              <h4>{stage.title}</h4>
              <p>{stage.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StageProgress;
