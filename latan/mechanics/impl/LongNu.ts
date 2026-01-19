
import { IMechanic, MechanicContext } from '../IMechanic';
import { Vector2 } from '../../types/types';
import { HazardCircle } from '../../types/ArenaState';
import { ARENA_CENTER, CIRCLE_RADIUS_PX } from '../../world/GameConstants';

enum Phase {
  Idle,
  Gathering,   // 40~42s 集合
  WaveStage,   // 43s+ 開始波次
  Finished
}

export class LongNu implements IMechanic {
  readonly id = 'LongNu';
  private phase = Phase.Idle;
  private animTime = 0;
  private moveStart = new Map<number, Vector2>();
  
  private getSOffsets(): Vector2[] {
    const offsets: Vector2[] = [];
    const count = 20; 
    const height = 1800;
    const amplitude = 180;
    
    for (let i = 0; i < count; i++) {
      const relY = (i / (count - 1)) - 0.5;
      const py = relY * height;
      const px = Math.sin(relY * Math.PI * 2) * amplitude;
      offsets.push({ x: px, y: py });
    }
    return offsets;
  }

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  private spawnSGroup(ctx: MechanicContext, centerX: number, centerY: number, startTime: number, waveId: string) {
    const offsets = this.getSOffsets();
    const newCircles: HazardCircle[] = [];

    offsets.forEach((offset, i) => {
      const worldX = centerX + offset.x;
      const worldY = centerY + offset.y;
      const distFromCenter = Math.hypot(worldX - ARENA_CENTER, worldY - ARENA_CENTER);
      
      if (distFromCenter < CIRCLE_RADIUS_PX + 50) {
        newCircles.push({
          id: `longnu-${waveId}-${i}-${startTime}`,
          pos: { x: worldX, y: worldY },
          radius: 0,
          maxRadius: 130,
          opacity: 1,
          color: '#ff2d55',
          fillProgress: 0,
          startTime: startTime,
          arenaId: 'White'
        });
      }
    });

    ctx.setArenaState(prev => ({
      ...prev,
      circles: [...prev.circles, ...newCircles]
    }));
  }

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    // 40~42s: 篩選 A/B 組玩家集合
    if (this.phase === Phase.Idle && t >= 40) {
      this.phase = Phase.Gathering;
      this.animTime = 0;
      this.moveStart.clear();
      
      const candidates = ctx.players.filter(
        p => (p.groupId === 'A' || p.groupId === 'B') && p.id !== ctx.controlledId
      );

      candidates.forEach(p => {
        this.moveStart.set(p.id, { ...p.pos });
      });
    }

    if (t >= 43 && t <= 52) {
      this.phase = Phase.WaveStage;
      if (t === 43) {
        this.spawnSGroup(ctx, ARENA_CENTER, ARENA_CENTER, t, 'center');
      } 
      else if (t >= 46 && t <= 50) {
        const waveIdx = t - 45; 
        const spreadDistance = waveIdx * 320;
        this.spawnSGroup(ctx, ARENA_CENTER - spreadDistance, ARENA_CENTER, t, `left-${waveIdx}`);
        this.spawnSGroup(ctx, ARENA_CENTER + spreadDistance, ARENA_CENTER, t, `right-${waveIdx}`);
      }
    }

    if (t > 53) {
      this.phase = Phase.Finished;
      ctx.setArenaState(prev => ({ ...prev, circles: [] }));
    }
  }

  onFrame(ctx: MechanicContext, dt: number): void {
    const t = ctx.battleTime;

    if (this.phase === Phase.Gathering) {
      this.animTime += dt;
      const progress = this.easeOutCubic(Math.min(this.animTime / 2, 1));
      this.moveStart.forEach((startPos, id) => {
        const p = ctx.players.find(pl => pl.id === id);
        if (p) {
          p.pos.x = startPos.x + (ARENA_CENTER - startPos.x) * progress;
          p.pos.y = startPos.y + (ARENA_CENTER - startPos.y) * progress;
        }
      });
    }

    if (ctx.arenaState.circles.length > 0) {
      ctx.setArenaState(prev => ({
        ...prev,
        circles: prev.circles.map(c => {
          const age = t - c.startTime;
          const isFirstWave = c.startTime === 43;
          const fillDuration = isFirstWave ? 3 : 1;
          const fill = Math.min(age / fillDuration, 1);
          const opacity = age >= fillDuration + 0.1 ? 0 : 1;
          return { ...c, fillProgress: fill, opacity: opacity };
        }).filter(c => c.opacity > 0)
      }));
    }
  }

  isFinished(): boolean { return this.phase === Phase.Finished; }
  reset(): void {
    this.phase = Phase.Idle;
    this.animTime = 0;
    this.moveStart.clear();
  }
}
