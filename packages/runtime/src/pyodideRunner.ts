import { executeInSandbox, type SandboxExecution } from './sandbox/sandboxRunner';
import type { SandboxResult } from './sandbox/types';

const KEY = 'python';

function factory(): Worker {
  return new Worker(
    new URL('./sandbox/python.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

export function runPython(code: string, timeoutMs = 30000): SandboxExecution {
  return executeInSandbox(KEY, factory, code, timeoutMs);
}

// ── Legacy status API — kept for RuntimeContext compatibility ──

let _status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let _error: string | null = null;
const _listeners = new Set<() => void>();

function notify() { _listeners.forEach((fn) => fn()); }

export function getPyodideStatus() {
  return { status: _status, error: _error, pyodide: null };
}

export function onPyodideChange(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export async function loadPyodideOnce(): Promise<void> {
  _status = 'loading';
  notify();
  try {
    const { promise } = executeInSandbox(KEY, factory, '42', 45000);
    const result = await promise;
    _status = result.ok ? 'ready' : 'error';
    _error = result.error ?? null;
  } catch (e) {
    _status = 'error';
    _error = e instanceof Error ? e.message : String(e);
  }
  notify();
}
