export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  unlocked: boolean
  progress: number
  type: AchievementType
  reward?: UnlockableReward
}

export type AchievementType = 
  | 'score' 
  | 'games_played' 
  | 'foods_eaten' 
  | 'walls_broken' 
  | 'survival_time' 
  | 'perfect_games' 
  | 'speed_demon' 
  | 'bullet_master'
  | 'teleport_expert'
  | 'combo_master'

export interface UnlockableReward {
  type: 'skin' | 'pattern' | 'color' | 'trail' | 'head_shape'
  id: string
  name: string
}

export interface SnakeSkin {
  id: string
  name: string
  description: string
  pattern: 'solid' | 'stripes' | 'spots' | 'gradient' | 'rainbow' | 'neon'
  unlocked: boolean
  requirement?: string
}

export interface TrailEffect {
  id: string
  name: string
  description: string
  effect: 'sparkles' | 'fire' | 'ice' | 'electric' | 'rainbow' | 'shadow'
  unlocked: boolean
  requirement?: string
}

export interface PlayerLevel {
  level: number
  experience: number
  experienceToNext: number
  totalExperience: number
}

export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  objective: string
  target: number
  progress: number
  completed: boolean
  reward: {
    experience: number
    unlockable?: UnlockableReward
  }
  type: 'score' | 'survival' | 'food_collection' | 'bullet_usage' | 'teleport_usage'
}

export interface PlayerStats {
  totalGames: number
  totalScore: number
  highestScore: number
  totalFoodsEaten: number
  totalWallsBroken: number
  totalSurvivalTime: number
  perfectGames: number
  totalBulletsFired: number
  totalTeleports: number
  longestSnake: number
  averageGameTime: number
  favoriteGameMode: 'single' | 'multiplayer'
}

export interface ProgressionData {
  level: PlayerLevel
  achievements: Achievement[]
  unlockedSkins: string[]
  unlockedTrails: string[]
  unlockedColors: string[]
  unlockedHeadShapes: string[]
  selectedSkin: string
  selectedTrail: string
  dailyChallenges: DailyChallenge[]
  stats: PlayerStats
  lastPlayed: string
}