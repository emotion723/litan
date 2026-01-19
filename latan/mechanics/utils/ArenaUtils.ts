
import { Vector2, GroupID} from '../../types/types';
import { ArenaState } from '../../types/ArenaState';

const ARENA_CENTER = 960;
const PLAYER_RADIUS = 50;
const SQUARE_HALF = (44 * 40) / 2;
const SQUARE_LIMIT = SQUARE_HALF - PLAYER_RADIUS;
const CIRCLE_LIMIT = 940 - PLAYER_RADIUS;

/**
 * 根據分組將玩家座標強制限制在場地內
 */
export function clampToArena(pos: Vector2, groupId: GroupID) {
  // A,B -> 白場 (圓形)
  // E,F -> 黑場 (方形)
  // C,D,Idle -> 外場 (方形 + 圓形組合，此處簡單視為方形邊界)
  let arenaType: 'Square' | 'Circle' = 'Square';
  if (groupId === 'A' || groupId === 'B') arenaType = 'Circle';

  if (arenaType === 'Square') {
    pos.x = Math.max(ARENA_CENTER - SQUARE_LIMIT, Math.min(ARENA_CENTER + SQUARE_LIMIT, pos.x));
    pos.y = Math.max(ARENA_CENTER - SQUARE_LIMIT, Math.min(ARENA_CENTER + SQUARE_LIMIT, pos.y));
  } else {
    const dx = pos.x - ARENA_CENTER;
    const dy = pos.y - ARENA_CENTER;
    const dist = Math.hypot(dx, dy);
    if (dist > CIRCLE_LIMIT) {
      const angle = Math.atan2(dy, dx);
      pos.x = ARENA_CENTER + Math.cos(angle) * CIRCLE_LIMIT;
      pos.y = ARENA_CENTER + Math.sin(angle) * CIRCLE_LIMIT;
    }
  }
}



const BASE_SIZE = 1920;
const ARENA_SPACING = 480;
const BLACK_INDEX = 2;

export function getBlackArenaWorldCenter() {
  const xOffset = BLACK_INDEX * (BASE_SIZE + ARENA_SPACING);
  return {
    x: xOffset + BASE_SIZE / 2,
    y: 500 + BASE_SIZE / 2,
  };
}

export function getBlackFlowerWorldPos(arena: ArenaState) {
  const flower = arena.flowers.black;
  if (!flower.visible) return null;

  const { x: cx, y: cy } = getBlackArenaWorldCenter();

  const half = (44 * 40) / 2;
  const r = half * 0.75;

  return {
    x: cx + Math.cos(flower.angle) * r,
    y: cy + Math.sin(flower.angle) * r,
  };
}