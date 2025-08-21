// Optional: Game state composable
import { ref, computed, type Ref } from 'vue'
import type { GameState, GameMode, GameProgress } from '../types/game'

export function useGameState() {
  const gameState: Ref<GameState> = ref('menu')
  const gameMode: Ref<GameMode> = ref('single')
  
  const gameProgress: Ref<GameProgress> = ref({
    snake: [{ x: 10, y: 10 }],
    snake2: [{ x: 8, y: 8 }],
    foods: [{ x: 15, y: 15, type: 'apple' }],
    walls: [],
    bullets: [],
    bots: [],
    direction: { x: 1, y: 0 },
    direction2: { x: 1, y: 0 },
    score: 0,
    score2: 0,
    winner: null,
    teleportCooldown: 0,
    teleportCooldown2: 0,
    bulletCount: 0,
    bulletCount2: 0
  })

  const isGameActive = computed(() => 
    gameState.value === 'playing' || gameState.value === 'paused'
  )

  const currentScore = computed(() => 
    gameMode.value === 'single' 
      ? gameProgress.value.score 
      : Math.max(gameProgress.value.score, gameProgress.value.score2)
  )

  const resetGame = () => {
    gameProgress.value = {
      snake: [{ x: 10, y: 10 }],
      snake2: [{ x: 8, y: 8 }],
      foods: [{ x: 15, y: 15, type: 'apple' }],
      walls: [],
      bullets: [],
      bots: [],
      direction: { x: 1, y: 0 },
      direction2: { x: 1, y: 0 },
      score: 0,
      score2: 0,
      winner: null,
      teleportCooldown: 0,
      teleportCooldown2: 0,
      bulletCount: 0,
      bulletCount2: 0
    }
  }

  return {
    gameState,
    gameMode,
    gameProgress,
    isGameActive,
    currentScore,
    resetGame
  }
}
