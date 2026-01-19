
import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const ARENA_SIZE = 1760;
const OFFSET = (BASE - ARENA_SIZE) / 2;
const FLOWER_RADIUS = (ARENA_SIZE * 0.75) / 2; // 660px

const PLAYER_NAMES = [
  "耘夏", "繁花", "怪獸", "果果",
  "TT", "小夜", "無名", "芊芊"
];

function getPointToLineDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = x1; yy = y1;
  } else if (param > 1) {
    xx = x2; yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export const DuoTian1_Black = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => {
        let nt = t + dt;
        // 到達 12 秒後停止，不再循環
        if (nt >= 12) return 12;
        return nt;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const data = useMemo(() => {
    const flowerAngle = Math.random() * Math.PI * 2;
    const flowerPos = {
      x: CENTER + Math.cos(flowerAngle) * FLOWER_RADIUS,
      y: CENTER + Math.sin(flowerAngle) * FLOWER_RADIUS
    };
    const targetDest = {
      x: flowerPos.x + Math.cos(flowerAngle) * 80,
      y: flowerPos.y + Math.sin(flowerAngle) * 80
    };
    const targetIdx = Math.floor(Math.random() * 8);

    const players = PLAYER_NAMES.map((name, i) => {
      const startPos = {
        x: OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS),
        y: OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS)
      };
      let scatterPos = { x: 0, y: 0 };
      if (i === targetIdx) {
        scatterPos = { ...targetDest };
      } else {
        let found = false, attempts = 0;
        while (!found && attempts < 100) {
          const rx = OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS);
          const ry = OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS);
          const dist = getPointToLineDist(rx, ry, CENTER, CENTER, targetDest.x, targetDest.y);
          if (dist > 250 && Math.hypot(rx - targetDest.x, ry - targetDest.y) > 180) {
            scatterPos = { x: rx, y: ry };
            found = true;
          }
          attempts++;
        }
        if (!found) scatterPos = { x: OFFSET + 100, y: OFFSET + 100 };
      }
      return { id: i, name, startPos, scatterPos };
    });
    return { flowerAngle, flowerPos, players, targetIdx, targetDest };
  }, []);

  const playersState = useMemo(() => {
    return data.players.map((p, i) => {
      const isTarget = i === data.targetIdx;
      let pos = { ...p.startPos }, angle = 0;
      if (time < 3) pos = p.startPos;
      else if (time < 5) {
        const prg = (time - 3) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        pos = { x: p.startPos.x + (p.scatterPos.x - p.startPos.x) * ease, y: p.startPos.y + (p.scatterPos.y - p.startPos.y) * ease };
        angle = Math.atan2(p.scatterPos.y - p.startPos.y, p.scatterPos.x - p.startPos.x);
      } else {
        pos = p.scatterPos;
        angle = isTarget ? Math.atan2(CENTER - pos.y, CENTER - pos.x) : Math.atan2(pos.y - CENTER, pos.x - CENTER);
      }
      return { ...p, pos, angle };
    });
  }, [time, data]);

  const targetPlayer = playersState[data.targetIdx];
  const reflectAngle = Math.atan2(CENTER - targetPlayer.pos.y, CENTER - targetPlayer.pos.x);
  const reflectEnd = {
    x: targetPlayer.pos.x + Math.cos(reflectAngle) * 3000,
    y: targetPlayer.pos.y + Math.sin(reflectAngle) * 3000
  };

  const fanPath = useMemo(() => {
    const r = 280, halfAng = Math.PI / 6;
    return `M 0 0 L ${Math.cos(-halfAng) * r} ${Math.sin(-halfAng) * r} A ${r} ${r} 0 0 1 ${Math.cos(halfAng) * r} ${Math.sin(halfAng) * r} Z`;
  }, []);

  const petals = useMemo(() => {
    if (time < 9 || time >= 12) return null;
    const dist = time < 10 ? (time - 9) * 250 : 250;
    const opacity = time < 11.5 ? 1 : Math.max(0, 1 - (time - 11.5) * 2);
    const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
    return angles.map((ang, i) => (
      <circle key={i} cx={data.flowerPos.x + Math.cos(ang + 9 * 2) * dist} cy={data.flowerPos.y + Math.sin(ang + 9 * 2) * dist} r={15} fill="#b829ff" opacity={opacity} filter="drop-shadow(0 0 8px #b829ff)" />
    ));
  }, [time, data.flowerPos]);

  return (
    <svg className="arena-svg" viewBox={`0 0 ${BASE} ${BASE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes rayFlow { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        .ray-directional { stroke-dasharray: 60 30; animation: rayFlow 1s linear infinite; }
      `}</style>
      <defs>
        <filter id="laserGlowEffect" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feFlood floodColor="white" floodOpacity="0.9" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={BASE} height={BASE} fill="#0a0a0d" />
      <rect x={OFFSET} y={OFFSET} width={ARENA_SIZE} height={ARENA_SIZE} fill="none" stroke="#ff2d55" strokeWidth="10" opacity="0.25" />
      {time >= 2 && time < 9 && <text x={CENTER} y="150" textAnchor="middle" fill="#ffd700" fontSize="80" fontWeight="900" style={{ textShadow: '0 0 20px rgba(0,0,0,1)' }}>奪天倒數: {Math.max(0, 9 - time).toFixed(1)}s</text>}
      {time >= 1 && time < 12 && (
        <g transform={`translate(${data.flowerPos.x}, ${data.flowerPos.y})`}>
          <rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" fill="none" stroke="#ff2d55" strokeWidth="4" />
          <text y="75" textAnchor="middle" fill="#ff2d55" fontSize="28" fontWeight="bold">黑花</text>
          {time >= 9 && time < 10 && <circle r={80 + (time - 9) * 600} fill="none" stroke="white" strokeWidth="15" opacity={1 - (time - 9)} />}
        </g>
      )}
      {petals}
      {time >= 6 && time < 8 && (
        <g transform={`translate(${targetPlayer.pos.x}, ${targetPlayer.pos.y}) rotate(${(targetPlayer.angle * 180) / Math.PI})`}><rect x="0" y="-30" width="2000" height="60" fill="white" opacity="0.15" stroke="white" strokeWidth="1" strokeDasharray="15,10" /></g>
      )}
      {time >= 8 && time < 9 && <line x1={CENTER} y1={CENTER} x2={targetPlayer.pos.x} y2={targetPlayer.pos.y} stroke="white" strokeWidth="60" filter="url(#laserGlowEffect)" strokeLinecap="round" className="ray-directional" />}
      {time >= 9 && <line x1={targetPlayer.pos.x} y1={targetPlayer.pos.y} x2={reflectEnd.x} y2={reflectEnd.y} stroke="white" strokeWidth="60" filter="url(#laserGlowEffect)" strokeLinecap="round" className={time < 12 ? "ray-directional" : ""} opacity={1} />}
      {playersState.map((p, i) => {
        const isTarget = i === data.targetIdx;
        const color = isTarget ? "#ffd700" : "#444";
        return (
          <g key={i} transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            {isTarget && time >= 5 && time < 9 && <path d={fanPath} fill="rgba(255, 215, 0, 0.25)" stroke="#ffd700" strokeWidth="3" opacity={0.7} />}
            <circle r={PLAYER_RADIUS} fill={color} stroke="white" strokeWidth="3" />
            <text y="-55" transform={`rotate(${-p.angle * 180 / Math.PI})`} textAnchor="middle" fill={isTarget ? "#ffd700" : "white"} fontSize="26" fontWeight="bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{(isTarget && time >= 1 && time < 12) ? `[被點名] ${p.name}` : p.name}</text>
            <line x1="0" y1="0" x2="65" y2="0" stroke="white" strokeWidth="2" />
          </g>
        );
      })}
      <circle cx={CENTER} cy={CENTER} r={BOSS_RADIUS} fill="#ff2d55" stroke="white" strokeWidth="4" /><text x={CENTER} y={CENTER + 35} textAnchor="middle" fill="white" fontSize="80" fontWeight="900">李</text>
    </svg>
  );
};
