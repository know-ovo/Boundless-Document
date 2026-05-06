import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

if (!document.elementsFromPoint) {
  document.elementsFromPoint = () => [];
}

const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const rect = origGetBoundingClientRect.call(this);
  (rect as any).toJSON = () => rect;
  return rect;
};

// jsdom does not provide Worker — stub for sandbox tests.
// The stub fires onmessage synchronously so that executeInSandbox
// resolves before the timeout.
if (typeof Worker === 'undefined') {
  class StubWorker {
    onmessage: ((ev: MessageEvent) => void) | null = null;
    onerror: ((ev: ErrorEvent) => void) | null = null;
    postMessage(data: unknown) {
      // Simulate a successful sandbox execution
      queueMicrotask(() => {
        this.onmessage?.(
          new MessageEvent('message', { data: { ok: true, value: data, logs: [] } }),
        );
      });
    }
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
  }
  (globalThis as any).Worker = StubWorker;
}
