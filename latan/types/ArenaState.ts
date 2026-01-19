
// src/types/ArenaState.ts
import { RayPath, Vector2, ArenaID } from './types';

export type HazardCircle = {
  pos: Vector2;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
  fillProgress: number; // 0 to 1
  startTime: number;    // 生成時的戰鬥時間
  id: string;
  arenaId: ArenaID;     // 新增：所屬場地
};

/** 花的顯示狀態（一場地一朵） */
export type FlowerState = {
  visible: boolean;
  angle: number; // 弧度 0 ~ 2π
};

/** 門的顯示狀態（用 index 開啟） */
export type GatesState = {
  white: number[];   // 0~3（上右下左）
  purple: number[];  // 0~3（左上右上右下左下）
};

/** 場地唯一狀態（BattleArena 只吃這個） */
export type ArenaState = {
  flowers: {
    white: FlowerState;
    black: FlowerState;
  };
  gates: GatesState;
  rays: RayPath[];
  circles: HazardCircle[];
};

/** 初始狀態（重置 / 開場用） */
export const createInitialArenaState = (): ArenaState => ({
  flowers: {
    white: { visible: false, angle: 0 },
    black: { visible: false, angle: 0 },
  },
  gates: {
    white: [],
    purple: [],
  },
  rays: [],
  circles: [],
});
