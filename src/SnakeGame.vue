<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
    <h1 class="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
      🐍 Snake Game Deluxe
    </h1>
    
    <!-- Menu Screen -->
    <GameMenu
      v-if="gameState === 'menu'"
      :game-mode="gameMode"
      :settings="settings"
      :high-scores="highScores"
      :todays-challenge="progressionSystem.getTodaysChallenge()"
      :this-weeks-challenge="progressionSystem.getThisWeeksChallenge()"
      :active-seasonal-events="progressionSystem.getActiveSeasonalEvents()"
      @update-game-mode="updateGameMode"
      @update-settings="updateSettings"
      @start-game="startGame"
    />
    
    <!-- Game Screen -->
    <GameCanvas
      v-if="gameState === 'playing' || gameState === 'paused'"
      ref="gameCanvasRef"
      :game-state="gameState"
      :game-mode="gameMode"
      :snake="gameProgress.snake"
      :snake2="gameProgress.snake2"
      :foods="gameProgress.foods"
      :walls="gameProgress.walls"
      :bullets="gameProgress.bullets"
      :bots="gameProgress.bots"
      :direction="gameProgress.direction"
      :direction2="gameProgress.direction2"
      :score="gameProgress.score"
      :score2="gameProgress.score2"
      :settings="settings"
      :teleport-cooldown="gameProgress.teleportCooldown"
      :teleport-cooldown2="gameProgress.teleportCooldown2"
      :bullet-count="gameProgress.bulletCount"
      :bullet-count2="gameProgress.bulletCount2"
      :magnet-count="gameProgress.magnetCount"
      :magnet-count2="gameProgress.magnetCount2"
    />
    
    <!-- Game Over Screen -->
    <GameOver
      v-if="gameState === 'gameOver'"
      :game-mode="gameMode"
      :score="gameProgress.score"
      :score2="gameProgress.score2"
      :winner="gameProgress.winner"
      :high-scores="highScores"
      :is-new-high-score="isNewHighScore"
      @restart-game="startGame"
      @return-to-menu="returnToMenu"
    />
    
    <!-- Progression Panel Modal -->
    <div 
      v-if="showProgressPanel" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      @click.self="showProgressPanel = false"
    >
      <ProgressionPanel
        :player-level="progressionSystem.getPlayerLevel()"
        :achievements="progressionSystem.getAchievements()"
        :stats="progressionSystem.getPlayerStats()"
        :todays-challenge="progressionSystem.getTodaysChallenge()"
        :this-weeks-challenge="progressionSystem.getThisWeeksChallenge()"
        :unlocked-skins="progressionData.unlockedSkins"
        :unlocked-trails="progressionData.unlockedTrails"
        :unlocked-colors="progressionData.unlockedColors"
        :unlocked-head-shapes="progressionData.unlockedHeadShapes"
        :selected-skin="progressionData.selectedSkin"
        :selected-trail="progressionData.selectedTrail"
        @close="showProgressPanel = false"
        @select-skin="selectSkin"
        @select-trail="selectTrail"
      />
    </div>
    
    <!-- Level Up Notification -->
    <LevelUpNotification
      v-if="showLevelUpNotification"
      :show="showLevelUpNotification"
      :new-level="levelUpData.newLevel"
      :experience-gained="levelUpData.experienceGained"
      :unlocked-rewards="levelUpData.unlockedRewards"
      @close="showLevelUpNotification = false"
    />
    
    <!-- Achievement Notifications -->
    <AchievementNotification
      v-for="(achievement, index) in achievementNotifications"
      :key="`achievement-${achievement.id}-${index}`"
      :show="true"
      :achievement="achievement"
      @close="removeAchievementNotification(index)"
      :style="{ top: `${4 + index * 6}rem` }"
    />
    
    <!-- Progression Button -->
    <button
      v-if="gameState === 'menu'"
      @click="showProgressPanel = true"
      class="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105 shadow-lg"
    >
      📊 Progress
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue'
import type { GameState, GameMode, GameSettings, GameProgress, Position, Direction, Food } from './types/game'
import type { Achievement, UnlockableReward } from './types/progression'
import { SPEEDS, WALL_PATTERNS, FOOD_TYPES, TELEPORT_COOLDOWN } from './utils/constants'
import { generateRandomWalls, generateMovingWalls, moveWalls, generateFood, checkCollisions, updateSnakeWithFood, moveSnake, isValidDirection, executeRandomTeleport, executeDirectionalTeleport, createBullet, moveBullets, checkBulletWallCollisions, checkBulletSnakeCollisions, collectNearbyFoods, checkBulletFoodCollisions } from './utils/gameLogic'
import { loadHighScores, updateHighScores } from './utils/storage'
import { ProgressionSystem } from './utils/progressionSystem'
import { SoundManager } from './utils/soundManager'
import { generateRandomBotCount, initializeBots, updateAllBots, checkBotCollisions } from './utils/botLogic'
import GameMenu from './components/GameMenu.vue'
import GameCanvas from './components/GameCanvas.vue'
import GameOver from './components/GameOver.vue'
import ProgressionPanel from './components/ProgressionPanel.vue'
import LevelUpNotification from './components/LevelUpNotification.vue'
import AchievementNotification from './components/AchievementNotification.vue'

