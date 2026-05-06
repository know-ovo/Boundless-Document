let logs: string[] = [];

const safeConsole = {
  log: (...args: unknown[]) => appendLog(args),
  info: (...args: unknown[]) => appendLog(args),
  warn: (...args: unknown[]) => appendLog(args),
  error: (...args: unknown[]) => appendLog(args),
};

self.onmessage = async (event: MessageEvent<{ code: string }>) => {
  logs = [];
  try {
    const fn = new Function(
      'console',
      `"use strict"; return (async () => {\n${event.data.code}\n})()`,
    );
    const value = await fn(safeConsole);
    self.postMessage({ ok: true, value: serializeValue(value), logs });
  } catch (error) {
    self.postMessage({
      ok: false,
      logs,
      error: error instanceof Error ? error.stack ?? error.message : String(error),
    });
  }
};

function appendLog(args: unknown[]) {
  logs.push(args.map((arg) => stringify(arg)).join(' '));
}

/**
 * Structured serialization that survives what JSON.stringify loses:
 *   BigInt     → { __bigint: "123" }
 *   Symbol     → { __symbol: "name" }
 *   undefined  → { __undefined: true }
 *   NaN        → { __nan: true }
 *   Infinity   → { __inf: "Infinity" }
 *   circular   → { __circular: "<ref path>" }
 *
 * StructuredClone would be ideal but doesn't transfer functions/errors.
 */
function serializeValue(value: unknown, seen = new WeakMap<object, string>()): unknown {
  if (value === undefined) return { __undefined: true };
  if (value === null) return null;

  if (typeof value === 'bigint') {
    return { __bigint: value.toString() };
  }
  if (typeof value === 'symbol') {
    return { __symbol: value.description ?? '' };
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return { __nan: true };
    if (!Number.isFinite(value)) return { __inf: value > 0 ? 'Infinity' : '-Infinity' };
    return value;
  }
  if (typeof value === 'function') {
    return { __function: value.name || '(anonymous)' };
  }

  if (value instanceof Error) {
    return {
      __error: true,
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === 'object') {
    const ref = seen.get(value);
    if (ref !== undefined) {
      return { __circular: ref };
    }
    seen.set(value, '<root>');

    if (Array.isArray(value)) {
      return value.map((v, i) => {
        seen.set(value, `[${i}]`);
        return serializeValue(v, seen);
      });
    }

    const obj: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      seen.set(value, key);
      try {
        obj[key] = serializeValue((value as Record<string, unknown>)[key], seen);
      } catch {
        obj[key] = { __error: true, message: 'serialization failed' };
      }
    }
    return obj;
  }

  // string, boolean, number
  return value;
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return `Symbol(${value.description ?? ''})`;
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
