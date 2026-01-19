// src/mechanics/utils/RayOrigin.ts
import { Vector2 } from '../../types/types';

/** 射線來源類型 */
export type RaySourceKind = 'player' | 'boss' | 'flower' | 'gate';

/** 射線來源設定 */
export interface RaySource {
  kind: RaySourceKind;
  pos: Vector2;      // 世界座標
  angle: number;     // 射線方向（rad）
}

/** 視覺半徑 / 偏移量（與 UI 對齊） */
const RAY_ORIGIN_OFFSET: Record<RaySourceKind, number> = {
  player: 50,   // PLAYER_RADIUS（BattleArena）
  boss: 100,    // BOSS_RADIUS
  flower: 80,   // 星星視覺半徑（可微調）
  gate: 20,     // 門厚度 / 偏移
};

/**
 * 計算射線起點（從物件邊界射出）
 */
export function getRayStart(source: RaySource): Vector2 {
  const offset = RAY_ORIGIN_OFFSET[source.kind] ?? 0;

  return {
    x: source.pos.x + Math.cos(source.angle) * offset,
    y: source.pos.y + Math.sin(source.angle) * offset,
  };
}

/**
 * 計算射線終點（固定長度）
 */
export function getRayEnd(
  start: Vector2,
  angle: number,
  length: number
): Vector2 {
  return {
    x: start.x + Math.cos(angle) * length,
    y: start.y + Math.sin(angle) * length,
  };
}

/**
 * 一次產生完整射線（start → end）
 */
export function buildRay(
  source: RaySource,
  length: number
): { start: Vector2; end: Vector2 } {
  const start = getRayStart(source);
  const end = getRayEnd(start, source.angle, length);
  return { start, end };
}