// Reactive state
const gameState: Ref<GameState> = ref('menu')
const gameMode: Ref<GameMode> = ref('single')

const settings: Ref<GameSettings> = ref({
  headShape: 'square',
  headColor: '#00ff00',
  headColor2: '#0080ff',
  bgColor: '#1a1a2e',
  speed: 'normal',
  wallPattern: 'simple',
  maxFoods: 3,
  teleportEnabled: false,
  gridSize: 20,
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
  botsEnabled: false,
  botCount: 3,
  botDifficulty: 'medium'
})

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
  bulletCount2: 0,
  magnetCount: 0,
  magnetCount2: 0
})

const highScores: Ref<number[]> = ref([])
const gameCanvasRef: Ref<typeof GameCanvas | null> = ref(null)

// Progression System
const progressionSystem = new ProgressionSystem()
const progressionData = ref(progressionSystem.getData())

// Sound System
const soundManager = new SoundManager()
const showProgressPanel = ref(false)
const showLevelUpNotification = ref(false)
const achievementNotifications: Ref<Achievement[]> = ref([])
const levelUpData = ref({
  newLevel: 1,
  experienceGained: 0,
  unlockedRewards: [] as UnlockableReward[]
})

// Game statistics tracking
let gameStartTime = 0
let foodsEatenThisGame = 0
let wallsBrokenThisGame = 0
let bulletsFiredThisGame = 0
let teleportsUsedThisGame = 0

// Game loop variables
let gameLoopRef: number | null = null
let animationId: number | null = null
let wallMoveTimer: number | null = null

// Computed properties
const isNewHighScore = computed(() => {
  return gameMode.value === 'single' && 
         highScores.value.length > 0 && 
         highScores.value[0] === gameProgress.value.score
})

// Methods
const updateGameMode = (mode: GameMode): void => {
  soundManager.playSound('button_click')
  gameMode.value = mode
}

const updateSettings = (key: keyof GameSettings, value: any): void => {
  soundManager.playSound('button_click')
  ;(settings.value as any)[key] = value
  
  // Update sound manager settings when audio settings change
  if (key === 'soundEnabled' || key === 'musicEnabled' || key === 'soundVolume' || key === 'musicVolume') {
    soundManager.updateSettings({
      soundEnabled: settings.value.soundEnabled,
      musicEnabled: settings.value.musicEnabled,
      soundVolume: settings.value.soundVolume,
      musicVolume: settings.value.musicVolume
    })
  }
}

// Progression System Methods
const selectSkin = (skinId: string): void => {
  progressionSystem.setSelected('skin', skinId)
  progressionData.value = progressionSystem.getData()
}

const selectTrail = (trailId: string): void => {
  progressionSystem.setSelected('trail', trailId)
  progressionData.value = progressionSystem.getData()
}

const showAchievementNotification = (achievement: Achievement): void => {
  achievementNotifications.value.push(achievement)
  soundManager.playSound('achievement_unlock')
}

const removeAchievementNotification = (index: number): void => {
  achievementNotifications.value.splice(index, 1)
}

const handleLevelUp = (newLevel: number, experienceGained: number): void => {
  levelUpData.value = {
    newLevel,
    experienceGained,
    unlockedRewards: [] // Will be populated by progression system
  }
  showLevelUpNotification.value = true
  soundManager.playSound('level_up')
}

const handleGameEnd = (): void => {
  const gameTime = Date.now() - gameStartTime
  const finalScore = gameProgress.value.score
  const snakeLength = gameProgress.value.snake.length
  
  // Record game statistics in progression system
  progressionSystem.recordGameEnd(
    finalScore,
    gameTime,
    foodsEatenThisGame,
    wallsBrokenThisGame,
    bulletsFiredThisGame,
    teleportsUsedThisGame,
    snakeLength,
    gameMode.value
  )
  
  // Check for achievements
  const newAchievements = [
    ...progressionSystem.updateAchievementProgress('score', finalScore),
    ...progressionSystem.updateAchievementProgress('games_played', 1),
    ...progressionSystem.updateAchievementProgress('foods_eaten', foodsEatenThisGame),
    ...progressionSystem.updateAchievementProgress('walls_broken', wallsBrokenThisGame),
    ...progressionSystem.updateAchievementProgress('survival_time', gameTime),
    ...progressionSystem.updateAchievementProgress('bullet_master', bulletsFiredThisGame),
    ...progressionSystem.updateAchievementProgress('teleport_expert', teleportsUsedThisGame)
  ]
  
  // Show achievement notifications
  newAchievements.forEach(achievement => {
    showAchievementNotification(achievement)
  })
  
  // Check for level up
  const newLevelUpResult = progressionSystem.addExperience(0)
  if (newLevelUpResult.leveledUp && newLevelUpResult.newLevel) {
    handleLevelUp(newLevelUpResult.newLevel, 0)
  }
  
  // Update progression data
  progressionData.value = progressionSystem.getData()
}

