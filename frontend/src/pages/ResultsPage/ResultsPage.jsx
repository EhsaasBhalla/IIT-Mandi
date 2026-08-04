import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle2, AlertTriangle, Download, ArrowLeft, Layers, HelpCircle, Activity, FileDown } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import TKPViewer from '../../components/TKPViewer/TKPViewer';
import ABTestView from '../../components/ABTestView/ABTestView';
import './ResultsPage.css';

const ResultsPage = () => {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/result/${jobId}`);
        const json = await response.json();
        if (response.ok && json.result) {
          setData(json.result);
        } else {
          setError(json.error || 'Failed to load results.');
        }
      } catch (err) {
        setError('Error connecting to backend server.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [jobId]);

  const handleDownloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TKP_Package_${jobId.slice(0, 8)}.json`;
    a.click();
  };

  const handleDownloadPDF = () => {
    window.open(`${API_BASE_URL}/api/download/${jobId}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="results-page animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Loading Teacher Knowledge Package...</h2>
        <p className="subtitle">Fetching synthesized lesson plans and assessment data.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="results-page animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#ef4444' }}>Unable to Display Results</h2>
        <p className="subtitle">{error || 'Job is still processing or result not found.'}</p>
        <Link to={`/progress/${jobId}`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Progress Monitor
        </Link>
      </div>
    );
  }

  const classification = data.classification || {};
  const knowledge = data.knowledge_graph || data.knowledge || {};
  const lessonPlan = data.lesson_plan || {};
  const periodContents = data.period_contents || [];
  const activities = data.activities || [];
  const gaps = data.gap_analysis || {};

  return (
    <div className="results-page animate-fade-in">
      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Upload Another Document
          </Link>
          <h2>{classification.subject || 'Curriculum'} — {classification.topic || 'Teacher Knowledge Package'}</h2>
          <p className="subtitle">Grade {classification.target_grade || classification.grade_level || 'K-12'} | {classification.curriculum_board || 'CBSE/NCERT'} | {lessonPlan.total_periods || periodContents.length || 3} Teaching Periods</p>
        </div>
        
        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleDownloadPDF} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e11d48', color: '#ffffff', fontWeight: 600, padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
          >
            <FileDown size={18} /> Download PDF
          </button>
          
          <button 
            onClick={handleDownloadJSON} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#38bdf8', color: '#0f172a', fontWeight: 600, padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
          >
            <Download size={18} /> Export JSON
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', margin: '1.5rem 0' }}>
        {[
          { id: 'overview', label: 'Interactive Knowledge Graph', icon: BookOpen },
          { id: 'lesson_plan', label: 'Lesson Plan & Sequence', icon: Layers },
          { id: 'scripts', label: 'Teacher Scripts & Content', icon: FileText },
          { id: 'activities', label: 'Class Activities', icon: Activity },
          { id: 'assessments', label: 'A/B Assessments', icon: CheckCircle2 },
          { id: 'gaps', label: 'Misconceptions & Remediation', icon: AlertTriangle },
          { id: 'raw', label: 'Raw JSON', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', background: activeTab === tab.id ? '#1e293b' : 'transparent', color: activeTab === tab.id ? '#38bdf8' : '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* INTERACTIVE KNOWLEDGE GRAPH TAB */}
        {activeTab === 'overview' && (
          <TKPViewer data={data} />
        )}

        {/* LESSON PLAN TAB */}
        {activeTab === 'lesson_plan' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Multi-Period Lesson Breakdown</h3>
            {(lessonPlan.periods || []).map((p, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#818cf8' }}>Period {p.period_number || idx + 1}: {p.title || p.topic || p.theme} ({p.duration_minutes || 45} mins)</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.4rem 0' }}><strong>Objectives:</strong> {Array.isArray(p.objectives) ? p.objectives.join(', ') : p.objectives}</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.4rem 0' }}><strong>Methodology:</strong> {p.teaching_methodology || 'Interactive lecture & problem solving'}</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.4rem 0' }}><strong>Key Takeaway:</strong> {p.key_takeaway || 'Core understanding of topics.'}</p>
              </div>
            ))}
          </div>
        )}

        {/* SCRIPTS & CONTENT TAB */}
        {activeTab === 'scripts' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Teacher Lecture Scripts & Board Work</h3>
            {periodContents.map((pc, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#38bdf8' }}>Period {pc.period_number || idx + 1}: Teacher Delivery Script</h4>
                <div style={{ background: '#090d16', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #38bdf8', marginBottom: '1rem' }}>
                  <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>TEACHER SCRIPT:</strong>
                  <p style={{ color: '#f1f5f9', whiteSpace: 'pre-line', marginTop: '0.5rem', lineHeight: '1.6' }}>{pc.teacher_script || 'Lecture outline and explanations.'}</p>
                </div>
                {pc.blackboard_notes && (
                  <div style={{ background: '#090d16', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>BLACKBOARD / SLIDE OUTLINE:</strong>
                    <p style={{ color: '#10b981', fontFamily: 'monospace', marginTop: '0.5rem' }}>{Array.isArray(pc.blackboard_notes) ? pc.blackboard_notes.join('\n') : pc.blackboard_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Engaging In-Class Activities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {activities.map((act, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: '#f8fafc' }}>{act.title || act.activity_name || `Activity ${idx+1}`}</h4>
                  <span style={{ fontSize: '0.8rem', background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#38bdf8' }}>{act.activity_type || 'Interactive'} | {act.duration_minutes || 15} mins</span>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.8rem' }}><strong>Instructions:</strong> {act.instructions || act.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSESSMENTS TAB (A/B Test) */}
        {activeTab === 'assessments' && (
          <ABTestView data={data} />
        )}

        {/* GAPS TAB */}
        {activeTab === 'gaps' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Misconception Diagnosis & Interventions</h3>
            {((gaps.misconceptions) || []).map((m, idx) => (
              <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f87171' }}>⚠️ Misconception: {typeof m === 'string' ? m : m.misconception}</h4>
                <p style={{ color: '#fca5a5', fontSize: '0.9rem', margin: '0.4rem 0' }}><strong>Diagnostic Check:</strong> {typeof m === 'string' ? 'Ask conceptual questions.' : m.diagnostic_question}</p>
                <p style={{ color: '#86efac', fontSize: '0.9rem', margin: '0.4rem 0' }}><strong>Teacher Remediation:</strong> {typeof m === 'string' ? 'Provide visual demonstration.' : m.remedial_strategy}</p>
              </div>
            ))}
          </div>
        )}

        {/* RAW JSON TAB */}
        {activeTab === 'raw' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Structured Pydantic Model Payload</h3>
            <pre style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#38bdf8', fontSize: '0.85rem', maxHeight: '500px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
