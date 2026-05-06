/**
 * SQL sandbox worker — DuckDB-Wasm inside Worker.
 * Shares { code } → { ok, value, error } protocol.
 */

let dbReady = false;
let db: any = null;

interface DuckDBBundle {
  mainModule: WebAssembly.Module;
  mainWorker: string;
}

async function ensureDuckDB(): Promise<any> {
  if (dbReady) return db;
  const duckdb = await import('@duckdb/duckdb-wasm');
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const worker = await duckdb.createWorker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule!);
  await db.open({ query: { castBigIntToDouble: true } });
  dbReady = true;
  return db;
}

self.onmessage = async (event: MessageEvent<{ code: string }>) => {
  try {
    const d = await ensureDuckDB();
    const conn = await d.connect();
    const result = await conn.query(event.data.code);
    const columns = result.schema.fields.map((f: { name: string }) => f.name);
    const rows = result.toArray().map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return columns.map((c: string) => String(r[c] ?? ''));
    });
    await conn.close();
    self.postMessage({ ok: true, value: { columns, rows }, logs: [] });
  } catch (error) {
    self.postMessage({
      ok: false,
      value: null,
      logs: [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
