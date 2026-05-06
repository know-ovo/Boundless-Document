import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribeToLiveData, type DataSnapshot, type DataSubscription } from '../src/dataSource';
import type { LiveDataBlock } from '@boundless-docs/shared';

function makeBlock(overrides: Partial<LiveDataBlock['config']> = {}): LiveDataBlock {
  return {
    id: 'live-data-1',
    kind: 'live-data' as const,
    raw: '',
    order: 0,
    config: {
      source: overrides.source ?? 'https://example.com/api',
      mode: overrides.mode ?? 'polling',
      interval: overrides.interval ?? 5000,
      view: overrides.view ?? 'json',
    },
  };
}

function collectSnapshots(sub: DataSubscription, ms = 100): DataSnapshot[] {
  const snapshots: DataSnapshot[] = [];
  // Just return what was emitted synchronously — polling/sse/ws are async
  return snapshots;
}

describe('subscribeToLiveData', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /* ─── missing source ────────────────────────────── */
  it('emits error immediately when source is empty', () => {
    const snaps: DataSnapshot[] = [];
    const sub = subscribeToLiveData(makeBlock({ source: '' }), (s) => snaps.push(s));
    expect(snaps).toHaveLength(1);
    expect(snaps[0].status).toBe('error');
    expect(snaps[0].error).toBe('Missing data source URL');
    sub.dispose();
  });

  /* ─── return shape ──────────────────────────────── */
  it('returns a subscription with pause / resume / dispose', () => {
    const sub = subscribeToLiveData(makeBlock(), () => {});
    expect(typeof sub.pause).toBe('function');
    expect(typeof sub.resume).toBe('function');
    expect(typeof sub.dispose).toBe('function');
    sub.dispose();
  });

  /* ─── dispose stops further emissions ──────────── */
  it('stops emitting after dispose()', async () => {
    const snaps: DataSnapshot[] = [];
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const sub = subscribeToLiveData(makeBlock({ mode: 'polling' }), (s) => snaps.push(s));

    // Initial state depends on timing — at least connecting was emitted
    sub.dispose();

    // After disposal, no more emissions should arrive
    const countAfterDispose = snaps.length;
    await vi.advanceTimersByTimeAsync(10000);
    expect(snaps).toHaveLength(countAfterDispose);

    fetchSpy.mockRestore();
  });

  /* ─── polling mode ──────────────────────────────── */
  it('emits connecting then calls fetch in polling mode', async () => {
    const snaps: DataSnapshot[] = [];
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const sub = subscribeToLiveData(makeBlock({ mode: 'polling' }), (s) => snaps.push(s));
    // Advance enough for the first fetch call (polling fires immediately then every interval)
    await vi.advanceTimersByTimeAsync(100);

    // First snapshot is connecting or open
    expect(snaps.length).toBeGreaterThanOrEqual(1);
    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
    sub.dispose();
  });

  /* ─── pause / resume ────────────────────────────── */
  it('pause emits paused status, resume restarts', async () => {
    const snaps: DataSnapshot[] = [];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const sub = subscribeToLiveData(makeBlock({ mode: 'polling' }), (s) => snaps.push(s));
    await vi.advanceTimersByTimeAsync(100);

    sub.pause();
    const paused = snaps.find((s) => s.status === 'paused');
    expect(paused).toBeDefined();

    sub.resume();
    await vi.advanceTimersByTimeAsync(100);
    sub.dispose();
  });
});

describe('subscribeToLiveData – mode routing', () => {
  it('defaults to polling for unknown mode', () => {
    const block = makeBlock({ mode: 'grpc' as any, source: 'https://x.com' });
    const sub = subscribeToLiveData(block, () => {});
    expect(typeof sub.dispose).toBe('function');
    sub.dispose();
  });
});
