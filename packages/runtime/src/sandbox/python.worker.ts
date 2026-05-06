/**
 * Python sandbox worker.
 * Downloads Pyodide once, then executes code on each message.
 * Shares the same { code } → { ok, value, error } protocol as js.worker.
 */

let pyodideReady = false;
let pyodide: any = null;

interface PyodideAPI {
  loadPyodide: (opts: { indexURL: string }) => Promise<any>;
}

async function ensurePyodide(): Promise<any> {
  if (pyodideReady) return pyodide;
  // Dynamic import — Pyodide may not be available if the host blocks CDN,
  // so we catch and report cleanly.
  const { loadPyodide } = (await import('pyodide')) as unknown as PyodideAPI;
  pyodide = await loadPyodide({
    // Must match the version in packages/runtime/package.json (pyodide: ^0.29.3)
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  });
  pyodideReady = true;
  return pyodide;
}

self.onmessage = async (event: MessageEvent<{ code: string }>) => {
  try {
    const p = await ensurePyodide();
    const outputLines: string[] = [];
    p.setStdout({ batched: (text: string) => outputLines.push(text) });
    p.setStderr({ batched: (text: string) => outputLines.push(text) });

    await p.loadPackagesFromImports(event.data.code, {
      messageCallback: () => {},
      errorCallback: () => {},
    });

    const result = p.runPython(event.data.code);
    const output = [
      ...outputLines,
      result !== undefined ? String(result) : '',
    ]
      .filter(Boolean)
      .join('\n');

    self.postMessage({
      ok: true,
      value: output || '(无输出)',
      logs: outputLines,
    });
  } catch (error) {
    self.postMessage({
      ok: false,
      value: null,
      logs: [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
