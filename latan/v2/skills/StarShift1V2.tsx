
import React, { useState, useEffect, useMemo } from 'react';

const CENTER = 960;

export const StarShift1V2: React.FC = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => (t + dt >= 8 ? 0 : t + dt));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const pathPoints = useMemo(() => {
    // 模擬白場與黑場門的位置
    const wGate = { x: CENTER, y: 100 };
    const pGate = { x: CENTER, y: 1820 };
    
    const wLine = [
      { x: CENTER, y: CENTER },
      { x: CENTER - 200, y: CENTER - 200 },
      { x: CENTER - 200, y: CENTER - 400 },
      { x: CENTER, y: CENTER - 600 },
      wGate
    ];
    const pLine = [
      { x: CENTER, y: CENTER },
      { x: CENTER + 200, y: CENTER + 200 },
      { x: CENTER + 200, y: CENTER + 400 },
      { x: CENTER, y: CENTER + 600 },
      pGate
    ];
    return { wLine, pLine };
  }, []);

  const isFiring = time > 5 && time < 7;
  const isAiming = time > 3 && time <= 5;

  const renderLine = (points: {x:number, y:number}[], color: string) => {
    const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    return (
      <path 
        d={d} fill="none" 
        stroke={color} 
        strokeWidth={isFiring ? 25 : 4} 
        strokeDasharray={isAiming ? "15,10" : "none"}
        opacity={isAiming || isFiring ? 1 : 0}
        style={{ transition: 'opacity 0.2s' }}
      />
    );
  };

  return (
    <svg viewBox="0 0 1920 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {renderLine(pathPoints.wLine, '#00f2ff')}
      {renderLine(pathPoints.pLine, '#ff2d55')}
      {/* 渲染參與者 */}
      {[...pathPoints.wLine, ...pathPoints.pLine].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="30" fill="#f9ff00" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
};
