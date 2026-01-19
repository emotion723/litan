// v2/V2Renderer.tsx
import React, { useState, useEffect } from 'react';
import { ArenaID } from '../types/types';

/* ===== 場地 ===== */
import { BlackArena } from './arenas/BlackArena';
import { WhiteArena } from './arenas/WhiteArena';
import { OuterArena } from './arenas/OuterArena';

/* ===== 技能 (V2 專用 React 組件) ===== */
import { DuoTian1_Black } from './skills/DuoTian1_Black';
import { DuoTian2_Outer } from './skills/DuoTian2_Outer';
import { DuoTian2_White } from './skills/DuoTian2_White';
import { DuoTian2_Black } from './skills/DuoTian2_Black';
import { DuoTian3_Outer } from './skills/DuoTian3_Outer';
import { DuoTian3_White } from './skills/DuoTian3_White';
import { DuoTian3_Black } from './skills/DuoTian3_Black';
import { WenLanSkill } from './skills/WenLanSkill';
import { XunV2 } from './skills/XunV2';
import { StarShift1_Outer } from './skills/StarShift1_Outer';
import { StarShift2_Outer } from './skills/StarShift2_Outer';
import { StarShift3_Outer } from './skills/StarShift3_Outer';
import { StarShift4_Outer } from './skills/StarShift4_Outer';
import { StarShift5_Outer } from './skills/StarShift5_Outer';
import { StarShift6_Outer } from './skills/StarShift6_Outer';

/* StarShift Black/White */
import { StarShift1_Black } from './skills/StarShift1_Black';
import { StarShift4_Black } from './skills/StarShift4_Black';
import { StarShift5_Black } from './skills/StarShift5_Black';
import { StarShift6_Black } from './skills/StarShift6_Black';

import { StarShift1_White } from './skills/StarShift1_White';
import { StarShift4_White } from './skills/StarShift4_White';
import { StarShift5_White } from './skills/StarShift5_White';
import { StarShift6_White } from './skills/StarShift6_White';

const ARENA_MAP: Record<ArenaID, React.FC> = {
  Black: BlackArena,
  White: WhiteArena,
  Outer: OuterArena,
};

const SKILL_MAP: Record<string, React.FC | null> = {
  none: null,
  DuoTian1_Black: DuoTian1_Black,
  DuoTian2_Outer: DuoTian2_Outer,
  DuoTian2_White: DuoTian2_White,
  DuoTian2_Black: DuoTian2_Black,
  DuoTian3_Outer: DuoTian3_Outer,
  DuoTian3_White: DuoTian3_White,
  DuoTian3_Black: DuoTian3_Black,
  WenLan1: WenLanSkill,
  Xun: XunV2,
  
  StarShift1_Outer,
  StarShift2_Outer,
  StarShift3_Outer,
  StarShift4_Outer,
  StarShift5_Outer,
  StarShift6_Outer,

  StarShift1_Black,
  StarShift4_Black,
  StarShift5_Black,
  StarShift6_Black,

  StarShift1_White,
  StarShift4_White,
  StarShift5_White,
  StarShift6_White,
};

interface Props {
  arenaId: ArenaID;
  skillId: string;
  isPlaying: boolean;
}

export const V2Renderer: React.FC<Props> = ({ arenaId, skillId, isPlaying }) => {
  const [replayKey, setReplayKey] = useState(0);
  
  useEffect(() => {
    if (isPlaying) setReplayKey(k => k + 1);
  }, [skillId, isPlaying]);

  const Arena = ARENA_MAP[arenaId] || OuterArena;
  const Skill = isPlaying ? SKILL_MAP[skillId] : null;

  const handleReplay = () => {
    setReplayKey(prev => prev + 1);
  };

  const getDescription = () => {
    if (skillId.startsWith('StarShift')) {
      return "星移機制：8人分為兩側。1、4號位於王與門連線上，2、3號位於連線左側（從王看門）。點名後需根據交換規則調整位置：若2或3號被點名，1號主動交換；若1或4號被點名則不換位。";
    }
    if (skillId === 'Xun') {
      return "汛：王對玩家散開方位發射第一波矩形，隨後從邊緣發射第二波交叉斜向矩形。玩家需精確散開並避開路徑。";
    }
    if (arenaId === 'White') {
      return "奪天白場為「白給」機制：12號固定站位（1號於門與王之間，2號於王視角右前方）。其他人只需避開預警線即可，不需要點名判定。注意：雷射路徑為門 -> 1號 -> 2號 -> 王。";
    } else if (arenaId === 'Black') {
      return "奪天黑場是花炸掉後每人皆有4尺AOE，需相互遠離，線上也不能站人，花打完會有花瓣可以撿，另外奪天2、3的判定有嚴重bug，但當你看出有bug的時候也代表你會了。";
    } else {
      return "奪天外場是1234號固定站位，4號視門位置補位。汛這個技能則是會先對當前位子打一下傷害後從這個位子延伸的場邊再轉左或右一點角度再打一個矩形。";
    }
  };

  const isWhite = arenaId === 'White';
  const isBlack = arenaId === 'Black';
  const themeColor = isWhite ? '#00f2ff' : (isBlack ? '#ff2d55' : '#f9ff00');

  return (
    <div className="arena-wrapper" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      gap: '20px'
    }}>
      {isPlaying && skillId !== 'none' && (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: `${themeColor}11`,
          border: `1px solid ${themeColor}44`,
          borderRadius: '8px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          zIndex: 100
        }}>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: themeColor, flex: 1 }}>
            {getDescription()}
          </div>
          <button 
            onClick={handleReplay}
            style={{
              background: themeColor,
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            重播
          </button>
        </div>
      )}

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        maxWidth: '85vh', 
        aspectRatio: '1/1' 
      }}>
        <Arena />
        {Skill && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
            <Skill key={`${skillId}-${replayKey}`} />
          </div>
        )}
      </div>
    </div>
  );
};