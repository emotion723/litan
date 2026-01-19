
import React from 'react';

const BASE = 1920;
const CENTER = 960;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

export const BlackArena = () => {
  return (
    <svg className="arena-svg" viewBox="0 0 1920 1920" style={{ display: 'block' }}>
      <rect width="1920" height="1920" fill="#0a0a0d" />

      {/* 正方形邊界 */}
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

      {/* 王 (李倓) */}
      <circle cx={CENTER} cy={CENTER} r="100" fill="#ff2d55" stroke="white" strokeWidth="4" />
      <text x={CENTER} y={CENTER + 35} textAnchor="middle" fill="white" fontSize="80" fontWeight="900">
        李
      </text>
    </svg>
  );
};
