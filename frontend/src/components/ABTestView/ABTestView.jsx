import React, { useState } from 'react';
import './ABTestView.css';
import { CheckCircle2, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';

const ABTestView = ({ data }) => {
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);

  const assessments = (data && (data.ab_test_assessment || data.assessments)) || {};
  const variantA = assessments.variant_a || {};
  const variantB = assessments.variant_b || {};

  const qListA = variantA.questions || [];
  const qListB = variantB.questions || [];

  const handleCopyVariant = (questions, label) => {
    let text = `--- ${label} ---\n\n`;
    questions.forEach((q, i) => {
      text += `Q${i + 1}. ${q.question || q.text}\n`;
      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          text += `   (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
        });
      }
      if (showAnswers) {
        text += `Ans: ${q.correct_answer || q.answer}\n`;
      }
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ab-test-view" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#8b5cf6" /> Differentiated A/B Assessment Generator
          </h3>
          <p style={{ margin: '0.3rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Compare generated question sets (Standard Bloom Level vs High-Order Reasoning).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            style={{
              background: showAnswers ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: showAnswers ? '#10b981' : '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>
      </div>

      <div className="variants-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* VARIANT A */}
        <div 
          className="variant-card"
          style={{
            background: selectedVariant === 'A' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: selectedVariant === 'A' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#60a5fa' }}>Variant A: Standard Curriculum</h4>
              <span style={{ fontSize: '0.75rem', background: '#1e3a8a', color: '#93c5fd', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                Baseline Bloom Level
              </span>
            </div>
            <button
              onClick={() => handleCopyVariant(qListA, 'Variant A (Standard)')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              title="Copy Variant A Questions"
            >
              {copied && selectedVariant === 'A' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="question-list" style={{ flexGrow: 1, marginBottom: '1.5rem' }}>
            {qListA.length > 0 ? (
              qListA.map((q, idx) => (
                <div key={idx} style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#f1f5f9' }}>
                    Q{idx + 1}. {q.question || q.text}
                  </p>
                  {q.options && (
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <li key={oIdx}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  {showAnswers && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <strong>Answer:</strong> {q.correct_answer || q.answer}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No questions generated for Variant A.</p>
            )}
          </div>

          <button 
            onClick={() => setSelectedVariant('A')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              background: selectedVariant === 'A' ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
              color: selectedVariant === 'A' ? '#ffffff' : '#cbd5e1'
            }}
          >
            {selectedVariant === 'A' ? '✓ Selected as Class Test' : 'Select Variant A'}
          </button>
        </div>

        {/* VARIANT B */}
        <div 
          className="variant-card"
          style={{
            background: selectedVariant === 'B' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: selectedVariant === 'B' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#a78bfa' }}>Variant B: Deep Reasoning</h4>
              <span style={{ fontSize: '0.75rem', background: '#4c1d95', color: '#c4b5fd', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                Higher-Order Thinking
              </span>
            </div>
            <button
              onClick={() => handleCopyVariant(qListB, 'Variant B (Deep Reasoning)')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              title="Copy Variant B Questions"
            >
              {copied && selectedVariant === 'B' ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="question-list" style={{ flexGrow: 1, marginBottom: '1.5rem' }}>
            {qListB.length > 0 ? (
              qListB.map((q, idx) => (
                <div key={idx} style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#f1f5f9' }}>
                    Q{idx + 1}. {q.question || q.text}
                  </p>
                  {q.options && (
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <li key={oIdx}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  {showAnswers && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                      <strong>Answer:</strong> {q.correct_answer || q.answer}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No questions generated for Variant B.</p>
            )}
          </div>

          <button 
            onClick={() => setSelectedVariant('B')}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              background: selectedVariant === 'B' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
              color: selectedVariant === 'B' ? '#ffffff' : '#cbd5e1'
            }}
          >
            {selectedVariant === 'B' ? '✓ Selected as Class Test' : 'Select Variant B'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ABTestView;
