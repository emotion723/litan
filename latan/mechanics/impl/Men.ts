
import { IMechanic, MechanicContext } from '../IMechanic';

export class Men implements IMechanic {
  readonly id = 'Men';
  private active = false;
  private whiteIdx: number | null = null;
  private purpleIdx: number | null = null;

  onSecond(ctx: MechanicContext): void {
    const t = ctx.battleTime;

    // 44s 開啟門，隨機選擇一個方位索引 (0~3)
    if (t === 44 && !this.active) {
      this.active = true;
      this.whiteIdx = Math.floor(Math.random() * 4);
      this.purpleIdx = Math.floor(Math.random() * 4);
      
      ctx.setArenaState(prev => ({
        ...prev,
        gates: {
          white: [this.whiteIdx!],
          purple: [this.purpleIdx!]
        }
      }));
    }

    // 移除原有的 t > 52 消失邏輯，讓門永久存在
  }

  onFrame(ctx: MechanicContext, dt: number): void {}

  isFinished(): boolean { return false; }
  
  reset(): void { 
    this.active = false; 
    this.whiteIdx = null;
    this.purpleIdx = null;
  }
}
