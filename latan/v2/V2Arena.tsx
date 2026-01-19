
// v2/V2Arena.tsx
import React from 'react';
import { ArenaID } from '../types/types';
import { ARENA_CONFIGS } from '../data/timelineData';
import { bossLocalPos } from '../world/ArenaGeometry';

const SIZE = 1920;
const CIRCLE_R = 940;
const SQUARE = 1760;

interface Props {
  arenaId: ArenaID;
}

/** 
 * V2 靜態場地基礎元件。
 * 在「未播放技能」或「剛切換場地」時顯示。
 */
export const V2ArenaBase: React.FC<Props> = ({ arenaId }) => {
  const config = ARENA_CONFIGS[arenaId] || { color: '#ffffff', name: '未知' };
  const boss = bossLocalPos(arenaId);

  return (
    <svg className="arena-svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <defs>
        <filter id="baseGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 背景填充 */}
      <rect width={SIZE} height={SIZE} fill="#0a0a0d" />

      {/* 場地標題 */}
      <text 
        x={SIZE/2} y="150" 
        textAnchor="middle" 
        fill={config.color} 
        fontSize="100" 
        fontWeight="900" 
        opacity="0.8"
        style={{ letterSpacing: '8px' }}
      >
        {config.name}
      </text>

      {/* 場地邊界線 */}
      <g opacity="0.4">
        {arenaId === 'White' ? (
          <circle cx={SIZE/2} cy={SIZE/2} r={CIRCLE_R} fill="none" stroke={config.color} strokeWidth="20" />
        ) : (
          <rect 
            x={(SIZE-SQUARE)/2} y={(SIZE-SQUARE)/2} 
            width={SQUARE} height={SQUARE} 
            fill="none" stroke={config.color} strokeWidth="20" 
          />
        )}
      </g>

      {/* 中心李倓 (王) */}
      <g filter="url(#baseGlow)">
        <circle cx={boss.x} cy={boss.y} r="100" fill={config.color} opacity="0.9" />
        <text 
          x={boss.x} y={boss.y + 35} 
          textAnchor="middle" 
          fontSize="90" 
          fill="#000" 
          fontWeight="900"
        >
          李
        </text>
      </g>
    </svg>
  );
};
