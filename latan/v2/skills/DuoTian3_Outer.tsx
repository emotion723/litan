
import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const CIRCLE_R = 940;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

const PLAYER_NAMES = ['夢夢', '衡橙', '思夜', '曦曦','耘夏', '繁花', '怪獸', '果果'];

export const DuoTian3_Outer = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => (t + dt >= 12 ? 12 : t + dt));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const data = useMemo(() => {
    const purpleCorners = [
      { id: 'TL', x: OFFSET + 120, y: OFFSET + 120, ang: -135 },
      { id: 'TR', x: BASE - OFFSET - 120, y: OFFSET + 120, ang: -45 },
      { id: 'BR', x: BASE - OFFSET - 120, y: BASE - OFFSET - 120, ang: 45 },
      { id: 'BL', x: OFFSET + 120, y: BASE - OFFSET - 120, ang: 135 },
    ];
    const pGate = purpleCorners[Math.floor(Math.random() * 4)];
    const pGateAngRad = (pGate.ang * Math.PI) / 180;

    const cardinalPoints = [
      { name: 'Top', ang: -90, x: CENTER, y: CENTER - CIRCLE_R },
      { name: 'Right', ang: 0, x: CENTER + CIRCLE_R, y: CENTER },
      { name: 'Bottom', ang: 90, x: CENTER, y: CENTER + CIRCLE_R },
      { name: 'Left', ang: 180, x: CENTER - CIRCLE_R, y: CENTER },
    ];
    const wGate = cardinalPoints[Math.floor(Math.random() * 4)];
    const wGateAngRad = (wGate.ang * Math.PI) / 180;

    let angDiff = wGateAngRad - pGateAngRad;
    while (angDiff > Math.PI) angDiff -= Math.PI * 2;
    while (angDiff < -Math.PI) angDiff += Math.PI * 2;
    const absDiffDeg = Math.round(Math.abs(angDiff) * 180 / Math.PI);
    const whiteOnRight = angDiff > 0;

    const p1Dest = {
      x: CENTER + Math.cos(pGateAngRad) * 260,
      y: CENTER + Math.sin(pGateAngRad) * 260
    };

    const p2Offset = (whiteOnRight ? -25 : 25) * (Math.PI / 180);
    const p2Ang = pGateAngRad + p2Offset;
    const p2Dest = {
      x: CENTER + Math.cos(p2Ang) * 420,
      y: CENTER + Math.sin(p2Ang) * 420
    };

    const p3Ang = p2Ang + Math.PI;
    const p3Dest = {
      x: CENTER + Math.cos(p3Ang) * 250,
      y: CENTER + Math.sin(p3Ang) * 250
    };

    const p4Ang = pGateAngRad - p2Offset;
    const p4Dest = {
      x: CENTER + Math.cos(p4Ang) * 580,
      y: CENTER + Math.sin(p4Ang) * 580
    };

    const needsP5 = absDiffDeg <= 65; 
    let p5Dest = null;
    if (needsP5) {
        const angP4ToW = Math.atan2(
          wGate.y - p4Dest.y,
          wGate.x - p4Dest.x
        );

        // P3 → P4 的方向
        const angP3ToP4 = Math.atan2(
          p4Dest.y - p3Dest.y,
          p4Dest.x - p3Dest.x
        );

        // 在兩者之間取中間值（折射感）
        const p5Ang = angP3ToP4 + (angP4ToW - angP3ToP4) * 0.75;
              
        const p5Radius = 600; // 580 + 100

        p5Dest = {
          x: CENTER + Math.cos(p5Ang) * p5Radius,
          y: CENTER + Math.sin(p5Ang) * p5Radius
        };

    }

    const fullPath = [ { x: pGate.x, y: pGate.y }, p1Dest, p2Dest, { x: CENTER, y: CENTER }, p3Dest, p4Dest ];
    if (p5Dest) fullPath.push(p5Dest);
    fullPath.push({ x: wGate.x, y: wGate.y });

    const players = PLAYER_NAMES.map((name, i) => {
      const startPos = {
        x: CENTER + (Math.random() - 0.5) * 1000,
        y: CENTER + (Math.random() - 0.5) * 1000
      };
      let scatterPos = startPos;
      if (i === 0) scatterPos = p1Dest;
      else if (i === 1) scatterPos = p2Dest;
      else if (i === 2) scatterPos = p3Dest;
      else if (i === 3) scatterPos = p4Dest;
      else if (i === 4 && p5Dest) scatterPos = p5Dest;
      else if (i === 4 && !p5Dest) {
        const ang = p4Ang + (whiteOnRight ? 15 : -15) * (Math.PI / 180);
        scatterPos = { x: CENTER + Math.cos(ang) * 820, y: CENTER + Math.sin(ang) * 820 };
      }
      else {
        const ang = (i * 45) * Math.PI / 180;
        scatterPos = { x: CENTER + Math.cos(ang) * 750, y: CENTER + Math.sin(ang) * 750 };
      }
      return { id: i, name, startPos, scatterPos };
    });

    return { pGatePos: { x: pGate.x, y: pGate.y }, wGatePos: { x: wGate.x, y: wGate.y }, players, fullPath, needsP5 };
  }, []);

  const playersState = useMemo(() => {
    return data.players.map((p, i) => {
      let pos = { ...p.startPos }, angle = 0;
      if (time < 4) pos = p.startPos;
      else if (time < 6) {
        const prg = (time - 4) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        pos = { x: p.startPos.x + (p.scatterPos.x - p.startPos.x) * ease, y: p.startPos.y + (p.scatterPos.y - p.startPos.y) * ease };
      } else pos = p.scatterPos;

      const nodeIdx = data.fullPath.findIndex(pt => Math.hypot(pt.x - p.scatterPos.x, pt.y - p.scatterPos.y) < 2);
      if (nodeIdx !== -1 && nodeIdx < data.fullPath.length - 1) {
        const next = data.fullPath[nodeIdx + 1];
        angle = Math.atan2(next.y - pos.y, next.x - pos.x);
      } else angle = Math.atan2(pos.y - CENTER, pos.x - CENTER);

      return { ...p, pos, angle };
    });
  }, [time, data]);

  const rayClass = time < 11.5 ? "ray-flow-v2-active" : "";

  return (
    <svg className="arena-svg" viewBox="0 0 1920 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes rayFlowV2 { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        .ray-flow-v2-active { stroke-dasharray: 60 30; animation: rayFlowV2 0.8s linear infinite; }
      `}</style>
      <defs>
        <filter id="laserGlowOuter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feFlood floodColor="white" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 背景線條：完全同步 OuterArena.tsx */}
      <rect x={OFFSET} y={OFFSET} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="none" stroke="#f9ff00" strokeWidth="10" opacity="0.25" />
      <circle cx={CENTER} cy={CENTER} r={CIRCLE_R} fill="#0a0a0d" stroke="#f9ff00" strokeWidth="10" opacity="1" />

      {time >= 2 && time < 9 && (
        <text x={CENTER} y="150" textAnchor="middle" fill="#f9ff00" fontSize="100" fontWeight="900" style={{ textShadow: '0 0 30px rgba(249,255,0,0.6)' }}>
          奪天倒數: {Math.max(0, 9 - time).toFixed(1)}s
        </text>
      )}

      <g>
        <rect x={data.pGatePos.x - 90} y={data.pGatePos.y - 90} width="180" height="180" fill="rgba(184, 41, 255, 0.1)" stroke="#b829ff" strokeWidth="15" rx="15" />
        <text x={data.pGatePos.x} y={data.pGatePos.y + 15} textAnchor="middle" fill="#b829ff" fontSize="45" fontWeight="bold">紫</text>
        <circle cx={data.wGatePos.x} cy={data.wGatePos.y} r="90" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="15" />
        <text x={data.wGatePos.x} y={data.wGatePos.y + 15} textAnchor="middle" fill="white" fontSize="45" fontWeight="bold">白</text>
      </g>

      {time >= 6 && time < 9 && (
        <g opacity="0.3">
          {data.fullPath.slice(0, -1).map((_, i) => (
            <line key={i} x1={data.fullPath[i].x} y1={data.fullPath[i].y} x2={data.fullPath[i+1].x} y2={data.fullPath[i+1].y} stroke="white" strokeWidth="50" strokeDasharray="30,15" />
          ))}
        </g>
      )}

      {time >= 9 && (
        <g>
          {data.fullPath.slice(0, -1).map((_, i) => (
            <line key={i} x1={data.fullPath[i].x} y1={data.fullPath[i].y} x2={data.fullPath[i+1].x} y2={data.fullPath[i+1].y} stroke="white" strokeWidth="65" filter="url(#laserGlowOuter)" className={rayClass} strokeLinecap="round" />
          ))}
        </g>
      )}

      {playersState.map((p, i) => {
        const isMech = i < 5;
        const color = isMech ? "#f9ff00" : "#444";
        const label = isMech ? `${i+1}號` : "";
        return (
          <g key={i} transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            {isMech && time >= 6 && time < 9 && <path d="M 0 0 L 250 -130 A 280 280 0 0 1 250 130 Z" fill="rgba(249, 255, 0, 0.2)" stroke="#f9ff00" strokeWidth="2.5" />}
            <circle r={PLAYER_RADIUS} fill={color} stroke="white" strokeWidth="3.5" />
            <text y="-55" transform={`rotate(${-p.angle * 180 / Math.PI})`} textAnchor="middle" fill={isMech ? "#f9ff00" : "white"} fontSize="32" fontWeight="bold" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>
              {label ? `[${label}] ` : ""}{p.name}
            </text>
            <line x1="0" y1="0" x2="60" y2="0" stroke="white" strokeWidth="2" />
          </g>
        );
      })}

      <circle cx={CENTER} cy={CENTER} r={BOSS_RADIUS} fill="#f9ff00" stroke="white" strokeWidth="5" />
      <text x={CENTER} y={CENTER + 38} textAnchor="middle" fill="black" fontSize="85" fontWeight="900">李</text>
    </svg>
  );
};
