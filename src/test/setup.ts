import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom doesn't implement these — Radix UI primitives (Select, Tooltip, etc.) need them.
class ResizeObserverStub {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Real ResizeObserver always fires asynchronously, never within the
    // same tick as observe() — deferring here avoids racing React's
    // render/commit phase, which caused intermittent SVG-namespace
    // warnings under full-suite runs when this fired synchronously.
    queueMicrotask(() => {
      this.callback(
        [
          {
            target,
            contentRect: { width: 500, height: 300 },
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    });
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
