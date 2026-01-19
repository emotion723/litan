import React, { useState, useEffect, useMemo } from 'react';

const BASE = 1920;
const CENTER = 960;
const BOSS_RADIUS = 100;
const PLAYER_RADIUS = 40;
const CIRCLE_R = 940;

const PLAYER_NAMES = ["悲歡", "阿寧", "盆醬", "CJ", "婪肆", "峻峻", "段考", "芯羽"];

/** 計算點到線段的最短距離 */
function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);

  let t =
    ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));

  return Math.hypot(
    px - (x1 + t * (x2 - x1)),
    py - (y1 + t * (y2 - y1))
  );
}

export const DuoTian3_White = () => {
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
    // 門的正位角度：上(-90), 右(0), 下(90), 左(180)
    const angles = [
      -Math.PI / 2,
      0,
      Math.PI / 2,
      Math.PI
    ];
    const gateAngle =
      angles[Math.floor(Math.random() * 4)];

    const GATE_RADIUS = CIRCLE_R - 150;

    const gatePos = {
      x: CENTER + Math.cos(gateAngle) * GATE_RADIUS,
      y: CENTER + Math.sin(gateAngle) * GATE_RADIUS
    };

    const p1Dest = {
      x: CENTER + Math.cos(gateAngle) * 420,
      y: CENTER + Math.sin(gateAngle) * 420
    };

    const p2Angle = gateAngle + (30 * Math.PI) / 180;
    const p2Dest = {
      x: CENTER + Math.cos(p2Angle) * 700,
      y: CENTER + Math.sin(p2Angle) * 700
    };

    const pathPoints = [
      gatePos,
      p1Dest,
      p2Dest,
      { x: CENTER, y: CENTER }
    ];

    const players = PLAYER_NAMES.map((name, i) => {
      const startPos = {
        x: CENTER + (Math.random() - 0.5) * 600,
        y: CENTER + (Math.random() - 0.5) * 600
      };

      let scatterPos = { x: 0, y: 0 };

      if (i === 0) {
        scatterPos = p1Dest;
      } else if (i === 1) {
        scatterPos = p2Dest;
      } else {
        let found = false;
        let attempts = 0;

        while (!found && attempts < 100) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 300 + Math.random() * 400;
          const tx = CENTER + Math.cos(ang) * dist;
          const ty = CENTER + Math.sin(ang) * dist;

          const d1 = pointToSegmentDist(
            tx,
            ty,
            gatePos.x,
            gatePos.y,
            p1Dest.x,
            p1Dest.y
          );
          const d2 = pointToSegmentDist(
            tx,
            ty,
            p1Dest.x,
            p1Dest.y,
            p2Dest.x,
            p2Dest.y
          );
          const d3 = pointToSegmentDist(
            tx,
            ty,
            p2Dest.x,
            p2Dest.y,
            CENTER,
            CENTER
          );

          if (d1 > 200 && d2 > 200 && d3 > 200) {
            scatterPos = { x: tx, y: ty };
            found = true;
          }
          attempts++;
        }

        if (!found) {
          scatterPos = {
            x: CENTER - 500,
            y: CENTER - 500
          };
        }
      }

      return { id: i, name, startPos, scatterPos };
    });

    return { gatePos, players, pathPoints };
  }, []);

  const playersState = useMemo(() => {
    return data.players.map((p, i) => {
      let pos = { ...p.startPos };
      let angle = 0;

      if (time < 4) {
        pos = p.startPos;
      } else if (time < 6) {
        const prg = (time - 4) / 2;
        const ease = 1 - Math.pow(1 - prg, 3);
        pos = {
          x:
            p.startPos.x +
            (p.scatterPos.x - p.startPos.x) * ease,
          y:
            p.startPos.y +
            (p.scatterPos.y - p.startPos.y) * ease
        };
      } else {
        pos = p.scatterPos;
      }

      if (i === 0) {
        angle = Math.atan2(
          data.pathPoints[2].y - pos.y,
          data.pathPoints[2].x - pos.x
        );
      } else if (i === 1) {
        angle = Math.atan2(
          CENTER - pos.y,
          CENTER - pos.x
        );
      } else {
        angle = Math.atan2(
          pos.y - CENTER,
          pos.x - CENTER
        );
      }

      return { ...p, pos, angle };
    });
  }, [time, data]);

  const rayClass =
    time < 11.5 ? "ray-directional-white" : "";

  return (
    <svg
      className="arena-svg"
      viewBox="-150 -150 2220 2220"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "#0a0a0d"
      }}
    >
      <style>{`
        @keyframes rayFlowWhiteV2 {
          from { stroke-dashoffset: 120; }
          to { stroke-dashoffset: 0; }
        }
        .ray-directional-white {
          stroke-dasharray: 60 30;
          animation: rayFlowWhiteV2 1s linear infinite;
        }
      `}</style>

      <defs>
        <filter
          id="whiteGlowV2"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feFlood
            floodColor="white"
            floodOpacity="0.9"
            result="color"
          />
          <feComposite
            in="color"
            in2="blur"
            operator="in"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

            {/* 奪天 7 秒倒數計時文字 (T=2 開始, T=9 結束) */}
      {time >= 2 && time < 9 && (
        <text x={CENTER} y="250" textAnchor="middle" fill="#00f2ff" fontSize="110" fontWeight="900" style={{ textShadow: '0 0 20px rgba(0,242,255,0.6)' }}>
          奪天倒數: {Math.max(0, 9 - time).toFixed(1)}s
        </text>
      )}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={CIRCLE_R}
        fill="none"
        stroke="#00f2ff"
        strokeWidth="10"
      />

      <g>
        <circle
          cx={data.gatePos.x}
          cy={data.gatePos.y}
          r="100"
          fill="none"
          stroke="#00f2ff"
          strokeWidth="15"
        />
        <text
          x={data.gatePos.x}
          y={data.gatePos.y + 10}
          textAnchor="middle"
          fill="#00f2ff"
          fontSize="40"
          fontWeight="bold"
        >
          門
        </text>
      </g>

      {time >= 6 && time < 9 && (
        <g opacity="0.4">
          {data.pathPoints.slice(0, -1).map((_, i) => (
            <line
              key={i}
              x1={data.pathPoints[i].x}
              y1={data.pathPoints[i].y}
              x2={data.pathPoints[i + 1].x}
              y2={data.pathPoints[i + 1].y}
              stroke="white"
              strokeWidth="60"
              strokeDasharray="20,10"
            />
          ))}
        </g>
      )}

      {time >= 9 && (
        <g>
          {data.pathPoints.slice(0, -1).map((_, i) => (
            <line
              key={i}
              x1={data.pathPoints[i].x}
              y1={data.pathPoints[i].y}
              x2={data.pathPoints[i + 1].x}
              y2={data.pathPoints[i + 1].y}
              stroke="white"
              strokeWidth="65"
              className={rayClass}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      {playersState.map((p, i) => (
        <g
          key={i}
          transform={`translate(${p.pos.x}, ${p.pos.y}) rotate(${(p.angle * 180) / Math.PI})`}
        >
          <circle
            r={PLAYER_RADIUS}
            fill={i <= 1 ? "#00f2ff" : "#444"}
            stroke="white"
            strokeWidth="3"
          />
          <text
            y="-55"
            transform={`rotate(${-p.angle * 180 / Math.PI})`}
            textAnchor="middle"
            fill="white"
            fontSize="28"
            fontWeight="bold"
          >
            {p.name}
          </text>
        </g>
      ))}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={BOSS_RADIUS}
        fill="#f9ff00"
        stroke="white"
        strokeWidth="4"
      />
      <text
        x={CENTER}
        y={CENTER + 35}
        textAnchor="middle"
        fill="black"
        fontSize="80"
        fontWeight="900"
      >
        李
      </text>
    </svg>
  );
};
