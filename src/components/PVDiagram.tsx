import React, { useState, useMemo } from 'react';
import { CarnotCycleData, CurvePoint, InstantaneousState } from '../physics/types';

interface PVDiagramProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

export const PVDiagram: React.FC<PVDiagramProps> = ({
  cycle,
  instantState,
}) => {
  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');
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

  // Stable min and max ranges computed from cycle
  const { vMin, vMax, pMin, pMax } = useMemo(() => {
    let minV = Infinity;
    let maxV = -Infinity;
    let minP = Infinity;
    let maxP = -Infinity;

    for (const curve of cycle.pvCurves) {
      for (const pt of curve) {
        if (pt.V < minV) minV = pt.V;
        if (pt.V > maxV) maxV = pt.V;
        if (pt.p < minP) minP = pt.p;
        if (pt.p > maxP) maxP = pt.p;
      }
    }

    // Add 10% padding for visual clarity
    const padV = (maxV - minV) * 0.1;
    const padP = (maxP - minP) * 0.12;

    return {
      vMin: Math.max(0.00005, minV - padV),
      vMax: maxV + padV,
      pMin: Math.max(5000, minP - padP),
      pMax: maxP + padP,
    };
  }, [cycle]);

  // Coordinate projection functions
  const projectX = (V: number): number => {
    if (scaleType === 'log') {
      const logMin = Math.log10(vMin);
      const logMax = Math.log10(vMax);
      const logV = Math.log10(V);
      return margin.left + ((logV - logMin) / (logMax - logMin)) * plotWidth;
    }
    return margin.left + ((V - vMin) / (vMax - vMin)) * plotWidth;
  };

  const projectY = (p: number): number => {
    if (scaleType === 'log') {
      const logMin = Math.log10(pMin);
      const logMax = Math.log10(pMax);
      const logP = Math.log10(p);
      return margin.top + (1 - (logP - logMin) / (logMax - logMin)) * plotHeight;
    }
    return margin.top + (1 - (p - pMin) / (pMax - pMin)) * plotHeight;
  };

  // Build SVG path strings for each process curve
  const curvePaths = useMemo(() => {
    return cycle.pvCurves.map((curve) => {
      return curve.map((pt, i) => {
        const x = projectX(pt.V);
        const y = projectY(pt.p);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      }).join(' ');
    });
  }, [cycle, scaleType, vMin, vMax, pMin, pMax]);

  // Build enclosed cycle polygon for shaded Wnet
  const enclosedCyclePath = useMemo(() => {
    const allPoints: string[] = [];
    cycle.pvCurves.forEach((curve) => {
      curve.forEach((pt) => {
        const x = projectX(pt.V);
        const y = projectY(pt.p);
        allPoints.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      });
    });
    return `M ${allPoints.join(' L ')} Z`;
  }, [cycle, scaleType, vMin, vMax, pMin, pMax]);

  // Current marker position
  const currentX = projectX(instantState.V);
  const currentY = projectY(instantState.p);

  // Process colors
  const processColors = ['#ea580c', '#8b5cf6', '#0284c7', '#10b981'];

  // Axis tick marks
  const vTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const v = vMin + (i / count) * (vMax - vMin);
      ticks.push({
        valL: (v * 1000).toFixed(1),
        x: projectX(v),
      });
    }
    return ticks;
  }, [vMin, vMax, scaleType]);

  const pTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const p = pMin + (i / count) * (pMax - pMin);
      ticks.push({
        valKPa: (p / 1000).toFixed(0),
        y: projectY(p),
      });
    }
    return ticks;
  }, [pMin, pMax, scaleType]);

  return (
    <div className="graph-card">
      <div className="graph-header">
        <div className="graph-title">
          <span style={{ color: '#ea580c', fontWeight: 800 }}>p–V</span>
          <span>Đồ Thị Công (Áp Suất – Thể Tích)</span>
        </div>
        <div className="scale-switch">
          <span>Thang:</span>
          <button
            className={`scale-btn ${scaleType === 'linear' ? 'active' : ''}`}
            onClick={() => setScaleType('linear')}
          >
            Tuyến tính
          </button>
          <button
            className={`scale-btn ${scaleType === 'log' ? 'active' : ''}`}
            onClick={() => setScaleType('log')}
          >
            Logarithmic
          </button>
        </div>
      </div>

      <div className="svg-chart-container">
        <svg
          className="chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Shaded Wnet area gradient */}
            <linearGradient id="pvAreaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.18" />
            </linearGradient>

            {/* Mid-curve Direction Arrow Markers */}
            <marker id="pvArrow0" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ea580c" />
            </marker>
            <marker id="pvArrow1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#8b5cf6" />
            </marker>
            <marker id="pvArrow2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
            </marker>
            <marker id="pvArrow3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Grid lines */}
          {vTicks.map((tick, idx) => (
            <line
              key={`vgrid-${idx}`}
              x1={tick.x}
              y1={margin.top}
              x2={tick.x}
              y2={margin.top + plotHeight}
              stroke="#e2e8f0"
              strokeDasharray="3,3"
            />
          ))}
          {pTicks.map((tick, idx) => (
            <line
              key={`pgrid-${idx}`}
              x1={margin.left}
              y1={tick.y}
              x2={margin.left + plotWidth}
              y2={tick.y}
              stroke="#e2e8f0"
              strokeDasharray="3,3"
            />
          ))}

          {/* Enclosed Wnet area fill */}
          <path d={enclosedCyclePath} fill="url(#pvAreaGrad)" />
          {/* Label Wnet at center of cycle */}
          {scaleType === 'linear' && (
            <text
              x={(projectX(cycle.states[0].V) + projectX(cycle.states[2].V)) / 2}
              y={(projectY(cycle.states[0].p) + projectY(cycle.states[2].p)) / 2}
              fill="#059669"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              opacity="0.85"
            >
              Wnet = ∮ p dV
            </text>
          )}

          {/* 4 Process Curves */}
          {cycle.pvCurves.map((curve, pIdx) => {
            const isCurrent = instantState.processIndex === pIdx;
            const midPt = curve[Math.floor(curve.length / 2)];
            const midX = projectX(midPt.V);
            const midY = projectY(midPt.p);

            return (
              <g key={`pv-curve-${pIdx}`}>
                <path
                  d={curvePaths[pIdx]}
                  fill="none"
                  stroke={processColors[pIdx]}
                  strokeWidth={isCurrent ? 3.5 : 2}
                  strokeLinecap="round"
                  style={{
                    filter: isCurrent ? `drop-shadow(0 0 4px ${processColors[pIdx]})` : 'none',
                    transition: 'stroke-width 0.2s',
                  }}
                />

                {/* Invisible hover trigger line */}
                <path
                  d={curvePaths[pIdx]}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = e.clientX - rect.left;
                    // Find closest curve point
                    let closest = curve[0];
                    let minD = Infinity;
                    for (const pt of curve) {
                      const px = projectX(pt.V);
                      const d = Math.abs(px - relX);
                      if (d < minD) {
                        minD = d;
                        closest = pt;
                      }
                    }
                    setHoveredPoint({
                      pt: closest,
                      x: projectX(closest.V),
                      y: projectY(closest.p),
                    });
                  }}
                />

                {/* Direction marker near midpoint */}
                <circle
                  cx={midX}
                  cy={midY}
                  r="1"
                  fill="none"
                  markerEnd={`url(#pvArrow${pIdx})`}
                />
              </g>
            );
          })}

          {/* 4 States Points (1, 2, 3, 4) */}
          {cycle.states.map((st) => {
            const sx = projectX(st.V);
            const sy = projectY(st.p);
            // Label offsets
            const offsetX = st.index === 1 || st.index === 4 ? -14 : 14;
            const offsetY = st.index === 1 || st.index === 2 ? -10 : 14;

            return (
              <g key={`state-pt-${st.index}`}>
                <circle cx={sx} cy={sy} r="4" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
                <rect
                  x={sx + offsetX - 8}
                  y={sy + offsetY - 8}
                  width="16"
                  height="16"
                  rx="8"
                  fill="#1e293b"
                />
                <text
                  x={sx + offsetX}
                  y={sy + offsetY + 3.5}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {st.index}
                </text>
              </g>
            );
          })}

          {/* Current Animated State Marker */}
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={currentX} cy={currentY} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

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
          {pTicks.map((tick, idx) => (
            <text
              key={`py-label-${idx}`}
              x={margin.left - 8}
              y={tick.y + 3.5}
              fill="#64748b"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {tick.valKPa}
            </text>
          ))}
          <text
            x={margin.left - 30}
            y={margin.top - 6}
            fill="#334155"
            fontSize="10"
            fontWeight="700"
          >
            p (kPa)
          </text>

          {/* X Axis Labels */}
          {vTicks.map((tick, idx) => (
            <text
              key={`vx-label-${idx}`}
              x={tick.x}
              y={margin.top + plotHeight + 16}
              fill="#64748b"
              fontSize="9"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {tick.valL}
            </text>
          ))}
          <text
            x={margin.left + plotWidth + 6}
            y={margin.top + plotHeight + 4}
            fill="#334155"
            fontSize="10"
            fontWeight="700"
          >
            V (L)
          </text>

          {/* Hover indicator dot */}
          {hoveredPoint && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4.5"
              fill="#3b82f6"
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
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 2 }}>
              {cycle.energies.processes[hoveredPoint.pt.processIndex].name}
            </div>
            <div>V: {(hoveredPoint.pt.V * 1000).toFixed(2)} L</div>
            <div>p: {(hoveredPoint.pt.p / 1000).toFixed(1)} kPa</div>
            <div>T: {hoveredPoint.pt.T.toFixed(1)} K</div>
          </div>
        )}
      </div>

      {scaleType === 'log' ? (
        <div className="chart-caption" style={{ color: '#ea580c' }}>
          * Chú ý: Khi dùng thang logarithmic, diện tích hình học trên màn hình không còn trực tiếp đại diện cho công.
        </div>
      ) : (
        <div className="chart-caption">
          Diện tích khép kín màu xanh nhạt bằng công có ích ròng Wnet = ∮ p dV.
        </div>
      )}
    </div>
  );
};
