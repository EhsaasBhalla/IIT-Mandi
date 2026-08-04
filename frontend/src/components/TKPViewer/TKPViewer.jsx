import React, { useState } from 'react';
import './TKPViewer.css';
import { BookOpen, Sparkles, Layers, Info } from 'lucide-react';

const TKPViewer = ({ data }) => {
  const [selectedConcept, setSelectedConcept] = useState(null);

  const knowledge = (data && (data.knowledge_graph || data.knowledge)) || {};
  const concepts = knowledge.concepts || [];
  const objectives = knowledge.learning_objectives || [];
  const subject = (data && data.classification && data.classification.subject) || 'Subject';
  const topic = (data && data.classification && data.classification.topic) || 'Core Curriculum';

  // If no concepts yet, display fallback message
  if (!concepts || concepts.length === 0) {
    return (
      <div className="tkp-viewer" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Knowledge Profile</h3>
        <p style={{ color: '#94a3b8' }}>No concepts extracted yet for this document.</p>
      </div>
    );
  }

  // Active concept details
  const activeConceptData = selectedConcept || concepts[0];

  return (
    <div className="tkp-viewer" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#38bdf8" /> Target Knowledge Graph: {topic}
          </h3>
          <p style={{ margin: '0.3rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Interactive concept map dynamically synthesized from your uploaded material.
          </p>
        </div>
        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
          {concepts.length} Key Concepts
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: '1.5rem' }}>
        {/* Interactive Graph / Concept Grid */}
        <div style={{ background: '#090d16', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', minHeight: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#ffffff', padding: '0.6rem 1.4rem', borderRadius: '24px', fontWeight: 700, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              {topic}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            {concepts.map((c, idx) => {
              const name = typeof c === 'string' ? c : c.name;
              const isSelected = activeConceptData && (typeof activeConceptData === 'string' ? activeConceptData === c : activeConceptData.name === name);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedConcept(c)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? '#38bdf8' : '#e2e8f0',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Concept Deep Dive */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {activeConceptData ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <BookOpen size={18} color="#38bdf8" />
                <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
                  {typeof activeConceptData === 'string' ? activeConceptData : activeConceptData.name}
                </h4>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                {typeof activeConceptData === 'string' 
                  ? 'Core foundational concept extracted from source text.' 
                  : activeConceptData.definition || activeConceptData.description || 'Definition extracted from lesson material.'}
              </p>

              {activeConceptData.formula && (
                <div style={{ background: '#090d16', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #10b981', marginBottom: '1rem' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.85rem' }}>Formula / Mathematical Expression:</strong>
                  <p style={{ color: '#f1f5f9', fontFamily: 'monospace', margin: '0.3rem 0 0 0' }}>{activeConceptData.formula}</p>
                </div>
              )}

              {activeConceptData.prerequisites && activeConceptData.prerequisites.length > 0 && (
                <div style={{ marginTop: '0.8rem' }}>
                  <strong style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Prerequisites:</strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
                    {Array.isArray(activeConceptData.prerequisites) ? activeConceptData.prerequisites.join(', ') : activeConceptData.prerequisites}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '3rem' }}>
              <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Click on any concept in the map to inspect its pedagogical definition and formula relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TKPViewer;
