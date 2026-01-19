// src/mechanics/MechanicManager.ts

import { IMechanic, MechanicContext } from './IMechanic';

export class MechanicManager {
  /** 目前正在執行的技能 */
  private mechanics: IMechanic[] = [];

  /** 加入一個技能（例如奪天） */
  add(mechanic: IMechanic) {
    this.mechanics.push(mechanic);
  }

  /** 清空所有技能（時間軸跳轉 / 重播用） */
  resetAll() {
    this.mechanics.forEach(m => m.reset?.());
    this.mechanics = [];
  }

  /** 每秒呼叫一次（由 index.tsx 觸發） */
  onSecond(ctx: MechanicContext) {
    this.mechanics.forEach(m => {
      m.onSecond(ctx);
    });

    this.cleanup();
  }

  /** 每幀呼叫（動畫 / 位移） */
  onFrame(ctx: MechanicContext, dt: number) {
    this.mechanics.forEach(m => {
      m.onFrame?.(ctx, dt);
    });

    this.cleanup();
  }

  /** 移除已結束的技能 */
  private cleanup() {
    this.mechanics = this.mechanics.filter(m => !m.isFinished());
  }

  /** 是否目前有技能在執行 */
  hasActiveMechanic(): boolean {
    return this.mechanics.length > 0;
  }
}
