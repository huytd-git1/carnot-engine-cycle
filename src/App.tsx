import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { calculateCarnotCycle, getInstantaneousState } from './physics/carnot';
import { CarnotInputs, DEFAULT_INPUTS, ProcessIndex } from './physics/types';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { ControlsPanel } from './components/ControlsPanel';
import { CylinderPiston } from './components/CylinderPiston';
import { PVDiagram } from './components/PVDiagram';
import { TSDiagram } from './components/TSDiagram';
import { TimelineController } from './components/TimelineController';
import { CycleExplanation } from './components/CycleExplanation';
import { StateTables } from './components/StateTables';

export const App: React.FC = () => {
  // Thermodynamic cycle inputs
  const [inputs, setInputs] = useState<CarnotInputs>(DEFAULT_INPUTS);

  // Playback control state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [cycleProgress, setCycleProgress] = useState<number>(0);

  // Calculate complete cycle data
  const cycleData = useMemo(() => calculateCarnotCycle(inputs), [inputs]);

  // Calculate instantaneous state for current cycleProgress
  const instantState = useMemo(
    () => getInstantaneousState(cycleData, cycleProgress),
    [cycleData, cycleProgress]
  );

  // Animation controller using requestAnimationFrame
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Duration of one complete cycle at 1.0x speed (in milliseconds)
  const BASE_CYCLE_DURATION_MS = 8000;

  const tick = useCallback(
    (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Advance progress
      const progressDelta = (deltaTime / BASE_CYCLE_DURATION_MS) * speed;

      setCycleProgress((prev) => {
        let next = prev + progressDelta;
        if (next >= 1) {
          if (isLooping) {
            next = next % 1;
          } else {
            setIsPlaying(false);
            return 1;
          }
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    },
    [speed, isLooping]
  );

  // Start / stop animation loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }

    // Cleanup on unmount or toggle
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, tick]);

  // Handlers for user interactions
  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      // If at end and not looping, reset to start when clicking play
      if (!prev && cycleProgress >= 0.999 && !isLooping) {
        setCycleProgress(0);
      }
      return !prev;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCycleProgress(0);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    const stepPositions = [0, 0.25, 0.5, 0.75, 1];
    const current = cycleProgress;
    // Find next position with small epsilon
    const nextPos = stepPositions.find((pos) => pos > current + 0.005) ?? (isLooping ? 0 : 1);
    setCycleProgress(nextPos >= 1 ? 0.9999 : nextPos);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    const stepPositions = [0, 0.25, 0.5, 0.75, 1];
    const current = cycleProgress;
    // Find previous position with small epsilon
    const prevPos = [...stepPositions].reverse().find((pos) => pos < current - 0.005) ?? (isLooping ? 0.75 : 0);
    setCycleProgress(prevPos);
  };

  const handleSeekProgress = (newProgress: number) => {
    setCycleProgress(Math.max(0, Math.min(1, newProgress)));
  };

  const handleJumpProcess = (pIdx: ProcessIndex) => {
    setIsPlaying(false);
    setCycleProgress(pIdx * 0.25);
  };

  const handleApplyInputs = (newInputs: CarnotInputs) => {
    setInputs(newInputs);
    setIsPlaying(false);
    setCycleProgress(0); // Reset to state 1
  };

  const handleResetDefaults = () => {
    setInputs(DEFAULT_INPUTS);
    setIsPlaying(false);
    setCycleProgress(0);
  };

  return (
    <div className="app-container">
      {/* 1. Header with brand, process status badge and playback controls */}
      <Header
        instantState={instantState}
        isPlaying={isPlaying}
        isLooping={isLooping}
        speed={speed}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onStepPrev={handleStepPrev}
        onStepNext={handleStepNext}
        onToggleLoop={() => setIsLooping(!isLooping)}
        onSpeedChange={setSpeed}
      />

      {/* 2. Top Summary Metric Cards */}
      <MetricsCards cycle={cycleData} />

      {/* 3. Main Workspace Grid: Controls (24%), Cylinder (38%), Graphs (38%) */}
      <main className="workspace-grid">
        {/* Left Column: Parameter Inputs */}
        <section aria-label="Bảng điều khiển thông số">
          <ControlsPanel
            currentInputs={inputs}
            onApplyInputs={handleApplyInputs}
            onResetDefaults={handleResetDefaults}
          />
        </section>

        {/* Center Column: Cylinder & Piston + Instantaneous Gas State */}
        <section aria-label="Mô hình xi lanh piston">
          <CylinderPiston
            cycle={cycleData}
            instantState={instantState}
          />
        </section>

        {/* Right Column: p-V & T-S Diagrams stacked */}
        <section className="graphs-column" aria-label="Đồ thị nhiệt động lực học">
          <PVDiagram
            cycle={cycleData}
            instantState={instantState}
          />
          <TSDiagram
            cycle={cycleData}
            instantState={instantState}
          />
        </section>
      </main>

      {/* 4. Timeline scrubber and direct process jump buttons */}
      <section aria-label="Bộ điều khiển tiến trình chu trình">
        <TimelineController
          instantState={instantState}
          onSeekProgress={handleSeekProgress}
          onJumpProcess={handleJumpProcess}
        />
      </section>

      {/* 5. Bottom Section: Explanations & Data Tables */}
      <section className="bottom-dashboard" aria-label="Giải thích và bảng số liệu">
        <CycleExplanation
          cycle={cycleData}
          instantState={instantState}
        />
        <StateTables
          cycle={cycleData}
          instantState={instantState}
        />
      </section>

      {/* Footer information */}
      <footer className="footer-note">
        Phòng Thí Nghiệm Ảo Nhiệt Động Lực Học — Chu trình động cơ Carnot lý tưởng (Nén & Giãn nở thuận nghịch của khí lý tưởng)
      </footer>
    </div>
  );
};

export default App;
