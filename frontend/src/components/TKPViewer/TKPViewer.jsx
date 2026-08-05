import React, { useState, useMemo } from 'react';
import './TKPViewer.css';
import { BookOpen, Sparkles, CheckCircle2, Sigma, Target, Lightbulb } from 'lucide-react';

const COLORS = ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fb923c', '#a78bfa', '#22d3ee', '#fbbf24', '#f87171', '#4ade80'];

const TKPViewer = ({ data }) => {
  const [selectedIdx, setSelectedIdx] = useState(null);

  const knowledge = (data && (data.knowledge_graph || data.knowledge)) || {};
  const concepts = knowledge.concepts || [];
  const objectives = knowledge.learning_objectives || [];
  const formulae = knowledge.formulae || [];
  const definitions = knowledge.definitions || [];
  const prerequisites = knowledge.prerequisites || [];
  const conceptMap = knowledge.concept_map || {};

  const classification = data?.classification || {};
  const topic = classification.topic || 'Core Curriculum';
  const subject = classification.subject || 'Subject';

  // Build node list from concepts (or definitions as fallback)
  const nodes = useMemo(() => {
    const items = concepts.length > 0 ? concepts : definitions;
    return items.map((c, i) => {
      const name = typeof c === 'string' ? c : (c.name || c.term || `Node ${i+1}`);
      const desc = typeof c === 'string' ? '' : (c.description || c.definition || '');
      return { name, desc, color: COLORS[i % COLORS.length] };
    });
  }, [concepts, definitions]);

  // Layout nodes in a circle around center
  const graphLayout = useMemo(() => {
    const cx = 400, cy = 280;
    const radius = Math.min(200, 80 + nodes.length * 15);
    return nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      return {
        ...n,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [nodes]);

  // Build edges from concept_map
  const edges = useMemo(() => {
    const result = [];
    const nameToIdx = {};
    graphLayout.forEach((n, i) => { nameToIdx[n.name.toLowerCase()] = i; });
    
    Object.entries(conceptMap).forEach(([src, targets]) => {
      const srcIdx = nameToIdx[src.toLowerCase()];
      if (srcIdx === undefined) return;
      (Array.isArray(targets) ? targets : []).forEach(t => {
        const tIdx = nameToIdx[t.toLowerCase()];
        if (tIdx !== undefined && tIdx !== srcIdx) {
          result.push([srcIdx, tIdx]);
        }
      });
    });
    
    // If no concept_map edges, connect all to center conceptually
    if (result.length === 0 && graphLayout.length > 1) {
      for (let i = 1; i < graphLayout.length; i++) {
        result.push([0, i]);
      }
    }
    return result;
  }, [graphLayout, conceptMap]);

  const activeNode = selectedIdx !== null ? graphLayout[selectedIdx] : null;

  // Find related formulae for selected concept
  const relatedFormulae = useMemo(() => {
    if (!activeNode) return [];
    const name = activeNode.name.toLowerCase();
    return formulae.filter(f => {
      const fName = (typeof f === 'string' ? f : (f.name || '')).toLowerCase();
      return fName.includes(name) || name.includes(fName);
    });
  }, [activeNode, formulae]);

  return (
    <div className="tkp-viewer-v2">
      {/* Header */}
      <div className="tkp-header">
        <div>
          <h3 className="tkp-title">
            <Sparkles size={20} color="#38bdf8" /> Knowledge Graph: {subject} — {topic}
          </h3>
          <p className="tkp-subtitle">Click any concept node to inspect definitions, formulae, and prerequisite relationships.</p>
        </div>
        <div className="tkp-badges">
          <span className="badge badge-blue">{nodes.length} Concepts</span>
          {formulae.length > 0 && <span className="badge badge-green">{formulae.length} Formulae</span>}
          {objectives.length > 0 && <span className="badge badge-purple">{objectives.length} Objectives</span>}
        </div>
      </div>

      {/* Interactive Graph + Detail Panel */}
      <div className="tkp-graph-container">
        {/* SVG Graph */}
        <div className="tkp-graph-panel">
          <svg viewBox="0 0 800 560" className="tkp-svg">
            {/* Edges */}
            {edges.map(([a, b], i) => (
              <line
                key={`e-${i}`}
                x1={graphLayout[a].x} y1={graphLayout[a].y}
                x2={graphLayout[b].x} y2={graphLayout[b].y}
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="1.5"
                strokeDasharray={selectedIdx !== null && (selectedIdx === a || selectedIdx === b) ? "none" : "6,4"}
              />
            ))}
            
            {/* Center topic node */}
            <circle cx="400" cy="280" r="38" fill="rgba(30, 58, 138, 0.9)" stroke="#38bdf8" strokeWidth="2" />
            <text x="400" y="280" textAnchor="middle" dominantBaseline="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
              {topic.length > 18 ? topic.slice(0, 18) + '...' : topic}
            </text>

            {/* Connection lines to center */}
            {graphLayout.map((node, idx) => (
              <line key={`center-${idx}`} x1="400" y1="280" x2={node.x} y2={node.y}
                stroke={selectedIdx === idx ? node.color : 'rgba(255,255,255,0.06)'}
                strokeWidth={selectedIdx === idx ? 2 : 1}
              />
            ))}

            {/* Concept Nodes */}
            {graphLayout.map((node, idx) => {
              const isSelected = selectedIdx === idx;
              const r = isSelected ? 32 : 26;
              return (
                <g key={idx} onClick={() => setSelectedIdx(isSelected ? null : idx)} style={{ cursor: 'pointer' }}>
                  {/* Glow effect */}
                  {isSelected && <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={node.color} strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" values={`${r+6};${r+12};${r+6}`} dur="2s" repeatCount="indefinite" />
                  </circle>}
                  
                  <circle cx={node.x} cy={node.y} r={r} 
                    fill={isSelected ? node.color : 'rgba(15, 23, 42, 0.95)'} 
                    stroke={node.color} 
                    strokeWidth={isSelected ? 3 : 1.5} 
                  />
                  <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" 
                    fill={isSelected ? '#0f172a' : node.color} 
                    fontSize={node.name.length > 12 ? '8' : '10'} fontWeight="600"
                  >
                    {node.name.length > 16 ? node.name.slice(0, 14) + '..' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail Panel */}
        <div className="tkp-detail-panel">
          {activeNode ? (
            <div className="concept-detail animate-fade-in">
              <div className="detail-header" style={{ borderLeftColor: activeNode.color }}>
                <BookOpen size={18} color={activeNode.color} />
                <h4 style={{ color: activeNode.color }}>{activeNode.name}</h4>
              </div>
              
              {activeNode.desc && (
                <div className="detail-section">
                  <span className="detail-label">Definition</span>
                  <p className="detail-text">{activeNode.desc}</p>
                </div>
              )}

              {relatedFormulae.length > 0 && (
                <div className="detail-section">
                  <span className="detail-label"><Sigma size={14} /> Formulae</span>
                  {relatedFormulae.map((f, i) => (
                    <div key={i} className="formula-card">
                      <strong>{typeof f === 'string' ? f : f.name}</strong>
                      <code>{typeof f === 'string' ? '' : (f.latex || f.plain_text)}</code>
                    </div>
                  ))}
                </div>
              )}

              {prerequisites.length > 0 && (
                <div className="detail-section">
                  <span className="detail-label">Prerequisites</span>
                  <div className="prereq-chips">
                    {prerequisites.map((p, i) => (
                      <span key={i} className="prereq-chip">{typeof p === 'string' ? p : p.concept}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="detail-placeholder">
              <Target size={36} color="#334155" />
              <p>Click any node in the graph to inspect its pedagogical details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Learning Objectives Section */}
      {objectives.length > 0 && (
        <div className="tkp-objectives">
          <h4 className="section-label"><Lightbulb size={16} color="#fbbf24" /> Targeted Learning Objectives (Bloom's Taxonomy)</h4>
          <div className="objectives-grid">
            {objectives.map((obj, i) => {
              const text = typeof obj === 'string' ? obj : (obj.objective || JSON.stringify(obj));
              const bloom = typeof obj === 'object' && obj.blooms_level ? obj.blooms_level : 'Understand';
              return (
                <div key={i} className="objective-card">
                  <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p>{text}</p>
                    <span className="bloom-tag">{bloom}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Formulae */}
      {formulae.length > 0 && (
        <div className="tkp-formulae">
          <h4 className="section-label"><Sigma size={16} color="#10b981" /> Mathematical Formulae</h4>
          <div className="formulae-grid">
            {formulae.map((f, i) => (
              <div key={i} className="formula-block">
                <strong>{typeof f === 'string' ? f : f.name}</strong>
                <code>{typeof f === 'string' ? '' : (f.latex || f.plain_text)}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TKPViewer;
