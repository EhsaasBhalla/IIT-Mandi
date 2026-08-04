import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StageProgress from '../../components/StageProgress/StageProgress';
import './ProgressPage.css';
import { API_BASE_URL } from '../../config';

const ProgressPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);

  // Poll real progress
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
        const data = await response.json();
        
        if (response.ok) {
            // Map backend stage strings to integer for UI component
            let stageIndex = 0;
            if (data.stage === "Knowledge Extraction") stageIndex = 1;
            else if (data.stage === "Lesson Planning") stageIndex = 2;
            else if (data.stage === "Content Generation") stageIndex = 3;
            else if (data.stage === "Activity Design") stageIndex = 4;
            else if (data.stage === "Assessment Generation (A/B Test)") stageIndex = 5;
            else if (data.stage === "Gap Analysis") stageIndex = 6;
            else if (data.stage === "Validation & Quality Check" || data.stage === "Packaging TKP") stageIndex = 7;
            else if (data.status === "completed") stageIndex = 8;
            
            setCurrentStage(stageIndex);
            
            if (data.status === "completed") {
                clearInterval(timer);
                navigate(`/results/${jobId}`);
            } else if (data.status === "error") {
                clearInterval(timer);
                alert("Error processing document: " + data.error);
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
        <h2>Processing Uploads...</h2>
        <p className="subtitle">Job ID: {jobId}</p>
      </div>
      
      <div className="progress-container glass-panel">
        <StageProgress currentStage={currentStage} />
      </div>
    </div>
  );
};

export default ProgressPage;
