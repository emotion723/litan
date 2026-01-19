
// index.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AppV1 } from './index_v1';
import { AppV2 } from './index_v2';

function Root() {
  // 預設進 V2 模式
  const [view, setView] = useState<'v1' | 'v2'>('v2');

  return view === 'v1' ? (
    <AppV1 onSwitch={() => setView('v2')} />
  ) : (
    <AppV2 onSwitch={() => setView('v1')} />
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Root />);
}
