
export interface Vector2 {
  x: number;
  y: number;
}

export type ArenaID = 'Outer' | 'White' | 'Black';
export type GroupID = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'Idle';

export interface Entity {
  id: number;
  name: string;
  groupId: GroupID;
  pos: Vector2;
  angle: number;

  // 操作與狀態
  isAiming: boolean;
  aimingTimer: number;
  
  targetTimer: number;

  snapLockTimer: number;
  snapTargetAngle: number;
  snapCooldownTimer: number;

  color: string;
}

export interface RayPath {
  id?: string;       // 用於標識是哪個技能產生的射線
  arenaId: ArenaID;
  points: Vector2[];
  color: string;
  width?: number;
  opacity?: number;
  length?: number; 
}
