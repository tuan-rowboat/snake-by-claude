import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  drawShape,
  drawSnakeEyes,
  drawGrid,
  drawWalls,
  drawPauseOverlay
} from '../utils/drawing'
import type { Position, HeadShape } from '../types/game'

describe('Drawing Utils', () => {
  let mockCtx: any

  beforeEach(() => {
    mockCtx = {
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 }))
    }
  })

  describe('drawShape', () => {
    const x = 100
    const y = 100
    const size = 20
    const color = '#ff0000'

    it('should draw square shape', () => {
      drawShape(mockCtx, 'square', x, y, size, color)
      
      expect(mockCtx.fillRect).toHaveBeenCalledWith(x, y, size, size)
      expect(mockCtx.fillStyle).toBe(color)
    })

    it('should draw circle shape', () => {
      drawShape(mockCtx, 'circle', x, y, size, color)
      
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.arc).toHaveBeenCalledWith(
        x + size / 2,
        y + size / 2,
        size / 2,
        0,
        Math.PI * 2
      )
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.fillStyle).toBe(color)
    })

    it('should draw triangle shape', () => {
      drawShape(mockCtx, 'triangle', x, y, size, color)
      
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalled()
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(2)
      expect(mockCtx.closePath).toHaveBeenCalled()
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.fillStyle).toBe(color)
    })

    it('should draw diamond shape', () => {
      drawShape(mockCtx, 'diamond', x, y, size, color)
      
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalled()
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(3)
      expect(mockCtx.closePath).toHaveBeenCalled()
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.fillStyle).toBe(color)
    })

    it('should draw star shape', () => {
      drawShape(mockCtx, 'star', x, y, size, color)
      
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalled()
      expect(mockCtx.lineTo).toHaveBeenCalled()
      expect(mockCtx.closePath).toHaveBeenCalled()
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.fillStyle).toBe(color)
    })
  })

  describe('drawSnakeEyes', () => {
    const position: Position = { x: 5, y: 5 }
    const direction = { x: 1, y: 0 }
    const headShape: HeadShape = 'square'

    it('should draw snake eyes for square head', () => {
      drawSnakeEyes(mockCtx, position, direction, headShape)
      
      expect(mockCtx.fillStyle).toBe('white')
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(2) // Two eyes
    })

    it('should not draw eyes for triangle head', () => {
      drawSnakeEyes(mockCtx, position, direction, 'triangle')
      
      expect(mockCtx.fillRect).not.toHaveBeenCalled()
    })

    it('should position eyes based on direction', () => {
      const upDirection = { x: 0, y: -1 }
      drawSnakeEyes(mockCtx, position, upDirection, headShape)
      
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(2)
    })
  })

  describe('drawGrid', () => {
    it('should draw grid lines', () => {
      drawGrid(mockCtx, 20)
      
      expect(mockCtx.strokeStyle).toBe('rgba(255, 255, 255, 0.1)')
      expect(mockCtx.lineWidth).toBe(1)
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.moveTo).toHaveBeenCalled()
      expect(mockCtx.lineTo).toHaveBeenCalled()
      expect(mockCtx.stroke).toHaveBeenCalled()
    })
  })

  describe('drawWalls', () => {
    it('should draw all walls', () => {
      const walls: Position[] = [
        { x: 5, y: 5 },
        { x: 6, y: 6 },
        { x: 7, y: 7 }
      ]
      
      drawWalls(mockCtx, walls)
      
      expect(mockCtx.fillStyle).toBe('#666666')
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(walls.length)
      expect(mockCtx.strokeStyle).toBe('#999999')
      expect(mockCtx.strokeRect).toHaveBeenCalledTimes(walls.length)
    })

    it('should handle empty walls array', () => {
      const walls: Position[] = []
      
      drawWalls(mockCtx, walls)
      
      expect(mockCtx.fillRect).not.toHaveBeenCalled()
      expect(mockCtx.strokeRect).not.toHaveBeenCalled()
    })
  })

  describe('drawPauseOverlay', () => {
    it('should draw pause overlay', () => {
      drawPauseOverlay(mockCtx, 20)
      
      // Should call fillRect for overlay
      expect(mockCtx.fillRect).toHaveBeenCalled()
      
      // Should call fillText for pause text
      expect(mockCtx.fillText).toHaveBeenCalledWith('PAUSED', expect.any(Number), expect.any(Number))
      
      // Final fillStyle should be white (for text)
      expect(mockCtx.fillStyle).toBe('white')
      expect(mockCtx.font).toBe('bold 24px Arial')
      expect(mockCtx.textAlign).toBe('center')
    })

    it('should center text correctly', () => {
      drawPauseOverlay(mockCtx, 20)
      
      expect(mockCtx.textAlign).toBe('center')
      expect(mockCtx.textBaseline).toBe('middle')
    })
  })
})
