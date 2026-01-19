
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GroupID, ArenaID, Entity } from './types/types';
import { ArenaState, createInitialArenaState } from './types/ArenaState';

import { LeftControlPanelV1 } from './ui/LeftControlPanelV1';
import { TimelinePanel } from './ui/TimelinePanel';
import { BattleArena } from './ui/BattleArena';
import { updatePlayerControl } from './input/PlayerController';

import { DuoTian1 } from './mechanics/impl/DuoTian1';
import { WenLan1 } from './mechanics/impl/WenLan1';
import { Xun } from './mechanics/impl/Xun';
import { LongNu } from './mechanics/impl/LongNu';
import { XueLian } from './mechanics/impl/XueLian';
import { Men } from './mechanics/impl/Men';
import { StarShift1 } from './mechanics/impl/StarShift1';
import { clampToArena } from './mechanics/utils/ArenaUtils';
import type { MechanicContext } from './mechanics/IMechanic';

import { ARENA_CONFIGS, GROUP_COLORS, START_POINTS, SKILLS, getMappingForTime } from './data/timelineData';

export function AppV1({ onSwitch }: { onSwitch: () => void }) {
  const [battleTime, setBattleTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlledId, setControlledId] = useState(0);
  const [currentStartPoint, setCurrentStartPoint] = useState(0);
  const lastFrameTimeRef = useRef<number | null>(null);

  const [entities, setEntities] = useState<Entity[]>([]);
  const entitiesRef = useRef<Entity[]>([]);
  const [arenaState, setArenaState] = useState<ArenaState>(createInitialArenaState());
  const [groupArenaMap, setGroupArenaMap] = useState<Record<GroupID, ArenaID>>({
    A: 'Outer', B: 'Outer', C: 'Outer', D: 'Outer', E: 'Outer', F: 'Outer', Idle: 'Outer'
  });
  const [overlay, setOverlay] = useState<{ text: string; until: number } | null>(null);
  
  const duotian1Ref = useRef(new DuoTian1());
  const wenlan1Ref = useRef(new WenLan1());
  const xunRef = useRef(new Xun());
  const longnuRef = useRef(new LongNu());
  const xuelianRef = useRef(new XueLian());
  const menRef = useRef(new Men());
  const starshift1Ref = useRef(new StarShift1());
  
  const lastSecondRef = useRef(-1);

  useEffect(() => {
    const list: Entity[] = [];
    const groupData: Record<string, string[]> = {
      A: ['系草', '耳狗', '醉夢', '梨梨'],
      B: ['夢夢', '衡橙', '思夜', '曦曦'],
      C: ['婪肆', '峻峻', '段考', '芯羽'],
      D: ['悲歡', '阿寧', '盆醬', 'CJ'],
      E: ['耘夏', '繁花', '怪獸', '果果'],
      F: ['TT', '小夜', '無名', '芊芊'],
      Idle: ['小薇']
    };

    let id = 0;
    const groups: GroupID[] = ['A', 'B', 'C', 'D', 'E', 'F', 'Idle'];
    for (const g of groups) {
      const names = groupData[g] || [];
      names.forEach((name, i) => {
        list.push({
          id: id++, 
          name: `${g === 'Idle' ? '補位' : g + (i + 1)} ${name}`, 
          groupId: g,
          pos: { x: 560 + Math.random() * 800, y: 560 + Math.random() * 800 },
          angle: 0, isAiming: false, aimingTimer: 0, targetTimer: 0,
          snapLockTimer: 0, snapCooldownTimer: 0, snapTargetAngle: 0,
          color: GROUP_COLORS[g]
        });
      });
    }
    entitiesRef.current = list;
    setEntities(list);
    if (list.length > 0) setControlledId(list[0].id);
  }, []);

  useEffect(() => {
    setGroupArenaMap(getMappingForTime(battleTime));
  }, [battleTime]);

  const rewindAndPause = useCallback((time: number) => {
    setBattleTime(time);
    setIsPlaying(false);
    lastSecondRef.current = -1;
    duotian1Ref.current.reset?.();
    wenlan1Ref.current.reset?.();
    xunRef.current.reset?.();
    longnuRef.current.reset?.();
    xuelianRef.current.reset?.();
    menRef.current.reset?.();
    starshift1Ref.current.reset?.();
    
    entitiesRef.current.forEach(p => {
      p.pos = { x: 560 + Math.random() * 800, y: 560 + Math.random() * 800 };
      p.targetTimer = 0;
      p.isAiming = false;
      p.aimingTimer = 0;
    });
    setArenaState(createInitialArenaState());
  }, []);

  const showOverlay = useCallback((text: string, seconds: number) => {
    const until = Date.now() + seconds * 1000;
    setOverlay({ text, until });
    window.setTimeout(() => {
      setOverlay(cur => (cur && cur.until === until ? null : cur));
    }, seconds * 1000);
  }, []);

  const update = useCallback((dt: number) => {
    entitiesRef.current.forEach(p => {
      if (p.targetTimer > 0) p.targetTimer = Math.max(0, p.targetTimer - dt);
    });

    const ctx: MechanicContext = {
      battleTime,
      controlledId,
      players: entitiesRef.current,
      groupArenaMap,
      arenaState,
      setArenaState,
      rewindAndPause,
      showOverlay,
    };

    if (battleTime !== lastSecondRef.current) {
      lastSecondRef.current = battleTime;
      duotian1Ref.current.onSecond(ctx);
      wenlan1Ref.current.onSecond(ctx);
      xunRef.current.onSecond(ctx);
      longnuRef.current.onSecond(ctx);
      xuelianRef.current.onSecond(ctx);
      menRef.current.onSecond(ctx);
      starshift1Ref.current.onSecond(ctx);
    }
    duotian1Ref.current.onFrame?.(ctx, dt);
    wenlan1Ref.current.onFrame?.(ctx, dt);
    xunRef.current.onFrame?.(ctx, dt);
    longnuRef.current.onFrame?.(ctx, dt);
    xuelianRef.current.onFrame?.(ctx, dt);
    menRef.current.onFrame?.(ctx, dt);
    starshift1Ref.current.onFrame?.(ctx, dt);
  }, [battleTime, arenaState, controlledId, rewindAndPause, showOverlay, groupArenaMap]);

  useEffect(() => {
    let rafId: number;
    const tick = (now: number) => {
      if (lastFrameTimeRef.current === null) lastFrameTimeRef.current = now;
      const dt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      
      updatePlayerControl({ 
        controlledId, 
        players: entitiesRef.current, 
        groupArenaMap,
        dt: isPlaying ? dt : 0 
      });

      if (isPlaying) update(dt);
      
      entitiesRef.current.forEach(p => clampToArena(p.pos, p.groupId));
      setEntities([...entitiesRef.current]);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [update, controlledId, isPlaying, groupArenaMap]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setBattleTime(t => {
        if (t >= 65) return 0;
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const performReset = useCallback((newTime: number, shouldPlay: boolean) => {
    setBattleTime(newTime);
    setIsPlaying(shouldPlay);
    lastSecondRef.current = -1;
    duotian1Ref.current.reset?.();
    wenlan1Ref.current.reset?.();
    xunRef.current.reset?.();
    longnuRef.current.reset?.();
    xuelianRef.current.reset?.();
    menRef.current.reset?.();
    starshift1Ref.current.reset?.();
    
    entitiesRef.current.forEach(p => { 
      p.pos = { x: 560 + Math.random() * 800, y: 560 + Math.random() * 800 };
      p.targetTimer = 0; 
      p.isAiming = false; 
      p.aimingTimer = 0; 
    });
    
    setArenaState(createInitialArenaState());
    setGroupArenaMap(getMappingForTime(newTime));
  }, []);

  return (
    <div className="game-container">
      <LeftControlPanelV1 
        battleTime={battleTime} 
        isPlaying={isPlaying} 
        entities={entities} 
        controlledId={controlledId} 
        startPoint={currentStartPoint} 
        startPoints={START_POINTS} 
        onChangeControlled={setControlledId} 
        onChangeStartPoint={(t) => { setCurrentStartPoint(t); performReset(t, false); }} 
        onStart={() => performReset(0, true)} 
        onReset={() => performReset(0, true)} 
        onSwitchToV2={() => onSwitch()}
      />
      <main className="main-content">
        <TimelinePanel battleTime={battleTime} maxTime={400} arenaConfigs={ARENA_CONFIGS} skills={SKILLS} />
        <BattleArena 
          entities={entities} 
          arenaState={arenaState} 
          groupArenaMap={groupArenaMap} 
          arenaConfigs={ARENA_CONFIGS} 
          controlledId={controlledId} 
        />
      </main>
      {overlay && (
        <div className="overlay-fail">
          <div className="overlay-fail-text">{overlay.text}</div>
        </div>
      )}
    </div>
  );
}
