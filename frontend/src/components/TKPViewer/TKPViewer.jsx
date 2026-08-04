import React, { useState } from 'react';
import './TKPViewer.css';
import { BookOpen, Sparkles, Layers, Info, CheckCircle2, Sigma, Lightbulb } from 'lucide-react';

const TKPViewer = ({ data }) => {
  const [selectedConcept, setSelectedConcept] = useState(null);

  const knowledge = (data && (data.knowledge_graph || data.knowledge)) || {};
  const concepts = knowledge.concepts || [];
  const objectives = knowledge.learning_objectives || [];
  const formulae = knowledge.formulae || [];
  const definitions = knowledge.definitions || [];
  const applications = knowledge.applications || [];

  const classification = data?.classification || {};
  const topic = classification.topic || 'Core Curriculum';
  const subject = classification.subject || 'Curriculum Subject';

  // Active concept details
  const activeConceptData = selectedConcept || concepts[0] || (definitions[0] ? { name: definitions[0].term, description: definitions[0].definition } : null);

  return (
    <div className="tkp-viewer" style={{ padding: '0.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#38bdf8" /> Target Knowledge Graph: {subject} — {topic}
          </h3>
          <p style={{ margin: '0.3rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Interactive concept map dynamically synthesized from source material.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
            {concepts.length || definitions.length || 1} Concepts
          </span>
          {formulae.length > 0 && (
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
              {formulae.length} Formulae
            </span>
          )}
        </div>
      </div>

      {/* Learning Objectives List */}
      {objectives.length > 0 && (
        <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#38bdf8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} /> Targeted Learning Objectives (Bloom's Taxonomy)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.6rem' }}>
            {objectives.map((obj, i) => {
              const text = typeof obj === 'string' ? obj : (obj.objective || obj.text || JSON.stringify(obj));
              const bloom = typeof obj === 'object' && obj.blooms_level ? obj.blooms_level : 'Understand';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#090d16', padding: '0.7rem 0.9rem', borderRadius: '6px' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#f1f5f9', lineHeight: '1.4' }}>{text}</p>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.3rem' }}>
                      Bloom: {bloom}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Concept Map & Deep Dive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
        {/* Interactive Concept Nodes */}
        <div style={{ background: '#090d16', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#ffffff', padding: '0.6rem 1.4rem', borderRadius: '24px', fontWeight: 700, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              {topic}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
            {(concepts.length > 0 ? concepts : definitions).map((c, idx) => {
              const name = typeof c === 'string' ? c : (c.name || c.term);
              const isSelected = activeConceptData && (typeof activeConceptData === 'string' ? activeConceptData === c : (activeConceptData.name === name || activeConceptData.term === name));
              
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

        {/* Selected Concept Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {activeConceptData ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <BookOpen size={18} color="#38bdf8" />
                <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>
                  {typeof activeConceptData === 'string' ? activeConceptData : (activeConceptData.name || activeConceptData.term)}
                </h4>
              </div>
              
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                {typeof activeConceptData === 'string' 
                  ? 'Core foundational concept extracted from lesson material.' 
                  : (activeConceptData.description || activeConceptData.definition || 'Core foundational concept extracted from lesson material.')}
              </p>

              {/* Formula if attached */}
              {(activeConceptData.latex || activeConceptData.plain_text) && (
                <div style={{ background: '#090d16', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #10b981', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Sigma size={14} /> Formula:
                  </div>
                  <p style={{ color: '#f1f5f9', fontFamily: 'monospace', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                    {activeConceptData.latex || activeConceptData.plain_text}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '3rem' }}>
              <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Click any concept node above to inspect its pedagogical explanation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Formulae Section */}
      {formulae.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#10b981', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sigma size={16} /> Mathematical Formulae & Equations
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
            {formulae.map((f, i) => (
              <div key={i} style={{ background: '#090d16', padding: '0.9rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{f.name}</strong>
                <p style={{ fontFamily: 'monospace', color: '#38bdf8', margin: '0.4rem 0 0 0', fontSize: '0.95rem' }}>
                  {f.latex || f.plain_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TKPViewer;
