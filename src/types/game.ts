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
  spawnTime?: number // For spawn animation
  scale?: number // For pulsing animation
}

export type FoodType = 'apple' | 'golden' | 'berry' | 'super' | 'banana' | 'cherry' | 'watermelon' | 'mushroom' | 'poison' | 'bullet' | 'growth' | 'shrink' | 'magnet'

export interface FoodProperties {
  color: string
  points: number
  spawnRate: number
  shape: ShapeType
  emoji: string
  effect?: 'double' | 'shrink' | 'bullet' | 'randomGrow' | 'randomShrink' | 'magnet'
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
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
  botsEnabled: boolean
  botCount: number
  botDifficulty: 'easy' | 'medium' | 'hard'
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
  bots: Bot[]
  direction: Direction
  direction2: Direction
  score: number
  score2: number
  winner: Winner
  teleportCooldown: number
  teleportCooldown2: number
  bulletCount: number
  bulletCount2: number
  magnetCount: number
  magnetCount2: number
}

import type { Bot } from './bot'
