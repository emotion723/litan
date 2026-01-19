
import React, { useState, useEffect } from 'react';

export const WenLanSkill = () => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let last = performance.now();
    let frameId: number;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTimer(t => (t + dt > 3 ? 0 : t + dt));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg className="arena-svg" viewBox="0 0 1920 1920" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      <circle 
        cx="960" cy="960" 
        r={timer * 300} 
        fill="none" 
        stroke="#00f2ff" 
        strokeWidth="10" 
        opacity={1 - (timer / 3)} 
      />
    </svg>
  );
};
