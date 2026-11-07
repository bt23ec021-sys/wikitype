import '@testing-library/jest-dom/vitest'

// jsdom versions do not all provide animation frames by default.
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    setTimeout(() => callback(performance.now()), 16) as unknown as number
  globalThis.cancelAnimationFrame = (id: number): void => clearTimeout(id)
}
