
import React, { useState, useEffect } from 'react';

export const DuoTian1_White = () => {
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    let last = performance.now();
    let frameId = requestAnimationFrame(function tick(now) {
      setTimer(t => (t + (now - last)/1000 > 3 ? 0 : t + (now - last)/1000));
      last = now;
      frameId = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const isFire = timer > 2.0;
  return (
    <svg className="arena-svg" viewBox="0 0 1920 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <line 
        x1="960" y1="960" x2="960" y2="100" 
        stroke="#ffffff" strokeWidth={isFire ? 80 : 2} 
        opacity={isFire ? 1 : 0.3} 
      />
      <circle cx="960" cy="100" r={isFire ? 120 : 30} fill="#00f2ff" opacity={isFire ? 0.8 : 0.2} />
    </svg>
  );
};
