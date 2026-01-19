import React from 'react';

const BASE = 1920;
const CENTER = 960;
const CIRCLE_R = 940;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

export const OuterArena = () => (
  <svg className="arena-svg" viewBox="0 0 1920 1920">
    {/* 背景 */}
    <rect width="1920" height="1920" fill="#0a0a0d" />

    {/* 正方形邊界（先畫） */}
    <rect
      x={OFFSET}
      y={OFFSET}
      width={SQUARE_SIZE}
      height={SQUARE_SIZE}
      fill="none"
      stroke="#f9ff00"
      strokeWidth="10"
      opacity="0.25"
    />

    {/* 圓形主場地（後畫，蓋住中段線） */}
    <circle
      cx={CENTER}
      cy={CENTER}
      r={CIRCLE_R}
      fill="#0a0a0d"
      stroke="#f9ff00"
      strokeWidth="10"
      opacity="1"
    />

    {/* 王 */}
    <circle cx={CENTER} cy={CENTER} r="100" fill="#f9ff00" />
    <text
      x={CENTER}
      y={CENTER + 35}
      textAnchor="middle"
      fill="#000"
      fontSize="80"
      fontWeight="900"
    >
      李
    </text>
  </svg>
);
