
import { Entity, GroupID, ArenaID } from '../types/types';
import { ArenaState } from '../types/ArenaState';

/**
 * MechanicContext
 * =========================
 * 技能腳本唯一能接觸的世界資訊
 */
export interface MechanicContext {
  /** 當前戰鬥秒數（整數） */
  battleTime: number;

  /** 當前玩家控制的角色 ID */
  controlledId: number;

  /** 所有玩家（包含可操作玩家與 NPC） */
  players: Entity[];

  /** 各組玩家當前所屬場地的映射表 */
  groupArenaMap: Record<GroupID, ArenaID>;

  /** 目前場地狀態（花 / 門 / 雷射） */
  arenaState: ArenaState;

  /** 安全修改場地狀態（唯一入口） */
  setArenaState: (updater: (prev: ArenaState) => ArenaState) => void;

  /** 重置時間並暫停 */
  rewindAndPause: (time: number) => void;

  /** 顯示覆蓋文字 */
  showOverlay: (text: string, seconds: number) => void;
}

/**
 * IMechanic
 * =========================
 * 一個技能 = 一段可播放的「動畫 / 行為腳本」
 */
export interface IMechanic {
  readonly id: string;
  onSecond(ctx: MechanicContext): void;
  onFrame?(ctx: MechanicContext, dt: number): void;
  isFinished(): boolean;
  reset?(): void;
}
