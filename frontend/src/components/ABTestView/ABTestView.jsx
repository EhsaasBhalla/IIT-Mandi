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

  // Extract MCQs & Short Answer questions from both variants
  const mcqsA = variantA.mcqs || [];
  const saA = variantA.short_answer || [];
  
  const mcqsB = variantB.mcqs || [];
  const saB = variantB.short_answer || [];

  const handleCopyVariant = (mcqs, sa, label) => {
    let text = `================ ${label} ================\n\n`;
    
    if (mcqs.length > 0) {
      text += `--- SECTION 1: MULTIPLE CHOICE QUESTIONS ---\n\n`;
      mcqs.forEach((q, i) => {
        text += `Q${i + 1}. ${q.question}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, oIdx) => {
            text += `   (${String.fromCharCode(65 + oIdx)}) ${opt}\n`;
          });
        }
        if (showAnswers) {
          text += `   [Correct Answer: ${q.correct_option}] ${q.explanation}\n`;
        }
        text += `\n`;
      });
    }

    if (sa.length > 0) {
      text += `--- SECTION 2: SHORT ANSWER QUESTIONS ---\n\n`;
      sa.forEach((q, i) => {
        text += `Q${i + 1}. ${q.question}\n`;
        if (showAnswers) {
          text += `   [Model Answer]: ${q.model_answer}\n`;
          if (q.key_points && q.key_points.length > 0) {
            text += `   [Key Points]: ${q.key_points.join(', ')}\n`;
          }
        }
        text += `\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderQuestions = (mcqs, sa, variantKey) => {
    const hasQuestions = mcqs.length > 0 || sa.length > 0;
    if (!hasQuestions) {
      return (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
          Generating assessment questions...
        </p>
      );
    }

    return (
      <div>
        {/* MCQs */}
        {mcqs.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ color: '#38bdf8', margin: '0 0 0.8rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multiple Choice Questions ({mcqs.length})
            </h5>
            {mcqs.map((q, idx) => (
              <div key={idx} style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ margin: '0 0 0.6rem 0', fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>
                  {idx + 1}. {q.question}
                </p>
                {q.options && q.options.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem', margin: '0.5rem 0' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        <strong style={{ color: '#38bdf8' }}>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                      </div>
                    ))}
                  </div>
                )}
                {showAnswers && (
                  <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.7rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                      Correct Option: {q.correct_option}
                    </p>
                    {q.explanation && (
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Short Answer Questions */}
        {sa.length > 0 && (
          <div>
            <h5 style={{ color: '#818cf8', margin: '0 0 0.8rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Short Answer & Conceptual ({sa.length})
            </h5>
            {sa.map((q, idx) => (
              <div key={idx} style={{ background: '#090d16', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>
                  {idx + 1}. {q.question}
                </p>
                {showAnswers && (
                  <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.7rem', background: 'rgba(129, 140, 248, 0.08)', borderRadius: '6px', borderLeft: '3px solid #818cf8' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                      Model Answer:
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {q.model_answer}
                    </p>
                    {q.key_points && q.key_points.length > 0 && (
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <strong>Marking Points:</strong> {q.key_points.join(' • ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ab-test-view" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#8b5cf6" /> Differentiated A/B Assessment Engine
          </h3>
          <p style={{ margin: '0.3rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            {assessments.hypothesis || "Variant A tests foundational recall, while Variant B tests deep analytical application."}
          </p>
        </div>

        <button
          onClick={() => setShowAnswers(!showAnswers)}
          style={{
            background: showAnswers ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: showAnswers ? '#10b981' : '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          {showAnswers ? '✓ Hide Answer Key' : '👁️ Show Answer Key'}
        </button>
      </div>

      <div className="variants-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* VARIANT A */}
        <div 
          className="variant-card"
          style={{
            background: selectedVariant === 'A' ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255, 255, 255, 0.02)',
            border: selectedVariant === 'A' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#60a5fa', fontSize: '1.1rem' }}>{variantA.title || 'Variant A: Standard Assessment'}</h4>
              <span style={{ fontSize: '0.75rem', background: '#1e3a8a', color: '#93c5fd', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-block', marginTop: '0.3rem' }}>
                Baseline Recall
              </span>
            </div>
            <button
              onClick={() => handleCopyVariant(mcqsA, saA, 'Variant A')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
              title="Copy Variant A Questions"
            >
              {copied && selectedVariant === 'A' ? <Check size={16} color="#10b981" /> : <Copy size={16} />} Copy
            </button>
          </div>

          <div style={{ flexGrow: 1, marginBottom: '1.2rem' }}>
            {renderQuestions(mcqsA, saA, 'A')}
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
            {selectedVariant === 'A' ? '✓ Active Test Selection' : 'Select Variant A'}
          </button>
        </div>

        {/* VARIANT B */}
        <div 
          className="variant-card"
          style={{
            background: selectedVariant === 'B' ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255, 255, 255, 0.02)',
            border: selectedVariant === 'B' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#a78bfa', fontSize: '1.1rem' }}>{variantB.title || 'Variant B: Deep Analytical Assessment'}</h4>
              <span style={{ fontSize: '0.75rem', background: '#4c1d95', color: '#c4b5fd', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-block', marginTop: '0.3rem' }}>
                Higher-Order Thinking
              </span>
            </div>
            <button
              onClick={() => handleCopyVariant(mcqsB, saB, 'Variant B')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
              title="Copy Variant B Questions"
            >
              {copied && selectedVariant === 'B' ? <Check size={16} color="#10b981" /> : <Copy size={16} />} Copy
            </button>
          </div>

          <div style={{ flexGrow: 1, marginBottom: '1.2rem' }}>
            {renderQuestions(mcqsB, saB, 'B')}
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
            {selectedVariant === 'B' ? '✓ Active Test Selection' : 'Select Variant B'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ABTestView;
