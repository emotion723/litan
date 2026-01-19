import { Vector2, Entity } from '../../types/types';
import { angleFromTo } from './ArenaMath';

/** 計算點到線段的最短距離 */
function pointLineDistance(
  p: Vector2,
  a: Vector2,
  b: Vector2
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLen2 = abx * abx + aby * aby;
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLen2));

  const cx = a.x + abx * t;
  const cy = a.y + aby * t;
  return Math.hypot(p.x - cx, p.y - cy);
}

/** 判定是否面向王 */
export function isFacingBoss(
  player: Entity,
  bossPos: Vector2,
  toleranceDeg = 10
): boolean {
  const want = angleFromTo(player.pos, bossPos);
  const diff = Math.abs(
    Math.atan2(
      Math.sin(player.angle - want),
      Math.cos(player.angle - want)
    )
  );
  return diff <= (toleranceDeg * Math.PI) / 180;
}

/** 判定 controlled player 是否站在 Boss→Target 線上 */
export function isPlayerBlockingLine(
  blocker: Entity,
  bossPos: Vector2,
  targetPos: Vector2,
  tolerancePx = 20
): boolean {
  return (
    pointLineDistance(blocker.pos, bossPos, targetPos) <= tolerancePx
  );
}
