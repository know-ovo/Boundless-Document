import type { LiveDataBlock } from '@boundless-docs/shared';

export type DataStatus = 'idle' | 'connecting' | 'open' | 'error' | 'paused';

export interface DataSnapshot {
  status: DataStatus;
  value: unknown;
  error?: string;
  updatedAt?: string;
}

export interface DataSubscription {
  pause: () => void;
  resume: () => void;
  dispose: () => void;
}

export function subscribeToLiveData(
  block: LiveDataBlock,
  onSnapshot: (snapshot: DataSnapshot) => void,
): DataSubscription {
  const { mode, source, interval } = block.config;
  let disposed = false;
  let paused = false;
  let timer: number | undefined;
  let eventSource: EventSource | undefined;
  let socket: WebSocket | undefined;

  const emit = (snapshot: DataSnapshot) => {
    if (!disposed) {
      onSnapshot(snapshot);
    }
  };

  const fetchOnce = async () => {
    if (disposed || paused || !source) {
      return;
    }
    emit({ status: 'connecting', value: null });
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      emit({
        status: 'open',
        value: await response.json(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      emit({
        status: 'error',
        value: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const startPolling = () => {
    void fetchOnce();
    timer = window.setInterval(fetchOnce, Math.max(interval, 1000));
  };

  const startSse = () => {
    emit({ status: 'connecting', value: null });
    eventSource = new EventSource(source);
    eventSource.onmessage = (event) => {
      emit({
        status: 'open',
        value: parseJsonPayload(event.data),
        updatedAt: new Date().toISOString(),
      });
    };
    eventSource.onerror = () => {
      emit({ status: 'error', value: null, error: 'SSE connection error' });
    };
  };

  const startWebSocket = () => {
    emit({ status: 'connecting', value: null });
    socket = new WebSocket(source);
    socket.onmessage = (event) => {
      emit({
        status: 'open',
        value: parseJsonPayload(event.data),
        updatedAt: new Date().toISOString(),
      });
    };
    socket.onerror = () => {
      emit({ status: 'error', value: null, error: 'WebSocket connection error' });
    };
  };

  const start = () => {
    if (mode === 'sse') {
      startSse();
    } else if (mode === 'websocket') {
      startWebSocket();
    } else {
      startPolling();
    }
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = undefined;
    }
    eventSource?.close();
    eventSource = undefined;
    socket?.close();
    socket = undefined;
  };

  if (!source) {
    emit({ status: 'error', value: null, error: 'Missing data source URL' });
  } else {
    start();
  }

  return {
    pause: () => {
      paused = true;
      stop();
      emit({ status: 'paused', value: null });
    },
    resume: () => {
      if (!disposed && paused) {
        paused = false;
        start();
      }
    },
    dispose: () => {
      disposed = true;
      stop();
    },
  };
}

function parseJsonPayload(data: unknown): unknown {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
