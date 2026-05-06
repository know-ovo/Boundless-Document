import { useRuntime } from '@boundless-docs/runtime';

export function RuntimeStatusCard() {
  const { pyodide, duckdb } = useRuntime();

  return (
    <div className="execution-card runtime-status-card">
      <div className="runtime-item">
        <div className="runtime-info">
          <span className="runtime-name">Python (Pyodide)</span>
          <span className={`runtime-status ${pyodide.status}`}>{pyodide.status}</span>
        </div>
        {pyodide.status !== 'ready' && pyodide.status !== 'loading' && (
          <button className="tb-btn small" onClick={pyodide.load}>Load</button>
        )}
      </div>

      <div className="runtime-item">
        <div className="runtime-info">
          <span className="runtime-name">SQL (DuckDB)</span>
          <span className={`runtime-status ${duckdb.status}`}>{duckdb.status}</span>
        </div>
        {duckdb.status !== 'ready' && duckdb.status !== 'loading' && (
          <button className="tb-btn small" onClick={duckdb.load}>Load</button>
        )}
      </div>
    </div>
  );
}
