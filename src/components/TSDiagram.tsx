import React, { useState, useMemo } from 'react';
import { CarnotCycleData, CurvePoint, InstantaneousState } from '../physics/types';

interface TSDiagramProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

export const TSDiagram: React.FC<TSDiagramProps> = ({
  cycle,
  instantState,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    pt: CurvePoint;
    x: number;
    y: number;
  } | null>(null);

  // SVG viewBox settings
  const width = 460;
  const height = 230;
  const margin = { top: 20, right: 30, bottom: 35, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Domain for S and T
  const { sMin, sMax, tMin, tMax } = useMemo(() => {
    const sDelta = cycle.states[1].S_rel;
    const padS = sDelta * 0.15;
    const minT = cycle.inputs.TC;
    const maxT = cycle.inputs.TH;
    const padT = (maxT - minT) * 0.15;

    return {
      sMin: -padS,
      sMax: sDelta + padS,
      tMin: Math.max(100, minT - padT),
      tMax: maxT + padT,
    };
  }, [cycle]);

  const projectX = (S: number): number => {
    return margin.left + ((S - sMin) / (sMax - sMin)) * plotWidth;
  };

  const projectY = (T: number): number => {
    return margin.top + (1 - (T - tMin) / (tMax - tMin)) * plotHeight;
  };

  // State coordinates
  const s0 = 0;
  const s1 = cycle.states[1].S_rel;
  const TH = cycle.inputs.TH;
  const TC = cycle.inputs.TC;

  const pt1 = { x: projectX(s0), y: projectY(TH) };
  const pt2 = { x: projectX(s1), y: projectY(TH) };
  const pt3 = { x: projectX(s1), y: projectY(TC) };
  const pt4 = { x: projectX(s0), y: projectY(TC) };

  // Rectangle path
  const rectPath = `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y} L ${pt3.x} ${pt3.y} L ${pt4.x} ${pt4.y} Z`;

  // Current marker coordinates
  const currentX = projectX(instantState.S_rel);
  const currentY = projectY(instantState.T);

  // Process colors
  const processColors = ['#ea580c', '#8b5cf6', '#0284c7', '#10b981'];

  // Axis tick marks
  const sTicks = useMemo(() => {
    return [
      { val: '0', x: projectX(0) },
      { val: (s1 / 2).toFixed(2), x: projectX(s1 / 2) },
      { val: s1.toFixed(2), x: projectX(s1) },
    ];
  }, [s1, sMin, sMax]);

  const tTicks = useMemo(() => {
    return [
      { val: TC.toFixed(0), y: projectY(TC) },
      { val: ((TH + TC) / 2).toFixed(0), y: projectY((TH + TC) / 2) },
      { val: TH.toFixed(0), y: projectY(TH) },
    ];
  }, [TH, TC, tMin, tMax]);

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div className="graph-title">
          <span style={{ color: '#8b5cf6', fontWeight: 800 }}>T–S</span>
          <span>Đồ Thị Nhiệt Độ – Entropy Tương Đối</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
          Hình chữ nhật chuẩn
        </span>
      </div>

      <div className="svg-chart-container">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="tsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.16" />
            </linearGradient>

            {/* Direction markers */}
            <marker id="tsArrow0" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ea580c" />
            </marker>
            <marker id="tsArrow1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#8b5cf6" />
            </marker>
            <marker id="tsArrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
            </marker>
            <marker id="tsArrow3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Grid lines */}
          {sTicks.map((tick, idx) => (
            <line
              key={`ts-sgrid-${idx}`}
              x1={tick.x}
              y1={margin.top}
              x2={tick.x}
              y2={margin.top + plotHeight}
              stroke="#e2e8f0"
              strokeDasharray="3,3"
            />
          ))}
          {tTicks.map((tick, idx) => (
            <line
              key={`ts-tgrid-${idx}`}
              x1={margin.left}
              y1={tick.y}
              x2={margin.left + plotWidth}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeDasharray="3,3"
            />
          ))}

          {/* Enclosed rectangular area fill */}
          <path d={rectPath} fill="url(#tsAreaGrad)" />
          <text
            x={(pt1.x + pt2.x) / 2}
            y={(pt1.y + pt4.y) / 2}
            fill="#8b5cf6"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            opacity="0.85"
          >
            ∮ T dS = Wnet
          </text>

          {/* 4 Process Segments */}
          {/* Segment 0: 1 -> 2 (Isothermal at TH) */}
          <line
            x1={pt1.x}
            y1={pt1.y}
            x2={pt2.x}
            y2={pt2.y}
            stroke={processColors[0]}
            strokeWidth={instantState.processIndex === 0 ? 3.5 : 2}
            strokeLinecap="round"
          />
          <circle cx={(pt1.x + pt2.x) / 2} cy={pt1.y} r="1" fill="none" markerEnd="url(#tsArrow0)" />

          {/* Segment 1: 2 -> 3 (Adiabatic isentropic at S2) */}
          <line
            x1={pt2.x}
            y1={pt2.y}
            x2={pt3.x}
            y2={pt3.y}
            stroke={processColors[1]}
            strokeWidth={instantState.processIndex === 1 ? 3.5 : 2}
            strokeLinecap="round"
          />
          <circle cx={pt2.x} cy={(pt2.y + pt3.y) / 2} r="1" fill="none" markerEnd="url(#tsArrow1)" />

          {/* Segment 2: 3 -> 4 (Isothermal at TC) */}
          <line
            x1={pt3.x}
            y1={pt3.y}
            x2={pt4.x}
            y2={pt4.y}
            stroke={processColors[2]}
            strokeWidth={instantState.processIndex === 2 ? 3.5 : 2}
            strokeLinecap="round"
          />
          <circle cx={(pt3.x + pt4.x) / 2} cy={pt3.y} r="1" fill="none" markerEnd="url(#tsArrow2)" />

          {/* Segment 3: 4 -> 1 (Adiabatic isentropic at S1=0) */}
          <line
            x1={pt4.x}
            y1={pt4.y}
            x2={pt1.x}
            y2={pt1.y}
            stroke={processColors[3]}
            strokeWidth={instantState.processIndex === 3 ? 3.5 : 2}
            strokeLinecap="round"
          />
          <circle cx={pt4.x} cy={(pt4.y + pt1.y) / 2} r="1" fill="none" markerEnd="url(#tsArrow3)" />

          {/* Invisible interactive hover lines for 4 segments */}
          {cycle.tsCurves.map((curve, pIdx) => {
            const from = curve[0];
            const to = curve[curve.length - 1];
            const x1 = projectX(from.S_rel);
            const y1 = projectY(from.T);
            const x2 = projectX(to.S_rel);
            const y2 = projectY(to.T);

            return (
              <line
                key={`ts-hover-line-${pIdx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth="14"
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = e.clientX - rect.left;
                  let closest = curve[0];
                  let minD = Infinity;
                  for (const pt of curve) {
                    const px = projectX(pt.S_rel);
                    const d = Math.abs(px - relX);
                    if (d < minD) {
                      minD = d;
                      closest = pt;
                    }
                  }
                  setHoveredPoint({
                    pt: closest,
                    x: projectX(closest.S_rel),
                    y: projectY(closest.T),
                  });
                }}
              />
            );
          })}

          {/* 4 State Point Dots and Badges */}
          {[
            { index: 1, x: pt1.x, y: pt1.y, ox: -14, oy: -10 },
            { index: 2, x: pt2.x, y: pt2.y, ox: 14, oy: -10 },
            { index: 3, x: pt3.x, y: pt3.y, ox: 14, oy: 14 },
            { index: 4, x: pt4.x, y: pt4.y, ox: -14, oy: 14 },
          ].map((st) => (
            <g key={`ts-state-dot-${st.index}`}>
              <circle cx={st.x} cy={st.y} r="4" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
              <rect
                x={st.x + st.ox - 8}
                y={st.y + st.oy - 8}
                width="16"
                height="16"
                rx="8"
                fill="#1e293b"
              />
              <text
                x={st.x + st.ox}
                y={st.y + st.oy + 3.5}
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {st.index}
              </text>
            </g>
          ))}

          {/* Current Animated State Marker */}
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={currentX} cy={currentY} r="5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />

          {/* Axes */}
          {/* Y Axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* X Axis */}
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Y Axis Labels */}
          {tTicks.map((tick, idx) => (
            <text
              key={`ty-label-${idx}`}
              x={margin.left - 8}
              y={tick.y + 3.5}
              fill="#64748b"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {tick.val}
            </text>
          ))}
          <text
            x={margin.left - 30}
            y={margin.top - 6}
            fill="#334155"
            fontSize="10"
            fontWeight="700"
          >
            T (K)
          </text>

          {/* X Axis Labels */}
          {sTicks.map((tick, idx) => (
            <text
              key={`sx-label-${idx}`}
              x={tick.x}
              y={margin.top + plotHeight + 16}
              fill="#64748b"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {tick.val}
            </text>
          ))}
          <text
            x={margin.left + plotWidth + 6}
            y={margin.top + plotHeight + 4}
            fill="#334155"
            fontSize="10"
            fontWeight="700"
          >
            S − S1 (J/K)
          </text>

          {/* Hover indicator dot */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4.5"
              fill="#8b5cf6"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: 2 }}>
              {cycle.energies.processes[hoveredPoint.pt.processIndex].name}
            </div>
            <div>S − S1: {hoveredPoint.pt.S_rel.toFixed(3)} J/K</div>
            <div>T: {hoveredPoint.pt.T.toFixed(1)} K</div>
          </div>
        )}
      </div>

      <div className="chart-caption">
        Với quá trình thuận nghịch, δQ = T·dS. Diện tích khép kín trên đồ thị T–S bằng nhiệt lượng ròng của chu trình, cũng bằng công ròng.
      </div>
    </div>
  );
};
