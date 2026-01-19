
// import { IMechanic, MechanicContext } from '../IMechanic';
// import { ExtendedPlayer } from '../../types';

// export class SplitPrep implements IMechanic {
//   id = 'SplitPrep';

//   claimsPlayer(player: ExtendedPlayer, ctx: MechanicContext): boolean {
//     return !player.isControlled;
//   }

//   onSecondTick(ctx: MechanicContext) {}
//   update(ctx: MechanicContext, delta: number) {}
//   onCheck(ctx: MechanicContext) {}

//   updateNPC(p: ExtendedPlayer, ctx: MechanicContext) {
//     const t = ctx.battleTime;
//     const params = ctx.getPlayerArenaParams('Emperor', 0);

//     if (t < 4) {
//       // 0~4 秒：快速亂動
//       if (Math.random() < 0.25) {
//         p.vel.x += (Math.random() - 0.5) * 6.5;
//         p.vel.y += (Math.random() - 0.5) * 6.5;
//       }
//     } else if (t < 6.5) {
//       // 4~6.5 秒：組成兩堆
//       let groupOffsetX = 0;
//       let groupOffsetY = 0;

//       // 左邊 (E,F) 與 右邊 (A,B) 各成一堆
//       if (['A', 'B'].includes(p.group)) {
//         groupOffsetX = 450; groupOffsetY = 0;
//       } else if (['E', 'F'].includes(p.group)) {
//         groupOffsetX = -450; groupOffsetY = 0;
//       } else {
//         // C, D 組在中央稍偏處
//         groupOffsetX = 0; groupOffsetY = p.group === 'C' ? 250 : -250;
//       }

//       const tx = params.centerX + groupOffsetX;
//       const ty = params.centerY + groupOffsetY;
//       const dx = tx - p.pos.x;
//       const dy = ty - p.pos.y;
//       const dist = Math.sqrt(dx * dx + dy * dy);

//       if (dist > 5) {
//         p.vel.x += (dx / dist) * 1.3;
//         p.vel.y += (dy / dist) * 1.3;
//       }
//     }
//     // 6s 之後保持靜止集合狀態，不進行合併

//     p.vel.x *= 0.82;
//     p.vel.y *= 0.82;
//   }
// }
