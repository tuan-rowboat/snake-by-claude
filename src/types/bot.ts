import type { Position, Direction } from './game'

export type BotType = 'wanderer' | 'chaser' | 'guard' | 'patrol' | 'random'

export interface Bot extends Position {
  id: string
  type: BotType
  direction: Direction
  speed: number
  color: string
  size: number
  lastMoveTime: number
  moveInterval: number
  targetPosition?: Position
  patrolPoints?: Position[]
  currentPatrolIndex?: number
  aggroRange?: number
  isActive: boolean
}

export interface BotSettings {
  enabled: boolean
  count: number
  types: BotType[]
  spawnDelay: number
  difficulty: 'easy' | 'medium' | 'hard'
}