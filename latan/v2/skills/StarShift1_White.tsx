import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const CIRCLE_R = 940;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

const PLAYER_NAMES = ["婪肆", "峻峻", "段考", "芯羽", "悲歡", "阿寧", "盆醬", "CJ", "小薇"];

export const StarShift1_White = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime(t => (t + dt >= 15 ? 15 : t + dt));
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
    const cardinalPoints = [
      { name: 'Top', ang: -90, x: CENTER, y: CENTER - CIRCLE_R },
      { name: 'Right', ang: 0, x: CENTER + CIRCLE_R, y: CENTER },
      { name: 'Bottom', ang: 90, x: CENTER, y: CENTER + CIRCLE_R },
      { name: 'Left', ang: 180, x: CENTER - CIRCLE_R, y: CENTER },
    ];
    const pGate = purpleCorners[Math.floor(Math.random() * 4)];
    const wGate = cardinalPoints[Math.floor(Math.random() * 4)];

    let diff = (pGate.ang - wGate.ang);
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    const isWhiteLeft = diff > 0;

    const getBasePoints = (gate: any, isLeftGate: boolean) => {
      const gateAng = (gate.ang * Math.PI) / 180;
      const dir = { x: Math.cos(gateAng), y: Math.sin(gateAng) };
      const sideDir = isLeftGate ? { x: dir.y, y: -dir.x } : { x: -dir.y, y: dir.x };
      return [
        { x: CENTER + dir.x * 250, y: CENTER + dir.y * 250 }, // P1
        { x: CENTER + dir.x * 100 + sideDir.x * 250, y: CENTER + dir.y * 100 + sideDir.y * 250 }, // P2
        { x: CENTER + dir.x * 480 + sideDir.x * 320, y: CENTER + dir.y * 480 + sideDir.y * 320 }, // P3
        { x: CENTER + dir.x * 500, y: CENTER + dir.y * 500 }, // P4
      ];
    };

    const sideAPoints = getBasePoints(wGate, isWhiteLeft);
    const sideBPoints = getBasePoints(pGate, !isWhiteLeft);
    const initialIdlePoint = { x: CENTER - 200, y: CENTER + 350 };
    let initialPoints = [...sideAPoints, ...sideBPoints, initialIdlePoint];

    const scatteredPoints = initialPoints.map(() => ({
      x: CENTER + (Math.random() - 0.5) * 1600,
      y: CENTER + (Math.random() - 0.5) * 1600
    }));

    const marks: number[] = [];
    while(marks.length < 2) {
      const r = Math.floor(Math.random() * 9);
      if(!marks.includes(r)) marks.push(r);
    }

    let mapping = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const getMyMarks = (side: 'A' | 'B') => marks.filter(m => side === 'A' ? (m >= 0 && m <= 3) : (m >= 4 && m <= 7));
    const swap = (pIdx1: number, pIdx2: number) => {
      const temp = mapping[pIdx1];
      mapping[pIdx1] = mapping[pIdx2];
      mapping[pIdx2] = temp;
    };

    const runP1Logic = (side: 'A' | 'B') => {
      const off = side === 'A' ? 0 : 4;
      const otherOff = side === 'A' ? 4 : 0;
      const p1 = 0 + off, p2 = 1 + off, p3 = 2 + off, p4 = 3 + off;
      const oP1 = 0 + otherOff, oP2 = 1 + otherOff, oP3 = 2 + otherOff;
      const myMarks = getMyMarks(side);
      if (myMarks.length === 1) {
        if (marks.includes(p2) || marks.includes(p3)) swap(p1, marks.includes(p2) ? p2 : p3);
      } else if (myMarks.length === 0) {
        if (marks.includes(oP3)) swap(p1, oP3);
        else if (marks.includes(oP2)) swap(p1, oP2);
        else if (marks.includes(oP1)) swap(p1, oP1);
      } else if (myMarks.length === 2) {
        if (marks.includes(p1) && marks.includes(p4)) swap(p1, oP1);
        else if (marks.includes(p2) && marks.includes(p3)) swap(p1, p2);
      }
    };

    const marksA = getMyMarks('A');
    const marksB = getMyMarks('B');

    if (marks.includes(8)) {
      if (marksA.length > 0) runP1Logic('A');
      else if (marksB.length > 0) runP1Logic('B');
    } else {
      runP1Logic('A');
      runP1Logic('B');
    }

    const getMidPoint = (p1Idx: number, p4Idx: number) => ({
      x: (initialPoints[p1Idx].x + initialPoints[p4Idx].x) / 2,
      y: (initialPoints[p1Idx].y + initialPoints[p4Idx].y) / 2
    });

    if (marks.includes(8)) {
      if (marksA.length === 0) initialPoints[8] = getMidPoint(0, 3);
      else initialPoints[8] = getMidPoint(4, 7);
    } else {
      initialPoints[8] = getMidPoint(0, 3);
    }

    const players = PLAYER_NAMES.map((name, i) => {
      const targetPointIdx = mapping[i];
      return {
        id: i,
        name,
        scatteredPos: scatteredPoints[i],
        basePos: initialPoints[i],
        targetPos: initialPoints[targetPointIdx],
        isMarked: marks.includes(i)
      };
    });

    return { wGate, pGate, players, marks, isWhiteLeft, initialPoints };
  }, []);

  const playersState = useMemo(() => {
    return data.players.map((p, i) => {
      let pos = { ...p.scatteredPos };
      let angle = 0;
      const isIdle = p.id === 8;

      if (time < 1) pos = p.scatteredPos;
      else if (time < 2) {
        if (isIdle) pos = p.scatteredPos;
        else {
          const prg = (time - 1) / 1;
          const ease = 1 - Math.pow(1 - prg, 3);
          pos = {
            x: p.scatteredPos.x + (p.basePos.x - p.scatteredPos.x) * ease,
            y: p.scatteredPos.y + (p.basePos.y - p.scatteredPos.y) * ease
          };
        }
      } else if (time < 8) pos = isIdle ? p.scatteredPos : p.basePos;
      else if (time < 10) {
        const prg = (time - 8) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        if (isIdle) {
          pos = {
            x: p.scatteredPos.x + (p.targetPos.x - p.scatteredPos.x) * ease,
            y: p.scatteredPos.y + (p.targetPos.y - p.scatteredPos.y) * ease
          };
        } else {
          pos = {
            x: p.basePos.x + (p.targetPos.x - p.basePos.x) * ease,
            y: p.basePos.y + (p.targetPos.y - p.basePos.y) * ease
          };
        }
      } else pos = p.targetPos;

      if (p.id < 8) {
        const localIdx = p.id % 4;
        const gate = p.id < 4 ? data.wGate : data.pGate;
        const sideOff = p.id < 4 ? 0 : 4;
        let nextTarget: { x: number; y: number } = gate;
        if (localIdx === 0) nextTarget = data.initialPoints[sideOff + 1];
        else if (localIdx === 1) nextTarget = data.initialPoints[sideOff + 2];
        else if (localIdx === 2) nextTarget = data.initialPoints[sideOff + 3];
        angle = Math.atan2(nextTarget.y - pos.y, nextTarget.x - pos.x);
      } else angle = Math.atan2(CENTER - pos.y, CENTER - pos.x);

      return { ...p, pos, angle };
    });
  }, [time, data]);

  const side1Path = [{ x: CENTER, y: CENTER }, ...[0,1,2,3].map(i => data.initialPoints[i]), data.wGate];
  const side2Path = [{ x: CENTER, y: CENTER }, ...[4,5,6,7].map(i => data.initialPoints[i]), data.pGate];

  return (
    <svg className="arena-svg" viewBox="0 0 1920 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes rayFlowSS { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
        .ray-flow-ss { stroke-dasharray: 60 30; animation: rayFlowSS 0.8s linear infinite; }
      `}</style>
      <defs>
        <filter id="laserGlowSS" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feFlood floodColor="white" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={CENTER} cy={CENTER} r={CIRCLE_R} fill="none" stroke="#00f2ff" strokeWidth="10" />
      {time < 3 ? (
        <text x={CENTER} y="150" textAnchor="middle" fill="#00f2ff" fontSize="100" fontWeight="900">星移倒數: {Math.max(0, 3 - time).toFixed(1)}s</text>
      ) : time < 12 ? (
        <text x={CENTER} y="150" textAnchor="middle" fill="#ff4d4d" fontSize="100" fontWeight="900">判定倒數: {Math.max(0, 12 - time).toFixed(1)}s</text>
      ) : null}
      <g>
        <circle cx={data.wGate.x} cy={data.wGate.y} r="90" fill="none" stroke="white" strokeWidth="15" />
        <rect x={data.pGate.x-90} y={data.pGate.y-90} width="180" height="180" fill="rgba(184,41,255,0.05)" stroke="#b829ff" strokeWidth="15" rx="15" />
      </g>
      {time >= 10 && time < 12 && (
        <g opacity="0.6">
          <polyline points={side1Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#00f2ff" strokeWidth="40" strokeDasharray="30,15" />
          <polyline points={side2Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ff2d55" strokeWidth="40" strokeDasharray="30,15" />
        </g>
      )}
      {time >= 12 && (
        <g>
          <polyline points={side1Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth="65" filter="url(#laserGlowSS)" className="ray-flow-ss" strokeLinecap="round" />
          <polyline points={side2Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth="65" filter="url(#laserGlowSS)" className="ray-flow-ss" strokeLinecap="round" />
        </g>
      )}
      {playersState.map((p, i) => {
        const isMarked = p.isMarked && time >= 3; 
        const isIdle = p.id === 8;
        const playerColor = isMarked ? "#ff4d4d" : (isIdle ? "#888" : (p.id < 4 ? "#00f2ff" : "#ff2d55"));
        return (
          <g key={i} transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            {isMarked && <circle r="60" fill="none" stroke="#ff4d4d" strokeWidth="5"><animate attributeName="r" values="50;75;50" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" /></circle>}
            <circle r={PLAYER_RADIUS} fill={playerColor} stroke="white" strokeWidth="3.5" />
            <text y="-55" transform={`rotate(${-p.angle * 180 / Math.PI})`} textAnchor="middle" fill="white" fontSize="30" fontWeight="bold">{isIdle ? "[閒人] " : `${(p.id % 4) + 1}號 `}{p.name}</text>
          </g>
        );
      })}
      <circle cx={CENTER} cy={CENTER} r={BOSS_RADIUS} fill="#f9ff00" stroke="white" strokeWidth="5" />
    </svg>
  );
};