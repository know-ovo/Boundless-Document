import { useRuntime, type SandboxResult } from '@boundless-docs/runtime';
import type { SqlBlock } from '@boundless-docs/shared';
import { useState, useRef } from 'react';

const MAX_ROWS = 100;

interface SQLResultValue {
  columns: string[];
  rows: string[][];
}

export function SQLBlockView({ block }: { block: SqlBlock }) {
  const { duckdb } = useRuntime();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [progress, setProgress] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);

  const timeoutMs = block.timeoutMs;

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setProgress('启动中...');
    try {
      const exec = duckdb.runSQL(block.code, timeoutMs);
      cancelRef.current = exec.cancel;
      const r = await exec.promise;
      setResult(r);
      setProgress('');
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        logs: [],
        durationMs: 0,
      });
      setProgress('');
    }
    cancelRef.current = null;
    setRunning(false);
  };

  const handleCancel = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setRunning(false);
    setProgress('');
  };

  const tableData: SQLResultValue | null =
    result?.ok && result.value && typeof result.value === 'object'
      ? (result.value as SQLResultValue)
      : null;

  const totalRows = tableData?.rows.length ?? 0;
  const displayedRows = tableData ? tableData.rows.slice(0, MAX_ROWS) : [];
  const truncated = totalRows > MAX_ROWS;

  return (
    <div className="code-block">
      <pre className="code-view">{block.code}</pre>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={running} onClick={handleRun}>
          {running ? '执行中...' : '运行 SQL'}
        </button>
        {running && (
          <button type="button" className="tb-btn" onClick={handleCancel}>
            取消
          </button>
        )}
        <span className="block-meta" style={{ fontSize: 11 }}>
          {running ? progress || '...' : `超时 ${timeoutMs / 1000}s`}
        </span>
      </div>
      {result && !result.ok && (
        <div className="run-result error">
          <pre className="json-view">{result.error}</pre>
        </div>
      )}
      {tableData && (
        <div className="run-result">
          <div className="block-meta">
            <span>成功</span>
            <span>{result!.durationMs}ms</span>
            <span>{totalRows} 行</span>
            {truncated && <span style={{ color: 'var(--ch-yellow-fg)' }}>仅显示前 {MAX_ROWS} 行</span>}
          </div>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: 13, fontFamily: 'var(--mono)',
            }}>
              <thead>
                <tr>
                  {tableData.columns.map((col) => (
                    <th key={col} style={{
                      textAlign: 'left', padding: '6px 10px',
                      borderBottom: '2px solid var(--hairline)',
                      color: 'var(--muted)', fontWeight: 500,
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        padding: '5px 10px',
                        borderBottom: '1px solid var(--hairline)',
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
