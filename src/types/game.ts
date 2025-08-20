// Game type definitions
export interface Position {
  x: number
  y: number
}

export interface Direction {
  x: number
  y: number
}

export interface Food extends Position {
  type: FoodType
}

export type FoodType = 'apple' | 'golden' | 'berry' | 'super' | 'banana' | 'cherry' | 'watermelon' | 'mushroom' | 'poison' | 'bullet' | 'growth' | 'shrink'

export interface FoodProperties {
  color: string
  points: number
  spawnRate: number
  shape: ShapeType
  emoji: string
  effect?: 'double' | 'shrink' | 'bullet' | 'randomGrow' | 'randomShrink'
}

export type ShapeType = 'circle' | 'triangle' | 'diamond' | 'star' | 'rectangle' | 'square'

export type HeadShape = 'square' | 'circle' | 'triangle' | 'diamond' | 'star'

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver'

export type GameMode = 'single' | 'multiplayer'

export type Winner = 'player1' | 'player2' | 'tie' | null

export type SpeedType = 'slow' | 'normal' | 'fast'

export type WallPattern = 'none' | 'simple' | 'cross' | 'maze' | 'random' | 'moving'

export interface GameSettings {
  headShape: HeadShape
  headColor: string
  headColor2: string
  bgColor: string
  speed: SpeedType
  wallPattern: WallPattern
  maxFoods: number
  teleportEnabled: boolean
  gridSize: number
}

export interface Bullet extends Position {
  direction: Direction
  playerId: 1 | 2
}

export interface GameProgress {
  snake: Position[]
  snake2: Position[]
  foods: Food[]
  walls: Position[]
  bullets: Bullet[]
  direction: Direction
  direction2: Direction
  score: number
  score2: number
  winner: Winner
  teleportCooldown: number
  teleportCooldown2: number
  bulletCount: number
  bulletCount2: number
}
