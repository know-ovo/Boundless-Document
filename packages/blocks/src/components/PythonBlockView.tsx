import { useRuntime, type SandboxResult } from '@boundless-docs/runtime';
import type { RunPythonBlock } from '@boundless-docs/shared';
import { useState, useRef } from 'react';

export function PythonBlockView({ block }: { block: RunPythonBlock }) {
  const { pyodide } = useRuntime();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [progress, setProgress] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setProgress('启动中...');
    try {
      const exec = pyodide.runPython(block.code, block.timeoutMs);
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

  return (
    <div className="code-block">
      <pre className="code-view">{block.code}</pre>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={running} onClick={handleRun}>
          {running ? '执行中...' : '运行 Python'}
        </button>
        {running && (
          <button type="button" className="tb-btn" onClick={handleCancel}>
            取消
          </button>
        )}
        <span className="block-meta" style={{ fontSize: 11 }}>
          {running ? progress || '...' : `超时 ${block.timeoutMs / 1000}s`}
        </span>
      </div>
      {result && (
        <div className={result.ok ? 'run-result' : 'run-result error'}>
          <div className="block-meta">
            <span>{result.ok ? '成功' : '失败'}</span>
            <span>{result.durationMs}ms</span>
          </div>
          {/* stdout/stderr — same as JS console */}
          {result.logs && result.logs.length > 0 && (
            <pre className="json-view">stdout: {result.logs.join('\n')}</pre>
          )}
          {result.error ? (
            <pre className="json-view">{result.error}</pre>
          ) : (
            <pre className="json-view">返回值: {String(result.value ?? '(无输出)')}</pre>
          )}
        </div>
      )}
    </div>
  );
}
