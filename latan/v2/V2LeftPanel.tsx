
// v2/V2LeftPanel.tsx
import React from 'react';

interface Option {
  id: string;
  label: string;
}

interface Props {
  isPlaying: boolean;
  arenas: Option[];
  skills: Option[];
  selectedArenaId: string;
  selectedSkillId: string;
  onChangeArena: (id: string) => void;
  onChangeSkill: (id: string) => void;
  onStart: () => void;
  onReset: () => void;
  onSwitchToV1: () => void;
}

export const V2LeftPanel: React.FC<Props> = ({
  isPlaying,
  arenas,
  skills,
  selectedArenaId,
  selectedSkillId,
  onChangeArena,
  onChangeSkill,
  onStart,
  onReset,
  onSwitchToV1,
}) => {
  return (
    <aside className="game-header-bar v2-theme">
      <div className="game-title">李倓<br />技能預覽 V2</div>

      <div className="control-item">
        <span className="control-label">選擇場地</span>
        <select 
          value={selectedArenaId} 
          onChange={e => {
            onChangeArena(e.target.value);
            onReset(); 
          }}
        >
          {arenas.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      <div className="control-item">
        <span className="control-label">選擇技能 (選中即執行)</span>
        <select 
          value={selectedSkillId} 
          onChange={e => {
            const sid = e.target.value;
            onChangeSkill(sid);
            if (sid !== 'none') onStart();
            else onReset();
          }}
        >
          <option value="none">-- 僅顯示場地圖 --</option>
          {skills.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="button-group" style={{ marginTop: '20px' }}>
        <button 
          className="start-btn" 
          style={{ 
            background: 'transparent', 
            color: '#888', 
            border: '1px solid #333',
            fontSize: '0.8rem',
            padding: '10px'
          }}
          onClick={onSwitchToV1}
        >
          切換 V1 模擬模式
        </button>
      </div>
    </aside>
  );
};
