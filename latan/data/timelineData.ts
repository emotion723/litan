
import { ArenaID, GroupID } from '../types/types';

export const ARENA_CONFIGS: Record<ArenaID, { name: string; color: string; timelineLabel: string }> = {
  Outer: { name: '外場', color: '#f9ff00', timelineLabel: '外場' },
  White: { name: '白內場', color: '#00f2ff', timelineLabel: '白(王道)' },
  Black: { name: '黑內場', color: '#ff2d55', timelineLabel: '黑(霸道)' }
};

export const GROUP_COLORS: Record<GroupID, string> = {
  A: '#00f2ff', B: '#00f2ff',
  C: '#f9ff00', D: '#f9ff00', Idle: '#f9ff00',
  E: '#ff2d55', F: '#ff2d55'
};

export const START_POINTS = [
  { label: '0:00 開場', time: 0 },
  { label: '0:11 幻龍結算', time: 11 },
  { label: '1:04 星移1結算', time: 64 },
  { label: '1:57 星移2結算', time: 117 },
  { label: '2:50 星移3結算', time: 170 },
  { label: '3:44 星移4結算', time: 224 },
  { label: '4:37 星移5結算', time: 277 },
  { label: '5:30 星移6結算', time: 330 }
];

export const SKILLS: Record<ArenaID, { time: number; name: string }[]> = {
  Outer: [
    { time: 3, name: '幻龍引界' },
    { time: 10, name: '引界結算' },
    { time: 25, name: '汛' },
    { time: 44, name: '門' },
    { time: 53, name: '星移1' },
    { time: 63, name: '星移1結算' },
    { time: 68, name: '換斗讀條' },
    { time: 73, name: '換斗結算' },
    { time: 88, name: '雙龍破' },
    { time: 106, name: '星移2' },
    { time: 116, name: '星移2結算' },
    { time: 121, name: '迅' },
    { time: 137, name: '龍威' },
    { time: 159, name: '星移3' },
    { time: 169, name: '星移3結算' },
    { time: 174, name: '影龍騰空' },
    { time: 191, name: '雙龍破' },
    { time: 196, name: '2門' },
    { time: 213, name: '星移4' },
    { time: 223, name: '星移4結算' },
    { time: 232, name: '8幻歌' },
    { time: 266, name: '星移5' },
    { time: 276, name: '星移5結算' },
    { time: 280, name: '門' },
    { time: 291, name: '迅' },
    { time: 305, name: '九鼎至尊' },
    { time: 319, name: '星移6' },
    { time: 329, name: '星移6結算' },
    { time: 338, name: '雙龍破' },
    { time: 352, name: '汛' },
    { time: 372, name: '星移7' }
  ],
  White: [
    { time: 18, name: '溫瀾1' },
    { time: 42, name: '龍怒' },
    { time: 44, name: '門' },
    { time: 53, name: '星移1' },
    { time: 63, name: '星移1結算' },
    { time: 73, name: '換斗結算' },
    { time: 85, name: '幻景' },
    { time: 104, name: '浮漚' },
    { time: 106, name: '星移2' },
    { time: 116, name: '星移2結算' },
    { time: 126, name: '溫瀾2' },
    { time: 161, name: '九鼎傾漩渦' },
    { time: 174, name: '影龍騰空' },
    { time: 179, name: '波痕泛影' },
    { time: 196, name: '2門' },
    { time: 249, name: '龍怒' },
    { time: 266, name: '星移5' },
    { time: 276, name: '星移5結算' },
    { time: 280, name: '門+波痕泛影' },
    { time: 315, name: '幻景' },
    { time: 319, name: '星移6' },
    { time: 329, name: '星移6結算' },
    { time: 335, name: '溫瀾3' },
    { time: 352, name: '浮漚' },
    { time: 372, name: '星移7' }
  ],
  Black: [
    { time: 18, name: '奪天1' },
    { time: 42, name: '血鍊' },
    { time: 44, name: '門' },
    { time: 53, name: '星移1' },
    { time: 63, name: '星移1結算' },
    { time: 73, name: '換斗結算' },
    { time: 85, name: '幻域' },
    { time: 93, name: '怒焰吐息' },
    { time: 106, name: '星移2' },
    { time: 116, name: '星移2結算' },
    { time: 119, name: '惡意凝聚' },
    { time: 126, name: '惡意釋放' },
    { time: 149, name: '赤龍血鏈' },
    { time: 174, name: '影龍騰空' },
    { time: 179, name: '怒焰吐息' },
    { time: 196, name: '2門' },
    { time: 236, name: '怒焰龍鱗' },
    { time: 242, name: '怒焰吐息' },
    { time: 266, name: '星移5' },
    { time: 276, name: '星移5結算' },
    { time: 278, name: '赤龍血鏈' },
    { time: 280, name: '門' },
    { time: 284, name: '惡意凝聚' },
    { time: 291, name: '惡意釋放' },
    { time: 304, name: '黑花 奪天' },
    { time: 315, name: '幻域' },
    { time: 319, name: '星移6' },
    { time: 329, name: '星移6結算' },
    { time: 333, name: '怒焰吐息' },
    { time: 354, name: '奪天3' },
    { time: 372, name: '星移7' }
  ]
};

// --- 場地 Map 組合 ---

const MAP_ALL_OUTER: Record<GroupID, ArenaID> = {
  A: 'Outer', B: 'Outer', C: 'Outer', D: 'Outer', E: 'Outer', F: 'Outer', Idle: 'Outer'
};

const MAP_PHASE_1: Record<GroupID, ArenaID> = {
  A: 'White', B: 'White',
  E: 'Black', F: 'Black',
  C: 'Outer', D: 'Outer', Idle: 'Outer'
};

const MAP_STAR_SHIFT_1: Record<GroupID, ArenaID> = {
  E: 'White', F: 'White',
  A: 'Black', B: 'Black',
  C: 'Outer', D: 'Outer', Idle: 'Outer'
};

const MAP_STAR_SHIFT_3: Record<GroupID, ArenaID> = {
  A: 'White', B: 'White',
  E: 'Black', F: 'Black',
  C: 'Outer', D: 'Outer', Idle: 'Outer'
};

const MAP_STAR_SHIFT_4: Record<GroupID, ArenaID> = {
  A: 'White',
  E: 'Black',
  B: 'Outer', C: 'Outer', D: 'Outer', F: 'Outer', Idle: 'Outer'
};

const MAP_STAR_SHIFT_5: Record<GroupID, ArenaID> = {
  A: 'White',
  C: 'Black', D: 'Black',
  B: 'Outer', E: 'Outer', F: 'Outer', Idle: 'Outer'
};

const MAP_STAR_SHIFT_6: Record<GroupID, ArenaID> = {
  C: 'White', D: 'White',
  A: 'Black', F: 'Black',
  B: 'Outer', E: 'Outer', Idle: 'Outer'
};

export function getMappingForTime(time: number): Record<GroupID, ArenaID> {
  if (time < 11) return MAP_ALL_OUTER;
  if (time < 63) return MAP_PHASE_1;
  if (time < 169) return MAP_STAR_SHIFT_1;
  if (time < 223) return MAP_STAR_SHIFT_3;
  if (time < 276) return MAP_STAR_SHIFT_4;
  if (time < 329) return MAP_STAR_SHIFT_5;
  return MAP_STAR_SHIFT_6;
}
