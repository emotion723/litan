import { Vector2, Entity } from '../../types/types';

function dot(a: Vector2, b: Vector2) {
  return a.x * b.x + a.y * b.y;
}

export function isBetweenBossAndFlower(
  player: Entity,
  boss: Vector2,
  flower: Vector2,
  tolerancePx = 30
): boolean {
  const bf = { x: flower.x - boss.x, y: flower.y - boss.y };
  const bp = { x: player.pos.x - boss.x, y: player.pos.y - boss.y };

  const bfLen2 = dot(bf, bf);
  const proj = dot(bp, bf) / bfLen2;

  // 必須在中間
  if (proj <= 0 || proj >= 1) return false;

  // 到線的距離
  const closest = {
    x: boss.x + bf.x * proj,
    y: boss.y + bf.y * proj,
  };

  const dist = Math.hypot(
    player.pos.x - closest.x,
    player.pos.y - closest.y
  );

  return dist <= tolerancePx;
}
