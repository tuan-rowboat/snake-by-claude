import { vi } from 'vitest'

// Mock canvas context for testing
;(globalThis as any).HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillText: vi.fn(),
  strokeText: vi.fn(),
}))

// Mock window.requestAnimationFrame
;(globalThis as any).requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
;(globalThis as any).cancelAnimationFrame = vi.fn()

// Mock window.alert
;(globalThis as any).alert = vi.fn()

// Mock console methods
;(globalThis as any).console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}
