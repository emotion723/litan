
import React, { useEffect, useRef } from 'react';
import { ArenaID } from '../types/types';

type SkillMarker = { time: number; name: string };

// 每秒對應的像素長度 (增加到 28，進一步拉長一點點)
const PIXELS_PER_SECOND = 28;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface TimelineRowProps {
  arenaId: ArenaID;
  label: string;
  color: string;
  time: number;
  skills: SkillMarker[];
  maxTime: number;
  onScrollSync: (left: number, senderId: string) => void;
  registerScroll: (id: string, el: HTMLDivElement | null) => void;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  arenaId,
  label,
  color,
  time,
  skills,
  maxTime,
  onScrollSync,
  registerScroll,
}) => {
  const progressPercent = Math.min((time / maxTime) * 100, 100);
  const trackWidth = maxTime * PIXELS_PER_SECOND;

  return (
    <div className="timeline-row">
      <div className="timeline-label-cell" style={{ color }}>
        {label}
      </div>

      <div
        className="timeline-track-scroll"
        ref={el => registerScroll(arenaId, el)}
        onScroll={e => {
          onScrollSync((e.target as HTMLDivElement).scrollLeft, arenaId);
        }}
      >
        <div className="timeline-track-bar" style={{ width: `${trackWidth}px` }}>
          {skills.map((skill, idx) => {
            const posPx = skill.time * PIXELS_PER_SECOND;
            return (
              <div
                key={idx}
                className="timeline-skill-marker"
                style={{ left: `${posPx}px` }}
              >
                <div
                  className="skill-dot"
                  style={{ backgroundColor: color, color }}
                />
                <div className="skill-name" style={{ color }}>
                  <span style={{ opacity: 0.6, fontSize: '0.65rem', marginRight: '4px' }}>
                    {formatTime(skill.time)}
                  </span>
                  {skill.name}
                </div>
              </div>
            );
          })}

          <div
            className="timeline-progress"
            style={{ 
              width: `${progressPercent}%`, 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface TimelinePanelProps {
  battleTime: number;
  maxTime: number;
  arenaConfigs: Record<ArenaID, { timelineLabel: string; color: string }>;
  skills?: Partial<Record<ArenaID, SkillMarker[]>>;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  battleTime,
  maxTime,
  arenaConfigs,
  skills = {},
}) => {
  const scrollEls = useRef<Record<string, HTMLDivElement | null>>({});
  const isSyncing = useRef(false);

  const registerScroll = (id: string, el: HTMLDivElement | null) => {
    scrollEls.current[id] = el;
  };

  const syncScroll = (left: number, senderId: string | 'SYSTEM') => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    
    Object.keys(scrollEls.current).forEach(id => {
      const el = scrollEls.current[id];
      if (el && id !== senderId && Math.abs(el.scrollLeft - left) > 1) {
        el.scrollLeft = left;
      }
    });
    
    isSyncing.current = false;
  };

  useEffect(() => {
    const firstId = Object.keys(arenaConfigs)[0] as ArenaID;
    const el = scrollEls.current[firstId];
    if (!el) return;

    const currentProgressPx = battleTime * PIXELS_PER_SECOND;
    const visibleWidth = el.clientWidth;
    
    const targetScrollLeft = currentProgressPx - (visibleWidth * 0.2);
    
    const maxScroll = (maxTime * PIXELS_PER_SECOND) - visibleWidth;
    const clampedScroll = Math.max(0, Math.min(targetScrollLeft, maxScroll));
    
    syncScroll(clampedScroll, 'SYSTEM');
  }, [battleTime, maxTime, arenaConfigs]);

  return (
    <div className="timeline-container">
      {(Object.keys(arenaConfigs) as ArenaID[]).map(aid => (
        <TimelineRow
          key={aid}
          label={arenaConfigs[aid].timelineLabel}
          color={arenaConfigs[aid].color}
          time={battleTime}
          skills={skills[aid] ?? []}
          maxTime={maxTime}
          onScrollSync={syncScroll}
          registerScroll={registerScroll}
          arenaId={aid}
        />
      ))}
    </div>
  );
};