const startGame = (): void => {
  // Initialize audio on first user interaction
  soundManager.initializeAudio()
  soundManager.playSound('button_click')
  
  // Reset game statistics tracking
  gameStartTime = Date.now()
  foodsEatenThisGame = 0
  wallsBrokenThisGame = 0
  bulletsFiredThisGame = 0
  teleportsUsedThisGame = 0
  
  // Initialize player 1
  gameProgress.value.snake = [{ x: 10, y: 10 }]
  gameProgress.value.direction = { x: 1, y: 0 }
  gameProgress.value.score = 0
  
  // Initialize player 2 (only in multiplayer mode)
  if (gameMode.value === 'multiplayer') {
    gameProgress.value.snake2 = [{ x: 8, y: 8 }]
    gameProgress.value.direction2 = { x: 1, y: 0 }
    gameProgress.value.score2 = 0
  } else {
    // Reset player 2 data in single player mode
    gameProgress.value.snake2 = []
    gameProgress.value.score2 = 0
  }
  
  // Reset winner
  gameProgress.value.winner = null
  
  // Reset teleport cooldowns
  gameProgress.value.teleportCooldown = 0
  gameProgress.value.teleportCooldown2 = 0
  
  // Reset bullet counts and bullets
  gameProgress.value.bulletCount = 0
  gameProgress.value.bulletCount2 = 0
  gameProgress.value.bullets = []
  
  // Reset magnet counts
  gameProgress.value.magnetCount = 0
  gameProgress.value.magnetCount2 = 0
  
  // Set walls based on pattern
  let newWalls: Position[] = []
  if (settings.value.wallPattern === 'random') {
    newWalls = generateRandomWalls(15, settings.value.gridSize)
  } else if (settings.value.wallPattern === 'moving') {
    newWalls = generateMovingWalls(8, settings.value.gridSize)
  } else if (settings.value.wallPattern !== 'none') {
    newWalls = WALL_PATTERNS[settings.value.wallPattern]
  }
  gameProgress.value.walls = newWalls
  
  // Generate initial foods
  const initialFoods: Food[] = []
  for (let i = 0; i < settings.value.maxFoods; i++) {
    initialFoods.push(generateFood(
      gameProgress.value.snake,
      initialFoods,
      gameProgress.value.walls,
      gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : [],
      settings.value.gridSize
    ))
  }
  gameProgress.value.foods = initialFoods
  
  // Initialize bots if enabled
  if (settings.value.botsEnabled) {
    const existingPositions = [
      ...gameProgress.value.snake,
      ...(gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : []),
      ...gameProgress.value.walls,
      ...gameProgress.value.foods
    ]
    
    // Use random count (1-5) or user-defined count
    const botCount = settings.value.botCount === 0 ? generateRandomBotCount() : settings.value.botCount
    gameProgress.value.bots = initializeBots(botCount, settings.value.gridSize, existingPositions)
  } else {
    gameProgress.value.bots = []
  }
  
  gameState.value = 'playing'
  
  // Setup moving walls timer if needed
  if (settings.value.wallPattern === 'moving') {
    setupMovingWallsTimer()
  }
}

const returnToMenu = (): void => {
  soundManager.playSound('button_click')
  gameState.value = 'menu'
}

const setupMovingWallsTimer = (): void => {
  // Clear any existing timer
  if (wallMoveTimer) {
    clearInterval(wallMoveTimer)
  }
  
  // Start new timer for moving walls every 10 seconds
  wallMoveTimer = setInterval(() => {
    if (gameState.value === 'playing' && settings.value.wallPattern === 'moving') {
      gameProgress.value.walls = moveWalls(
        gameProgress.value.walls,
        gameProgress.value.snake,
        gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : []
      )
    }
  }, 10000) // 10 seconds
}

