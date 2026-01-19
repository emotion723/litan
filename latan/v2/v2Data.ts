// v2/v2Data.ts
import { ArenaID } from '../types/types';

/** V2 預覽可用的場地選項 */
export const V2_ARENA_OPTIONS = [
  { id: 'Outer' as ArenaID, label: '外場' },
  { id: 'White' as ArenaID, label: '白內場' },
  { id: 'Black' as ArenaID, label: '黑內場' },
];

/** 
 * V2 專用靜態技能清單
 */
const V2_SKILLS_MAP: Record<ArenaID, { id: string; label: string }[]> = {
  Outer: [
    { id: 'StarShift1_Outer', label: '星移1、3' },
    { id: 'StarShift4_Outer', label: '星移4' },
    { id: 'StarShift5_Outer', label: '星移5' },
    { id: 'StarShift6_Outer', label: '星移6' },
    { id: 'DuoTian2_Outer', label: '奪天2' },
    { id: 'DuoTian3_Outer', label: '奪天3' },
    { id: 'Xun', label: '汛' },
  ],
  White: [
    { id: 'StarShift1_White', label: '星移1、3' },
    { id: 'StarShift4_White', label: '星移4' },
    { id: 'StarShift5_White', label: '星移5' },
    { id: 'StarShift6_White', label: '星移6' },
    { id: 'DuoTian2_White', label: '奪天2' },
    { id: 'DuoTian3_White', label: '奪天3' },
    { id: 'WenLan1', label: '溫瀾1' },
    { id: 'WenLan2', label: '溫瀾1' },
    { id: 'WenLan3', label: '溫瀾1' }
  ],
  Black: [
    { id: 'StarShift1_Black', label: '星移1、3' },
    { id: 'StarShift4_Black', label: '星移4' },
    { id: 'StarShift5_Black', label: '星移5' },
    { id: 'StarShift6_Black', label: '星移6' },
    { id: 'DuoTian1_Black', label: '奪天1' },
    { id: 'DuoTian2_Black', label: '奪天2' },
    { id: 'DuoTian3_Black', label: '奪天3' }
  ],
};

export function getV2SkillsByArena(arenaId: ArenaID) {
  return V2_SKILLS_MAP[arenaId] || [];
}