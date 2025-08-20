// Optional: Extract settings logic to a composable
import { ref, watch } from 'vue'
import type { GameSettings } from '../types/game'

export function useGameSettings() {
  const settings = ref<GameSettings>({
    headShape: 'square',
    headColor: '#00ff00',
    headColor2: '#0080ff',
    bgColor: '#1a1a2e',
    speed: 'normal',
    wallPattern: 'simple',
    maxFoods: 3,
    teleportEnabled: false
  })

  // Auto-save settings to localStorage
  watch(settings, (newSettings) => {
    localStorage.setItem('snakeGameSettings', JSON.stringify(newSettings))
  }, { deep: true })

  // Load settings on init
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('snakeGameSettings')
      if (saved) {
        Object.assign(settings.value, JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load settings:', error)
    }
  }

  const updateSetting = <K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ) => {
    settings.value[key] = value
  }

  return {
    settings,
    loadSettings,
    updateSetting
  }
}
