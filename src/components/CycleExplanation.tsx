import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { CarnotCycleData, InstantaneousState } from '../physics/types';

interface CycleExplanationProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

export const CycleExplanation: React.FC<CycleExplanationProps> = ({
  cycle,
  instantState,
}) => {
  const [isFormulaOpen, setIsFormulaOpen] = useState(true);

  const processColors = ['#ea580c', '#8b5cf6', '#0284c7', '#10b981'];
  const activeColor = processColors[instantState.processIndex];
  const activeProcess = cycle.energies.processes[instantState.processIndex];

  return (
    <div className="explanation-card">
      <div className="panel-header">
        <div className="panel-title">
          <BookOpen size={18} color="#2563eb" />
          <span>Giải Thích Diễn Biến Vật Lý</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Đồng bộ tức thời
        </span>
      </div>

      {/* Dynamic Process Explanation Banner */}
      <div
        className="explanation-banner"
        style={{
          color: activeColor,
          backgroundColor: `${activeColor}10`,
          borderColor: activeColor,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
          {activeProcess.name}
        </div>
        <div>{activeProcess.description}</div>
      </div>

      {/* Cumulative Energy Distinction Box */}
      <div style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: '0.78rem',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
          Năng Lượng Tích Lũy Từ Đầu Chu Trình (Đến Thời Điểm Hiện Tại):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Q tích lũy: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: instantState.Q_cumulative >= 0 ? '#ea580c' : '#0284c7' }}>
              {instantState.Q_cumulative > 0 ? '+' : ''}{instantState.Q_cumulative.toFixed(2)} J
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>W tích lũy: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>
              {instantState.W_cumulative > 0 ? '+' : ''}{instantState.W_cumulative.toFixed(2)} J
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ΔU tích lũy: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#6366f1' }}>
              {instantState.deltaU_cumulative > 0 ? '+' : ''}{instantState.deltaU_cumulative.toFixed(2)} J
            </strong>
          </div>
        </div>
      </div>

      {/* Expandable Formulas Accordion */}
      <div className="formula-accordion">
        <div
          className="formula-accordion-header"
          onClick={() => setIsFormulaOpen(!isFormulaOpen)}
        >
          <span>Công Thức Nhiệt Động Lực Học Tương Ứng</span>
          {isFormulaOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {isFormulaOpen && (
          <div className="formula-accordion-body">
            {/* 1 -> 2 Formula */}
            <div className={`formula-item ${instantState.processIndex === 0 ? 'highlight' : ''}`}>
              <div style={{ fontWeight: 700, color: '#ea580c', marginBottom: 2 }}>
                1 → 2: Đẳng nhiệt tại TH (T1 = T2 = TH)
              </div>
              <div className="formula-math">
                W1→2 = n·R·TH·ln(V2/V1) = n·R·TH·ln(r) | Q1→2 = W1→2 &gt; 0 | ΔU = 0
              </div>
            </div>

            {/* 2 -> 3 Formula */}
            <div className={`formula-item ${instantState.processIndex === 1 ? 'highlight' : ''}`}>
              <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: 2 }}>
                2 → 3: Đoạn nhiệt thuận nghịch (TH → TC, S không đổi)
              </div>
              <div className="formula-math">
                Q2→3 = 0 | ΔU2→3 = n·Cv·(TC − TH) &lt; 0 | W2→3 = −ΔU2→3 &gt; 0
              </div>
            </div>

            {/* 3 -> 4 Formula */}
            <div className={`formula-item ${instantState.processIndex === 2 ? 'highlight' : ''}`}>
              <div style={{ fontWeight: 700, color: '#0284c7', marginBottom: 2 }}>
                3 → 4: Đẳng nhiệt tại TC (T3 = T4 = TC)
              </div>
              <div className="formula-math">
                W3→4 = n·R·TC·ln(V4/V3) = −n·R·TC·ln(r) | Q3→4 = W3→4 &lt; 0 | ΔU = 0
              </div>
            </div>

            {/* 4 -> 1 Formula */}
            <div className={`formula-item ${instantState.processIndex === 3 ? 'highlight' : ''}`}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 2 }}>
                4 → 1: Đoạn nhiệt thuận nghịch (TC → TH, S không đổi)
              </div>
              <div className="formula-math">
                Q4→1 = 0 | ΔU4→1 = n·Cv·(TH − TC) &gt; 0 | W4→1 = −ΔU4→1 &lt; 0
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Quy ước quốc tế: Q &gt; 0 khí nhận nhiệt, W &gt; 0 khí thực hiện công ra ngoài. Định luật I: ΔU = Q − W.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
