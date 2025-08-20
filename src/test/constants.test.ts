import { describe, it, expect } from 'vitest'
import {
  DEFAULT_GRID_SIZE,
  CELL_SIZE,
  WALL_PATTERNS,
  FOOD_TYPES,
  HEAD_SHAPES,
  HEAD_COLORS,
  BG_COLORS,
  SPEEDS,
  TELEPORT_COOLDOWN,
  TELEPORT_RANGE,
  getGameSize
} from '../utils/constants'

describe('Constants', () => {
  describe('Grid Constants', () => {
    it('should have valid grid dimensions', () => {
      expect(DEFAULT_GRID_SIZE).toBeGreaterThan(0)
      expect(CELL_SIZE).toBeGreaterThan(0)
      const gameSize = getGameSize(DEFAULT_GRID_SIZE)
      expect(gameSize.width).toBe(DEFAULT_GRID_SIZE * CELL_SIZE)
      expect(gameSize.height).toBe(DEFAULT_GRID_SIZE * CELL_SIZE)
    })

    it('should have consistent dimensions', () => {
      const gameSize = getGameSize(DEFAULT_GRID_SIZE)
      expect(gameSize.width).toBeGreaterThan(0)
      expect(gameSize.height).toBeGreaterThan(0)
      expect(gameSize.width % CELL_SIZE).toBe(0)
      expect(gameSize.height % CELL_SIZE).toBe(0)
    })
  })

  describe('Wall Patterns', () => {
    it('should include all required patterns', () => {
      expect(WALL_PATTERNS).toHaveProperty('none')
      expect(WALL_PATTERNS).toHaveProperty('simple')
      expect(WALL_PATTERNS).toHaveProperty('cross')
      expect(WALL_PATTERNS).toHaveProperty('maze')
      expect(WALL_PATTERNS).toHaveProperty('random')
      expect(WALL_PATTERNS).toHaveProperty('moving')
    })

    it('should have valid wall positions', () => {
      Object.entries(WALL_PATTERNS).forEach(([pattern, walls]) => {
        if (pattern !== 'random') { // random is empty by design
          walls.forEach(wall => {
            expect(wall).toHaveProperty('x')
            expect(wall).toHaveProperty('y')
            expect(wall.x).toBeGreaterThanOrEqual(0)
            expect(wall.x).toBeLessThan(DEFAULT_GRID_SIZE)
            expect(wall.y).toBeGreaterThanOrEqual(0)
            expect(wall.y).toBeLessThan(DEFAULT_GRID_SIZE)
          })
        }
      })
    })

    it('should have empty arrays for dynamic patterns', () => {
      expect(WALL_PATTERNS.random).toEqual([])
      expect(WALL_PATTERNS.none).toEqual([])
    })
  })

  describe('Food Types', () => {
    it('should have all required food types', () => {
      const requiredTypes = ['apple', 'golden', 'berry', 'super', 'banana', 'cherry', 'watermelon', 'mushroom', 'poison']
      
      requiredTypes.forEach(type => {
        expect(FOOD_TYPES).toHaveProperty(type)
      })
    })

    it('should have valid food properties', () => {
      Object.entries(FOOD_TYPES).forEach(([, properties]) => {
        expect(properties).toHaveProperty('color')
        expect(properties).toHaveProperty('points')
        expect(properties).toHaveProperty('spawnRate')
        expect(properties).toHaveProperty('shape')
        expect(properties).toHaveProperty('emoji')
        
        expect(typeof properties.color).toBe('string')
        expect(typeof properties.points).toBe('number')
        expect(typeof properties.spawnRate).toBe('number')
        expect(typeof properties.shape).toBe('string')
        expect(typeof properties.emoji).toBe('string')
        
        expect(properties.spawnRate).toBeGreaterThan(0)
        expect(properties.spawnRate).toBeLessThanOrEqual(1)
        expect(properties.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('should have positive points for most foods', () => {
      expect(FOOD_TYPES.apple.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.golden.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.berry.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.super.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.banana.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.cherry.points).toBeGreaterThan(0)
      expect(FOOD_TYPES.watermelon.points).toBeGreaterThan(0)
    })

    it('should have negative points for poison', () => {
      expect(FOOD_TYPES.poison.points).toBeLessThan(0)
    })
  })

  describe('Head Shapes', () => {
    it('should include all valid shapes', () => {
      const expectedShapes = ['square', 'circle', 'triangle', 'diamond', 'star']
      
      expect(HEAD_SHAPES).toEqual(expect.arrayContaining(expectedShapes))
      expect(HEAD_SHAPES).toHaveLength(expectedShapes.length)
    })

    it('should contain only strings', () => {
      HEAD_SHAPES.forEach(shape => {
        expect(typeof shape).toBe('string')
      })
    })
  })

  describe('Colors', () => {
    it('should have valid hex colors for heads', () => {
      HEAD_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('should have valid hex colors for backgrounds', () => {
      BG_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('should have multiple color options', () => {
      expect(HEAD_COLORS.length).toBeGreaterThan(1)
      expect(BG_COLORS.length).toBeGreaterThan(1)
    })

    it('should have unique colors', () => {
      const uniqueHeadColors = new Set(HEAD_COLORS)
      const uniqueBgColors = new Set(BG_COLORS)
      
      expect(uniqueHeadColors.size).toBe(HEAD_COLORS.length)
      expect(uniqueBgColors.size).toBe(BG_COLORS.length)
    })
  })

  describe('Speeds', () => {
    it('should have all speed levels', () => {
      expect(SPEEDS).toHaveProperty('slow')
      expect(SPEEDS).toHaveProperty('normal')
      expect(SPEEDS).toHaveProperty('fast')
    })

    it('should have valid speed values', () => {
      Object.values(SPEEDS).forEach(speed => {
        expect(speed).toBeGreaterThan(0)
        expect(typeof speed).toBe('number')
      })
    })

    it('should have correct speed ordering', () => {
      expect(SPEEDS.slow).toBeGreaterThan(SPEEDS.normal)
      expect(SPEEDS.normal).toBeGreaterThan(SPEEDS.fast)
    })
  })

  describe('Teleport Constants', () => {
    it('should have valid teleport cooldown', () => {
      expect(TELEPORT_COOLDOWN).toBeGreaterThan(0)
      expect(typeof TELEPORT_COOLDOWN).toBe('number')
    })

    it('should have valid teleport range', () => {
      expect(TELEPORT_RANGE).toBeGreaterThan(0)
      expect(typeof TELEPORT_RANGE).toBe('number')
    })

    it('should have reasonable values', () => {
      expect(TELEPORT_COOLDOWN).toBeLessThan(30000) // Less than 30 seconds
      expect(TELEPORT_RANGE).toBeLessThan(DEFAULT_GRID_SIZE) // Less than grid size
    })
  })
})
