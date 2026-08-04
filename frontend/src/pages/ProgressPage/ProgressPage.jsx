import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StageProgress from '../../components/StageProgress/StageProgress';
import './ProgressPage.css';
import { API_BASE_URL } from '../../config';

const ProgressPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [progressPercent, setProgressPercent] = useState(5);
  const [stageText, setStageText] = useState('Stage 1: Parsing Document');

  // Poll real progress
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
        const data = await response.json();
        
        if (response.ok) {
            const rawStage = (data.stage || "").toLowerCase();
            let stageIndex = 1;
            
            if (rawStage.includes('stage 2') || rawStage.includes('classif')) stageIndex = 2;
            else if (rawStage.includes('stage 3') || rawStage.includes('knowledge')) stageIndex = 3;
            else if (rawStage.includes('stage 4') || rawStage.includes('lesson') || rawStage.includes('plan')) stageIndex = 4;
            else if (rawStage.includes('stage 5') || rawStage.includes('content')) stageIndex = 5;
            else if (rawStage.includes('stage 6') || rawStage.includes('activit')) stageIndex = 6;
            else if (rawStage.includes('stage 7') || rawStage.includes('assess')) stageIndex = 7;
            else if (rawStage.includes('stage 8') || rawStage.includes('gap')) stageIndex = 8;
            else if (rawStage.includes('stage 9') || rawStage.includes('validat')) stageIndex = 9;
            else if (rawStage.includes('stage 10') || rawStage.includes('publish') || rawStage.includes('packag')) stageIndex = 10;
            else if (data.status === 'completed') stageIndex = 11;
            
            setCurrentStage(stageIndex);
            if (data.progress !== undefined) setProgressPercent(data.progress);
            if (data.stage) setStageText(data.stage);
            
            if (data.status === "completed") {
                clearInterval(timer);
                setTimeout(() => {
                    navigate(`/results/${jobId}`);
                }, 800);
            } else if (data.status === "error") {
                clearInterval(timer);
                alert("Error processing document: " + (data.error || "Unknown pipeline error"));
            }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [jobId, navigate]);

  return (
    <div className="progress-page animate-fade-in">
      <div className="progress-header">
        <h2>Synthesizing Curriculum Package...</h2>
        <p className="subtitle">Job ID: <code>{jobId}</code></p>
      </div>
      
      <div className="progress-container glass-panel">
        <StageProgress 
          currentStage={currentStage} 
          progressPercent={progressPercent}
          currentStageText={stageText}
        />
      </div>
    </div>
  );
};

export default ProgressPage;
