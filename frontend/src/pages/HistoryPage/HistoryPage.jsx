import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, Loader, AlertTriangle, ArrowRight, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './HistoryPage.css';

const HistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs list');
      }
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Unable to load history from backend. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobClick = (job) => {
    if (job.status === 'completed') {
      navigate(`/results/${job.id}`);
    } else {
      navigate(`/progress/${job.id}`);
    }
  };

  return (
    <div className="history-container animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="history-title" style={{ margin: 0, fontSize: '1.8rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={28} color="#38bdf8" /> Job History & Archive
          </h1>
          <p className="history-subtitle" style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
            Access all previously synthesized Teacher Knowledge Packages.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
          <Loader className="spin" size={36} color="#38bdf8" style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <p>Loading generated packages...</p>
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="#f87171" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: '#fca5a5', margin: '0.5rem 0' }}>{error}</p>
          <button onClick={fetchJobs} className="btn" style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', border: 'none', marginTop: '0.5rem' }}>
            Retry Connection
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 1rem', background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <FileText size={48} color="#475569" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>No Jobs Found</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 1.5rem 0' }}>You have not generated any Teacher Knowledge Packages yet.</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn"
            style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 600, padding: '0.7rem 1.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            Upload New Document
          </button>
        </div>
      ) : (
        <div className="job-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => {
            const isDone = job.status === 'completed';
            const isErr = job.status === 'error';
            const title = job.subject && job.topic ? `${job.subject} — ${job.topic}` : `Document Job #${job.id.substring(0, 8)}`;
            
            return (
              <div 
                key={job.id} 
                className="job-card" 
                onClick={() => handleJobClick(job)}
                style={{
                  background: '#090d16',
                  padding: '1.2rem 1.5rem',
                  borderRadius: '12px',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                      {title}
                    </h3>
                    {job.target_grade && (
                      <span style={{ fontSize: '0.75rem', background: '#1e293b', color: '#38bdf8', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                        Grade {job.target_grade}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span>Language: <strong style={{ color: '#cbd5e1' }}>{job.language || 'English'}</strong></span>
                    {job.created_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {new Date(job.created_at * 1000).toLocaleString()}
                      </span>
                    )}
                    <span style={{ color: isDone ? '#10b981' : isErr ? '#ef4444' : '#38bdf8', fontWeight: 600 }}>
                      {job.stage || (isDone ? 'Completed (100%)' : 'Processing...')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>{isDone ? 'View Results' : 'View Progress'}</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