const gameLoop = (): void => {
  if (gameState.value !== 'playing') return

  // Update bots if enabled
  if (settings.value.botsEnabled && gameProgress.value.bots.length > 0) {
    const playerPositions = [
      gameProgress.value.snake[0], // Snake head
      ...(gameMode.value === 'multiplayer' ? [gameProgress.value.snake2[0]] : [])
    ]
    const obstacles = [
      ...gameProgress.value.walls,
      ...gameProgress.value.snake.slice(1), // Snake body (excluding head)
      ...(gameMode.value === 'multiplayer' ? gameProgress.value.snake2.slice(1) : [])
    ]
    
    gameProgress.value.bots = updateAllBots(
      gameProgress.value.bots,
      Date.now(),
      settings.value.gridSize,
      playerPositions,
      obstacles
    )
  }

  // Move bullets
  gameProgress.value.bullets = moveBullets(gameProgress.value.bullets, settings.value.gridSize)
  
  // Check bullet-wall collisions
  const { remainingBullets, destroyedWalls } = checkBulletWallCollisions(gameProgress.value.bullets, gameProgress.value.walls)
  gameProgress.value.bullets = remainingBullets
  
  // Remove destroyed walls
  if (destroyedWalls.length > 0) {
    wallsBrokenThisGame += destroyedWalls.length // Track walls broken
    soundManager.playSound('wall_break')
    gameProgress.value.walls = gameProgress.value.walls.filter(wall => 
      !destroyedWalls.some(destroyed => destroyed.x === wall.x && destroyed.y === wall.y)
    )
  }
  
  // Check bullet-food collisions
  const { remainingBullets: bulletsAfterFoodCheck, remainingFoods, eatenFoods } = checkBulletFoodCollisions(gameProgress.value.bullets, gameProgress.value.foods)
  gameProgress.value.bullets = bulletsAfterFoodCheck
  gameProgress.value.foods = remainingFoods
  
  // Process eaten foods by bullets
  if (eatenFoods.length > 0) {
    let totalScoreP1 = 0, totalScoreP2 = 0
    let totalBulletCountP1 = 0, totalBulletCountP2 = 0
    let totalMagnetCountP1 = 0, totalMagnetCountP2 = 0
    
    // Process each eaten food and track which bullet hit it
    for (const { food, bullet } of eatenFoods) {
      const foodProps = FOOD_TYPES[food.type]
      const playerId = bullet.playerId
      
      // Attribute points and effects to the correct player
      if (playerId === 1) {
        totalScoreP1 += foodProps.points
        if (foodProps.effect === 'bullet') {
          totalBulletCountP1 += 5
        } else if (foodProps.effect === 'magnet') {
          totalMagnetCountP1 += Math.floor(Math.random() * 5) + 1 // 1-5 magnets
        }
      } else {
        totalScoreP2 += foodProps.points
        if (foodProps.effect === 'bullet') {
          totalBulletCountP2 += 5
        } else if (foodProps.effect === 'magnet') {
          totalMagnetCountP2 += Math.floor(Math.random() * 5) + 1 // 1-5 magnets
        }
      }
      
      // Play appropriate food sound
      if (food.type === 'golden') {
        soundManager.playSound('eat_golden_food')
      } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(food.type)) {
        soundManager.playSound('eat_special_food')
      } else {
        soundManager.playSound('eat_food')
      }
    }
    
    // Apply effects to correct players
    gameProgress.value.score += totalScoreP1
    gameProgress.value.bulletCount += totalBulletCountP1
    gameProgress.value.magnetCount += totalMagnetCountP1
    
    if (gameMode.value === 'multiplayer') {
      gameProgress.value.score2 += totalScoreP2
      gameProgress.value.bulletCount2 += totalBulletCountP2
      gameProgress.value.magnetCount2 += totalMagnetCountP2
    }
    
    // Generate new foods to replace eaten ones
    while (gameProgress.value.foods.length < settings.value.maxFoods) {
      gameProgress.value.foods.push(generateFood(
        gameProgress.value.snake,
        gameProgress.value.foods,
        gameProgress.value.walls,
        gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : [],
        settings.value.gridSize
      ))
    }
  }
  
  // Check bullet-snake collisions
  if (gameMode.value === 'single') {
    const { remainingBullets: bulletsAfterSnakeCheck, snakeHit } = checkBulletSnakeCollisions(
      gameProgress.value.bullets, 
      gameProgress.value.snake
    )
    gameProgress.value.bullets = bulletsAfterSnakeCheck
    
    if (snakeHit) {
      soundManager.playSound('game_over')
      handleGameEnd()
      gameState.value = 'gameOver'
      return
    }
  } else {
    // Multiplayer - check both snakes
    const { remainingBullets: bulletsAfterSnakeCheck, snakeHit, otherSnakeHit } = checkBulletSnakeCollisions(
      gameProgress.value.bullets, 
      gameProgress.value.snake,
      gameProgress.value.snake2
    )
    gameProgress.value.bullets = bulletsAfterSnakeCheck
    
    if (snakeHit || otherSnakeHit) {
      if (snakeHit && otherSnakeHit) {
        gameProgress.value.winner = 'tie'
      } else if (snakeHit) {
        gameProgress.value.winner = 'player2'
      } else {
        gameProgress.value.winner = 'player1'
      }
      soundManager.playSound('game_over')
      handleGameEnd()
      gameState.value = 'gameOver'
      return
    }
  }

  // Update teleport cooldowns
  if (gameProgress.value.teleportCooldown > 0) {
    gameProgress.value.teleportCooldown -= SPEEDS[settings.value.speed]
    if (gameProgress.value.teleportCooldown < 0) gameProgress.value.teleportCooldown = 0
  }
  if (gameProgress.value.teleportCooldown2 > 0) {
    gameProgress.value.teleportCooldown2 -= SPEEDS[settings.value.speed]
    if (gameProgress.value.teleportCooldown2 < 0) gameProgress.value.teleportCooldown2 = 0
  }

  if (gameMode.value === 'single') {
    // Single player game loop
    const newSnake = moveSnake(gameProgress.value.snake, gameProgress.value.direction)
    const head = newSnake[0]
    
    // Check collisions with walls and self
    if (checkCollisions(head, gameProgress.value.snake, gameProgress.value.walls, [], settings.value.gridSize)) {
      soundManager.playSound('game_over')
      handleGameEnd()
      gameState.value = 'gameOver'
      return
    }
    
    // Check collisions with bots
    if (settings.value.botsEnabled && checkBotCollisions(head, gameProgress.value.bots)) {
      soundManager.playSound('game_over')
      handleGameEnd()
      gameState.value = 'gameOver'
      return
    }
    
    // Check food collision
    const eatenFoodIndex = gameProgress.value.foods.findIndex(food => food.x === head.x && food.y === head.y)
    if (eatenFoodIndex !== -1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex]
      const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(newSnake, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      
      // Play appropriate food sound
      if (eatenFood.type === 'golden') {
        soundManager.playSound('eat_golden_food')
      } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(eatenFood.type)) {
        soundManager.playSound('eat_special_food')
      } else {
        soundManager.playSound('eat_food')
      }
      
      gameProgress.value.snake = updatedSnake
      gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
      
      // Track food eaten for progression
      foodsEatenThisGame++
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount += bulletCount
      }
      
      // Add magnets if magnet food was eaten
      if (magnetCount > 0) {
        gameProgress.value.magnetCount += magnetCount
      }
      
      // Remove eaten food and generate new one
      const newFoods = gameProgress.value.foods.filter((_, index) => index !== eatenFoodIndex)
      if (newFoods.length < settings.value.maxFoods) {
        newFoods.push(generateFood(
          gameProgress.value.snake,
          newFoods,
          gameProgress.value.walls,
          [],
          settings.value.gridSize
        ))
      }
      gameProgress.value.foods = newFoods
    } else {
      // Only pop if we didn't eat food
      newSnake.pop()
      gameProgress.value.snake = newSnake
    }
  } else {
    // Multiplayer game loop
    const newSnake1 = moveSnake(gameProgress.value.snake, gameProgress.value.direction)
    const newSnake2 = moveSnake(gameProgress.value.snake2, gameProgress.value.direction2)
    const head1 = newSnake1[0]
    const head2 = newSnake2[0]
    
    let player1Dead = false
    let player2Dead = false
    
    // Check collisions for both players
    if (checkCollisions(head1, gameProgress.value.snake, gameProgress.value.walls, gameProgress.value.snake2, settings.value.gridSize)) {
      player1Dead = true
    }
    if (checkCollisions(head2, gameProgress.value.snake2, gameProgress.value.walls, gameProgress.value.snake, settings.value.gridSize)) {
      player2Dead = true
    }
    
    // Check bot collisions for both players
    if (settings.value.botsEnabled) {
      if (checkBotCollisions(head1, gameProgress.value.bots)) {
        player1Dead = true
      }
      if (checkBotCollisions(head2, gameProgress.value.bots)) {
        player2Dead = true
      }
    }
    
    // Check head-to-head collision
    if (head1.x === head2.x && head1.y === head2.y) {
      player1Dead = true
      player2Dead = true
    }
    
    // Determine winner and end game if needed
    if (player1Dead || player2Dead) {
      if (player1Dead && player2Dead) {
        gameProgress.value.winner = 'tie'
      } else if (player1Dead) {
        gameProgress.value.winner = 'player2'
      } else {
        gameProgress.value.winner = 'player1'
      }
      handleGameEnd()
      gameState.value = 'gameOver'
      return
    }
    
    // Handle food collisions for both players
    const eatenFoodIndex1 = gameProgress.value.foods.findIndex(food => food.x === head1.x && food.y === head1.y)
    const eatenFoodIndex2 = gameProgress.value.foods.findIndex(food => food.x === head2.x && food.y === head2.y)
    
    let foodsToRemove: number[] = []
    
    if (eatenFoodIndex1 !== -1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex1]
      const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(newSnake1, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      
      // Play appropriate food sound
      if (eatenFood.type === 'golden') {
        soundManager.playSound('eat_golden_food')
      } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(eatenFood.type)) {
        soundManager.playSound('eat_special_food')
      } else {
        soundManager.playSound('eat_food')
      }
      
      gameProgress.value.snake = updatedSnake
      gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
      
      // Track food eaten for progression
      foodsEatenThisGame++
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount += bulletCount
      }
      
      // Add magnets if magnet food was eaten
      if (magnetCount > 0) {
        gameProgress.value.magnetCount += magnetCount
      }
      
      foodsToRemove.push(eatenFoodIndex1)
    } else {
      newSnake1.pop()
      gameProgress.value.snake = newSnake1
    }
    
    if (eatenFoodIndex2 !== -1 && eatenFoodIndex2 !== eatenFoodIndex1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex2]
      const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(newSnake2, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      
      // Play appropriate food sound
      if (eatenFood.type === 'golden') {
        soundManager.playSound('eat_golden_food')
      } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(eatenFood.type)) {
        soundManager.playSound('eat_special_food')
      } else {
        soundManager.playSound('eat_food')
      }
      
      gameProgress.value.snake2 = updatedSnake
      gameProgress.value.score2 = Math.max(0, gameProgress.value.score2 + scoreChange)
      
      // Track food eaten for progression
      foodsEatenThisGame++
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount2 += bulletCount
      }
      
      // Add magnets if magnet food was eaten
      if (magnetCount > 0) {
        gameProgress.value.magnetCount2 += magnetCount
      }
      
      foodsToRemove.push(eatenFoodIndex2)
    } else if (eatenFoodIndex2 === -1) {
      newSnake2.pop()
      gameProgress.value.snake2 = newSnake2
    }
    
    // Remove eaten foods and generate new ones
    if (foodsToRemove.length > 0) {
      const newFoods = gameProgress.value.foods.filter((_, index) => !foodsToRemove.includes(index))
      // Add new foods if below max
      while (newFoods.length < settings.value.maxFoods) {
        newFoods.push(generateFood(
          gameProgress.value.snake,
          newFoods,
          gameProgress.value.walls,
          gameProgress.value.snake2,
          settings.value.gridSize
        ))
      }
      gameProgress.value.foods = newFoods
    }
  }
  
  // Spawn new foods periodically
  if (gameProgress.value.foods.length < settings.value.maxFoods && Math.random() < 0.1) {
    gameProgress.value.foods.push(generateFood(
      gameProgress.value.snake,
      gameProgress.value.foods,
      gameProgress.value.walls,
      gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : [],
      settings.value.gridSize
    ))
  }
}

