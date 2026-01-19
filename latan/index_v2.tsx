
// index_v2.tsx
import React, { useState } from 'react';
import { V2LeftPanel } from './v2/V2LeftPanel';
import { V2Renderer } from './v2/V2Renderer';
import { ArenaID } from './types/types';
import { V2_ARENA_OPTIONS, getV2SkillsByArena } from './v2/v2Data';

export function AppV2({ onSwitch }: { onSwitch: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [arenaId, setArenaId] = useState<ArenaID>('Black');
  const [skillId, setSkillId] = useState<string>('DuoTian1_Black');

  const handleArenaChange = (id: string) => {
    setArenaId(id as ArenaID);
    setIsPlaying(false);
  };

  const handleSkillChange = (id: string) => {
    setSkillId(id);
    setIsPlaying(false);
  };

  const currentSkills = getV2SkillsByArena(arenaId);

  return (
    <div className="game-container v2-theme">
      <V2LeftPanel
        isPlaying={isPlaying}
        arenas={V2_ARENA_OPTIONS}
        skills={currentSkills}
        selectedArenaId={arenaId}
        selectedSkillId={skillId}
        onChangeArena={handleArenaChange}
        onChangeSkill={handleSkillChange}
        onStart={() => setIsPlaying(true)}
        onReset={() => setIsPlaying(false)}
        onSwitchToV1={onSwitch}
      />

      <main className="main-content">
        <V2Renderer arenaId={arenaId} skillId={skillId} isPlaying={isPlaying} />
      </main>
    </div>
  );
}
