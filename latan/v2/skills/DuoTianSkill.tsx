import React, { useEffect, useRef, useState } from 'react';

const BASE = 1920;
const CENTER = 960;

// 黑內場尺寸（跟你現在 BlackArena 一致）
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

// 奪天雷射方向（右下）
const LASER_END = { x: 1600, y: 1600 };

export const DuoTianSkill: React.FC = () => {
  const [time, setTime] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      setTime(t => {
        const nt = t + dt;
        return nt > 2.5 ? 0 : nt; // 2.5 秒一循環
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 時序設計
  // 0.0 ~ 1.5：瞄準線
  // 1.5 ~ 2.5：正式奪天
  const isFire = time >= 1.5;

  return (
    <svg
      className="arena-svg"
      viewBox="0 0 1920 1920"
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* 背景 */}
      <rect width={BASE} height={BASE} fill="#0a0a0d" />

      {/* 黑內場正方形 */}
      <rect
        x={OFFSET}
        y={OFFSET}
        width={SQUARE_SIZE}
        height={SQUARE_SIZE}
        fill="none"
        stroke="#ff2d55"
        strokeWidth="10"
        opacity="0.25"
      />

      {/* 王 */}
      <circle cx={CENTER} cy={CENTER} r={100} fill="#ff2d55" />
      <text
        x={CENTER}
        y={CENTER + 35}
        textAnchor="middle"
        fill="#000"
        fontSize={80}
        fontWeight={900}
      >
        李
      </text>

      {/* 奪天雷射 */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={LASER_END.x}
        y2={LASER_END.y}
        stroke="#ffffff"
        strokeWidth={isFire ? 60 : 4}
        opacity={isFire ? 1 : 0.4}
        strokeDasharray={isFire ? undefined : '20,10'}
        style={{
          filter: isFire
            ? 'drop-shadow(0 0 25px white)'
            : 'none',
        }}
      />
    </svg>
  );
};
