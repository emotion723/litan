
import { IMechanic, MechanicContext } from '../IMechanic';
import { Vector2 } from '../../types/types';
import { ARENA_CENTER, SQUARE_HALF_PX } from '../../world/GameConstants';

enum Phase {
  Idle,
  Spread,      // 42-44s 位移
  Waiting,     // 44-46s
  Chain,       // 46-47s 連線
  Explosion,   // 47-48s 爆炸
  Finished
}

export class XueLian implements IMechanic {
  readonly id = 'XueLian';
  private phase = Phase.Idle;
  private animTime = 0;
  private moveStart = new Map<number, Vector2>();
  private moveEnd = new Map<number, Vector2>();
  private pairs: [number, number][] = []; // 儲存配對 ID
  private candidates: number[] = [];

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    if (this.phase === Phase.Idle && t >= 42) {
      this.phase = Phase.Spread;
      this.animTime = 0;
      this.moveStart.clear();
      this.moveEnd.clear();
      this.pairs = [];

      // 篩選 EF 組玩家 (包含操作者，確保總共 8 人)
      const candEntities = ctx.players.filter(
        p => (p.groupId === 'E' || p.groupId === 'F')
      );
      this.candidates = candEntities.map(p => p.id);

      // 隨機分配 8 個方向
      const directions = Array.from({ length: 8 }, (_, i) => (i * 45 * Math.PI) / 180);
      directions.sort(() => Math.random() - 0.5);

      candEntities.forEach((p, i) => {
        this.moveStart.set(p.id, { ...p.pos });
        const angle = directions[i % 8];
        const dist = SQUARE_HALF_PX * 0.8; 
        this.moveEnd.set(p.id, {
          x: ARENA_CENTER + Math.cos(angle) * dist,
          y: ARENA_CENTER + Math.sin(angle) * dist
        });
      });

      // 隨機倆倆配對 (共 4 對，包含操作者)
      const shuffled = [...this.candidates].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i+1] !== undefined) {
          this.pairs.push([shuffled[i], shuffled[i+1]]);
        }
      }
    }

    // 46s 四條連線
    if (t === 46) {
      this.phase = Phase.Chain;
      const newRays = this.pairs.map(([id1, id2]) => {
        const p1 = ctx.players.find(p => p.id === id1);
        const p2 = ctx.players.find(p => p.id === id2);
        return {
          arenaId: 'Black' as const,
          points: [p1!.pos, p2!.pos],
          color: '#ff2d55',
          width: 12,
          opacity: 1
        };
      });

      ctx.setArenaState(prev => ({
        ...prev,
        rays: [...prev.rays, ...newRays]
      }));
    }

    // 47s 8個爆炸
    if (t === 47) {
      this.phase = Phase.Explosion;
      // 移除連線
      ctx.setArenaState(prev => ({ ...prev, rays: prev.rays.filter(r => r.color !== '#ff2d55') }));

      const explosionCircles = this.candidates.map(tid => {
        const p = ctx.players.find(pl => pl.id === tid);
        return {
          id: `xuelian-exp-${tid}`,
          pos: p ? { ...p.pos } : { x: 0, y: 0 },
          radius: 0,
          maxRadius: 220,
          opacity: 1,
          color: '#ff2d55',
          fillProgress: 1,
          startTime: t,
          arenaId: 'Black' as const
        };
      });

      ctx.setArenaState(prev => ({
        ...prev,
        circles: [...prev.circles, ...explosionCircles]
      }));
    }

    // 48s 結束
    if (t >= 48 && this.phase === Phase.Explosion) {
      this.phase = Phase.Finished;
      ctx.setArenaState(prev => ({
        ...prev,
        circles: prev.circles.filter(c => !c.id.startsWith('xuelian-exp'))
      }));
    }
  }

  onFrame(ctx: MechanicContext, dt: number): void {
    if (this.phase === Phase.Spread) {
      this.animTime += dt;
      const progress = this.easeOutCubic(Math.min(this.animTime / 2, 1));
      
      this.moveStart.forEach((start, id) => {
        const p = ctx.players.find(pl => pl.id === id);
        const end = this.moveEnd.get(id);
        if (p && end) {
          p.pos.x = start.x + (end.x - start.x) * progress;
          p.pos.y = start.y + (end.y - start.y) * progress;
          const dx = end.x - start.x, dy = end.y - start.y;
          if (Math.hypot(dx, dy) > 1) p.angle = Math.atan2(dy, dx);
        }
      });
      if (this.animTime >= 2) this.phase = Phase.Waiting;
    }

    if (this.phase === Phase.Explosion) {
      ctx.setArenaState(prev => ({
        ...prev,
        circles: prev.circles.map(c => 
          c.id.startsWith('xuelian-exp') ? { ...c, opacity: Math.max(0, c.opacity - dt * 2.5) } : c
        )
      }));
    }
  }

  isFinished(): boolean { return this.phase === Phase.Finished; }
  reset(): void {
    this.phase = Phase.Idle;
    this.animTime = 0;
    this.moveStart.clear();
    this.moveEnd.clear();
    this.pairs = [];
    this.candidates = [];
  }
}
