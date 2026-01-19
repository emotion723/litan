
// src/mechanics/impl/WenLan1.ts
import { IMechanic, MechanicContext } from '../IMechanic';
import { resolveLocalPos } from '../utils/ArenaLocator';
import { Vector2 } from '../../types/types';
import { clampToArena } from '../utils/ArenaUtils';
import { sub, normalize, add, mul, angleFromTo } from '../utils/ArenaMath';
import { getRayStart } from '../utils/RayOrigin';
import { raycastBoundaryOnly } from '../utils/RaycastAiming';

enum Phase {
  Idle,
  SpawnFlower,
  LockTarget,
  MoveAnimation,
  Aim,
  Fire,
  Finished,
}

export class WenLan1 implements IMechanic {
  readonly id = 'WenLan1';
  private phase: Phase = Phase.Idle;
  private targetId: number | null = null;
  private lockedFireAngle: number | null = null;
  private animTime = 0;
  private moveStart = new Map<number, Vector2>();
  private moveEnd = new Map<number, Vector2>();

  private enterPhase(t: number, p: Phase) {
    this.phase = p;
    this.animTime = 0;
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    switch (this.phase) {
      case Phase.Idle:
        if (t >= 13) this.enterPhase(t, Phase.SpawnFlower);
        break;
      case Phase.SpawnFlower: {
        const angle = Math.random() * Math.PI * 2;
        ctx.setArenaState(prev => ({
          ...prev,
          flowers: { ...prev.flowers, white: { visible: true, angle } },
        }));
        this.enterPhase(t, Phase.LockTarget);
        break;
      }
      case Phase.LockTarget: {
        const candidates = ctx.players.filter(p => p.groupId === 'A' || p.groupId === 'B');
        if (!candidates.length) { this.enterPhase(t, Phase.Finished); break; }
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        this.targetId = pick.id;
        pick.targetTimer = 7;
        const boss = resolveLocalPos({ kind: 'boss', arena: 'White' }, ctx)!;
        const flower = resolveLocalPos({ kind: 'flower', arena: 'White' }, ctx)!;
        const u = normalize(sub(flower, boss));
        candidates.forEach(p => {
          this.moveStart.set(p.id, { ...p.pos });
          if (p.id === this.targetId) {
            const mid = add(boss, mul(u, 0.5 * Math.hypot(flower.x - boss.x, flower.y - boss.y)));
            clampToArena(mid, p.groupId);
            this.moveEnd.set(p.id, mid);
          } else {
            this.moveEnd.set(p.id, { ...p.pos });
          }
        });
        this.enterPhase(t, Phase.MoveAnimation);
        break;
      }
      case Phase.MoveAnimation:
        if (t >= 18) this.enterPhase(t, Phase.Aim);
        break;
      case Phase.Aim:
        if (t >= 21) this.enterPhase(t, Phase.Fire);
        break;
      case Phase.Fire: {
        if (this.targetId === null) break;
        const target = ctx.players.find(p => p.id === this.targetId);
        if (!target) break;
        const boss = resolveLocalPos({ kind: 'boss', arena: 'White' }, ctx)!;
        const fireAngle = this.lockedFireAngle ?? target.angle;
        const start = getRayStart({ kind: 'player', pos: target.pos, angle: fireAngle });
        const hit = raycastBoundaryOnly(start, fireAngle, 'White');

        ctx.setArenaState(prev => ({
          ...prev,
          rays: [...prev.rays.filter(r => !r.id?.startsWith('wenlan-')), { 
            id: 'wenlan-laser', 
            arenaId: 'White', 
            color: '#ffffff', 
            points: [boss, target.pos, hit.point], 
            width: 60 
          }],
        }));
        this.enterPhase(t, Phase.Finished);
        break;
      }
    }

    if (t === 22) {
      ctx.setArenaState(prev => ({
        ...prev,
        rays: prev.rays.filter(r => !r.id?.startsWith('wenlan-')),
        flowers: { ...prev.flowers, white: { ...prev.flowers.white, visible: false } }
      }));
    }
  }

  onFrame(ctx: MechanicContext, dt: number): void {
    const t = ctx.battleTime;
    const boss = resolveLocalPos({ kind: 'boss', arena: 'White' }, ctx)!;

    if (this.phase === Phase.MoveAnimation) {
      this.animTime += dt;
      const p = this.easeOutCubic(Math.min(this.animTime / 2, 1));
      ctx.players.forEach(pl => {
        const s = this.moveStart.get(pl.id);
        const e = this.moveEnd.get(pl.id);
        if (s && e) {
          pl.pos.x = s.x + (e.x - s.x) * p;
          pl.pos.y = s.y + (e.y - s.y) * p;
        }
      });
    }

    if (this.phase === Phase.Aim && this.targetId !== null) {
      const target = ctx.players.find(p => p.id === this.targetId);
      if (target) {
        target.isAiming = true;
        target.aimingTimer = 21 - t; 
        target.angle = angleFromTo(target.pos, boss);
        this.lockedFireAngle = target.angle;

        const hit = raycastBoundaryOnly(target.pos, target.angle, 'White');

        const guideRay = {
          id: 'wenlan-guide',
          arenaId: 'White' as const,
          color: '#ffffff',
          width: 15, 
          opacity: 0.5,
          points: [boss, target.pos, hit.point]
        };

        ctx.setArenaState(prev => ({
          ...prev,
          rays: [...prev.rays.filter(r => r.id !== 'wenlan-guide'), guideRay]
        }));
      }
    }
  }

  isFinished(): boolean { return this.phase === Phase.Finished; }
  reset(): void {
    this.phase = Phase.Idle;
    this.targetId = null;
    this.moveStart.clear();
    this.moveEnd.clear();
  }
}
