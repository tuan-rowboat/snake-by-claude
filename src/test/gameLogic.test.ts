import { describe, it, expect } from 'vitest'
import {
  generateRandomWalls,
  generateMovingWalls,
  moveWalls,
  generateFood,
  checkCollisions,
  updateSnakeWithFood,
  moveSnake,
  isValidDirection,
  findValidTeleportPositions,
  executeRandomTeleport,
  executeDirectionalTeleport
} from '../utils/gameLogic'
import type { Position, Direction, Food } from '../types/game'
import { GRID_SIZE } from '../utils/constants'

describe('Game Logic Utils', () => {
  describe('generateRandomWalls', () => {
    it('should generate the correct number of walls', () => {
      const walls = generateRandomWalls(10)
      expect(walls.length).toBeLessThanOrEqual(10)
      expect(walls.length).toBeGreaterThan(0)
    })

    it('should not place walls in forbidden positions', () => {
      const walls = generateRandomWalls(50)
      const forbiddenPositions = [
        { x: 10, y: 10 }, // Starting position player 1
        { x: 8, y: 8 },   // Starting position player 2
        { x: 15, y: 15 }  // Initial food position
      ]
      
      forbiddenPositions.forEach(forbidden => {
        expect(walls).not.toContainEqual(forbidden)
      })
    })

    it('should generate walls within grid boundaries', () => {
      const walls = generateRandomWalls(20)
      walls.forEach(wall => {
        expect(wall.x).toBeGreaterThanOrEqual(0)
        expect(wall.x).toBeLessThan(GRID_SIZE)
        expect(wall.y).toBeGreaterThanOrEqual(0)
        expect(wall.y).toBeLessThan(GRID_SIZE)
      })
    })
  })

  describe('generateMovingWalls', () => {
    it('should generate moving walls', () => {
      const walls = generateMovingWalls(8)
      expect(walls.length).toBeGreaterThan(0)
      expect(walls.length).toBeLessThanOrEqual(15) // Including pattern formations
    })

    it('should generate walls within grid boundaries', () => {
      const walls = generateMovingWalls(10)
      walls.forEach(wall => {
        expect(wall.x).toBeGreaterThanOrEqual(0)
        expect(wall.x).toBeLessThan(GRID_SIZE)
        expect(wall.y).toBeGreaterThanOrEqual(0)
        expect(wall.y).toBeLessThan(GRID_SIZE)
      })
    })
  })

  describe('moveWalls', () => {
    it('should return the same walls when no snake collision', () => {
      const walls: Position[] = [{ x: 5, y: 5 }, { x: 6, y: 5 }]
      const snake: Position[] = [{ x: 10, y: 10 }]
      const movedWalls = moveWalls(walls, snake)
      
      expect(movedWalls).toHaveLength(walls.length)
      movedWalls.forEach(wall => {
        expect(wall.x).toBeGreaterThanOrEqual(0)
        expect(wall.x).toBeLessThan(GRID_SIZE)
        expect(wall.y).toBeGreaterThanOrEqual(0)
        expect(wall.y).toBeLessThan(GRID_SIZE)
      })
    })

    it('should handle empty walls array', () => {
      const walls: Position[] = []
      const snake: Position[] = [{ x: 10, y: 10 }]
      const movedWalls = moveWalls(walls, snake)
      
      expect(movedWalls).toEqual([])
    })
  })

  describe('generateFood', () => {
    it('should generate food at valid position', () => {
      const snake: Position[] = [{ x: 10, y: 10 }]
      const existingFoods: Food[] = []
      const walls: Position[] = []
      
      const food = generateFood(snake, existingFoods, walls)
      
      expect(food).toHaveProperty('x')
      expect(food).toHaveProperty('y')
      expect(food).toHaveProperty('type')
      expect(food.x).toBeGreaterThanOrEqual(0)
      expect(food.x).toBeLessThan(GRID_SIZE)
      expect(food.y).toBeGreaterThanOrEqual(0)
      expect(food.y).toBeLessThan(GRID_SIZE)
    })

    it('should not place food on snake', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const existingFoods: Food[] = []
      const walls: Position[] = []
      
      const food = generateFood(snake, existingFoods, walls)
      
      snake.forEach(segment => {
        expect(food).not.toEqual({ x: segment.x, y: segment.y, type: food.type })
      })
    })

    it('should not place food on walls', () => {
      const snake: Position[] = [{ x: 10, y: 10 }]
      const existingFoods: Food[] = []
      const walls: Position[] = [{ x: 5, y: 5 }, { x: 6, y: 6 }]
      
      const food = generateFood(snake, existingFoods, walls)
      
      walls.forEach(wall => {
        expect(food).not.toEqual({ x: wall.x, y: wall.y, type: food.type })
      })
    })
  })

  describe('checkCollisions', () => {
    it('should detect wall collision', () => {
      const head: Position = { x: 5, y: 5 }
      const snake: Position[] = [{ x: 10, y: 10 }]
      const walls: Position[] = [{ x: 5, y: 5 }]
      
      expect(checkCollisions(head, snake, walls)).toBe(true)
    })

    it('should detect boundary collision', () => {
      const head: Position = { x: -1, y: 5 }
      const snake: Position[] = [{ x: 0, y: 5 }]
      const walls: Position[] = []
      
      expect(checkCollisions(head, snake, walls)).toBe(true)
    })

    it('should detect self collision', () => {
      const head: Position = { x: 8, y: 10 }
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
      const walls: Position[] = []
      
      expect(checkCollisions(head, snake, walls)).toBe(true)
    })

    it('should not detect collision when safe', () => {
      const head: Position = { x: 11, y: 10 }
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
      const walls: Position[] = [{ x: 5, y: 5 }]
      
      expect(checkCollisions(head, snake, walls)).toBe(false)
    })

    it('should detect collision with other snake in multiplayer', () => {
      const head: Position = { x: 15, y: 15 }
      const snake: Position[] = [{ x: 10, y: 10 }]
      const walls: Position[] = []
      const otherSnake: Position[] = [{ x: 15, y: 15 }, { x: 14, y: 15 }]
      
      expect(checkCollisions(head, snake, walls, otherSnake)).toBe(true)
    })
  })

  describe('updateSnakeWithFood', () => {
    it('should grow snake with normal food', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
      const result = updateSnakeWithFood(snake, 'apple', 10)
      
      expect(result.newSnake).toHaveLength(snake.length + 1)
      expect(result.scoreChange).toBe(10)
    })

    it('should double score with golden apple', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
      const result = updateSnakeWithFood(snake, 'golden', 20)
      
      expect(result.newSnake).toHaveLength(snake.length + 2)
      expect(result.scoreChange).toBe(40) // Double points
    })

    it('should shrink snake with poison mushroom', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]
      const result = updateSnakeWithFood(snake, 'poison', -15)
      
      expect(result.newSnake).toHaveLength(snake.length - 2) // Shrinks by 2
      expect(result.scoreChange).toBe(-15)
    })

    it('should not shrink snake below length 1', () => {
      const snake: Position[] = [{ x: 10, y: 10 }]
      const result = updateSnakeWithFood(snake, 'poison', -15)
      
      expect(result.newSnake).toHaveLength(1)
      expect(result.scoreChange).toBe(-15)
    })
  })

  describe('moveSnake', () => {
    it('should move snake in correct direction', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
      const direction: Direction = { x: 1, y: 0 }
      
      const newSnake = moveSnake(snake, direction)
      
      expect(newSnake[0]).toEqual({ x: 11, y: 10 })
      expect(newSnake).toHaveLength(snake.length + 1) // Head added, tail not removed yet
    })

    it('should not modify original snake', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
      const direction: Direction = { x: 1, y: 0 }
      const originalSnake = [...snake]
      
      moveSnake(snake, direction)
      
      expect(snake).toEqual(originalSnake)
    })
  })

  describe('isValidDirection', () => {
    it('should prevent immediate reversal horizontally', () => {
      const currentDirection: Direction = { x: 1, y: 0 }
      const newDirection: Direction = { x: -1, y: 0 }
      
      expect(isValidDirection(currentDirection, newDirection)).toBe(false)
    })

    it('should prevent immediate reversal vertically', () => {
      const currentDirection: Direction = { x: 0, y: 1 }
      const newDirection: Direction = { x: 0, y: -1 }
      
      expect(isValidDirection(currentDirection, newDirection)).toBe(false)
    })

    it('should allow perpendicular direction change', () => {
      const currentDirection: Direction = { x: 1, y: 0 }
      const newDirection: Direction = { x: 0, y: 1 }
      
      expect(isValidDirection(currentDirection, newDirection)).toBe(true)
    })

    it('should allow same direction', () => {
      const currentDirection: Direction = { x: 1, y: 0 }
      const newDirection: Direction = { x: 1, y: 0 }
      
      expect(isValidDirection(currentDirection, newDirection)).toBe(true)
    })
  })

  describe('Teleport Functions', () => {
    describe('findValidTeleportPositions', () => {
      it('should find valid teleport positions', () => {
        const snake: Position[] = [{ x: 10, y: 10 }]
        const walls: Position[] = [{ x: 5, y: 5 }]
        
        const positions = findValidTeleportPositions(snake, walls, [], 3)
        
        expect(positions.length).toBeGreaterThan(0)
        positions.forEach(pos => {
          expect(pos.x).toBeGreaterThanOrEqual(0)
          expect(pos.x).toBeLessThan(GRID_SIZE)
          expect(pos.y).toBeGreaterThanOrEqual(0)
          expect(pos.y).toBeLessThan(GRID_SIZE)
          
          // Should not be on snake
          expect(snake).not.toContainEqual(pos)
          
          // Should not be on walls
          expect(walls).not.toContainEqual(pos)
          
          // Should respect minimum distance
          const distance = Math.abs(snake[0].x - pos.x) + Math.abs(snake[0].y - pos.y)
          expect(distance).toBeGreaterThanOrEqual(3)
        })
      })

      it('should exclude occupied positions', () => {
        const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
        const walls: Position[] = [{ x: 5, y: 5 }]
        const otherSnake: Position[] = [{ x: 15, y: 15 }]
        
        const positions = findValidTeleportPositions(snake, walls, otherSnake, 1)
        
        positions.forEach(pos => {
          expect(snake).not.toContainEqual(pos)
          expect(walls).not.toContainEqual(pos)
          expect(otherSnake).not.toContainEqual(pos)
        })
      })
    })

    describe('executeRandomTeleport', () => {
      it('should teleport snake to a valid position', () => {
        const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }]
        const walls: Position[] = []
        
        const newSnake = executeRandomTeleport(snake, walls)
        
        expect(newSnake).toHaveLength(snake.length)
        expect(newSnake[0]).not.toEqual(snake[0]) // Head should move
        expect(newSnake.slice(1)).toEqual(snake.slice(1)) // Body should stay same
      })

      it('should return original snake if no valid positions', () => {
        // Create a scenario with very limited space
        const snake: Position[] = [{ x: 0, y: 0 }]
        const walls: Position[] = []
        // Fill most of the grid with walls to simulate no valid positions
        for (let x = 0; x < GRID_SIZE; x++) {
          for (let y = 0; y < GRID_SIZE; y++) {
            if (!(x === 0 && y === 0)) {
              walls.push({ x, y })
            }
          }
        }
        
        const newSnake = executeRandomTeleport(snake, walls)
        expect(newSnake).toEqual(snake)
      })
    })

    describe('executeDirectionalTeleport', () => {
      it('should teleport in the given direction', () => {
        const snake: Position[] = [{ x: 10, y: 10 }]
        const direction: Direction = { x: 1, y: 0 }
        const walls: Position[] = []
        
        const newPosition = executeDirectionalTeleport(snake, direction, walls)
        
        expect(newPosition.x).toBeGreaterThan(10) // Should move right
        expect(newPosition.y).toBe(10) // Y should stay same
      })

      it('should wrap around boundaries', () => {
        const snake: Position[] = [{ x: GRID_SIZE - 1, y: 10 }]
        const direction: Direction = { x: 1, y: 0 }
        const walls: Position[] = []
        
        const newPosition = executeDirectionalTeleport(snake, direction, walls)
        
        // Should wrap around to the left side
        expect(newPosition.x).toBeLessThan(GRID_SIZE - 1)
      })

      it('should avoid walls and find nearby safe space', () => {
        const snake: Position[] = [{ x: 5, y: 10 }]
        const direction: Direction = { x: 1, y: 0 }
        const walls: Position[] = [{ x: 6, y: 10 }, { x: 7, y: 10 }] // Block direct path
        
        const newPosition = executeDirectionalTeleport(snake, direction, walls)
        
        // Should not land on a wall
        expect(walls).not.toContainEqual(newPosition)
        // Should either find a new position or return original position as fallback
        const isValidPosition = !walls.some(wall => wall.x === newPosition.x && wall.y === newPosition.y)
        expect(isValidPosition).toBe(true)
      })
    })
  })
})
