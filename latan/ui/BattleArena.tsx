
// ui/BattleArena.tsx
import React from 'react';
import { ArenaID, Entity, GroupID } from  '../types/types';
import { ArenaState } from '../types/ArenaState';
import { flowerLocalPos, bossLocalPos, gateLocalPos } from '../world/ArenaGeometry';
import { raycastBoundaryOnly } from '../mechanics/utils/RaycastAiming';

const PX_PER_CHI = 40;
const BASE_SIZE = 1920;
const ARENA_SPACING = 480;
const RADIUS_CIRCLE_PX = 23.5 * PX_PER_CHI;
const SQUARE_SIDE_PX = 44 * PX_PER_CHI;
const BORDER_WIDTH_PX = 1.0 * PX_PER_CHI;

const PLAYER_RADIUS = 50;
const TEXT_LINE_HEIGHT = 75;
const PLAYER_NAME_FONT_SIZE = 55;
const COUNTDOWN_FONT_SIZE = 60;

const BOSS_RADIUS = 100;
const BOSS_NAME_OFFSET_Y = 40;
const BOSS_NAME_FONT_SIZE = 80;

const FAN_ANGLE_DEG = 60;
const FAN_LENGTH = 160;
const FAN_OPACITY = 0.4;
const BG_COLOR = '#0a0a0d';

interface BattleArenaProps {
  entities: Entity[];
  arenaState: ArenaState;
  groupArenaMap: Record<GroupID, ArenaID>;
  arenaConfigs: Record<ArenaID, { name: string; color: string }>;
  controlledId: number;
}

