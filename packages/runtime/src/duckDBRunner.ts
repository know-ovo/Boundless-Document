import { executeInSandbox, type SandboxExecution } from './sandbox/sandboxRunner';
import type { SandboxResult } from './sandbox/types';

const KEY = 'sql';

function factory(): Worker {
  return new Worker(
    new URL('./sandbox/sql.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

export function runSQL(sql: string, timeoutMs = 10000): SandboxExecution {
  return executeInSandbox(KEY, factory, sql, timeoutMs);
}

// ── Legacy status stubs ──

let _status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let _error: string | null = null;
const _listeners = new Set<() => void>();

function notify() { _listeners.forEach((fn) => fn()); }

export function getDuckDBStatus() {
  return { status: _status, error: _error, db: null };
}

export function onDuckDBChange(fn: () => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export async function loadDuckDBOnce(): Promise<void> {
  _status = 'loading';
  notify();
  try {
    const { promise } = executeInSandbox(KEY, factory, 'SELECT 1', 30000);
    const result = await promise;
    _status = result.ok ? 'ready' : 'error';
    _error = result.error ?? null;
  } catch (e) {
    _status = 'error';
    _error = e instanceof Error ? e.message : String(e);
  }
  notify();
}
