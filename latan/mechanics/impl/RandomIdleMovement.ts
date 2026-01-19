
import { IMechanic, MechanicContext } from '../IMechanic';
import { GroupID, ArenaID } from '../../types/types';

interface WanderState {
  targetAngle: number;
  changeDirTimer: number;
}

interface WanderFilter {
  groups?: GroupID[];
  arenas?: ArenaID[];
  groupArenaMap?: Record<GroupID, ArenaID>;
}

export class RandomIdleMovement implements IMechanic {
  readonly id = 'RandomIdleMovement';
  private states = new Map<number, WanderState>();
  private readonly IDLE_SPEED = 180; // 低於玩家速度 (420)

  onSecond(ctx: MechanicContext): void {}

  /**
   * 執行動畫邏輯
   * @param filters 指定哪些組別或場地的玩家需要遊走
   */
  onFrame(ctx: MechanicContext, dt: number, filters?: WanderFilter): void {
    ctx.players.forEach(p => {
      // 玩家控制的或是被排除的組別不進行遊走
      if (p.id === ctx.controlledId) return;

      // 檢查過濾條件
      if (filters) {
        if (filters.groups && !filters.groups.includes(p.groupId)) return;
        if (filters.arenas && filters.groupArenaMap) {
          const arenaId = filters.groupArenaMap[p.groupId];
          if (!filters.arenas.includes(arenaId)) return;
        }
      }

      let state = this.states.get(p.id);
      if (!state) {
        state = { targetAngle: Math.random() * Math.PI * 2, changeDirTimer: 0 };
        this.states.set(p.id, state);
      }

      state.changeDirTimer -= dt;
      if (state.changeDirTimer <= 0) {
        state.targetAngle = Math.random() * Math.PI * 2;
        state.changeDirTimer = 1.5 + Math.random() * 1.5;
      }

      // 位移
      p.pos.x += Math.cos(state.targetAngle) * this.IDLE_SPEED * dt;
      p.pos.y += Math.sin(state.targetAngle) * this.IDLE_SPEED * dt;
      
      // 緩向旋轉
      let angleDiff = state.targetAngle - p.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      p.angle += angleDiff * 5 * dt;
    });
  }

  isFinished(): boolean { return false; }

  reset(): void {
    this.states.clear();
  }
}
