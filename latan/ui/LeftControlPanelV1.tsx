
import React from 'react';
import { Entity } from '../types/types';

interface StartPoint {
  label: string;
  time: number;
}

interface LeftControlPanelV1Props {
  battleTime: number;
  isPlaying: boolean;
  entities: Entity[];
  controlledId: number;
  startPoint: number;
  startPoints: StartPoint[];
  onChangeControlled: (id: number) => void;
  onChangeStartPoint: (t: number) => void;
  onStart: () => void;
  onReset: () => void;
  onSwitchToV2: () => void;
}

export const LeftControlPanelV1: React.FC<LeftControlPanelV1Props> = (props) => {
  return (
    <aside className="game-header-bar">
      <div className="game-title" style={{ color: '#ffd700', textShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}>
        李倓<br />模擬器(放棄版)
      </div>

      <div className="control-item">
        <span className="control-label">選擇位置</span>
        <select value={props.controlledId} onChange={e => props.onChangeControlled(Number(e.target.value))}>
          {props.entities.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      <div className="controls">
        <div className="control-item">
          <span className="control-label">戰鬥時間</span>
          <div className="battle-timer" style={{ color: '#ffd700', borderColor: '#ffd70033' }}>{props.battleTime}s</div>
        </div>

        <div className="control-item">
          <span className="control-label">時間軸切換</span>
          <select value={props.startPoint} onChange={e => props.onChangeStartPoint(Number(e.target.value))}>
            {props.startPoints.map(p => (
              <option key={p.time} value={p.time}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="button-group">
          {!props.isPlaying ? (
            <button 
              className="start-btn" 
              style={{ background: '#ffd700', color: '#000', boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }} 
              onClick={props.onStart}
            >
              開始模擬
            </button>
          ) : (
            <button className="start-btn reset" onClick={props.onReset}>重新開始</button>
          )}
          
          <button 
            className="start-btn" 
            style={{ 
              marginTop: '10px', 
              background: '#00ffd5', 
              color: '#000', 
              boxShadow: '0 0 15px rgba(0, 255, 213, 0.4)',
              border: 'none',
              fontSize: '0.9rem'
            }}
            onClick={props.onSwitchToV2}
          >
            切換 V2 動畫模式
          </button>
        </div>
      </div>
    </aside>
  );
};
