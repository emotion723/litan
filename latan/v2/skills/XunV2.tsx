
import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const CIRCLE_R = 940;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;
const SQUARE_HALF = SQUARE_SIZE / 2;

export const XunV2: React.FC = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => (t + dt >= 6 ? 0 : t + dt));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const participants = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const angle = (i * 40 * Math.PI) / 180;
      const endDist = SQUARE_HALF * 0.95;
      return {
        id: i,
        angle,
        endPos: {
          x: CENTER + Math.cos(angle) * endDist,
          y: CENTER + Math.sin(angle) * endDist
        }
      };
    });
  }, []);

  const renderRays = () => {
    if (time < 2) return null;
    if (time < 3) {
      return participants.map(p => (
        <line key={`burst1-${p.id}`} x1={CENTER} y1={CENTER} x2={p.endPos.x} y2={p.endPos.y} stroke="#ff2d55" strokeWidth="80" opacity="0.5" />
      ));
    }
    if (time < 5) {
      return participants.map(p => {
        const fireAngle = p.angle + Math.PI + (Math.PI / 6);
        return (
          <line key={`burst2-${p.id}`} x1={p.endPos.x} y1={p.endPos.y} x2={p.endPos.x + Math.cos(fireAngle) * 3000} y2={p.endPos.y + Math.sin(fireAngle) * 3000} stroke="#ff2d55" strokeWidth="80" opacity="0.7" />
        );
      });
    }
    return null;
  };

  return (
    <svg viewBox="0 0 1920 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* 背景線條：同步 OuterArena.tsx */}
      <rect x={OFFSET} y={OFFSET} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="none" stroke="#f9ff00" strokeWidth="10" opacity="0.25" />
      <circle cx={CENTER} cy={CENTER} r={CIRCLE_R} fill="#0a0a0d" stroke="#f9ff00" strokeWidth="10" opacity="1" />

      {renderRays()}
      {participants.map(p => {
        let currentPos = { x: CENTER, y: CENTER };
        if (time < 2) {
          const prg = time / 2;
          const ease = 1 - Math.pow(1 - prg, 3);
          currentPos = { x: CENTER + (p.endPos.x - CENTER) * ease, y: CENTER + (p.endPos.y - CENTER) * ease };
        } else currentPos = p.endPos;
        return (
          <g key={p.id} transform={`translate(${currentPos.x}, ${currentPos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            <circle r="40" fill="#f9ff00" stroke="white" strokeWidth="3" />
            <line x1="0" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
};
