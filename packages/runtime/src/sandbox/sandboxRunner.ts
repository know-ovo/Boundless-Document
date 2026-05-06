/**
 * Unified sandbox runner — worker pooling with per-key queuing.
 *
 * Each language (JS / Python / SQL) gets one warm worker.
 * Concurrent requests for the same key are queued, not aborted.
 * First execution triggers WASM download (Pyodide / DuckDB);
 * the worker stays warm for subsequent calls.
 *
 * Cancel: call the returned `cancel()` function to abort
 * the current execution and terminate the stuck worker.
 * The next queued or future request spawns a fresh one.
 */

import type { SandboxResult } from './types';

type WorkerFactory = () => Worker;

interface PoolEntry {
  worker: Worker | null;
  /** true while a message is in-flight */
  busy: boolean;
}

const pool = new Map<string, PoolEntry>();

interface QueuedTask {
  factory: WorkerFactory;
  code: string;
  timeoutMs: number;
  resolve: (r: SandboxResult) => void;
  onProgress: ((msg: string) => void) | undefined;
}

const queues = new Map<string, QueuedTask[]>();

function ensureEntry(key: string): PoolEntry {
  let entry = pool.get(key);
  if (!entry) {
    entry = { worker: null, busy: false };
    pool.set(key, entry);
  }
  return entry;
}

function enqueue(key: string, task: QueuedTask) {
  let q = queues.get(key);
  if (!q) {
    q = [];
    queues.set(key, q);
  }
  q.push(task);
  if (q.length === 1) {
    processNext(key);
  }
}

function dequeue(key: string): QueuedTask | undefined {
  const q = queues.get(key);
  if (!q || q.length === 0) return undefined;
  return q.shift();
}

function processNext(key: string) {
  const q = queues.get(key);
  if (!q || q.length === 0) return;
  const task = q[0];
  const entry = ensureEntry(key);
  entry.busy = true;
  runTask(key, entry, task);
}

function runTask(key: string, entry: PoolEntry, task: QueuedTask) {
  const { factory, code, timeoutMs, resolve, onProgress } = task;
  const startedAt = performance.now();

  // Reuse or create worker
  if (!entry.worker) {
    entry.worker = factory();
    // Listen for progress messages (e.g. "loading" status from worker)
    entry.worker.onmessageerror = () => {};
  }

  const worker = entry.worker;
  let settled = false;
  let timer: number;

  const finish = (result: SandboxResult) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    entry.busy = false;

    // Remove completed task from queue head
    dequeue(key);
    resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) });

    // Process next queued task (if any)
    processNext(key);
  };

  timer = window.setTimeout(() => {
    // Timeout — evict and recreate for next task
    worker.terminate();
    entry.worker = null;
    entry.busy = false;
    dequeue(key);
    resolve({
      ok: false,
      error: `执行超时 (${timeoutMs}ms)`,
      logs: [],
      durationMs: Math.round(performance.now() - startedAt),
    });
    processNext(key);
  }, timeoutMs);

  worker.onmessage = (event: MessageEvent) => {
    const data = event.data ?? {};

    // Progress message from worker (e.g. loading status)
    if (data.type === 'progress' && onProgress) {
      onProgress(data.message ?? '加载中...');
      return;
    }

    finish({
      ok: Boolean(data.ok),
      value: data.value,
      error: data.error,
      logs: Array.isArray(data.logs) ? data.logs : [],
      durationMs: 0,
    });
  };

  worker.onerror = (event) => {
    finish({
      ok: false,
      error: event.message || 'Worker error',
      logs: [],
      durationMs: 0,
    });
  };

  worker.postMessage({ code });
}

export interface SandboxExecution {
  promise: Promise<SandboxResult>;
  cancel: () => void;
}

export function executeInSandbox(
  key: string,
  factory: WorkerFactory,
  code: string,
  timeoutMs = 5000,
  onProgress?: (msg: string) => void,
): SandboxExecution {
  const entry = ensureEntry(key);

  // If idle, run immediately; otherwise queue
  if (!entry.busy) {
    entry.busy = true;
    const task: QueuedTask = {
      factory,
      code,
      timeoutMs,
      resolve: () => {},
      onProgress,
    };

    let resolvePromise!: (r: SandboxResult) => void;
    const promise = new Promise<SandboxResult>((res) => { resolvePromise = res; });
    task.resolve = resolvePromise;

    // Push and immediately process (it's the only one)
    let q = queues.get(key);
    if (!q) { q = []; queues.set(key, q); }
    q.push(task);
    runTask(key, entry, task);

    return {
      promise,
      cancel: () => {
        if (entry.worker) {
          entry.worker.terminate();
          entry.worker = null;
          entry.busy = false;
          dequeue(key);
          resolvePromise({
            ok: false,
            error: '已取消',
            logs: [],
            durationMs: 0,
          });
          processNext(key);
        }
      },
    };
  }

  // Queue the task
  let resolvePromise!: (r: SandboxResult) => void;
  const promise = new Promise<SandboxResult>((res) => { resolvePromise = res; });

  const task: QueuedTask = {
    factory,
    code,
    timeoutMs,
    resolve: resolvePromise,
    onProgress,
  };
  enqueue(key, task);

  return {
    promise,
    cancel: () => {
      // Remove from queue if still waiting
      const q = queues.get(key);
      if (q) {
        const idx = q.indexOf(task);
        if (idx >= 0) {
          q.splice(idx, 1);
          resolvePromise({ ok: false, error: '已取消', logs: [], durationMs: 0 });
        }
      }
      // If currently running, terminate the worker
      if (entry.busy && entry.worker) {
        entry.worker.terminate();
        entry.worker = null;
        entry.busy = false;
        dequeue(key);
        processNext(key);
      }
    },
  };
}
