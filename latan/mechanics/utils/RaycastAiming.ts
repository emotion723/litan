import { Vector2, ArenaID, Entity } from '../../types/types';

/** 命中結果 */
export type RaycastHit =
  | {
      kind: 'player';
      player: Entity;
      point: Vector2;
      distance: number;
    }
  | {
      kind: 'boundary';
      point: Vector2;
      distance: number;
    };

/** 與圓相交（Ray × Circle） */
function intersectRayCircle(
  start: Vector2,
  dir: Vector2,
  center: Vector2,
  radius: number
): number | null {
  const fx = start.x - center.x;
  const fy = start.y - center.y;

  const a = dir.x * dir.x + dir.y * dir.y;
  const b = 2 * (fx * dir.x + fy * dir.y);
  const c = fx * fx + fy * fy - radius * radius;

  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;

  const sqrt = Math.sqrt(disc);
  const t1 = (-b - sqrt) / (2 * a);
  const t2 = (-b + sqrt) / (2 * a);

  if (t1 > 0) return t1;
  if (t2 > 0) return t2;
  return null;
}

/** 與場地邊界相交（正方形） */
function intersectArenaBoundary(
  start: Vector2,
  dir: Vector2,
  arena: ArenaID
): number {
  // 與 BattleArena 對齊
  const SIZE = 1920;

  let t = Infinity;

  if (dir.x !== 0) {
    const tx1 = (0 - start.x) / dir.x;
    const tx2 = (SIZE - start.x) / dir.x;
    if (tx1 > 0) t = Math.min(t, tx1);
    if (tx2 > 0) t = Math.min(t, tx2);
  }

  if (dir.y !== 0) {
    const ty1 = (0 - start.y) / dir.y;
    const ty2 = (SIZE - start.y) / dir.y;
    if (ty1 > 0) t = Math.min(t, ty1);
    if (ty2 > 0) t = Math.min(t, ty2);
  }

  return t;
}

/**
 * Raycast：
 * - 只會被「開鏡玩家」擋住
 * - 否則射到場地邊界
 */
export function raycastAimingPlayersOrBoundary(
  start: Vector2,
  angle: number,
  players: Entity[],
  arena: ArenaID
): RaycastHit {
  const dir = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  let closestT = intersectArenaBoundary(start, dir, arena);
  let hit: RaycastHit = {
    kind: 'boundary',
    point: {
      x: start.x + dir.x * closestT,
      y: start.y + dir.y * closestT,
    },
    distance: closestT,
  };

  const PLAYER_RADIUS = 50;

  for (const p of players) {
    if (!p.isAiming) continue;

    const t = intersectRayCircle(start, dir, p.pos, PLAYER_RADIUS);
    if (t !== null && t < closestT) {
      closestT = t;
      hit = {
        kind: 'player',
        player: p,
        point: {
          x: start.x + dir.x * t,
          y: start.y + dir.y * t,
        },
        distance: t,
      };
    }
  }

  return hit;
}

export function raycastBoundaryOnly(
  start: Vector2,
  angle: number,
  arena: ArenaID
): RaycastHit {
  const dir = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  const t = intersectArenaBoundary(start, dir, arena);

  return {
    kind: 'boundary',
    point: {
      x: start.x + dir.x * t,
      y: start.y + dir.y * t,
    },
    distance: t,
  };
}
