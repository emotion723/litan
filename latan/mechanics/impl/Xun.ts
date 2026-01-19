
import { IMechanic, MechanicContext } from '../IMechanic';
import { Vector2, RayPath } from '../../types/types';
import { resolveLocalPos } from '../utils/ArenaLocator';
import { SQUARE_HALF_PX } from '../../world/GameConstants';

enum Phase {
  Idle,
  MoveToEdge,    // 25s - 27s (散開動畫)
  BossBurst,     // 27s - 28s (王對玩家射)
  CrossBurst,    // 28s - 30s (邊緣交叉射)
  Finished,
}

export class Xun implements IMechanic {
  readonly id = 'Xun';
  private phase: Phase = Phase.Idle;
  
  // 紀錄參與機制的玩家 ID 與他們的目標方位
  private participants: { id: number; angle: number }[] = [];
  private moveStart = new Map<number, Vector2>();
  private moveEnd = new Map<number, Vector2>();
  private animTime = 0;

  private easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    switch (this.phase) {
      case Phase.Idle:
        if (t >= 25) {
          this.phase = Phase.MoveToEdge;
          this.animTime = 0;
          this.moveStart.clear();
          this.moveEnd.clear();

          // 1. 找尋參與者：在外場且非操作者的 NPC (C 組 + D 組 + Idle 共 9 人)
          const candidates = ctx.players.filter(p => 
             p.id !== ctx.controlledId && 
             (p.groupId === 'C' || p.groupId === 'D' || p.groupId === 'Idle')
          ).slice(0, 9); 

          const boss = resolveLocalPos({ kind: 'boss', arena: 'Outer' }, ctx)!;
          // 改為 9 人，每 40 度一個
          const angles = Array.from({ length: 9 }, (_, i) => (i * 40 * Math.PI) / 180);

          this.participants = candidates.map((p, i) => {
            const ang = angles[i];
            this.moveStart.set(p.id, { ...p.pos });
            
            // 計算邊緣座標
            const dist = SQUARE_HALF_PX * 0.95; 
            const dest = {
              x: boss.x + Math.cos(ang) * dist,
              y: boss.y + Math.sin(ang) * dist
            };
            this.moveEnd.set(p.id, dest);
            return { id: p.id, angle: ang };
          });
        }
        break;

      case Phase.MoveToEdge:
        if (t >= 27) {
          this.phase = Phase.BossBurst;
          
          // 第一波：王對 9 個參與者位置發射矩形
          const boss = resolveLocalPos({ kind: 'boss', arena: 'Outer' }, ctx)!;
          
          const newRays: RayPath[] = this.participants.map(p => ({
            arenaId: 'Outer',
            color: '#ff2d55',
            width: 80, 
            opacity: 0.5,
            points: [
              boss,
              this.moveEnd.get(p.id)!
            ]
          }));

          ctx.setArenaState(prev => ({ ...prev, rays: newRays }));
        }
        break;

      case Phase.BossBurst:
        if (t >= 28) {
          this.phase = Phase.CrossBurst;

          // 第二波：從玩家邊緣位置向內斜射 30 度矩形
          const newRays: RayPath[] = this.participants.map(p => {
            const start = this.moveEnd.get(p.id)!;
            // 方位偏移 30 度向內射 (Math.PI / 6)
            const fireAngle = p.angle + Math.PI + (Math.PI / 6); 
            
            return {
              arenaId: 'Outer',
              color: '#ff2d55',
              width: 80,
              opacity: 0.7,
              points: [
                start,
                {
                  x: start.x + Math.cos(fireAngle) * 3000, // 增加長度確保貫穿
                  y: start.y + Math.sin(fireAngle) * 3000
                }
              ]
            };
          });

          ctx.setArenaState(prev => ({ ...prev, rays: newRays }));
        }
        break;

      case Phase.CrossBurst:
        if (t >= 30) {
          ctx.setArenaState(prev => ({ ...prev, rays: [] }));
          this.phase = Phase.Finished;
        }
        break;
    }
  }

  onFrame(ctx: MechanicContext, dt: number): void {
    if (this.phase === Phase.MoveToEdge) {
      this.animTime += dt;
      const progress = this.easeOutCubic(Math.min(this.animTime / 2, 1));
      
      this.participants.forEach(item => {
        const p = ctx.players.find(pl => pl.id === item.id);
        const start = this.moveStart.get(item.id);
        const end = this.moveEnd.get(item.id);
        
        if (p && start && end) {
          p.pos.x = start.x + (end.x - start.x) * progress;
          p.pos.y = start.y + (end.y - start.y) * progress;
          
          // 轉向：面向散開的方向
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          if (Math.hypot(dx, dy) > 1) {
            p.angle = Math.atan2(dy, dx);
          }
        }
      });
    }
  }

  isFinished(): boolean {
    return this.phase === Phase.Finished;
  }

  reset(): void {
    this.phase = Phase.Idle;
    this.moveStart.clear();
    this.moveEnd.clear();
    this.participants = [];
    this.animTime = 0;
  }
}
