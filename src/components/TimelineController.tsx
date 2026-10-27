import React from 'react';
import { InstantaneousState, ProcessIndex } from '../physics/types';

interface TimelineControllerProps {
  instantState: InstantaneousState;
  onSeekProgress: (progress: number) => void;
  onJumpProcess: (processIndex: ProcessIndex) => void;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  instantState,
  onSeekProgress,
  onJumpProcess,
}) => {
  const processNames = [
    '1 → 2: Giãn nở đẳng nhiệt',
    '2 → 3: Giãn nở đoạn nhiệt',
    '3 → 4: Nén đẳng nhiệt',
    '4 → 1: Nén đoạn nhiệt',
  ];

  const processBgColors = ['#ea580c', '#8b5cf6', '#0284c7', '#10b981'];

  return (
    <div className="timeline-card">
      <div className="timeline-header">
        <div className="progress-info">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Tiến Trình Chu Trình:
          </span>
          <span className="cycle-pct-badge">
            {(instantState.cycleProgress * 100).toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Đang chạy: <strong style={{ color: processBgColors[instantState.processIndex] }}>
              {processNames[instantState.processIndex]}
            </strong> ({Math.round(instantState.u * 100)}%)
          </span>
        </div>

        <div className="process-step-buttons">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
            Nhảy đến quá trình:
          </span>
          {([0, 1, 2, 3] as ProcessIndex[]).map((idx) => {
            const isActive = instantState.processIndex === idx;
            return (
              <button
                key={`jump-step-${idx}`}
                className={`step-btn ${isActive ? 'active' : ''}`}
                style={{
                  backgroundColor: isActive ? processBgColors[idx] : undefined,
                  borderColor: isActive ? processBgColors[idx] : undefined,
                }}
                onClick={() => onJumpProcess(idx)}
                title={`Nhảy tới đầu quá trình ${idx + 1} → ${(idx + 1) % 4 + 1}`}
              >
                {idx + 1} → {(idx + 1) % 4 + 1}
              </button>
            );
          })}
        </div>
      </div>

      <input
        type="range"
        className="timeline-scrubber"
        min="0"
        max="1"
        step="0.001"
        value={instantState.cycleProgress}
        onChange={(e) => onSeekProgress(parseFloat(e.target.value))}
        aria-label="Thanh kéo tiến trình toàn chu trình"
      />
    </div>
  );
};
