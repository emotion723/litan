// src/world/ArenaGeometry.ts
import { ArenaID, Vector2 } from '../types/types';
import { ArenaState } from '../types/ArenaState';
import {
  ARENA_CENTER,
  BASE_SIZE,
  ARENA_SPACING,
  CIRCLE_RADIUS_PX,
  SQUARE_SIDE_PX,
  SQUARE_HALF_PX,
} from './GameConstants';

/** 三個場地在畫布上的排列順序（必須與 BattleArena 一致） */
export const ARENA_ORDER: ArenaID[] = ['Outer', 'White', 'Black'];

export function arenaCanvasOffsetX(arenaId: ArenaID): number {
  const idx = ARENA_ORDER.indexOf(arenaId);
  if (idx < 0) return 0;
  return idx * (BASE_SIZE + ARENA_SPACING);
}

/** Arena-local (0..1920) -> Canvas 座標 */
export function toCanvasPoint(arenaId: ArenaID, p: Vector2): Vector2 {
  return { x: p.x + arenaCanvasOffsetX(arenaId), y: p.y };
}

/** 王（目前三場都在正中央） */
export function bossLocalPos(_arenaId: ArenaID): Vector2 {
  return { x: ARENA_CENTER, y: ARENA_CENTER };
}

/** 花位置：完全對齊你 BattleArena 現在的畫法 */
export function flowerLocalPos(arenaId: ArenaID, state: ArenaState): Vector2 | null {
  if (arenaId === 'White') {
    const f = state.flowers.white;
    if (!f.visible) return null;

    // BattleArena: cx + cos(angle) * RADIUS * 0.75
    return {
      x: ARENA_CENTER + Math.cos(f.angle) * (CIRCLE_RADIUS_PX * 0.75),
      y: ARENA_CENTER + Math.sin(f.angle) * (CIRCLE_RADIUS_PX * 0.75),
    };
  }

  if (arenaId === 'Black') {
    const f = state.flowers.black;
    if (!f.visible) return null;

    // BattleArena: cx + cos(angle) * SQUARE_SIDE * 0.375
    return {
      x: ARENA_CENTER + Math.cos(f.angle) * (SQUARE_SIDE_PX * 0.375),
      y: ARENA_CENTER + Math.sin(f.angle) * (SQUARE_SIDE_PX * 0.375),
    };
  }

  return null;
}

/**
 * 門位置（提供機制用座標）
 * - white gates: 0~3 = 上右下左，位在白場圓周
 * - purple gates: 0~3 = 左上右上右下左下，位在黑場方形四角附近
 *
 * 你現在 UI 還沒畫門，但機制先能拿到定位，未來要畫也會一致。
 */
export function gateLocalPos(
  kind: 'white' | 'purple',
  index: number
): Vector2 {
  if (kind === 'white') {
    // 上(0) 右(1) 下(2) 左(3)
    const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    const a = angles[index % 4] ?? 0;
    return {
      x: ARENA_CENTER + Math.cos(a) * CIRCLE_RADIUS_PX,
      y: ARENA_CENTER + Math.sin(a) * CIRCLE_RADIUS_PX,
    };
  }

  // purple: 左上(0) 右上(1) 右下(2) 左下(3)
  const corners: Vector2[] = [
    { x: ARENA_CENTER - SQUARE_HALF_PX, y: ARENA_CENTER - SQUARE_HALF_PX },
    { x: ARENA_CENTER + SQUARE_HALF_PX, y: ARENA_CENTER - SQUARE_HALF_PX },
    { x: ARENA_CENTER + SQUARE_HALF_PX, y: ARENA_CENTER + SQUARE_HALF_PX },
    { x: ARENA_CENTER - SQUARE_HALF_PX, y: ARENA_CENTER + SQUARE_HALF_PX },
  ];
  return corners[index % 4] ?? corners[0];
}
