import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Loader, AlertTriangle, ArrowRight } from 'lucide-react';
import './HistoryPage.css';

const HistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    if (job.status === 'completed') {
      navigate(`/results/${job.id}`);
    } else {
      navigate(`/progress/${job.id}`);
    }
  };

  if (loading) {
    return (
      <div className="history-container loading-container">
        <Loader className="spinner" size={32} />
        <p>Loading History...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1 className="history-title">Job History</h1>
      <p className="history-subtitle">View and access your previously generated Teacher Knowledge Packages.</p>
      
      {jobs.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>No jobs found in history.</p>
          <button className="nav-btn primary" onClick={() => navigate('/')}>Create New Job</button>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card" onClick={() => handleJobClick(job)}>
              <div className="job-card-header">
                <span className="job-id">Job ID: {job.id.substring(0, 8)}...</span>
                <span className="job-date">
                  <Clock size={14} /> 
                  {new Date(job.created_at * 1000).toLocaleString()}
                </span>
              </div>
              <div className="job-card-body">
                <div className="job-details">
                  <div className="job-language">
                    Language: <strong>{job.language}</strong>
                  </div>
                  <div className={`job-status ${job.status}`}>
                    {job.status === 'completed' ? <CheckCircle size={16} /> : 
                     job.status === 'error' ? <AlertTriangle size={16} /> : 
                     <Loader size={16} className="spin" />}
                    <span>{job.status.charAt(0).toUpperCase() + job.status.slice(1)} ({job.progress}%)</span>
                  </div>
                </div>
                <div className="job-stage">{job.stage}</div>
              </div>
              <div className="job-card-footer">
                <span>View Details</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
