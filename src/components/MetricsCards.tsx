import React from 'react';
import { CarnotCycleData } from '../physics/types';

interface MetricsCardsProps {
  cycle: CarnotCycleData;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ cycle }) => {
  const { energies } = cycle;

  return (
    <div className="metrics-grid">
      {/* 1. Carnot Efficiency */}
      <div className="metric-card efficiency">
        <div className="metric-header">
          <span className="metric-label">Hiệu Suất Carnot</span>
          <span className="metric-symbol">η = 1 − TC/TH</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-number" style={{ color: '#8b5cf6' }}>
            {energies.efficiencyPercent.toFixed(1)}%
          </span>
          <span className="metric-unit">({energies.efficiency.toFixed(4)})</span>
        </div>
        <div className="metric-note">
          Giới hạn cực đại lý tưởng theo Định luật II
        </div>
      </div>

      {/* 2. Heat Absorbed QH */}
      <div className="metric-card heat-in">
        <div className="metric-header">
          <span className="metric-label">Nhiệt Lượng Nhận Vào</span>
          <span className="metric-symbol">QH (1 → 2)</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-number" style={{ color: '#ef4444' }}>
            {energies.QH.toFixed(2)}
          </span>
          <span className="metric-unit">J</span>
        </div>
        <div className="metric-note">
          QH = n·R·TH·ln(r) (tại nguồn nóng TH)
        </div>
      </div>

      {/* 3. Heat Rejected |QC| */}
      <div className="metric-card heat-out">
        <div className="metric-header">
          <span className="metric-label">Nhiệt Thải Ra Nguồn Lạnh</span>
          <span className="metric-symbol">|QC| (3 → 4)</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-number" style={{ color: '#0284c7' }}>
            {energies.QC_mag.toFixed(2)}
          </span>
          <span className="metric-unit">J</span>
        </div>
        <div className="metric-note">
          |QC| = n·R·TC·ln(r) (thải cho nguồn lạnh TC)
        </div>
      </div>

      {/* 4. Net Work Wnet */}
      <div className="metric-card work-net">
        <div className="metric-header">
          <span className="metric-label">Công Ròng Chu Trình</span>
          <span className="metric-symbol">Wnet = QH − |QC|</span>
        </div>
        <div className="metric-value-row">
          <span className="metric-number" style={{ color: '#059669' }}>
            {energies.Wnet.toFixed(2)}
          </span>
          <span className="metric-unit">J</span>
        </div>
        <div className="metric-note">
          Bằng diện tích khép kín trên p–V và T–S
        </div>
      </div>
    </div>
  );
};
