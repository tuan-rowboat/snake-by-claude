import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadHighScores, updateHighScores, saveHighScores } from '../utils/storage'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

// Replace global localStorage with mock
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadHighScores', () => {
    it('should return empty array when no scores exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const scores = loadHighScores()
      
      expect(scores).toEqual([])
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('snakeHighScores')
    })

    it('should return parsed scores when they exist', () => {
      const mockScores = [100, 80, 60, 40, 20]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockScores))
      
      const scores = loadHighScores()
      
      expect(scores).toEqual(mockScores)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('snakeHighScores')
    })

    it('should return empty array when localStorage contains invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      const scores = loadHighScores()
      
      expect(scores).toEqual([])
    })

    it('should return empty array when localStorage throws error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const scores = loadHighScores()
      
      expect(scores).toEqual([])
    })
  })

  describe('updateHighScores', () => {
    beforeEach(() => {
      mockLocalStorage.setItem.mockImplementation(() => {})
    })

    it('should add new high score to empty list', () => {
      const currentScore = 100
      const existingScores: number[] = []
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100])
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'snakeHighScores',
        JSON.stringify([100])
      )
    })

    it('should insert score in correct position', () => {
      const currentScore = 75
      const existingScores = [100, 50, 25]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 75, 50, 25])
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'snakeHighScores',
        JSON.stringify([100, 75, 50, 25])
      )
    })

    it('should add score at the end if it is lowest', () => {
      const currentScore = 10
      const existingScores = [100, 80, 60, 40]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 80, 60, 40, 10])
    })

    it('should add score at the beginning if it is highest', () => {
      const currentScore = 150
      const existingScores = [100, 80, 60, 40, 20]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([150, 100, 80, 60, 40])
    })

    it('should limit to maximum number of scores', () => {
      const currentScore = 90
      const existingScores = [100, 80, 60, 40, 20]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 90, 80, 60, 40])
      expect(updatedScores).toHaveLength(5)
    })

    it('should not add score if it does not make top 5', () => {
      const currentScore = 5
      const existingScores = [100, 80, 60, 40, 20]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 80, 60, 40, 20])
      expect(updatedScores).toHaveLength(5)
    })

    it('should handle duplicate scores', () => {
      const currentScore = 80
      const existingScores = [100, 80, 60, 40]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 80, 80, 60, 40])
    })

    it('should handle zero score', () => {
      const currentScore = 0
      const existingScores = [100, 80, 60, 40, 20]
      
      const updatedScores = updateHighScores(currentScore, existingScores)
      
      expect(updatedScores).toEqual([100, 80, 60, 40, 20])
    })

    it('should not modify original scores array', () => {
      const currentScore = 75
      const existingScores = [100, 50, 25]
      const originalLength = existingScores.length
      
      updateHighScores(currentScore, existingScores)
      
      expect(existingScores).toHaveLength(originalLength)
      expect(existingScores).toEqual([100, 50, 25])
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const currentScore = 100
      const existingScores: number[] = []
      
      expect(() => updateHighScores(currentScore, existingScores)).not.toThrow()
    })
  })

  describe('saveHighScores', () => {
    it('should save scores to localStorage', () => {
      const scores = [100, 80, 60, 40, 20]
      
      saveHighScores(scores)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'snakeHighScores',
        JSON.stringify(scores)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const scores = [100, 80, 60, 40, 20]
      
      expect(() => saveHighScores(scores)).not.toThrow()
    })
  })
})
