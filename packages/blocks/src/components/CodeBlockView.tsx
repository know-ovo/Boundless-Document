import { runJavaScript, type SandboxResult } from '@boundless-docs/runtime';
import type { RunJsBlock } from '@boundless-docs/shared';
import { useState, useRef } from 'react';

export function CodeBlockView({ block }: { block: RunJsBlock }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const exec = runJavaScript(block.code, block.timeoutMs);
      cancelRef.current = exec.cancel;
      setResult(await exec.promise);
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        logs: [],
        durationMs: 0,
      });
    }
    cancelRef.current = null;
    setRunning(false);
  };

  const handleCancel = () => {
    cancelRef.current?.();
    cancelRef.current = null;
    setRunning(false);
  };

  return (
    <div className="code-block">
      <pre className="code-view">{block.code}</pre>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={running} onClick={handleRun}>
          {running ? '执行中...' : '运行 JS'}
        </button>
        {running && (
          <button type="button" className="tb-btn" onClick={handleCancel}>
            取消
          </button>
        )}
        <span className="block-meta" style={{ fontSize: 11 }}>
          {running ? '...' : `超时 ${block.timeoutMs / 1000}s`}
        </span>
      </div>
      {result && (
        <div className={result.ok ? 'run-result' : 'run-result error'}>
          <div className="block-meta">
            <span>{result.ok ? '成功' : '失败'}</span>
            <span>{result.durationMs}ms</span>
          </div>
          {result.logs && result.logs.length > 0 && (
            <pre className="json-view">console: {result.logs.join('\n')}</pre>
          )}
          {result.error ? (
            <pre className="json-view">{result.error}</pre>
          ) : (
            <pre className="json-view">{JSON.stringify(result.value, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