export const BattleArena = ({
  entities,
  arenaState,
  groupArenaMap,
  arenaConfigs,
  controlledId,
}: BattleArenaProps) => {
  const FAN_HALF_RAD = (FAN_ANGLE_DEG / 2) * Math.PI / 180;
  const { rays, flowers, circles, gates } = arenaState;

  return (
    <div className="arena-wrapper">
      <svg className="arena-svg" viewBox={`0 0 ${BASE_SIZE * 3 + ARENA_SPACING * 2} 2450`}>
        <defs>
          <filter id="laserGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* 白花圖騰 */}
          <symbol id="lotus-pattern" viewBox="0 0 100 100">
            <path d="M50 10 Q60 40 90 50 Q60 60 50 90 Q40 60 10 50 Q40 40 50 10" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
            <path d="M50 25 L50 75 M25 50 L75 50" stroke="currentColor" strokeWidth="2" />
          </symbol>

          {/* 黑花圖騰 */}
          <symbol id="crystal-pattern" viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" fill="none" stroke="currentColor" strokeWidth="4" />
            <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" fill="currentColor" opacity="0.6" />
            <path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="2" />
          </symbol>
        </defs>

        {(['Outer', 'White', 'Black'] as ArenaID[]).map((aid, idx) => {
          const xOffset = idx * (BASE_SIZE + ARENA_SPACING);
          const cx = BASE_SIZE / 2;
          const cy = BASE_SIZE / 2;
          const arenaColor = arenaConfigs[aid].color;
          const arenaPlayers = entities.filter(e => groupArenaMap[e.groupId] === aid);
          const boss = bossLocalPos(aid);

          return (
            <g key={aid} transform={`translate(${xOffset}, 300)`}>
              <text x={cx} y="-120" textAnchor="middle" fill={arenaColor} fontSize="110" fontWeight="900">
                {arenaConfigs[aid].name}
              </text>

              <rect width={BASE_SIZE} height={BASE_SIZE} fill={BG_COLOR} stroke="#2a2a35" strokeWidth="4" rx="20" />

              {/* 邊界背景 - 填滿效果 */}
              {(aid === 'Outer' || aid === 'Black') && (
                <rect 
                  x={(BASE_SIZE - SQUARE_SIDE_PX) / 2} 
                  y={(BASE_SIZE - SQUARE_SIDE_PX) / 2} 
                  width={SQUARE_SIDE_PX} 
                  height={SQUARE_SIDE_PX} 
                  fill={aid === 'Black' ? `${arenaColor}11` : 'none'} 
                  stroke={arenaColor} 
                  strokeWidth={BORDER_WIDTH_PX} 
                />
              )}
              {(aid === 'Outer' || aid === 'White') && (
                <circle 
                  cx={cx} cy={cy} r={RADIUS_CIRCLE_PX} 
                  fill={aid === 'White' ? `${arenaColor}11` : 'none'} 
                  stroke={arenaColor} 
                  strokeWidth={BORDER_WIDTH_PX} 
                />
              )}

              {/* 門 */}
              {(aid === 'White' || aid === 'Outer') && gates?.white?.map(gIdx => {
                const pos = gateLocalPos('white', gIdx);
                return <circle key={`gw-${gIdx}`} cx={pos.x} cy={pos.y} r="100" fill="none" stroke="#ffffff" strokeWidth="20" opacity="0.8" />;
              })}
              {(aid === 'Black' || aid === 'Outer') && gates?.purple?.map(gIdx => {
                const pos = gateLocalPos('purple', gIdx);
                return <rect key={`gp-${gIdx}`} x={pos.x-90} y={pos.y-90} width="180" height="180" fill="none" stroke="#ff2d55" strokeWidth="20" opacity="0.8" />;
              })}

              {/* 射線渲染 */}
              {Array.isArray(rays) && rays.filter(r => r.arenaId === aid).map((r, i) => {
                let pointsStr = r.points.map(p => `${p.x},${p.y}`).join(' ');
                const isGuide = (r.width || 16) <= 15;
                return (
                  <polyline 
                    key={`ray-${r.id || i}`} 
                    points={pointsStr} 
                    fill="none" 
                    stroke={r.color || '#ffffff'} 
                    strokeWidth={r.width || 16} 
                    opacity={r.opacity || 1}
                    strokeDasharray={isGuide ? "40,20" : "none"}
                    filter="url(#laserGlow)" 
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })}

              {/* 危險圓圈 */}
              {circles?.filter(c => c.arenaId === aid).map((c, i) => (
                <g key={c.id || i} transform={`translate(${c.pos.x}, ${c.pos.y})`}>
                   <circle r={c.maxRadius} fill="none" stroke={c.color} strokeWidth="4" opacity={c.opacity * 0.4} />
                   <circle r={c.maxRadius * c.fillProgress} fill={c.color} opacity={c.opacity * (0.3 + 0.5 * c.fillProgress)} />
                </g>
              ))}

              {/* 花朵圖騰 */}
              {aid === 'White' && flowers.white.visible && (
                <g transform={`translate(${flowerLocalPos('White', arenaState)?.x! - 100}, ${flowerLocalPos('White', arenaState)?.y! - 100})`}>
                  <use href="#lotus-pattern" width="200" height="200" color="#00f2ff" />
                </g>
              )}
              {aid === 'Black' && flowers.black.visible && (
                <g transform={`translate(${flowerLocalPos('Black', arenaState)?.x! - 100}, ${flowerLocalPos('Black', arenaState)?.y! - 100})`}>
                  <use href="#crystal-pattern" width="200" height="200" color="#ff2d55" />
                </g>
              )}

              <circle cx={boss.x} cy={boss.y} r={BOSS_RADIUS} fill="#9d4edd" stroke="#fff" strokeWidth="4" />
              <text x={boss.x} y={boss.y + BOSS_NAME_OFFSET_Y} textAnchor="middle" fill="#fff" fontSize={BOSS_NAME_FONT_SIZE} fontWeight="bold">李</text>

              {/* 玩家與其狀態 */}
              {arenaPlayers.map(e => {
                const showAim = e.aimingTimer > 0;
                const showTarget = e.targetTimer > 0;
                let currentY = -80;
                return (
                  <g key={e.id} transform={`translate(${e.pos.x}, ${e.pos.y})`}>
                    <circle r={PLAYER_RADIUS} fill={e.color} stroke={e.id === controlledId ? '#00ffd5' : 'none'} strokeWidth="6" />
                    <text y={currentY} textAnchor="middle" fill="#fff" fontSize={PLAYER_NAME_FONT_SIZE} fontWeight="bold" style={{ textShadow: '3px 3px 5px #000' }}>{e.name}</text>
                    
                    {showAim && (
                      <text 
                        y={currentY -= TEXT_LINE_HEIGHT} 
                        textAnchor="middle" 
                        fill="#00f2ff" 
                        fontSize={COUNTDOWN_FONT_SIZE} 
                        fontWeight="bold" 
                        style={{ textShadow: '0 0 10px #000, 0 0 5px #00f2ff' }}
                      >
                        開鏡 {e.aimingTimer.toFixed(1)}s
                      </text>
                    )}
                    {showTarget && (
                      <text 
                        y={currentY -= TEXT_LINE_HEIGHT} 
                        textAnchor="middle" 
                        fill="#ff4d4d" 
                        fontSize={COUNTDOWN_FONT_SIZE} 
                        fontWeight="bold" 
                        style={{ textShadow: '0 0 10px #000, 0 0 5px #ff4d4d' }}
                      >
                        點名 {e.targetTimer.toFixed(1)}s
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
