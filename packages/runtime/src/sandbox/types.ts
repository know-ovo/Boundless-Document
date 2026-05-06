/**
 * Unified sandbox result — shared by JS, Python, SQL runners.
 * Mirrors the adapter pattern from packages/shared/src/extensionPoints.ts.
 */
export interface SandboxResult {
  ok: boolean;
  value?: unknown;
  error?: string;
  /** console output (JS, Python) — worker-dependent */
  logs?: string[];
  /** execution duration in ms */
  durationMs: number;
}

/**
 * Worker request sent to every sandbox worker.
 * The worker decides how to interpret `code` + `config`.
 */
export interface SandboxRequest {
  code: string;
  config?: Record<string, unknown>;
}

/**
 * Worker response returned from every sandbox worker.
 * Must match SandboxResult so the caller gets a uniform shape.
 */
export interface SandboxResponse {
  ok: boolean;
  value?: unknown;
  error?: string;
}
