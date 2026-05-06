import { executeInSandbox, type SandboxExecution } from './sandbox/sandboxRunner';
import type { SandboxResult } from './sandbox/types';

export type CodeRunResult = SandboxResult;

const KEY = 'js';

function factory(): Worker {
  return new Worker(
    new URL('./jsSandbox.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

export function runJavaScript(code: string, timeoutMs = 3000): SandboxExecution {
  return executeInSandbox(KEY, factory, code, timeoutMs);
}

export function explainPythonRuntimeStatus(): string {
  return 'Python 在 Web Worker 沙箱中通过 Pyodide 执行。首次运行会自动下载 Pyodide (~12MB)，后续即时可用。';
}
