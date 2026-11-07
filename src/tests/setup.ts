import '@testing-library/jest-dom/vitest'

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: window.localStorage,
})

if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    setTimeout(() => callback(performance.now()), 16) as unknown as number

  globalThis.cancelAnimationFrame = (id: number): void =>
    clearTimeout(id)
}
