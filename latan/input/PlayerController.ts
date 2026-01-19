// src/input/PlayerController.ts
import { Entity, GroupID, ArenaID } from '../types/types';

/* =====================
 * Context
 * ===================== */
export interface PlayerControlContext {
  controlledId: number;
  players: Entity[];
  groupArenaMap: Record<GroupID, ArenaID>;
  dt: number; // 秒
}

/* =====================
 * 常數（對齊你之前的手感）
 * ===================== */
const MOVE_SPEED = 420;          // px / sec
const TURN_SPEED = 2.5;          // rad / sec
const AIM_DURATION = 5;          // 秒

const SNAP_CONE_DEG = 10;
const SNAP_CONE_RAD = (SNAP_CONE_DEG * Math.PI) / 180;
const SNAP_HOLD_TIME = 1.0;      // 秒（≈ 60 frame）

/* =====================
 * Key State
 * ===================== */
const keyState: Record<string, boolean> = {};

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k.startsWith('arrow')) e.preventDefault();
  keyState[k] = true;
});

window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k.startsWith('arrow')) e.preventDefault();
  keyState[k] = false;
});

/* =====================
 * 吸附判定
 * ===================== */
function trySnapToPlayer(
  self: Entity,
  all: Entity[],
  arenaMap: Record<GroupID, ArenaID>
): number | null {
  let best: number | null = null;
  let bestDiff = SNAP_CONE_RAD;

  for (const other of all) {
    if (other.id === self.id) continue;
    if (arenaMap[other.groupId] !== arenaMap[self.groupId]) continue;

    const dx = other.pos.x - self.pos.x;
    const dy = other.pos.y - self.pos.y;
    const ang = Math.atan2(dy, dx);

    let diff = ang - self.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    if (Math.abs(diff) < bestDiff) {
      bestDiff = Math.abs(diff);
      best = ang;
    }
  }

  return best;
}

/* =====================
 * 主更新
 * ===================== */
export function updatePlayerControl(ctx: PlayerControlContext) {
  const player = ctx.players.find(p => p.id === ctx.controlledId);
  if (!player) return;

  /* ---------- 開鏡邏輯 ---------- */
  if (keyState['z'] && player.aimingTimer <= 0) {
    player.aimingTimer = AIM_DURATION;
  }

  if (player.aimingTimer > 0) {
    player.aimingTimer -= ctx.dt;
    player.isAiming = true;
  } else {
    player.isAiming = false;
    player.snapLockTimer = 0;
  }

  /* ---------- 轉向（A / D）---------- */
  if (keyState['a']) {
    player.angle -= TURN_SPEED * ctx.dt;
  }
  if (keyState['d']) {
    player.angle += TURN_SPEED * ctx.dt;
  }

  /* ---------- 移動（方向鍵，僅非開鏡）---------- */
  if (!player.isAiming) {
    let mx = 0;
    let my = 0;

    if (keyState['arrowup']) my -= 1;
    if (keyState['arrowdown']) my += 1;
    if (keyState['arrowleft']) mx -= 1;
    if (keyState['arrowright']) mx += 1;

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      const dx = mx / len;
      const dy = my / len;

      player.pos.x += dx * MOVE_SPEED * ctx.dt;
      player.pos.y += dy * MOVE_SPEED * ctx.dt;

      // 面向移動方向
      player.angle = Math.atan2(dy, dx);
    }
  }

  /* ---------- 吸附（只在開鏡）---------- */
  if (player.isAiming) {
    const snapAngle = trySnapToPlayer(
      player,
      ctx.players,
      ctx.groupArenaMap
    );

    if (snapAngle !== null) {
      if (player.snapTargetAngle === snapAngle) {
        player.snapLockTimer += ctx.dt;
      } else {
        player.snapTargetAngle = snapAngle;
        player.snapLockTimer = 0;
      }

      if (player.snapLockTimer >= SNAP_HOLD_TIME) {
        player.angle = snapAngle;
      }
    } else {
      player.snapLockTimer = 0;
    }
  }
}
