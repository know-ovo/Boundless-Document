import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getPyodideStatus, onPyodideChange, loadPyodideOnce, runPython } from './pyodideRunner';
import { getDuckDBStatus, onDuckDBChange, loadDuckDBOnce, runSQL } from './duckDBRunner';
import type { SandboxExecution } from './sandbox/sandboxRunner';

interface RuntimeContextValue {
  pyodide: {
    status: string;
    error: string | null;
    load: () => Promise<void>;
    runPython: (code: string, timeoutMs?: number) => SandboxExecution;
  };
  duckdb: {
    status: string;
    error: string | null;
    load: () => Promise<void>;
    runSQL: (sql: string, timeoutMs?: number) => SandboxExecution;
  };
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub1 = onPyodideChange(() => forceUpdate((n) => n + 1));
    const unsub2 = onDuckDBChange(() => forceUpdate((n) => n + 1));
    return () => { unsub1(); unsub2(); };
  }, []);

  const pyodideState = getPyodideStatus();
  const duckdbState = getDuckDBStatus();

  const value: RuntimeContextValue = {
    pyodide: {
      status: pyodideState.status,
      error: pyodideState.error,
      load: loadPyodideOnce,
      runPython,
    },
    duckdb: {
      status: duckdbState.status,
      error: duckdbState.error,
      load: loadDuckDBOnce,
      runSQL,
    },
  };

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useRuntime() {
  const ctx = useContext(RuntimeContext);
  if (!ctx) throw new Error('useRuntime must be used within RuntimeProvider');
  return ctx;
}
