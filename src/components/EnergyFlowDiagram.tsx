import React, { useState } from 'react';
import { GitFork, Info, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { CarnotCycleData, InstantaneousState } from '../physics/types';

interface EnergyFlowDiagramProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  cycle,
  instantState,
}) => {
  const [showOriginalImages, setShowOriginalImages] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const { QH, QC_mag, Wnet, efficiencyPercent } = cycle.energies;
  const { TH, TC } = cycle.inputs;

  // Arrow thickness proportional to energies
  // Total height available: width of Qh arrow
  const totalArrowWidth = 60; // Base width for QH
  const wWidth = Math.max(14, (Wnet / QH) * totalArrowWidth);
  const qcWidth = Math.max(14, (QC_mag / QH) * totalArrowWidth);

  // Active pulsing when animation is playing
  const isHotActive = instantState.processIndex === 0;
  const isColdActive = instantState.processIndex === 2;
  const isWorkActive = instantState.workExchange === 'by_gas';

  return (
    <div className="explanation-card" style={{ marginTop: 12 }}>
      <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div className="panel-title">
          <GitFork size={18} color="#2563eb" />
          <span>Sơ Đồ Dòng Năng Lượng Động Cơ Nhiệt (Sankey Diagram)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
            W = QH − |QC|
          </span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Interactive Sankey SVG */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <svg
              viewBox="0 0 540 320"
              style={{ width: '100%', maxHeight: '310px', overflow: 'visible' }}
            >
              <defs>
                {/* Hot Source Gradient */}
                <linearGradient id="sankeyHot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f87171" />
                </linearGradient>

                {/* Cold Sink Gradient */}
                <linearGradient id="sankeyCold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                {/* Work Arrow Gradient */}
                <linearGradient id="sankeyWork" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Arrow markers */}
                <marker id="sankeyArrowWork" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <marker id="sankeyArrowCold" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
                </marker>
              </defs>

              {/* 1. TOP BLOCK: Hot Temperature Heat Source (TH) */}
              <rect
                x="80"
                y="15"
                width="220"
                height="45"
                rx="8"
                fill="url(#sankeyHot)"
                stroke="#b91c1c"
                strokeWidth={isHotActive ? 2.5 : 1.5}
                style={{
                  filter: isHotActive ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <text x="190" y="36" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
                Nguồn nóng TH = {TH} K (T1)
              </text>
              <text x="190" y="50" fill="#fee2e2" fontSize="10" textAnchor="middle">
                Higher temperature heat source
              </text>

              {/* 2. DOWNWARD TRUNK: Heat In QH */}
              <rect
                x={190 - totalArrowWidth / 2}
                y="60"
                width={totalArrowWidth}
                height="65"
                fill="#f87171"
                opacity="0.85"
              />
              {/* Decorative small downward arrows inside trunk */}
              <path d="M 190 75 L 184 83 L 196 83 Z" fill="#ffffff" opacity="0.75" />
              <path d="M 190 95 L 184 103 L 196 103 Z" fill="#ffffff" opacity="0.75" />
              <text x="145" y="95" fill="#b91c1c" fontSize="11" fontWeight="700" textAnchor="end">
                QH = {QH.toFixed(2)} J
              </text>

              {/* 3. CENTER ENGINE: Heat Engine Circle / Box */}
              <circle
                cx="190"
                cy="170"
                r="45"
                fill="#ffffff"
                stroke="#475569"
                strokeWidth="3.5"
                strokeDasharray="none"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08))',
                }}
              />
              <text x="190" y="165" fill="#1e293b" fontSize="11" fontWeight="800" textAnchor="middle">
                ĐỘNG CƠ
              </text>
              <text x="190" y="179" fill="#64748b" fontSize="9" fontWeight="600" textAnchor="middle">
                HEAT ENGINE
              </text>

              {/* 4. WORK BRANCH TO THE RIGHT: W = QH - |QC| */}
              {/* Curved smooth Sankey path turning right */}
              <path
                d={`
                  M 190 145
                  Q 240 145, 270 160
                  L 430 160
                  L 430 ${160 + wWidth}
                  L 270 ${160 + wWidth}
                  Q 230 ${160 + wWidth}, 190 ${170 + totalArrowWidth / 2}
                  Z
                `}
                fill="url(#sankeyWork)"
                opacity="0.85"
                style={{
                  filter: isWorkActive ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' : 'none',
                }}
              />
              {/* Big Work Arrow head pointing right */}
              <path
                d={`M 430 ${145} L 475 ${160 + wWidth / 2} L 430 ${175 + wWidth} Z`}
                fill="#10b981"
              />
              <text x="350" y={150} fill="#059669" fontSize="12" fontWeight="800">
                W = QH − |QC| = {Wnet.toFixed(2)} J
              </text>
              <text x="350" y={166 + wWidth} fill="#047857" fontSize="10" fontWeight="600">
                Hiệu suất: η = {efficiencyPercent.toFixed(1)}%
              </text>

              {/* 5. DOWNWARD TRUNK CONTINUATION: Heat Out |QC| */}
              <rect
                x={190 - qcWidth / 2}
                y="190"
                width={qcWidth}
                height="65"
                fill="#38bdf8"
                opacity="0.85"
              />
              {/* Arrow head pointing into cold sink */}
              <path
                d={`M ${190 - qcWidth} 255 L ${190 + qcWidth} 255 L 190 270 Z`}
                fill="#0284c7"
              />
              <text x="145" y="235" fill="#0369a1" fontSize="11" fontWeight="700" textAnchor="end">
                |QC| = {QC_mag.toFixed(2)} J
              </text>

              {/* 6. BOTTOM BLOCK: Lower Temperature Heat Sink (TC) */}
              <rect
                x="80"
                y="265"
                width="220"
                height="45"
                rx="8"
                fill="url(#sankeyCold)"
                stroke="#0369a1"
                strokeWidth={isColdActive ? 2.5 : 1.5}
                style={{
                  filter: isColdActive ? 'drop-shadow(0 0 8px rgba(2, 132, 199, 0.4))' : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <text x="190" y="286" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
                Nguồn lạnh TC = {TC} K (T2)
              </text>
              <text x="190" y="300" fill="#e0f2fe" fontSize="10" textAnchor="middle">
                Lower temperature heat sink
              </text>
            </svg>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 4,
              fontStyle: 'italic',
            }}>
              Bề rộng của các nhánh mũi tên tỉ lệ trực tiếp với năng lượng: Bề rộng QH = Bề rộng W + Bề rộng |QC|.
            </div>
          </div>

          {/* Theoretical Explanation Box */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            color: 'var(--text-main)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#2563eb', marginBottom: 6 }}>
              <Info size={16} />
              <span>Ý Nghĩa Vật Lý Của Sơ Đồ Năng Lượng & Đồ Thị p–V</span>
            </div>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>
                <strong>Định luật I Nhiệt động lực học (Bảo toàn năng lượng):</strong> Sau một chu trình khép kín, khí trở về trạng thái ban đầu nên biến thiên nội năng ΔU (toàn chu trình) = 0. Do đó, toàn bộ công có ích sinh ra bằng hiệu nhiệt lượng nhận vào và nhiệt lượng thải ra:
                <br />
                <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#059669' }}>
                  W = Q1 − Q2 = QH − |QC| = ∮ p dV
                </code>
              </li>
              <li>
                <strong>Định luật II Nhiệt động lực học (Phát biểu Kelvin–Planck):</strong> Không thể chế tạo một động cơ nhiệt hoạt động tuần hoàn mà biến đổi <em>toàn bộ 100%</em> nhiệt nhận từ nguồn nóng thành công cơ học. Động cơ bắt buộc phải truyền một phần nhiệt Q₂ &gt; 0 cho nguồn lạnh.
              </li>
              <li>
                <strong>Tương quan với đồ thị p–V (Chu trình M–N–O–P–M):</strong>
                <br />
                - Quá trình <strong>M → N</strong> (1 → 2): Giãn nở đẳng nhiệt tại $T_h$, khí hấp thụ nhiệt $Q_h$ ($Q_1$).
                <br />
                - Quá trình <strong>N → O</strong> (2 → 3): Giãn nở đoạn nhiệt, không trao đổi nhiệt ($Q = 0$).
                <br />
                - Quá trình <strong>O → P</strong> (3 → 4): Nén đẳng nhiệt tại $T_c$, khí thải nhiệt $Q_c$ ($Q_2$) cho nguồn lạnh.
                <br />
                - Quá trình <strong>P → M</strong> (4 → 1): Nén đoạn nhiệt về trạng thái ban đầu ($Q = 0$).
                <br />
                - <em>Diện tích khép kín nằm gọn bên trong đường bao chu trình trên đồ thị p–V chính là công sinh ra $W$.</em>
              </li>
              <li>
                <strong>Hiệu suất cực đại Carnot:</strong>
                <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#8b5cf6', marginLeft: 4 }}>
                  η = W / QH = 1 − TC / TH = 1 − Q2 / Q1
                </code>
                . Bất kỳ động cơ nhiệt thực tế nào làm việc giữa hai nguồn $T_H$ và $T_C$ đều có hiệu suất nhỏ hơn hoặc bằng hiệu suất Carnot này.
              </li>
            </ul>
          </div>

          {/* Toggle Button to View Original Textbook Figures */}
          <div>
            <button
              className="btn-secondary"
              onClick={() => setShowOriginalImages(!showOriginalImages)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <ImageIcon size={14} />
              <span>{showOriginalImages ? 'Ẩn tài liệu ảnh gốc' : 'Xem hai hình ảnh đối chiếu trong giáo trình gốc'}</span>
            </button>

            {showOriginalImages && (
              <div style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 12,
                padding: 10,
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ textAlign: 'center', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <img
                    src="./images/heat-engine-classic.png"
                    alt="Sơ đồ kinh điển động cơ nhiệt"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                    Hình 1: Sơ đồ kinh điển động cơ nhiệt (T1, Q1, W = Q1 − Q2, Q2, T2)
                  </div>
                </div>

                <div style={{ textAlign: 'center', background: '#fff', padding: 8, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <img
                    src="./images/carnot-cycle-energy-flow.png"
                    alt="Đồ thị p-V chu trình MNOP và sơ đồ dòng năng lượng Sankey"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                    Hình 2: Chu trình p–V (M–N–O–P) và Sơ đồ Sankey dòng nhiệt Th → Qh → W & Qc → Tc
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
