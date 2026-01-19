
import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const ARENA_SIZE = 1760;
const OFFSET = (BASE - ARENA_SIZE) / 2;
const FLOWER_RADIUS = (ARENA_SIZE * 0.7) / 2; // 616px

const PLAYER_NAMES = [
"悲歡", "阿寧", "盆醬", "CJ",
"婪肆", "峻峻", "段考", "芯羽"

];

/** 判定座標所屬象限 (0:左上, 1:右上, 2:右下, 3:左下) */
function getQuadrant(x: number, y: number) {
  if (x <= CENTER && y <= CENTER) return 0;
  if (x > CENTER && y <= CENTER) return 1;
  if (x > CENTER && y > CENTER) return 2;
  return 3;
}

/** 計算兩角度差值 (弧度) */
function getAngleDiff(a1: number, a2: number) {
  let diff = Math.abs(a1 - a2);
  while (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
}

/** 計算點到直線段的最短距離 */
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
  return Math.hypot(px - xx, py - yy);
}

export const DuoTian2_Black = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => {
        let nt = t + dt;
        if (nt >= 12) return 12;
        return nt;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const data = useMemo(() => {
    const corners = [
      { id: 0, x: OFFSET + 120, y: OFFSET + 120 },
      { id: 1, x: BASE - OFFSET - 120, y: OFFSET + 120 },
      { id: 2, x: BASE - OFFSET - 120, y: BASE - OFFSET - 120 },
      { id: 3, x: OFFSET + 120, y: BASE - OFFSET - 120 }
    ];
    const gatePos = corners[Math.floor(Math.random() * 4)];
    const gateAngle = Math.atan2(gatePos.y - CENTER, gatePos.x - CENTER);

    const flowerAngle = Math.random() * Math.PI * 2;
    const flowerPos = {
      x: CENTER + Math.cos(flowerAngle) * FLOWER_RADIUS,
      y: CENTER + Math.sin(flowerAngle) * FLOWER_RADIUS
    };

    const angleDiff = getAngleDiff(flowerAngle, gateAngle);
    const flowerQuad = getQuadrant(flowerPos.x, flowerPos.y);
    const gateQuad = getQuadrant(gatePos.x, gatePos.y);
    const sameQuad = (flowerQuad === gateQuad);
    const isDirectZero = angleDiff < (20 * Math.PI / 180);
    const isDirectPI = angleDiff > (160 * Math.PI / 180);
    
    let pathType: 'DIRECT_REVERSE' | 'DIRECT_NORMAL' | 'REFRACT_1' | 'REFRACT_2';
    if (isDirectZero && sameQuad) {
      pathType = 'DIRECT_REVERSE';
    } else if (isDirectPI && !sameQuad) {
      pathType = 'DIRECT_NORMAL';
    } else {
      pathType = sameQuad ? 'REFRACT_1' : 'REFRACT_2';
    }

    const p1Idx = Math.floor(Math.random() * 8);
    let p2Idx = -1;
    let p3Idx = -1;

    if (pathType === 'REFRACT_1') {
      p2Idx = (p1Idx === 0) ? 2 : 0;
    } else if (pathType === 'REFRACT_2') {
      p2Idx = (p1Idx === 0) ? 2 : 0;
      p3Idx = (p1Idx === 1) ? 2 : 1;
    }

    const p1Dest = {
      x: CENTER + Math.cos(flowerAngle) * (FLOWER_RADIUS + 120),
      y: CENTER + Math.sin(flowerAngle) * (FLOWER_RADIUS + 120)
    };
    const p2DestBase = {
      x: CENTER + Math.cos(flowerAngle + Math.PI) * 180,
      y: CENTER + Math.sin(flowerAngle + Math.PI) * 180
    };
    const p3DestBase = {
      x: CENTER + Math.cos(gateAngle + Math.PI) * 180,
      y: CENTER + Math.sin(gateAngle + Math.PI) * 180
    };

    let finalP1Dest = p1Dest;
    if (pathType === 'DIRECT_REVERSE') {
      finalP1Dest = p2DestBase;
    }

    const pathPoints = [ { x: CENTER, y: CENTER }, finalP1Dest ];
    if (pathType !== 'DIRECT_REVERSE' && pathType !== 'DIRECT_NORMAL') {
      if (p2Idx !== -1) pathPoints.push(p2DestBase);
      if (p3Idx !== -1) pathPoints.push(p3DestBase);
    }
    pathPoints.push(gatePos);

    const players = PLAYER_NAMES.map((name, i) => {
      const startPos = {
        x: OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS),
        y: OFFSET + PLAYER_RADIUS + Math.random() * (ARENA_SIZE - 2 * PLAYER_RADIUS)
      };
      
      let scatterPos = { x: 0, y: 0 };
      if (i === p1Idx) scatterPos = { ...finalP1Dest };
      else if (i === p2Idx) scatterPos = { ...p2DestBase };
      else if (i === p3Idx) scatterPos = { ...p3DestBase };
      else {
        let found = false, attempts = 0;
        while (!found && attempts < 200) {
          const rx = OFFSET + 150 + Math.random() * (ARENA_SIZE - 300);
          const ry = OFFSET + 150 + Math.random() * (ARENA_SIZE - 300);
          let tooClose = false;
          for (let j = 0; j < pathPoints.length - 1; j++) {
            const d = getPointToLineDist(rx, ry, pathPoints[j].x, pathPoints[j].y, pathPoints[j+1].x, pathPoints[j+1].y);
            if (d < 180) { tooClose = true; break; }
          }
          if (Math.hypot(rx - CENTER, ry - CENTER) < 250) tooClose = true;
          if (Math.hypot(rx - flowerPos.x, ry - flowerPos.y) < 250) tooClose = true;
          if (!tooClose) { scatterPos = { x: rx, y: ry }; found = true; }
          attempts++;
        }
        if (!found) scatterPos = { x: OFFSET + 200, y: OFFSET + 200 };
      }
      return { id: i, name, startPos, scatterPos };
    });

    return { gatePos, flowerPos, players, p1Idx, p2Idx, p3Idx, pathType, finalP1Dest, p2DestBase, p3DestBase, pathPoints };
  }, []);

  const playersState = useMemo(() => {
    return data.players.map((p, i) => {
      const isP1 = i === data.p1Idx;
      const isP2 = i === data.p2Idx;
      const isP3 = i === data.p3Idx;
      let pos = { ...p.startPos }, angle = 0;

      if (time < 3) pos = p.startPos;
      else if (time < 5) {
        const prg = (time - 3) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        pos = { x: p.startPos.x + (p.scatterPos.x - p.startPos.x) * ease, y: p.startPos.y + (p.scatterPos.y - p.startPos.y) * ease };
        angle = Math.atan2(p.scatterPos.y - p.startPos.y, p.scatterPos.x - p.startPos.x);
      } else {
        pos = p.scatterPos;
        if (isP1) {
          const target = (data.pathType === 'DIRECT_REVERSE') ? { x: CENTER, y: CENTER } : 
                         (data.p2Idx !== -1) ? data.p2DestBase : data.gatePos;
          angle = Math.atan2(target.y - pos.y, target.x - pos.x);
        } else if (isP2) {
          const target = (data.p3Idx !== -1) ? data.p3DestBase : data.gatePos;
          angle = Math.atan2(target.y - pos.y, target.x - pos.x);
        } else if (isP3) {
          angle = Math.atan2(data.gatePos.y - pos.y, data.gatePos.x - pos.x);
        } else angle = Math.atan2(pos.y - CENTER, pos.x - CENTER);
      }
      return { ...p, pos, angle };
    });
  }, [time, data]);

  const p1 = playersState[data.p1Idx];
  const p2 = data.p2Idx !== -1 ? playersState[data.p2Idx] : null;
  const p3 = data.p3Idx !== -1 ? playersState[data.p3Idx] : null;

  const fanPath = useMemo(() => {
    const r = 280;
    const halfAng = Math.PI / 6; 
    const x1 = Math.cos(-halfAng) * r;
    const y1 = Math.sin(-halfAng) * r;
    const x2 = Math.cos(halfAng) * r;
    const y2 = Math.sin(halfAng) * r;
    return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  }, []);

  const flowerPetals = useMemo(() => {
    if (time < 9 || time >= 11) return null;
    const progress = Math.min(1, (time - 9) / 0.8);
    const dist = progress * 250;
    const opacity = time < 10.5 ? 1 : Math.max(0, 1 - (time - 10.5) * 2);
    const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
    return angles.map((ang, i) => (
      <circle key={i} cx={data.flowerPos.x + Math.cos(ang) * dist} cy={data.flowerPos.y + Math.sin(ang) * dist} r={25} fill="#b829ff" stroke="white" strokeWidth="2" opacity={opacity} filter="drop-shadow(0 0 12px #b829ff)" />
    ));
  }, [time, data.flowerPos]);

  const rayClass = time < 11 ? "ray-directional" : "";

  // 渲染白色矩形預警線
  const renderGuideRects = () => {
    const rects = [];
    for (let i = 0; i < data.pathPoints.length - 1; i++) {
      const pStart = data.pathPoints[i];
      const pEnd = data.pathPoints[i + 1];
      const dist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
      const angleDeg = (Math.atan2(pEnd.y - pStart.y, pEnd.x - pStart.x) * 180) / Math.PI;
      
      rects.push(
        <g key={`guide-rect-${i}`} transform={`translate(${pStart.x}, ${pStart.y}) rotate(${angleDeg})`}>
          <rect x="0" y="-30" width={dist} height="60" fill="white" opacity="0.15" />
        </g>
      );
    }
    return rects;
  };

  return (
    <svg className="arena-svg" viewBox={`0 0 ${BASE} ${BASE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes rayFlow { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        .ray-directional { stroke-dasharray: 60 30; animation: rayFlow 1s linear infinite; }
        .purple-gate { animation: gatePulse 2s infinite ease-in-out; }
        @keyframes gatePulse { 0% { opacity: 0.6; stroke-width: 10; } 50% { opacity: 1; stroke-width: 15; } 100% { opacity: 0.6; stroke-width: 10; } }
      `}</style>
      <defs>
        <filter id="laserGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feFlood floodColor="white" floodOpacity="0.9" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={BASE} height={BASE} fill="#0a0a0d" />
      <rect x={OFFSET} y={OFFSET} width={ARENA_SIZE} height={ARENA_SIZE} fill="none" stroke="#ff2d55" strokeWidth="10" opacity="0.25" />

      <g transform={`translate(${data.gatePos.x}, ${data.gatePos.y})`}>
        <rect x="-90" y="-90" width="180" height="180" fill="rgba(184, 41, 255, 0.1)" stroke="#b829ff" strokeWidth="10" rx="20" className="purple-gate" />
        <text y="5" textAnchor="middle" fill="#b829ff" fontSize="32" fontWeight="bold">霸道之門</text>
      </g>

      {time >= 1 && (
        <g transform={`translate(${data.flowerPos.x}, ${data.flowerPos.y})`}>
          <rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" fill="none" stroke="#ff2d55" strokeWidth="4" />
          <text y="75" textAnchor="middle" fill="#ff2d55" fontSize="28" fontWeight="bold">黑花</text>
          {time >= 9 && time < 10 && (
            <circle r={80 + (time - 9) * 800} fill="none" stroke="white" strokeWidth="15" opacity={1 - (time - 9)} />
          )}
        </g>
      )}

      {flowerPetals}

      {/* 矩形射線輔助與指引虛線 (6s-8s) */}
      {time >= 6 && time < 8 && (
        <g opacity="0.4">
          {renderGuideRects()}
          {/* 指引虛線 */}
          {data.pathPoints.map((p, i) => i < data.pathPoints.length - 1 && (
            <line key={`guide-line-${i}`} x1={p.x} y1={p.y} x2={data.pathPoints[i+1].x} y2={data.pathPoints[i+1].y} stroke="white" strokeWidth="4" strokeDasharray="15,10" />
          ))}
        </g>
      )}

      {/* 階段 1：王 -> P1 (8-9s) */}
      {time >= 8 && (
        <line x1={CENTER} y1={CENTER} x2={p1.pos.x} y2={p1.pos.y} stroke="white" strokeWidth="60" filter="url(#laserGlow)" className={time < 11 ? "ray-directional" : ""} />
      )}
      
      {/* 階段 2：反射啟動 (9s 之後永久保留) */}
      {time >= 9 && (
        <g>
          {data.pathType === 'DIRECT_REVERSE' || data.pathType === 'DIRECT_NORMAL' ? (
            <line x1={p1.pos.x} y1={p1.pos.y} x2={data.gatePos.x} y2={data.gatePos.y} stroke="white" strokeWidth="60" filter="url(#laserGlow)" className={rayClass} />
          ) : (
            <>
              <line x1={p1.pos.x} y1={p1.pos.y} x2={p2 ? p2.pos.x : data.gatePos.x} y2={p2 ? p2.pos.y : data.gatePos.y} stroke="white" strokeWidth="60" filter="url(#laserGlow)" className={rayClass} />
              {p2 && <line x1={p2.pos.x} y1={p2.pos.y} x2={p3 ? p3.pos.x : data.gatePos.x} y2={p3 ? p3.pos.y : data.gatePos.y} stroke="white" strokeWidth="60" filter="url(#laserGlow)" className={rayClass} />}
              {p3 && <line x1={p3.pos.x} y1={p3.pos.y} x2={data.gatePos.x} y2={data.gatePos.y} stroke="white" strokeWidth="60" filter="url(#laserGlow)" className={rayClass} />}
            </>
          )}
        </g>
      )}

      {/* 角色 */}
      {playersState.map((p, i) => {
        const isTarget = i === data.p1Idx;
        const isCoreMember = (i === 0 || i === 1 || i === 2);
        const color = (isTarget && time >= 1) ? "#ffd700" : (isCoreMember ? "#b829ff" : "#444");
        const label = i === data.p2Idx ? "1號" : (i === data.p3Idx ? "2號" : (isTarget && time >= 1 ? "被點名" : ""));
        return (
          <g key={i} transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            {isTarget && time >= 5 && time < 9 && (
              <path d={fanPath} fill="rgba(255, 215, 0, 0.25)" stroke="#ffd700" strokeWidth="3" opacity={0.7} />
            )}
            <circle r={PLAYER_RADIUS} fill={color} stroke="white" strokeWidth="3" />
            <text y="-55" transform={`rotate(${-p.angle * 180 / Math.PI})`} textAnchor="middle" fill={color === "#444" ? "white" : color} fontSize="26" fontWeight="bold">{label ? `[${label}] ` : ""}{p.name}</text>
            <line x1="0" y1="0" x2="65" y2="0" stroke="white" strokeWidth="2" />
          </g>
        );
      })}

      <circle cx={CENTER} cy={CENTER} r={BOSS_RADIUS} fill="#ff2d55" stroke="white" strokeWidth="4" />
      <text x={CENTER} y={CENTER + 35} textAnchor="middle" fill="white" fontSize="80" fontWeight="900">李</text>
    </svg>
  );
};
