import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, FileText, CheckCircle2, AlertTriangle, Download, ArrowLeft, Layers, HelpCircle, Activity, FileDown, Clock, CheckCircle } from 'lucide-react';
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
  const [currentScriptPage, setCurrentScriptPage] = useState(1);
  const [currentPlanPage, setCurrentPlanPage] = useState(1);

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
  const lessonPlan = data.lesson_plan || {};
  const periodContents = data.period_contents || [];
  const activities = data.activities || [];
  const gapsData = data.gap_analysis || {};
  const gapsList = gapsData.gaps || [];

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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.open(`${API_BASE_URL}/api/download/${jobId}/pdf`, '_blank')} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e11d48', color: '#ffffff', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.85rem' }}
          >
            <FileDown size={16} /> PDF
          </button>
          
          <button 
            onClick={() => window.open(`${API_BASE_URL}/api/download/${jobId}/docx`, '_blank')} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: '#ffffff', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.85rem' }}
          >
            <FileDown size={16} /> DOCX
          </button>

          <button 
            onClick={() => window.open(`${API_BASE_URL}/api/download/${jobId}/pptx`, '_blank')} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#d97706', color: '#ffffff', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.85rem' }}
          >
            <FileDown size={16} /> PPTX
          </button>
          
          <button 
            onClick={handleDownloadJSON} 
            className="btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#38bdf8', color: '#0f172a', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '0.85rem' }}
          >
            <Download size={16} /> JSON
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
          { id: 'assessments', label: 'Assessments', icon: CheckCircle2 },
          { id: 'gaps', label: 'Misconceptions & Remediation', icon: AlertTriangle },
          { id: 'validation', label: 'Quality Report', icon: CheckCircle },
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
        {activeTab === 'lesson_plan' && (() => {
          const periods = lessonPlan.periods || [];
          if (periods.length === 0) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No periods generated yet.</p>;
          const p = periods[currentPlanPage - 1];
          const idx = currentPlanPage - 1;
          
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} /> Multi-Period Sequence ({periods.length} Periods)
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => setCurrentPlanPage(Math.max(1, currentPlanPage - 1))} disabled={currentPlanPage === 1} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: currentPlanPage === 1 ? 'not-allowed' : 'pointer', border: 'none', background: currentPlanPage === 1 ? 'rgba(255,255,255,0.05)' : '#334155', color: currentPlanPage === 1 ? '#64748b' : '#f8fafc', fontWeight: 600 }}>&larr; Prev</button>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0 0.5rem' }}>Period {currentPlanPage} of {periods.length}</span>
                  <button onClick={() => setCurrentPlanPage(Math.min(periods.length, currentPlanPage + 1))} disabled={currentPlanPage === periods.length} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: currentPlanPage === periods.length ? 'not-allowed' : 'pointer', border: 'none', background: currentPlanPage === periods.length ? 'rgba(255,255,255,0.05)' : '#334155', color: currentPlanPage === periods.length ? '#64748b' : '#f8fafc', fontWeight: 600 }}>Next &rarr;</button>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#818cf8', fontSize: '1.1rem' }}>
                    Period {p.period_number || idx + 1}: {p.title || `Period ${idx + 1}`}
                  </h4>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {p.duration_minutes || lessonPlan.period_duration_minutes || 45} mins
                  </span>
                </div>
                
                {p.learning_objectives && p.learning_objectives.length > 0 && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Target Objectives:</strong>
                    <ul style={{ margin: '0.3rem 0', paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {p.learning_objectives.map((obj, oIdx) => (
                        <li key={oIdx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  <strong style={{ color: '#94a3b8' }}>Pedagogical Methodology:</strong> {p.teaching_methodology || 'Interactive instruction and scaffolding'}
                </p>

                {p.concepts_covered && p.concepts_covered.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Concepts Covered:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                      {p.concepts_covered.map((c, cIdx) => (
                        <span key={cIdx} style={{ background: '#090d16', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* SCRIPTS & CONTENT TAB */}
        {activeTab === 'scripts' && (() => {
          if (periodContents.length === 0) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No scripts generated yet.</p>;
          const pc = periodContents[currentScriptPage - 1];
          const idx = currentScriptPage - 1;
          
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} /> Teacher Lecture Scripts
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => setCurrentScriptPage(Math.max(1, currentScriptPage - 1))} disabled={currentScriptPage === 1} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: currentScriptPage === 1 ? 'not-allowed' : 'pointer', border: 'none', background: currentScriptPage === 1 ? 'rgba(255,255,255,0.05)' : '#334155', color: currentScriptPage === 1 ? '#64748b' : '#f8fafc', fontWeight: 600 }}>&larr; Prev</button>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0 0.5rem' }}>Period {currentScriptPage} of {periodContents.length}</span>
                  <button onClick={() => setCurrentScriptPage(Math.min(periodContents.length, currentScriptPage + 1))} disabled={currentScriptPage === periodContents.length} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: currentScriptPage === periodContents.length ? 'not-allowed' : 'pointer', border: 'none', background: currentScriptPage === periodContents.length ? 'rgba(255,255,255,0.05)' : '#334155', color: currentScriptPage === periodContents.length ? '#64748b' : '#f8fafc', fontWeight: 600 }}>Next &rarr;</button>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.4rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.15rem' }}>
                  Period {pc.period_number || idx + 1}: Instructional Script
                </h4>

                {/* Entry Ticket */}
                {pc.entry_ticket && (
                  <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #818cf8', marginBottom: '1rem' }}>
                    <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>🎫 5-MIN ENTRY TICKET:</strong>
                    <p style={{ color: '#f1f5f9', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>{pc.entry_ticket.question}</p>
                    <p style={{ color: '#94a3b8', margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>Expected Answer: {pc.entry_ticket.expected_answer}</p>
                  </div>
                )}

                {/* Teacher Script */}
                <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '1rem' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>🎙️ TEACHER VERBATIM SCRIPT:</strong>
                  <p style={{ color: '#f1f5f9', whiteSpace: 'pre-line', marginTop: '0.6rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {pc.teacher_script || 'Lecture outline and explanations.'}
                  </p>
                </div>

                {/* Blackboard Notes */}
                {pc.blackboard_notes && (
                  <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '1rem' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>📋 BLACKBOARD / SLIDE DIAGRAM:</strong>
                    <pre style={{ color: '#10b981', fontFamily: 'monospace', margin: '0.5rem 0 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {pc.blackboard_notes}
                    </pre>
                  </div>
                )}

                {/* Exit Ticket */}
                {pc.exit_ticket && (
                  <div style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>🚪 EXIT TICKET CHECK:</strong>
                    <p style={{ color: '#f1f5f9', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>{pc.exit_ticket.question}</p>
                    <p style={{ color: '#94a3b8', margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>Expected Answer: {pc.exit_ticket.expected_answer}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} /> Engaging In-Class Activities & Experiments
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
              {activities.map((act, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.4rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>
                    {act.title || `Activity ${idx+1}`}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#38bdf8' }}>
                      {act.type || 'Interactive'}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#818cf8' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                      {act.duration_minutes || 15} mins
                    </span>
                  </div>
                  
                  {/* Instructions */}
                  <div style={{ marginTop: '0.8rem' }}>
                    <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Student Instructions:</strong>
                    <p style={{ fontSize: '0.9rem', color: '#f1f5f9', margin: '0.3rem 0 0.8rem 0', lineHeight: '1.5' }}>
                      {act.student_instructions || (act.teacher_instructions && act.teacher_instructions[0]) || 'Engage students in hands-on application of concepts.'}
                    </p>
                  </div>

                  {act.teacher_instructions && act.teacher_instructions.length > 0 && (
                    <div style={{ marginTop: '0.6rem' }}>
                      <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Teacher Guidance:</strong>
                      <ul style={{ margin: '0.3rem 0', paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                        {act.teacher_instructions.map((tInst, tIdx) => (
                          <li key={tIdx}>{tInst}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {act.materials_needed && act.materials_needed.length > 0 && (
                    <div style={{ marginTop: '0.6rem' }}>
                      <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Materials:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#38bdf8' }}>
                        {act.materials_needed.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {activeTab === 'assessments' && (
          <ABTestView data={data} />
        )}

        {/* GAPS TAB */}
        {activeTab === 'gaps' && (
          <div>
            <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#f87171" /> Misconception Diagnostics & Remedial Action
            </h3>
            {gapsList.length > 0 ? (
              gapsList.map((g, idx) => (
                <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '1.3rem', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <h4 style={{ margin: 0, color: '#f87171', fontSize: '1.05rem' }}>
                      ⚠️ {g.concept}: {g.misconception}
                    </h4>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                      Severity: {g.severity || 'Medium'}
                    </span>
                  </div>

                  {g.why_students_think_this && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.4rem 0' }}>
                      <strong style={{ color: '#94a3b8' }}>Root Cause:</strong> {g.why_students_think_this}
                    </p>
                  )}

                  {g.diagnostic_question && (
                    <div style={{ background: '#090d16', padding: '0.8rem', borderRadius: '6px', margin: '0.6rem 0', borderLeft: '3px solid #818cf8' }}>
                      <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>Diagnostic Check Question:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#f1f5f9', fontSize: '0.9rem' }}>{g.diagnostic_question}</p>
                    </div>
                  )}

                  {g.remedial_action && (
                    <div style={{ background: '#090d16', padding: '0.8rem', borderRadius: '6px', margin: '0.6rem 0', borderLeft: '3px solid #10b981' }}>
                      <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>Teacher Remediation Strategy:</strong>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#86efac', fontSize: '0.9rem' }}>{g.remedial_action}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No learning gaps detected in this module.</p>
            )}
          </div>
        )}

        {/* VALIDATION QUALITY REPORT TAB */}
        {activeTab === 'validation' && (() => {
          const validation = data.validation || {};
          const score = validation.overall_score || validation.score || 'N/A';
          let hallFlags = validation.hallucination_flags || validation.hallucination_count || 0;
          
          if (Array.isArray(hallFlags)) {
            hallFlags = hallFlags.length;
          } else if (typeof hallFlags === 'object' && hallFlags !== null) {
            hallFlags = 1;
          }

          // Defensive parsing to prevent crash if LLM hallucinates non-arrays
          const rawIssues = validation.issues || [];
          const issues = Array.isArray(rawIssues) ? rawIssues : (rawIssues ? [rawIssues] : []);
          
          const rawRecs = validation.recommendations || [];
          const recommendations = Array.isArray(rawRecs) ? rawRecs : (rawRecs ? [rawRecs] : []);
          return (
            <div>
              <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} /> Stage 9: Quality Validation Report
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Overall Quality Score</p>
                  <p style={{ margin: 0, color: '#10b981', fontSize: '2.2rem', fontWeight: 700 }}>{score}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span></p>
                </div>
                <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Hallucination Flags</p>
                  <p style={{ margin: 0, color: hallFlags > 0 ? '#f87171' : '#10b981', fontSize: '2.2rem', fontWeight: 700 }}>{hallFlags}</p>
                </div>
                <div style={{ background: '#090d16', padding: '1.2rem', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <p style={{ margin: '0 0 0.3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Issues Found</p>
                  <p style={{ margin: 0, color: '#38bdf8', fontSize: '2.2rem', fontWeight: 700 }}>{issues.length}</p>
                </div>
              </div>

              {issues.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#f87171', margin: '0 0 0.8rem 0' }}>Identified Issues</h4>
                  {issues.map((issue, idx) => {
                    const text = typeof issue === 'string' ? issue : (issue.description || JSON.stringify(issue));
                    return (
                      <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        <p style={{ margin: 0, color: '#fca5a5', fontSize: '0.9rem' }}>{text}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {recommendations.length > 0 && (
                <div>
                  <h4 style={{ color: '#10b981', margin: '0 0 0.8rem 0' }}>Recommendations</h4>
                  {recommendations.map((rec, idx) => (
                    <div key={idx} style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <p style={{ margin: 0, color: '#86efac', fontSize: '0.9rem' }}>{typeof rec === 'string' ? rec : rec.text || JSON.stringify(rec)}</p>
                    </div>
                  ))}
                </div>
              )}

              {issues.length === 0 && recommendations.length === 0 && (
                <p style={{ color: '#10b981', textAlign: 'center', padding: '2rem', fontSize: '1.1rem' }}>
                  ✅ All validation checks passed. Content is verified against source material.
                </p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ResultsPage;
