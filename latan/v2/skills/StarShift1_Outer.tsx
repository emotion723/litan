
import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const CIRCLE_R = 940;
const SQUARE_SIZE = 1760;
const OFFSET = (BASE - SQUARE_SIZE) / 2;

const PLAYER_NAMES = ["婪肆", "峻峻", "段考", "芯羽", "悲歡", "阿寧", "盆醬", "CJ", "小薇"];

export const StarShift1_Outer = () => {
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
    // 1. 產生門位與 8 個正確站位 + 1 個閒人位
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
    
    // 原始 9 個站位座標
    // 閒人初始位置隨機或固定，此處定義其基準點（雖然 2-3s 不會去）
    const initialIdlePoint = { x: CENTER - 200, y: CENTER + 350 };
    let initialPoints = [...sideAPoints, ...sideBPoints, initialIdlePoint];

    // 隨機散開點位 (用於 0-2s)
    const scatteredPoints = initialPoints.map(() => ({
      x: CENTER + (Math.random() - 0.5) * 1600,
      y: CENTER + (Math.random() - 0.5) * 1600
    }));

    // 2. 隨機點名 9 取 2
    const marks: number[] = [];
    while(marks.length < 2) {
      const r = Math.floor(Math.random() * 9);
      if(!marks.includes(r)) marks.push(r);
    }

    // 3. 換位邏輯 (Mapping)
    let mapping = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // 工具函數：判定側
    const getMyMarks = (side: 'A' | 'B') => marks.filter(m => side === 'A' ? (m >= 0 && m <= 3) : (m >= 4 && m <= 7));

    // 交換函數
    const swap = (pIdx1: number, pIdx2: number) => {
      const temp = mapping[pIdx1];
      mapping[pIdx1] = mapping[pIdx2];
      mapping[pIdx2] = temp;
    };

    // --- P1 判定邏輯 (保持不動) ---
    const runP1ALogic = () => {
      const myMarks = getMyMarks('A');
      const p1 = 0, p2 = 1, p3 = 2, p4 = 3;
      const oP1 = 4, oP2 = 5, oP3 = 6;
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

    const runP1BLogic = () => {
      const myMarks = getMyMarks('B');
      const p1 = 4, p2 = 5, p3 = 6, p4 = 7;
      const oP1 = 0, oP2 = 1, oP3 = 2;
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


    const idleMarked = marks.includes(8);

    const marksA = getMyMarks('A'); // 0~3
    const marksB = getMyMarks('B'); // 4~7

    let execSideA = true;
    let execSideB = true;

    if (idleMarked) {
      // 閒人被點，只執行「有被點名的那一側」
      execSideA = marksA.length > 0;
      execSideB = marksB.length > 0;
    }

 
    // --- 閒人優先 ---
    if (idleMarked) {
      let targetGate = null;

      // 閒人永遠補到「沒被點名的那一側」
      if (marksA.length === 0) targetGate = wGate;
      else if (marksB.length === 0) targetGate = pGate;

      if (targetGate) {
        const ang = (targetGate.ang * Math.PI) / 180;
        const dir = { x: Math.cos(ang), y: Math.sin(ang) };
        initialPoints[8] = {
          x: CENTER + dir.x * 350,
          y: CENTER + dir.y * 350
        };
      }


    }

     // 執行邏輯
      if (execSideA) {
        runP1ALogic();
      }

      if (execSideB) {
        runP1BLogic();
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

      if (time < 1) {
        pos = p.scatteredPos; 
      } else if (time < 2) {
        // 1-2s 上點階段
        if (isIdle) {
          pos = p.scatteredPos; // 閒人不參與上點，留在原地
        } else {
          const prg = (time - 1) / 1;
          const ease = 1 - Math.pow(1 - prg, 3);
          pos = {
            x: p.scatteredPos.x + (p.basePos.x - p.scatteredPos.x) * ease,
            y: p.scatteredPos.y + (p.basePos.y - p.scatteredPos.y) * ease
          };
        }
      } else if (time < 6) {
        // 3-6s 待機
        pos = isIdle ? p.scatteredPos : p.basePos;
      } else if (time < 8) {
        // 8-10s 換位動畫
        const prg = (time - 6) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        if (isIdle) {
          // 閒人從隨機點移動到 targetPos
          pos = {
            x: p.scatteredPos.x + (p.targetPos.x - p.scatteredPos.x) * ease,
            y: p.scatteredPos.y + (p.targetPos.y - p.scatteredPos.y) * ease
          };
        } else {
          // 其他人從基準點移動到 targetPos
          pos = {
            x: p.basePos.x + (p.targetPos.x - p.basePos.x) * ease,
            y: p.basePos.y + (p.targetPos.y - p.basePos.y) * ease
          };
        }
      } else {
        pos = p.targetPos;
      }

      // 朝向計算
      if (p.id < 8) {
        const localIdx = p.id % 4;
        const gate = p.id < 4 ? data.wGate : data.pGate;
        const sideOff = p.id < 4 ? 0 : 4;
        let nextTarget: { x: number; y: number } = gate;
        if (localIdx === 0) nextTarget = data.initialPoints[sideOff + 1];
        else if (localIdx === 1) nextTarget = data.initialPoints[sideOff + 2];
        else if (localIdx === 2) nextTarget = data.initialPoints[sideOff + 3];
        angle = Math.atan2(nextTarget.y - pos.y, nextTarget.x - pos.x);
      } else {
        angle = Math.atan2(CENTER - pos.y, CENTER - pos.x);
      }

      return { ...p, pos, angle };
    });
  }, [time, data]);

  // 射線路徑固定使用原始點位
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

      <rect x={OFFSET} y={OFFSET} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="none" stroke="#f9ff00" strokeWidth="10" opacity="0.25" />
      <circle cx={CENTER} cy={CENTER} r={CIRCLE_R} fill="#0a0a0d" stroke="#f9ff00" strokeWidth="10" opacity="1" />

      {time < 3 ? (
        <text x={CENTER} y="150" textAnchor="middle" fill="#f9ff00" fontSize="100" fontWeight="900" style={{ textShadow: '0 0 30px rgba(249,255,0,0.6)' }}>
          星移倒數: {Math.max(0, 3 - time).toFixed(1)}s
        </text>
      ) : time < 10 ? (
        <text x={CENTER} y="150" textAnchor="middle" fill="#ff4d4d" fontSize="100" fontWeight="900" style={{ textShadow: '0 0 30px rgba(255,77,77,0.6)' }}>
          判定倒數(實戰是10): {Math.max(0, 10 - time).toFixed(1)}s
        </text>
      ) : null}

      <g>
        <circle cx={data.wGate.x} cy={data.wGate.y} r="90" fill="none" stroke="white" strokeWidth="15" />
        <rect x={data.pGate.x-90} y={data.pGate.y-90} width="180" height="180" fill="rgba(184,41,255,0.05)" stroke="#b829ff" strokeWidth="15" rx="15" />
      </g>

      {time >= 8 && time < 10 && (
        <g opacity="0.6">
          <polyline points={side1Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#00f2ff" strokeWidth="40" strokeDasharray="30,15" />
          <polyline points={side2Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ff2d55" strokeWidth="40" strokeDasharray="30,15" />
        </g>
      )}

      {time >= 10 && (
        <g>
          <polyline points={side1Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth="65" filter="url(#laserGlowSS)" className="ray-flow-ss" strokeLinecap="round" />
          <polyline points={side2Path.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#ffffff" strokeWidth="65" filter="url(#laserGlowSS)" className="ray-flow-ss" strokeLinecap="round" />
        </g>
      )}

      {playersState.map((p, i) => {
        const isMarked = p.isMarked && time >= 3; 
        const isIdle = p.id === 8;
        const label = isIdle ? "閒人" : `${(p.id % 4) + 1}號`;
        
        let playerColor = "#f9ff00";
        if (isMarked) playerColor = "#ff4d4d";
        else if (isIdle) playerColor = "#888";
        else {
          const isLeft = (p.id < 4) ? data.isWhiteLeft : !data.isWhiteLeft;
          playerColor = isLeft ? "#00f2ff" : "#00ff00";
        }

        return (
          <g key={i} transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}>
            {isMarked && (
              <circle r="60" fill="none" stroke="#ff4d4d" strokeWidth="5">
                <animate attributeName="r" values="50;75;50" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={PLAYER_RADIUS} fill={playerColor} stroke="white" strokeWidth="3.5" />
            <text y="-55" transform={`rotate(${-p.angle * 180 / Math.PI})`} textAnchor="middle" fill={isMarked ? "#ff4d4d" : "white"} fontSize="30" fontWeight="bold" style={{ textShadow: '2px 2px 5px #000' }}>
              {`[${label}] `}{p.name}
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
