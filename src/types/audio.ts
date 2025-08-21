export type SoundEffect = 
  | 'eat_food'
  | 'eat_golden_food'
  | 'eat_special_food'
  | 'teleport'
  | 'bullet_fire'
  | 'wall_break'
  | 'game_over'
  | 'achievement_unlock'
  | 'level_up'
  | 'button_click'
  | 'pause'
  | 'resume'
  | 'magnet_activate'

export type BackgroundMusic = 
  | 'menu'
  | 'gameplay'
  | 'game_over'

export interface AudioSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
}

export interface SoundConfig {
  id: SoundEffect
  urls: string[]
  volume?: number
  loop?: boolean
}

export interface MusicConfig {
  id: BackgroundMusic
  url: string
  volume?: number
  loop?: boolean
}