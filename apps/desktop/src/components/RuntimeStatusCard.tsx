import { useRuntime } from '@boundless-docs/runtime';
import { useSettings } from '../contexts/SettingsContext';

export function RuntimeStatusCard() {
  const { pyodide, duckdb } = useRuntime();
  const { t } = useSettings();

  return (
    <div className="execution-card runtime-status-card">
      <div className="runtime-item">
        <div className="runtime-info">
          <span className="runtime-name">{t('runtime.python')}</span>
          <span className={`runtime-status ${pyodide.status}`}>{pyodide.status}</span>
        </div>
        {pyodide.status !== 'ready' && pyodide.status !== 'loading' && (
          <button className="tb-btn small" onClick={pyodide.load}>{t('runtime.load')}</button>
        )}
      </div>

      <div className="runtime-item">
        <div className="runtime-info">
          <span className="runtime-name">{t('runtime.sql')}</span>
          <span className={`runtime-status ${duckdb.status}`}>{duckdb.status}</span>
        </div>
        {duckdb.status !== 'ready' && duckdb.status !== 'loading' && (
          <button className="tb-btn small" onClick={duckdb.load}>{t('runtime.load')}</button>
        )}
      </div>
    </div>
  );
}
