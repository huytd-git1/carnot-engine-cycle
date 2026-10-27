import React, { useMemo } from 'react';
import { CarnotCycleData, InstantaneousState } from '../physics/types';

interface CylinderPistonProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

// Helper to convert Temperature to smooth CSS color
function getTemperatureColor(T: number): { base: string; light: string; border: string } {
  // Normalize T between 200K and 1200K
  const tNorm = Math.max(0, Math.min(1, (T - 200) / 1000));
  // Hue ranges from 210 (cool blue) down to 0 (vibrant red)
  const hue = 210 - tNorm * 210;
  // Saturation 85% to 95%
  const sat = 85 + tNorm * 10;
  // Lightness around 50%
  return {
    base: `hsl(${hue}, ${sat}%, 50%)`,
    light: `hsla(${hue}, ${sat}%, 65%, 0.35)`,
    border: `hsl(${hue}, ${sat}%, 45%)`,
  };
}

export const CylinderPiston: React.FC<CylinderPistonProps> = ({
  cycle,
  instantState,
}) => {
  const { states } = cycle;
  const V1 = states[0].V;
  const V3 = states[2].V; // Maximum volume in cycle

  // Piston geometry in SVG coordinates
  // Cylinder chamber X range: 100 to 260 (width = 160)
  // Cylinder chamber base Y: 220
  // Piston face height: 16
  // When V = V1 (min), piston bottom is at Y = 170 (chamber height = 50)
  // When V = V3 (max), piston bottom is at Y = 60 (chamber height = 160)
  const yChamberBase = 220;
  const yPistonMinV = 170; // V = V1
  const yPistonMaxV = 60;  // V = V3

  const vNorm = Math.max(0, Math.min(1, (instantState.V - V1) / (V3 - V1 || 1)));
  const yPistonBottom = yPistonMinV - vNorm * (yPistonMinV - yPistonMaxV);
  const chamberHeight = yChamberBase - yPistonBottom;

  const tempColor = useMemo(
    () => getTemperatureColor(instantState.T),
    [instantState.T]
  );

  // Generate pseudo-particles inside gas chamber
  const particles = useMemo(() => {
    const list = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      // Deterministic spread
      const relX = 0.08 + 0.84 * ((i * 37 + 13) % 100) / 100;
      const relY = 0.08 + 0.84 * ((i * 53 + 29) % 100) / 100;
      const r = 2.5 + ((i % 3) * 0.5);
      list.push({ relX, relY, r });
    }
    return list;
  }, []);

  // Jiggle offset based on cycle progress and temperature
  const jiggleScale = Math.sqrt(instantState.T / 300) * 1.5;

  return (
    <div className="panel-card cylinder-panel">
      <div className="panel-header">
        <div className="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="12" y1="10" x2="12" y2="2" />
          </svg>
          <span>Mô Hình Xi Lanh – Piston Khí Lý Tưởng</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Hệ kín & Thuận nghịch
        </span>
      </div>

      <div className="cylinder-svg-wrapper">
        <svg
          className="cylinder-svg"
          viewBox="0 0 360 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Diagonal hatching pattern for adiabatic thermal insulation */}
            <pattern id="insulation-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" strokeWidth="3" />
            </pattern>

            {/* Hot Reservoir Gradient */}
            <linearGradient id="hotReservoirGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.95" />
            </linearGradient>

            {/* Cold Reservoir Gradient */}
            <linearGradient id="coldReservoirGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>

            {/* Gas Chamber Gradient */}
            <linearGradient id="gasChamberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tempColor.light} />
              <stop offset="100%" stopColor={tempColor.base} stopOpacity="0.45" />
            </linearGradient>

            {/* Metallic Piston Gradient */}
            <linearGradient id="pistonMetalGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="25%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="75%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Cylinder Wall Metallic Gradient */}
            <linearGradient id="wallMetalGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Marker Arrow Head */}
            <marker id="arrowUp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
            </marker>
            <marker id="arrowWork" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
            </marker>
          </defs>

          {/* ================= CYLINDER WALLS ================= */}
          {/* Left Wall (x=80 to 100, y=30 to 220) */}
          <rect x="80" y="30" width="20" height="190" fill="url(#wallMetalGrad)" stroke="#1e293b" strokeWidth="1" />
          {/* Right Wall (x=260 to 280, y=30 to 220) */}
          <rect x="260" y="30" width="20" height="190" fill="url(#wallMetalGrad)" stroke="#1e293b" strokeWidth="1" />

          {/* ================= GAS CHAMBER INTERIOR ================= */}
          {/* Gas chamber rect: x=100, y=yPistonBottom, width=160, height=chamberHeight */}
          <rect
            x="100"
            y={yPistonBottom}
            width="160"
            height={chamberHeight}
            fill="url(#gasChamberGrad)"
            stroke={tempColor.border}
            strokeWidth="1.5"
          />

          {/* Thermal gas particles (illustration of temperature motion) */}
          {particles.map((pt, idx) => {
            const posX = 100 + pt.relX * 160 + Math.sin(instantState.cycleProgress * 30 + idx) * jiggleScale;
            const posY = yPistonBottom + pt.relY * chamberHeight + Math.cos(instantState.cycleProgress * 30 + idx) * jiggleScale;
            return (
              <circle
                key={idx}
                cx={Math.max(104, Math.min(256, posX))}
                cy={Math.max(yPistonBottom + 4, Math.min(yChamberBase - 4, posY))}
                r={pt.r}
                fill={tempColor.base}
                opacity={0.8}
              />
            );
          })}

          {/* ================= PISTON & CONNECTING ROD ================= */}
          {/* Piston Rod (width 16, extending upward from piston) */}
          <rect
            x="172"
            y={Math.max(5, yPistonBottom - 50)}
            width="16"
            height={50}
            fill="url(#pistonMetalGrad)"
            stroke="#334155"
            strokeWidth="1"
            rx="2"
          />
          {/* Piston Head (width 159, height 16) */}
          <rect
            x="100.5"
            y={yPistonBottom - 16}
            width="159"
            height="16"
            fill="url(#pistonMetalGrad)"
            stroke="#1e293b"
            strokeWidth="1.5"
            rx="1"
          />
          {/* Piston seal rings */}
          <line x1="101" y1={yPistonBottom - 11} x2="259" y2={yPistonBottom - 11} stroke="#1e293b" strokeWidth="1.5" />
          <line x1="101" y1={yPistonBottom - 5} x2="259" y2={yPistonBottom - 5} stroke="#1e293b" strokeWidth="1.5" />

          {/* Work Arrow on Piston Rod */}
          {instantState.workExchange === 'by_gas' ? (
            <g>
              {/* Arrow pointing UP (expansion, gas does work W > 0) */}
              <line
                x1="180"
                y1={yPistonBottom - 25}
                x2="180"
                y2={Math.max(10, yPistonBottom - 55)}
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrowWork)"
              />
              <text x="200" y={yPistonBottom - 35} fill="#059669" fontSize="11" fontWeight="700">
                W &gt; 0 (Giãn nở)
              </text>
            </g>
          ) : (
            <g>
              {/* Arrow pointing DOWN (compression, work done ON gas W < 0) */}
              <line
                x1="180"
                y1={Math.max(10, yPistonBottom - 55)}
                x2="180"
                y2={yPistonBottom - 25}
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrowWork)"
              />
              <text x="200" y={yPistonBottom - 35} fill="#059669" fontSize="11" fontWeight="700">
                W &lt; 0 (Nén khí)
              </text>
            </g>
          )}

          {/* ================= RESERVOIRS / INSULATION AT CYLINDER BASE ================= */}
          {/* Base interface: y = 220 to 270 */}
          {instantState.heatReservoir === 'hot' && (
            <g>
              {/* Hot Reservoir TH active */}
              <rect x="70" y="222" width="220" height="48" rx="6" fill="url(#hotReservoirGrad)" stroke="#b91c1c" strokeWidth="2" />
              <text x="180" y="244" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle">
                Nguồn nóng TH = {cycle.inputs.TH} K
              </text>
              <text x="180" y="260" fill="#fef2f2" fontSize="10" textAnchor="middle">
                Tiếp xúc nhiệt đẳng nhiệt (Nhận QH)
              </text>

              {/* Heat Arrows pointing INTO gas */}
              <line x1="130" y1="220" x2="130" y2="195" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowUp)" />
              <line x1="180" y1="220" x2="180" y2="195" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowUp)" />
              <line x1="230" y1="220" x2="230" y2="195" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowUp)" />
            </g>
          )}

          {instantState.heatReservoir === 'cold' && (
            <g>
              {/* Cold Reservoir TC active */}
              <rect x="70" y="222" width="220" height="48" rx="6" fill="url(#coldReservoirGrad)" stroke="#0369a1" strokeWidth="2" />
              <text x="180" y="244" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle">
                Nguồn lạnh TC = {cycle.inputs.TC} K
              </text>
              <text x="180" y="260" fill="#f0f9ff" fontSize="10" textAnchor="middle">
                Tiếp xúc nhiệt đẳng nhiệt (Thải |QC|)
              </text>

              {/* Heat Arrows pointing OUT of gas into reservoir */}
              <line x1="130" y1="195" x2="130" y2="220" stroke="#0284c7" strokeWidth="3" markerEnd="url(#arrowDown)" />
              <line x1="180" y1="195" x2="180" y2="220" stroke="#0284c7" strokeWidth="3" markerEnd="url(#arrowDown)" />
              <line x1="230" y1="195" x2="230" y2="220" stroke="#0284c7" strokeWidth="3" markerEnd="url(#arrowDown)" />
            </g>
          )}

          {instantState.heatReservoir === 'insulated' && (
            <g>
              {/* Adiabatic Insulation active (striped) */}
              <rect x="70" y="222" width="220" height="48" rx="6" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
              <rect x="72" y="224" width="216" height="44" rx="4" fill="url(#insulation-stripes)" />
              <rect x="110" y="234" width="140" height="24" rx="4" fill="#ffffff" opacity="0.92" />
              <text x="180" y="250" fill="#334155" fontSize="11" fontWeight="700" textAnchor="middle">
                Đế cách nhiệt lý tưởng (Q = 0)
              </text>
            </g>
          )}

          {/* Volume Scale tick marks on side wall */}
          <line x1="95" y1={yPistonMinV} x2="100" y2={yPistonMinV} stroke="#ffffff" strokeWidth="1.5" />
          <text x="75" y={yPistonMinV + 3} fill="#64748b" fontSize="9" fontWeight="600" textAnchor="end">V1</text>
          
          <line x1="95" y1={yPistonMaxV} x2="100" y2={yPistonMaxV} stroke="#ffffff" strokeWidth="1.5" />
          <text x="75" y={yPistonMaxV + 3} fill="#64748b" fontSize="9" fontWeight="600" textAnchor="end">V3</text>
        </svg>
      </div>

      {/* Caption note */}
      <div className="chart-caption">
        Mô hình piston minh họa chu trình Carnot lý tưởng; tốc độ chuyển động dùng để quan sát.
      </div>

      {/* Instantaneous Thermodynamic & Energy Status Box */}
      <div className="instant-state-box">
        <div className="instant-header">
          <span>Trạng Thái Tức Thời Của Khí</span>
          <span style={{ color: tempColor.base, fontWeight: 700 }}>
            T = {instantState.T.toFixed(1)} K
          </span>
        </div>

        <div className="instant-values-grid">
          <div className="instant-item">
            <span className="instant-name">Áp suất (p)</span>
            <span className="instant-val">{(instantState.p / 1000).toFixed(1)} <small style={{ fontSize: '0.7rem' }}>kPa</small></span>
          </div>
          <div className="instant-item">
            <span className="instant-name">Thể tích (V)</span>
            <span className="instant-val">{(instantState.V * 1000).toFixed(2)} <small style={{ fontSize: '0.7rem' }}>L</small></span>
          </div>
          <div className="instant-item">
            <span className="instant-name">Nhiệt độ (T)</span>
            <span className="instant-val">{instantState.T.toFixed(1)} <small style={{ fontSize: '0.7rem' }}>K</small></span>
          </div>
          <div className="instant-item">
            <span className="instant-name">Entropy (S − S1)</span>
            <span className="instant-val">{instantState.S_rel.toFixed(3)} <small style={{ fontSize: '0.7rem' }}>J/K</small></span>
          </div>
        </div>

        {/* Energy transferred from start of current process */}
        <div className="process-energies-row">
          <div className="process-energy-item">
            <span className="process-energy-title">Q (từ đầu quá trình)</span>
            <span className="process-energy-val" style={{ color: instantState.Q_process >= 0 ? '#ea580c' : '#0284c7' }}>
              {instantState.Q_process > 0 ? '+' : ''}{instantState.Q_process.toFixed(2)} J
            </span>
          </div>
          <div className="process-energy-item">
            <span className="process-energy-title">W (từ đầu quá trình)</span>
            <span className="process-energy-val" style={{ color: '#059669' }}>
              {instantState.W_process > 0 ? '+' : ''}{instantState.W_process.toFixed(2)} J
            </span>
          </div>
          <div className="process-energy-item">
            <span className="process-energy-title">ΔU (từ đầu quá trình)</span>
            <span className="process-energy-val" style={{ color: '#6366f1' }}>
              {instantState.deltaU_process > 0 ? '+' : ''}{instantState.deltaU_process.toFixed(2)} J
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