// Handle keyboard input
const handleKeyPress = (e: KeyboardEvent): void => {
  // Handle space key for pause/resume regardless of game state
  if (e.key === ' ') {
    if (gameState.value === 'playing') {
      gameState.value = 'paused'
      soundManager.playSound('pause')
    } else if (gameState.value === 'paused') {
      gameState.value = 'playing'
      soundManager.playSound('resume')
    }
    e.preventDefault() // Prevent page scrolling
    return
  }
  
  // Handle movement keys only when playing
  if (gameState.value === 'playing') {
    // Player 1 controls (Arrow keys)
    let newDirection: Direction = { ...gameProgress.value.direction }
    switch (e.key) {
      case 'ArrowUp':
        newDirection = { x: 0, y: -1 }
        break
      case 'ArrowDown':
        newDirection = { x: 0, y: 1 }
        break
      case 'ArrowLeft':
        newDirection = { x: -1, y: 0 }
        break
      case 'ArrowRight':
        newDirection = { x: 1, y: 0 }
        break
    }
    
    if (isValidDirection(gameProgress.value.direction, newDirection)) {
      gameProgress.value.direction = newDirection
    }
    
    // Player 2 controls (WASD) - only in multiplayer mode
    if (gameMode.value === 'multiplayer') {
      let newDirection2: Direction = { ...gameProgress.value.direction2 }
      switch (e.key) {
        case 'w':
        case 'W':
          newDirection2 = { x: 0, y: -1 }
          break
        case 's':
        case 'S':
          // Check if player 2 has bullets - if so, shoot bullet instead of moving
          if (gameProgress.value.bulletCount2 > 0) {
            const bullet = createBullet(gameProgress.value.snake2[0], gameProgress.value.direction2, 2)
            gameProgress.value.bullets.push(bullet)
            gameProgress.value.bulletCount2-- // Use up one bullet
            bulletsFiredThisGame++ // Track bullets fired
            soundManager.playSound('bullet_fire')
            e.preventDefault()
            return
          } else {
            newDirection2 = { x: 0, y: 1 }
          }
          break
        case 'a':
        case 'A':
          newDirection2 = { x: -1, y: 0 }
          break
        case 'd':
        case 'D':
          newDirection2 = { x: 1, y: 0 }
          break
      }
      
      if (isValidDirection(gameProgress.value.direction2, newDirection2)) {
        gameProgress.value.direction2 = newDirection2
      }
    } else {
      // Single player mode - also allow WASD for player 1
      switch (e.key) {
        case 'w':
        case 'W':
          newDirection = { x: 0, y: -1 }
          break
        case 's':
        case 'S':
          // Check if snake has bullets - if so, shoot bullet instead of moving
          if (gameProgress.value.bulletCount > 0) {
            const bullet = createBullet(gameProgress.value.snake[0], gameProgress.value.direction, 1)
            gameProgress.value.bullets.push(bullet)
            gameProgress.value.bulletCount-- // Use up one bullet
            bulletsFiredThisGame++ // Track bullets fired
            soundManager.playSound('bullet_fire')
            e.preventDefault()
            return
          } else {
            newDirection = { x: 0, y: 1 }
          }
          break
        case 'a':
        case 'A':
          newDirection = { x: -1, y: 0 }
          break
        case 'd':
        case 'D':
          newDirection = { x: 1, y: 0 }
          break
      }
      
      if (isValidDirection(gameProgress.value.direction, newDirection)) {
        gameProgress.value.direction = newDirection
      }
    }
    
    // Teleport controls (only when teleport is enabled)
    if (settings.value.teleportEnabled) {
      // Player 1 teleport controls
      if ((e.key === 't' || e.key === 'T') && gameProgress.value.teleportCooldown === 0) {
        // Random teleport for player 1
        const newSnake = executeRandomTeleport(
          gameProgress.value.snake,
          gameProgress.value.walls,
          gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : [],
          settings.value.gridSize
        )
        gameProgress.value.snake = newSnake
        gameProgress.value.teleportCooldown = TELEPORT_COOLDOWN
        teleportsUsedThisGame++ // Track teleports used
        soundManager.playSound('teleport')
        e.preventDefault()
      } else if ((e.key === 'r' || e.key === 'R') && gameProgress.value.teleportCooldown === 0) {
        // Directional teleport for player 1
        const teleportPosition = executeDirectionalTeleport(
          gameProgress.value.snake,
          gameProgress.value.direction,
          gameProgress.value.walls,
          gameMode.value === 'multiplayer' ? gameProgress.value.snake2 : [],
          settings.value.gridSize
        )
        gameProgress.value.snake[0] = teleportPosition
        gameProgress.value.teleportCooldown = TELEPORT_COOLDOWN
        teleportsUsedThisGame++ // Track teleports used
        soundManager.playSound('teleport')
        e.preventDefault()
      }
      
      // Player 2 teleport controls (only in multiplayer)
      if (gameMode.value === 'multiplayer') {
        if ((e.key === 'q' || e.key === 'Q') && gameProgress.value.teleportCooldown2 === 0) {
          // Random teleport for player 2
          const newSnake2 = executeRandomTeleport(
            gameProgress.value.snake2,
            gameProgress.value.walls,
            gameProgress.value.snake,
            settings.value.gridSize
          )
          gameProgress.value.snake2 = newSnake2
          gameProgress.value.teleportCooldown2 = TELEPORT_COOLDOWN
          teleportsUsedThisGame++ // Track teleports used
          soundManager.playSound('teleport')
          e.preventDefault()
        } else if ((e.key === 'x' || e.key === 'X') && gameProgress.value.teleportCooldown2 === 0) {
          // Directional teleport for player 2
          const teleportPosition = executeDirectionalTeleport(
            gameProgress.value.snake2,
            gameProgress.value.direction2,
            gameProgress.value.walls,
            gameProgress.value.snake,
            settings.value.gridSize
          )
          gameProgress.value.snake2[0] = teleportPosition
          gameProgress.value.teleportCooldown2 = TELEPORT_COOLDOWN
          teleportsUsedThisGame++ // Track teleports used
          soundManager.playSound('teleport')
          e.preventDefault()
        }
      }
    }
    
    // Magnet controls
    if (e.key === 'm' || e.key === 'M') {
      if (gameMode.value === 'multiplayer') {
        // In multiplayer, M activates magnet for player 1, N for player 2
        if (gameProgress.value.magnetCount > 0) {
          const { collectedFoods, remainingFoods } = collectNearbyFoods(
            gameProgress.value.snake[0], 
            gameProgress.value.foods, 
            5
          )
          
          if (collectedFoods.length > 0) {
            // Create lightning animation from snake to nearby foods
            gameCanvasRef.value?.createLightningToFoods(
              gameProgress.value.snake[0],
              collectedFoods.map(f => ({ x: f.x, y: f.y }))
            )
            
            // Process each collected food
            for (const food of collectedFoods) {
              const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(
                gameProgress.value.snake, 
                food.type, 
                FOOD_TYPES[food.type].points
              )
              gameProgress.value.snake = updatedSnake
              gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
              
              if (bulletCount > 0) {
                gameProgress.value.bulletCount += bulletCount
              }
              if (magnetCount > 0) {
                gameProgress.value.magnetCount += magnetCount
              }
              
              // Play appropriate food sound
              if (food.type === 'golden') {
                soundManager.playSound('eat_golden_food')
              } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(food.type)) {
                soundManager.playSound('eat_special_food')
              } else {
                soundManager.playSound('eat_food')
              }
            }
            
            gameProgress.value.foods = remainingFoods
            gameProgress.value.magnetCount-- // Use up one magnet charge
            soundManager.playSound('magnet_activate')
            
            // Generate new foods to maintain max count
            while (gameProgress.value.foods.length < settings.value.maxFoods) {
              gameProgress.value.foods.push(generateFood(
                gameProgress.value.snake,
                gameProgress.value.foods,
                gameProgress.value.walls,
                gameProgress.value.snake2,
                settings.value.gridSize
              ))
            }
          }
        }
      } else {
        // Single player mode
        if (gameProgress.value.magnetCount > 0) {
          const { collectedFoods, remainingFoods } = collectNearbyFoods(
            gameProgress.value.snake[0], 
            gameProgress.value.foods, 
            5
          )
          
          if (collectedFoods.length > 0) {
            // Create lightning animation from snake to nearby foods
            gameCanvasRef.value?.createLightningToFoods(
              gameProgress.value.snake[0],
              collectedFoods.map(f => ({ x: f.x, y: f.y }))
            )
            
            // Process each collected food
            for (const food of collectedFoods) {
              const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(
                gameProgress.value.snake, 
                food.type, 
                FOOD_TYPES[food.type].points
              )
              gameProgress.value.snake = updatedSnake
              gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
              
              if (bulletCount > 0) {
                gameProgress.value.bulletCount += bulletCount
              }
              if (magnetCount > 0) {
                gameProgress.value.magnetCount += magnetCount
              }
              
              // Play appropriate food sound
              if (food.type === 'golden') {
                soundManager.playSound('eat_golden_food')
              } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(food.type)) {
                soundManager.playSound('eat_special_food')
              } else {
                soundManager.playSound('eat_food')
              }
            }
            
            gameProgress.value.foods = remainingFoods
            gameProgress.value.magnetCount-- // Use up one magnet charge
            soundManager.playSound('magnet_activate')
            
            // Generate new foods to maintain max count
            while (gameProgress.value.foods.length < settings.value.maxFoods) {
              gameProgress.value.foods.push(generateFood(
                gameProgress.value.snake,
                gameProgress.value.foods,
                gameProgress.value.walls,
                [],
                settings.value.gridSize
              ))
            }
          }
        }
      }
      e.preventDefault()
    }
    
    // Magnet controls for player 2 in multiplayer
    if ((e.key === 'n' || e.key === 'N') && gameMode.value === 'multiplayer') {
      if (gameProgress.value.magnetCount2 > 0) {
        const { collectedFoods, remainingFoods } = collectNearbyFoods(
          gameProgress.value.snake2[0], 
          gameProgress.value.foods, 
          5
        )
        
        if (collectedFoods.length > 0) {
          // Create lightning animation from snake to nearby foods
          gameCanvasRef.value?.createLightningToFoods(
            gameProgress.value.snake2[0],
            collectedFoods.map(f => ({ x: f.x, y: f.y }))
          )
          
          // Process each collected food
          for (const food of collectedFoods) {
            const { newSnake: updatedSnake, scoreChange, bulletCount, magnetCount } = updateSnakeWithFood(
              gameProgress.value.snake2, 
              food.type, 
              FOOD_TYPES[food.type].points
            )
            gameProgress.value.snake2 = updatedSnake
            gameProgress.value.score2 = Math.max(0, gameProgress.value.score2 + scoreChange)
            
            if (bulletCount > 0) {
              gameProgress.value.bulletCount2 += bulletCount
            }
            if (magnetCount > 0) {
              gameProgress.value.magnetCount2 += magnetCount
            }
            
            // Play appropriate food sound
            if (food.type === 'golden') {
              soundManager.playSound('eat_golden_food')
            } else if (['super', 'banana', 'cherry', 'watermelon', 'mushroom'].includes(food.type)) {
              soundManager.playSound('eat_special_food')
            } else {
              soundManager.playSound('eat_food')
            }
          }
          
          gameProgress.value.foods = remainingFoods
          gameProgress.value.magnetCount2-- // Use up one magnet charge
          soundManager.playSound('magnet_activate')
          
          // Generate new foods to maintain max count
          while (gameProgress.value.foods.length < settings.value.maxFoods) {
            gameProgress.value.foods.push(generateFood(
              gameProgress.value.snake,
              gameProgress.value.foods,
              gameProgress.value.walls,
              gameProgress.value.snake2,
              settings.value.gridSize
            ))
          }
        }
      }
      e.preventDefault()
    }
  }
}

