import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsProvider } from "./contexts/SettingsContext";
import { defaultDocument } from './defaultDocument';
import './styles.css';

// 导出供 packages/editor 和外部使用
export { defaultDocument };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <App initialDocument={defaultDocument} />
    </SettingsProvider>
  </React.StrictMode>,
);
