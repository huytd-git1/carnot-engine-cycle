import React from 'react';
import { Table } from 'lucide-react';
import { CarnotCycleData, InstantaneousState } from '../physics/types';

interface StateTablesProps {
  cycle: CarnotCycleData;
  instantState: InstantaneousState;
}

export const StateTables: React.FC<StateTablesProps> = ({
  cycle,
  instantState,
}) => {
  const { states, energies } = cycle;

  return (
    <div className="tables-card">
      <div className="panel-header">
        <div className="panel-title">
          <Table size={18} color="#2563eb" />
          <span>Bảng Trạng Thái & Năng Lượng Chu Trình</span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Hệ SI Chuẩn
        </span>
      </div>

      {/* 4 States Table */}
      <div className="data-table-wrap">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
          1. TỌA ĐỘ BỐN ĐIỂM TRẠNG THÁI (Entropy tương đối với mốc S1 = 0)
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>T (K)</th>
              <th>V (L)</th>
              <th>p (kPa)</th>
              <th>S − S1 (J/K)</th>
            </tr>
          </thead>
          <tbody>
            {states.map((st) => {
              // Highlight if current process originates from this state
              const isSource = instantState.processIndex === (st.index - 1);
              return (
                <tr key={`st-row-${st.index}`} className={isSource ? 'active-row' : ''}>
                  <td style={{ fontWeight: 700 }}>
                    Trạng thái {st.index}
                  </td>
                  <td>{st.T.toFixed(1)}</td>
                  <td>{(st.V * 1000).toFixed(2)}</td>
                  <td>{(st.p / 1000).toFixed(1)}</td>
                  <td>{st.S_rel.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Energy Balance Table */}
      <div className="data-table-wrap">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
          2. CÂN BẰNG NĂNG LƯỢNG CỦA CÁC QUÁ TRÌNH (ΔU = Q − W)
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Quá trình</th>
              <th>Q (J)</th>
              <th>W (J)</th>
              <th>ΔU (J)</th>
            </tr>
          </thead>
          <tbody>
            {energies.processes.map((proc) => {
              const isActive = instantState.processIndex === proc.index;
              return (
                <tr key={`energy-row-${proc.index}`} className={isActive ? 'active-row' : ''}>
                  <td style={{ fontWeight: 600 }}>{proc.name}</td>
                  <td style={{ color: proc.Q >= 0 ? '#ea580c' : '#0284c7' }}>
                    {proc.Q > 0 ? '+' : ''}{proc.Q.toFixed(2)}
                  </td>
                  <td style={{ color: '#059669' }}>
                    {proc.W > 0 ? '+' : ''}{proc.W.toFixed(2)}
                  </td>
                  <td style={{ color: '#6366f1' }}>
                    {proc.deltaU > 0 ? '+' : ''}{proc.deltaU.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {/* Total Cycle Row */}
            <tr className="total-row">
              <td><strong>Toàn chu trình</strong></td>
              <td style={{ color: '#ea580c' }}>
                <strong>+{(energies.QH - energies.QC_mag).toFixed(2)}</strong>
              </td>
              <td style={{ color: '#059669' }}>
                <strong>+{energies.Wnet.toFixed(2)}</strong>
              </td>
              <td style={{ color: '#6366f1' }}>
                <strong>{energies.deltaU_cycle.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        * Hiệu suất Carnot là giới hạn lý tưởng giữa hai nguồn nhiệt TH và TC: η = 1 − TC/TH = Wnet / QH.
      </div>
    </div>
  );
};
