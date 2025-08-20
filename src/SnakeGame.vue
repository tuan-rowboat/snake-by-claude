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
      :direction="gameProgress.direction"
      :direction2="gameProgress.direction2"
      :score="gameProgress.score"
      :score2="gameProgress.score2"
      :settings="settings"
      :teleport-cooldown="gameProgress.teleportCooldown"
      :teleport-cooldown2="gameProgress.teleportCooldown2"
      :bullet-count="gameProgress.bulletCount"
      :bullet-count2="gameProgress.bulletCount2"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue'
import type { GameState, GameMode, GameSettings, GameProgress, Position, Direction, Food } from './types/game'
import { SPEEDS, WALL_PATTERNS, FOOD_TYPES, TELEPORT_COOLDOWN } from './utils/constants'
import { generateRandomWalls, generateMovingWalls, moveWalls, generateFood, checkCollisions, updateSnakeWithFood, moveSnake, isValidDirection, executeRandomTeleport, executeDirectionalTeleport, createBullet, moveBullets, checkBulletWallCollisions, checkBulletSnakeCollisions } from './utils/gameLogic'
import { loadHighScores, updateHighScores } from './utils/storage'
import GameMenu from './components/GameMenu.vue'
import GameCanvas from './components/GameCanvas.vue'
import GameOver from './components/GameOver.vue'

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
  gridSize: 20
})

const gameProgress: Ref<GameProgress> = ref({
  snake: [{ x: 10, y: 10 }],
  snake2: [{ x: 8, y: 8 }],
  foods: [{ x: 15, y: 15, type: 'apple' }],
  walls: [],
  bullets: [],
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

const highScores: Ref<number[]> = ref([])
const gameCanvasRef: Ref<typeof GameCanvas | null> = ref(null)

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
  gameMode.value = mode
}

const updateSettings = (key: keyof GameSettings, value: any): void => {
  (settings.value as any)[key] = value
}

const startGame = (): void => {
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
  
  gameState.value = 'playing'
  
  // Setup moving walls timer if needed
  if (settings.value.wallPattern === 'moving') {
    setupMovingWallsTimer()
  }
}

const returnToMenu = (): void => {
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

  // Move bullets
  gameProgress.value.bullets = moveBullets(gameProgress.value.bullets, settings.value.gridSize)
  
  // Check bullet-wall collisions
  const { remainingBullets, destroyedWalls } = checkBulletWallCollisions(gameProgress.value.bullets, gameProgress.value.walls)
  gameProgress.value.bullets = remainingBullets
  
  // Remove destroyed walls
  if (destroyedWalls.length > 0) {
    gameProgress.value.walls = gameProgress.value.walls.filter(wall => 
      !destroyedWalls.some(destroyed => destroyed.x === wall.x && destroyed.y === wall.y)
    )
  }
  
  // Check bullet-snake collisions
  if (gameMode.value === 'single') {
    const { remainingBullets: bulletsAfterSnakeCheck, snakeHit } = checkBulletSnakeCollisions(
      gameProgress.value.bullets, 
      gameProgress.value.snake
    )
    gameProgress.value.bullets = bulletsAfterSnakeCheck
    
    if (snakeHit) {
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
    
    // Check collisions
    if (checkCollisions(head, gameProgress.value.snake, gameProgress.value.walls, [], settings.value.gridSize)) {
      gameState.value = 'gameOver'
      return
    }
    
    // Check food collision
    const eatenFoodIndex = gameProgress.value.foods.findIndex(food => food.x === head.x && food.y === head.y)
    if (eatenFoodIndex !== -1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex]
      const { newSnake: updatedSnake, scoreChange, bulletCount } = updateSnakeWithFood(newSnake, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      
      gameProgress.value.snake = updatedSnake
      gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount += bulletCount
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
      gameState.value = 'gameOver'
      return
    }
    
    // Handle food collisions for both players
    const eatenFoodIndex1 = gameProgress.value.foods.findIndex(food => food.x === head1.x && food.y === head1.y)
    const eatenFoodIndex2 = gameProgress.value.foods.findIndex(food => food.x === head2.x && food.y === head2.y)
    
    let foodsToRemove: number[] = []
    
    if (eatenFoodIndex1 !== -1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex1]
      const { newSnake: updatedSnake, scoreChange, bulletCount } = updateSnakeWithFood(newSnake1, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      gameProgress.value.snake = updatedSnake
      gameProgress.value.score = Math.max(0, gameProgress.value.score + scoreChange)
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount += bulletCount
      }
      
      foodsToRemove.push(eatenFoodIndex1)
    } else {
      newSnake1.pop()
      gameProgress.value.snake = newSnake1
    }
    
    if (eatenFoodIndex2 !== -1 && eatenFoodIndex2 !== eatenFoodIndex1) {
      const eatenFood = gameProgress.value.foods[eatenFoodIndex2]
      const { newSnake: updatedSnake, scoreChange, bulletCount } = updateSnakeWithFood(newSnake2, eatenFood.type, FOOD_TYPES[eatenFood.type].points)
      gameProgress.value.snake2 = updatedSnake
      gameProgress.value.score2 = Math.max(0, gameProgress.value.score2 + scoreChange)
      
      // Add bullets if bullet food was eaten
      if (bulletCount > 0) {
        gameProgress.value.bulletCount2 += bulletCount
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
    } else if (gameState.value === 'paused') {
      gameState.value = 'playing'
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
          e.preventDefault()
        }
      }
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
watch(gameState, (newState: GameState) => {
  if (newState === 'playing') {
    gameLoopRef = setInterval(gameLoop, SPEEDS[settings.value.speed])
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
