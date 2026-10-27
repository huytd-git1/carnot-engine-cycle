import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { InstantaneousState } from '../physics/types';

interface HeaderProps {
  instantState: InstantaneousState;
  isPlaying: boolean;
  isLooping: boolean;
  speed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onToggleLoop: () => void;
  onSpeedChange: (speed: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  instantState,
  isPlaying,
  isLooping,
  speed,
  onTogglePlay,
  onReset,
  onStepPrev,
  onStepNext,
  onToggleLoop,
  onSpeedChange,
}) => {
  // Process color mapping
  const processColors = ['#ea580c', '#8b5cf6', '#0284c7', '#10b981'];
  const activeColor = processColors[instantState.processIndex];

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="brand-titles">
          <h1>Mô Phỏng Chu Trình Động Cơ Carnot</h1>
          <div className="brand-subtitle">Carnot Heat Engine Cycle — Phòng Thí Nghiệm Nhiệt Động Lực Học</div>
        </div>
      </div>

      {/* Process Indicator Badge */}
      <div
        className="process-indicator-badge"
        style={{
          color: activeColor,
          backgroundColor: `${activeColor}15`,
        }}
      >
        <span className="badge-dot" />
        <span>{instantState.processName}</span>
        <span style={{ opacity: 0.8, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          ({Math.round(instantState.u * 100)}%)
        </span>
      </div>

      {/* Main Playback Controls */}
      <div className="header-playback-controls">
        <div className="btn-group">
          <button
            className="btn"
            onClick={onReset}
            title="Về đầu chu trình (Trạng thái 1)"
            aria-label="Về đầu"
          >
            <RotateCcw size={15} />
            <span>Về đầu</span>
          </button>
          <button
            className="btn"
            onClick={onStepPrev}
            title="Quay lại trạng thái đặc trưng trước"
            aria-label="Trạng thái trước"
          >
            <SkipBack size={15} />
            <span>Trước</span>
          </button>
          <button
            className={`btn btn-primary ${isPlaying ? 'active' : ''}`}
            onClick={onTogglePlay}
            title={isPlaying ? 'Tạm dừng mô phỏng' : 'Chạy mô phỏng'}
            aria-label={isPlaying ? 'Tạm dừng' : 'Chạy'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Tạm dừng' : 'Chạy'}</span>
          </button>
          <button
            className="btn"
            onClick={onStepNext}
            title="Tiến tới trạng thái đặc trưng tiếp theo"
            aria-label="Trạng thái tiếp theo"
          >
            <span>Sau</span>
            <SkipForward size={15} />
          </button>
        </div>

        <button
          className={`btn ${isLooping ? 'active' : ''}`}
          onClick={onToggleLoop}
          title={isLooping ? 'Tắt chế độ chạy lặp' : 'Bật chế độ chạy lặp liên tục'}
          style={{
            border: '1px solid var(--border-subtle)',
            backgroundColor: isLooping ? '#eff6ff' : 'var(--bg-surface)',
            color: isLooping ? '#2563eb' : 'var(--text-muted)',
          }}
        >
          <Repeat size={15} />
          <span>Lặp</span>
        </button>

        <select
          className="speed-select"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          title="Tốc độ phát hoạt ảnh (chỉ thay đổi quan sát, không đổi công hay hiệu suất)"
          aria-label="Tốc độ phát"
        >
          <option value={0.25}>0.25×</option>
          <option value={0.5}>0.5×</option>
          <option value={1}>1.0×</option>
          <option value={2}>2.0×</option>
          <option value={4}>4.0×</option>
        </select>
      </div>
    </header>
  );
};
