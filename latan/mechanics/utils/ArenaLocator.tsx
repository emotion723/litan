// src/mechanics/utils/ArenaLocator.ts
import { MechanicContext } from '../IMechanic';
import { ArenaID, Vector2, GroupID } from '../../types/types';
import {
  bossLocalPos,
  flowerLocalPos,
  gateLocalPos,
} from '../../world/ArenaGeometry';

export type LocRef =
  | { kind: 'boss'; arena: ArenaID }
  | { kind: 'flower'; arena: ArenaID }
  | { kind: 'player'; playerId: number }
  | { kind: 'gate'; arena: ArenaID; gateKind: 'white' | 'purple'; index: number };

export function resolveLocalPos(ref: LocRef, ctx: MechanicContext): Vector2 | null {
  switch (ref.kind) {
    case 'boss':
      return bossLocalPos(ref.arena);

    case 'flower':
      return flowerLocalPos(ref.arena, ctx.arenaState);

    case 'player': {
      const p = ctx.players.find(p => p.id === ref.playerId);
      return p ? { x: p.pos.x, y: p.pos.y } : null;
    }

    case 'gate': {
      // gateLocalPos 本身不帶 arena，因為位置是以 arena-local 表示
      return gateLocalPos(ref.gateKind, ref.index);
    }
  }
}

/** 方便你直接拿兩點距離 */
export function distanceOf(a: LocRef, b: LocRef, ctx: MechanicContext): number | null {
  const pa = resolveLocalPos(a, ctx);
  const pb = resolveLocalPos(b, ctx);
  if (!pa || !pb) return null;
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}
