import type { FoodType, FoodProperties, HeadShape, SpeedType, WallPattern, Position } from '../types/game'

// Game constants
export const DEFAULT_GRID_SIZE: number = 20
export const CELL_SIZE: number = 25

// Grid size options
export const GRID_SIZES: Record<string, number> = {
  small: 15,
  normal: 20,
  large: 25,
  huge: 30
}

// Dynamic game size calculation
export const getGameSize = (gridSize: number) => ({
  width: gridSize * CELL_SIZE,
  height: gridSize * CELL_SIZE
})

// Food types with their properties
export const FOOD_TYPES: Record<FoodType, FoodProperties> = {
  apple: { color: '#ff0000', points: 10, spawnRate: 0.26, shape: 'circle', emoji: '🍎' },
  golden: { color: '#ffd700', points: 50, spawnRate: 0.05, shape: 'star', emoji: '⭐' },
  berry: { color: '#9932cc', points: 20, spawnRate: 0.14, shape: 'circle', emoji: '🫐' },
  super: { color: '#ff69b4', points: 100, spawnRate: 0.03, shape: 'diamond', emoji: '💎' },
  banana: { color: '#ffe135', points: 15, spawnRate: 0.11, shape: 'rectangle', emoji: '🍌' },
  cherry: { color: '#dc143c', points: 25, spawnRate: 0.09, shape: 'circle', emoji: '🍒' },
  watermelon: { color: '#fc6c85', points: 30, spawnRate: 0.05, shape: 'triangle', emoji: '🍉' },
  mushroom: { color: '#00ff00', points: 5, spawnRate: 0.05, shape: 'circle', emoji: '🍄', effect: 'double' },
  poison: { color: '#8b008b', points: -10, spawnRate: 0.05, shape: 'triangle', emoji: '☠️', effect: 'shrink' },
  bullet: { color: '#ff6600', points: 20, spawnRate: 0.05, shape: 'diamond', emoji: '🔥', effect: 'bullet' },
  growth: { color: '#00ffaa', points: 15, spawnRate: 0.06, shape: 'circle', emoji: '🧪', effect: 'randomGrow' },
  shrink: { color: '#ff00aa', points: -5, spawnRate: 0.06, shape: 'circle', emoji: '💊', effect: 'randomShrink' }
}

// Wall patterns
export const WALL_PATTERNS: Record<WallPattern, Position[]> = {
  none: [],
  simple: [
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 12, y: 14 }, { x: 13, y: 14 }, { x: 14, y: 14 },
    { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
    { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }
  ],
  cross: [
    // Horizontal line
    { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 },
    { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 },
    // Vertical line
    { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
    { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 10, y: 13 }, { x: 10, y: 14 }
  ],
  maze: [
    // Top left L
    { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
    // Top right L
    { x: 14, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 },
    // Bottom left L
    { x: 3, y: 14 }, { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 },
    // Bottom right L
    { x: 16, y: 14 }, { x: 16, y: 15 }, { x: 16, y: 16 }, { x: 15, y: 16 }, { x: 14, y: 16 },
    // Center obstacles
    { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
  ],
  random: [], // Will be generated randomly
  moving: [
    // Moving group 1 - L shape
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 },
    // Moving group 2 - horizontal line
    { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 },
    // Moving group 3 - vertical line
    { x: 8, y: 15 }, { x: 8, y: 16 },
    // Moving group 4 - small block  
    { x: 18, y: 12 }, { x: 19, y: 12 }, { x: 18, y: 13 }
  ] // Will be moved dynamically every 10 seconds
}

export const HEAD_SHAPES: HeadShape[] = ['square', 'circle', 'triangle', 'diamond', 'star']
export const HEAD_COLORS: string[] = ['#00ff00', '#0080ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8000']
export const BG_COLORS: string[] = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#3d5a80']
export const SPEEDS: Record<SpeedType, number> = { slow: 200, normal: 120, fast: 70 }

// Teleport settings
export const TELEPORT_COOLDOWN = 5000 // 5 seconds cooldown
export const TELEPORT_RANGE = 5 // Minimum distance for teleport