// Save high score
const saveHighScore = (): void => {
  if (gameMode.value === 'single') {
    highScores.value = updateHighScores(gameProgress.value.score, highScores.value)
  }
}

// Watch for game state changes
watch(gameState, (newState: GameState, oldState: GameState) => {
  if (newState === 'playing') {
    gameLoopRef = setInterval(gameLoop, SPEEDS[settings.value.speed])
    soundManager.playMusic('gameplay')
  } else {
    if (gameLoopRef) {
      clearInterval(gameLoopRef)
      gameLoopRef = null
    }
    // Clear moving walls timer when not playing
    if (wallMoveTimer) {
      clearInterval(wallMoveTimer)
      wallMoveTimer = null
    }
  }
  
  if (newState === 'gameOver') {
    saveHighScore()
    soundManager.playMusic('game_over')
  } else if (newState === 'menu') {
    soundManager.playMusic('menu')
  } else if (newState === 'paused') {
    soundManager.pauseMusic()
  } else if (oldState === 'paused' && newState === 'playing') {
    soundManager.resumeMusic()
  }
})

// Watch for speed changes
watch(() => settings.value.speed, (newSpeed) => {
  if (gameState.value === 'playing' && gameLoopRef) {
    clearInterval(gameLoopRef)
    gameLoopRef = setInterval(gameLoop, SPEEDS[newSpeed])
  }
})

// Setup event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  highScores.value = loadHighScores()
  
  // Initialize sound manager settings
  soundManager.updateSettings({
    soundEnabled: settings.value.soundEnabled,
    musicEnabled: settings.value.musicEnabled,
    soundVolume: settings.value.soundVolume,
    musicVolume: settings.value.musicVolume
  })
  
  // Start with menu music
  soundManager.playMusic('menu')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (gameLoopRef) {
    clearInterval(gameLoopRef)
  }
  if (wallMoveTimer) {
    clearInterval(wallMoveTimer)
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>
