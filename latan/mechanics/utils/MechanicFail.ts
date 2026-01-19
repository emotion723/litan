import { MechanicContext } from '../IMechanic';

export interface MechanicFailOptions {
  /** 回溯到哪一秒 */
  rewindTo: number;
  /** 顯示文字 */
  text: string;
  /** 顯示幾秒 */
  duration: number;
}

/**
 * 標準機制失敗流程
 */
export function triggerMechanicFail(
  ctx: MechanicContext,
  opt: MechanicFailOptions
) {
  // 清場地特效
  ctx.setArenaState(prev => ({
    ...prev,
    rays: [],
    flowers: {
      white: { ...prev.flowers.white, visible: false },
      black: { ...prev.flowers.black, visible: false },
    },
  }));

  // 回溯時間軸並暫停
  ctx.rewindAndPause(opt.rewindTo);

  // 顯示失敗字樣
  ctx.showOverlay(opt.text, opt.duration);
}
