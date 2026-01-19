// src/mechanics/utils/ReflectLaser.ts

import { Entity, Vector2 } from '../../types/types';
import { RayPath } from '../../types/types';
import { ArenaID } from '../../types/types';

const MAX_LASER_LENGTH = 4000;
const PLAYER_HIT_RADIUS = 60;

/** 向量工具 */
function sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function mul(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

function length(v: Vector2): number {
  return Math.hypot(v.x, v.y);
}

function normalize(v: Vector2): Vector2 {
  const len = length(v);
  return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

/**
 * 發射一條雷射，並檢查是否命中開鏡玩家
 *
 * @returns
 *  - ray: 要畫的雷射
 *  - hitPlayer: 若命中，回傳該玩家
 */
export function emitLaser(
  arenaId: ArenaID,
  origin: Vector2,
  angle: number,
  players: Entity[],
  color: string
): {
  ray: RayPath;
  hitPlayer: Entity | null;
} {
  const dir = normalize({
    x: Math.cos(angle),
    y: Math.sin(angle),
  });

  let closestHit: {
    player: Entity;
    t: number;
  } | null = null;

  for (const p of players) {
    if (!p.isAiming) continue;

    const OP = sub(p.pos, origin);
    const t = dot(OP, dir);

    if (t <= 0 || t > MAX_LASER_LENGTH) continue;

    const closestPoint = add(origin, mul(dir, t));
    const dist = length(sub(p.pos, closestPoint));

    if (dist <= PLAYER_HIT_RADIUS) {
      if (!closestHit || t < closestHit.t) {
        closestHit = { player: p, t };
      }
    }
  }

  // 雷射終點
  const endPoint = closestHit
    ? add(origin, mul(dir, closestHit.t))
    : add(origin, mul(dir, MAX_LASER_LENGTH));

  const ray: RayPath = {
    arenaId,
    color,
    points: [origin, endPoint],
  };

  return {
    ray,
    hitPlayer: closestHit?.player ?? null,
  };
}
