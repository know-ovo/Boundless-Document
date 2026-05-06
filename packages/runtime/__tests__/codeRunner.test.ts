import { describe, it, expect } from 'vitest';
import { runJavaScript, explainPythonRuntimeStatus, type CodeRunResult } from '../src/codeRunner';

const ok = (result: CodeRunResult) => {
  expect(typeof result).toBe('object');
  expect(typeof result.ok).toBe('boolean');
  expect(Array.isArray(result.logs)).toBe(true);
  expect(typeof result.durationMs).toBe('number');
  expect(result.durationMs).toBeGreaterThanOrEqual(0);
};

describe('runJavaScript', () => {
  it('returns SandboxExecution with promise and cancel', async () => {
    const exec = runJavaScript('console.log("hello")', 500);
    expect(exec).toHaveProperty('promise');
    expect(exec).toHaveProperty('cancel');
    expect(typeof exec.cancel).toBe('function');
    const result = await exec.promise;
    ok(result);
  }, 5000);

  it('handles empty code string', async () => {
    const { promise } = runJavaScript('', 500);
    const result = await promise;
    ok(result);
  }, 5000);

  it('cancel function does not throw', () => {
    const exec = runJavaScript('while(true){}', 5000);
    expect(() => exec.cancel()).not.toThrow();
  }, 5000);
});

describe('explainPythonRuntimeStatus', () => {
  it('returns a non-empty message', () => {
    const msg = explainPythonRuntimeStatus();
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('mentions Pyodide or JupyterLite', () => {
    expect(explainPythonRuntimeStatus().toLowerCase()).toMatch(/pyodide|jupyterlite/);
  });
});
