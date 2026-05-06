import { describe, it, expect, vi } from 'vitest';

vi.mock('pyodide', () => ({ loadPyodide: vi.fn() }));

describe('pyodideRunner', () => {
  it('should export loadPyodideOnce', async () => {
    const { loadPyodideOnce, getPyodideStatus } = await import('../src/pyodideRunner');
    expect(typeof loadPyodideOnce).toBe('function');
    expect(getPyodideStatus().status).toBe('idle');
  });
});

describe('duckDBRunner', () => {
  it('should export loadDuckDBOnce', async () => {
    const { loadDuckDBOnce, getDuckDBStatus } = await import('../src/duckDBRunner');
    expect(typeof loadDuckDBOnce).toBe('function');
    expect(getDuckDBStatus().status).toBe('idle');
  });
});
