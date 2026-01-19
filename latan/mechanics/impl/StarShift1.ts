
import { IMechanic, MechanicContext } from '../IMechanic';
import { Vector2, RayPath } from '../../types/types';
import { ARENA_CENTER } from '../../world/GameConstants';
import { gateLocalPos } from '../../world/ArenaGeometry';
import { normalize, sub, add, mul, angleFromTo } from '../utils/ArenaMath';

enum Phase {
  Idle,
  Moving,      // 53-55s 跑位
  Aiming,      // 60-63s 瞄準指引
  Firing,      // 63-64s 正式發射
  Finished
}

export class StarShift1 implements IMechanic {
  readonly id = 'StarShift1';
  private phase = Phase.Idle;
  private participants: number[] = [];
  private moveStart = new Map<number, Vector2>();
  private moveEnd = new Map<number, Vector2>();
  private animTime = 0;

  private getPathPositions(gatePos: Vector2, isLeft: boolean): Vector2[] {
    const boss = { x: ARENA_CENTER, y: ARENA_CENTER };
    const toGate = sub(gatePos, boss);
    const dist = Math.hypot(toGate.x, toGate.y);
    const dir = normalize(toGate);
    const sideDir = { x: -dir.y, y: dir.x }; 
    
    // P2/P3 的偏移距離
    const lateralShift = (isLeft ? -1 : 1) * 440;

    const p1 = add(boss, mul(dir, dist * 0.28));
    const p4 = add(boss, mul(dir, dist * 0.72));

    const p2 = add(p1, mul(sideDir, lateralShift));
    const p3 = add(p4, mul(sideDir, lateralShift));

    return [p1, p2, p3, p4];
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    if (this.phase === Phase.Idle && t >= 53) {
      this.phase = Phase.Moving;
      this.animTime = 0;

      const whiteIdx = ctx.arenaState.gates.white[0] ?? 0;
      const purpleIdx = ctx.arenaState.gates.purple[0] ?? 0;
      const whiteGate = gateLocalPos('white', whiteIdx);
      const purpleGate = gateLocalPos('purple', purpleIdx);

      const candEntities = ctx.players.filter(
        p => (p.groupId === 'C' || p.groupId === 'D' || p.groupId === 'Idle')
      ).slice(0, 8);
      
      this.participants = candEntities.map(p => p.id);

      const path1 = this.getPathPositions(whiteGate, true);
      const path2 = this.getPathPositions(purpleGate, false);
      const allPositions = [...path1, ...path2];

      candEntities.forEach((p, i) => {
        this.moveStart.set(p.id, { ...p.pos });
        this.moveEnd.set(p.id, allPositions[i]);
        if (i === 0 || i === 4) p.targetTimer = 10;
      });
    }

    if (t === 60) this.phase = Phase.Aiming;
    if (t === 63) this.phase = Phase.Firing;

    if (t >= 65 && this.phase !== Phase.Idle) {
      this.phase = Phase.Finished;
      ctx.setArenaState(prev => ({ 
        ...prev, 
        rays: prev.rays.filter(r => !r.id?.startsWith('ss1-')) 
      }));
    }
  }

  onFrame(ctx: MechanicContext, dt: number): void {
    const t = ctx.battleTime;

    if (this.phase === Phase.Moving || this.phase === Phase.Aiming || this.phase === Phase.Firing) {
      if (this.animTime < 2) {
        this.animTime += dt;
        const progress = this.easeOutCubic(Math.min(this.animTime / 2, 1));
        this.participants.forEach(id => {
          const p = ctx.players.find(pl => pl.id === id);
          const start = this.moveStart.get(id);
          const end = this.moveEnd.get(id);
          if (p && start && end) {
            p.pos.x = start.x + (end.x - start.x) * progress;
            p.pos.y = start.y + (end.y - start.y) * progress;
          }
        });
      }
    }

    if (this.phase === Phase.Aiming || this.phase === Phase.Firing) {
      const whiteIdx = ctx.arenaState.gates.white[0] ?? 0;
      const purpleIdx = ctx.arenaState.gates.purple[0] ?? 0;
      const whiteGate = gateLocalPos('white', whiteIdx);
      const purpleGate = gateLocalPos('purple', purpleIdx);
      const boss = { x: ARENA_CENTER, y: ARENA_CENTER };

      const pArr = this.participants.map(id => {
        const p = ctx.players.find(pl => pl.id === id);
        if (p) {
          p.isAiming = true;
          p.aimingTimer = 0.5;
        }
        return p;
      });

      pArr.forEach((p, i) => {
        if (!p) return;
        let targetPos: Vector2;
        if (i === 3) targetPos = whiteGate;
        else if (i === 7) targetPos = purpleGate;
        else {
          const nextP = pArr[i + 1];
          targetPos = nextP ? nextP.pos : p.pos;
        }
        p.angle = angleFromTo(p.pos, targetPos);
      });

      const isFiring = this.phase === Phase.Firing;
      // 關鍵修復：瞄準階段使用 width: 4 (在 UI 會被渲染為虛線)，發射階段使用 width: 25
      const width = isFiring ? 25 : 4; 
      const opacity = isFiring ? 1 : 0.6;
      const color1 = isFiring ? '#ffffff' : '#00f2ff';
      const color2 = isFiring ? '#ff2d55' : '#ff7aa2';

      const ssRays: RayPath[] = [
        { 
          id: 'ss1-w', arenaId: 'Outer', color: color1, width, opacity,
          points: [boss, pArr[0]!.pos, pArr[1]!.pos, pArr[2]!.pos, pArr[3]!.pos, whiteGate] 
        },
        { 
          id: 'ss1-p', arenaId: 'Outer', color: color2, width, opacity,
          points: [boss, pArr[4]!.pos, pArr[5]!.pos, pArr[6]!.pos, pArr[7]!.pos, purpleGate] 
        }
      ];

      ctx.setArenaState(prev => ({
        ...prev,
        rays: [...prev.rays.filter(r => !r.id?.startsWith('ss1-')), ...ssRays]
      }));
    }
  }

  isFinished(): boolean { return this.phase === Phase.Finished; }
  reset(): void {
    this.phase = Phase.Idle;
    this.animTime = 0;
    this.participants = [];
    this.moveStart.clear();
    this.moveEnd.clear();
  }
}
