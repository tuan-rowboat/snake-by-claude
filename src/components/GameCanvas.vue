<template>
  <div class="flex gap-6 items-start justify-center">
    <!-- Main Game Area -->
    <div class="flex flex-col items-center">
      <!-- Score Display -->
      <div v-if="gameMode === 'single'" class="mb-4 flex gap-8 items-center">
        <div class="text-xl font-bold">Score: <span class="text-green-400 text-2xl">{{ score }}</span></div>
        <div v-if="bulletCount && bulletCount > 0" class="text-lg font-bold text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount }} (Press S to shoot)</div>
      </div>
      
      <div v-if="gameMode === 'multiplayer'" class="mb-4 flex gap-8 items-center">
        <div class="text-lg font-bold">
          Player 1: <span class="text-green-400 text-xl">{{ score }}</span>
          <div v-if="bulletCount && bulletCount > 0" class="text-sm text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount }}</div>
        </div>
        <div class="text-lg font-bold">
          Player 2: <span class="text-blue-400 text-xl">{{ score2 }}</span>
          <div v-if="bulletCount2 && bulletCount2 > 0" class="text-sm text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount2 }}</div>
        </div>
      </div>

      <!-- Game Canvas -->
      <div class="relative rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref="canvasRef"
          :width="gameSize.width"
          :height="gameSize.height"
          class="border-2 border-gray-700"
        />
      </div>
    </div>

    <!-- Right Panel -->
    <div class="flex flex-col gap-4 text-sm w-64">
      <!-- Pause Controls -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <div class="text-center mb-3">
          <div class="text-yellow-400 font-medium animate-pulse">Press SPACE to {{ gameState === 'playing' ? 'Pause' : 'Resume' }}</div>
        </div>
        
        <!-- Movement Controls -->
        <div class="text-center mb-3">
          <div v-if="gameMode === 'single'" class="text-gray-300">🎮 Use Arrow Keys or WASD to move</div>
          <div v-if="gameMode === 'multiplayer'" class="text-gray-300">
            🎮 Player 1: Arrow Keys<br>
            🎮 Player 2: WASD
          </div>
        </div>
      </div>
      
      <!-- Teleport Controls -->
      <div v-if="settings.teleportEnabled" class="bg-purple-900/30 p-4 rounded-lg">
        <div class="text-purple-300 font-medium mb-3 text-center">🌀 Teleport Controls</div>
        <div v-if="gameMode === 'single'" class="text-xs text-center">
          <div :class="{ 'text-gray-500': teleportCooldown && teleportCooldown > 0 }" class="mb-2">
            T: Random Teleport<br>
            R: Direction Teleport
          </div>
          <div v-if="teleportCooldown && teleportCooldown > 0" class="text-yellow-400">
            Cooldown: {{ Math.ceil(teleportCooldown / 1000) }}s
          </div>
        </div>
        <div v-if="gameMode === 'multiplayer'" class="text-xs">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div :class="{ 'text-gray-500': teleportCooldown && teleportCooldown > 0 }">
              <div class="font-medium text-green-400">Player 1</div>
              <div>T: Random</div>
              <div>R: Direction</div>
              <div v-if="teleportCooldown && teleportCooldown > 0" class="text-yellow-400 mt-1">
                {{ Math.ceil(teleportCooldown / 1000) }}s
              </div>
            </div>
            <div :class="{ 'text-gray-500': teleportCooldown2 && teleportCooldown2 > 0 }">
              <div class="font-medium text-blue-400">Player 2</div>
              <div>Q: Random</div>
              <div>X: Direction</div>
              <div v-if="teleportCooldown2 && teleportCooldown2 > 0" class="text-yellow-400 mt-1">
                {{ Math.ceil(teleportCooldown2 / 1000) }}s
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Food Legend -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <div class="text-center mb-3">
          <div class="text-blue-400 font-medium">🍎 Food Guide</div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div v-for="([type, props]) in Object.entries(FOOD_TYPES)" :key="type" class="flex items-center gap-1">
            <span>{{ props.emoji }}</span>
            <span>{{ props.points }}pts</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Position, Food, Bullet, GameState, GameMode, Direction, GameSettings } from '../types/game'
import type { Bot } from '../types/bot'
import { FOOD_TYPES, getGameSize } from '../utils/constants'
import { drawGrid, drawWalls, drawPauseOverlay, drawSnakeWithTrail, drawAnimatedFood, drawBulletWithTrail, drawBot } from '../utils/drawing'
import { ParticleSystem } from '../utils/particles'
import { ScreenShake } from '../utils/screenShake'

interface Props {
  gameState: GameState
  gameMode: GameMode
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
  settings: GameSettings
  teleportCooldown?: number
  teleportCooldown2?: number
  bulletCount?: number
  bulletCount2?: number
}

const props = defineProps<Props>()

const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)

// Visual effects instances
const particleSystem = new ParticleSystem()
const screenShake = new ScreenShake()
let animationFrame: number | null = null
let lastTime = 0
let currentTime = 0

// Computed game size based on grid size
const gameSize = computed(() => getGameSize(props.settings.gridSize))

// Track previous state for effect triggers
let previousFoods: Food[] = []
let previousBullets: Bullet[] = []

const animate = (timestamp: number): void => {
  const deltaTime = timestamp - lastTime
  lastTime = timestamp
  currentTime = timestamp
  
  // Update visual effects
  particleSystem.update(deltaTime)
  screenShake.update(deltaTime)
  
  draw()
  
  if (props.gameState === 'playing') {
    animationFrame = requestAnimationFrame(animate)
  }
}

const draw = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.save()
  
  // Apply screen shake
  screenShake.apply(ctx)
  
  // Clear canvas
  ctx.fillStyle = props.settings.bgColor
  ctx.fillRect(0, 0, gameSize.value.width, gameSize.value.height)
  
  // Draw grid
  drawGrid(ctx, props.settings.gridSize)
  
  // Draw walls
  drawWalls(ctx, props.walls)
  
  // Draw foods with animations
  props.foods.forEach(food => {
    drawAnimatedFood(ctx, food, currentTime)
  })
  
  // Draw snake 1 with trail effects
  drawSnakeWithTrail(ctx, props.snake, props.direction, props.settings.headShape, props.settings.headColor)
  
  // Create trail particles for snake movement
  if (props.snake.length > 1) {
    particleSystem.createTrailParticles(props.snake[1], props.settings.headColor)
  }
  
  // Draw snake 2 (only in multiplayer mode) with trail effects
  if (props.gameMode === 'multiplayer') {
    drawSnakeWithTrail(ctx, props.snake2, props.direction2, props.settings.headShape, props.settings.headColor2)
    
    // Create trail particles for snake 2 movement
    if (props.snake2.length > 1) {
      particleSystem.createTrailParticles(props.snake2[1], props.settings.headColor2)
    }
  }
  
  // Draw bullets with enhanced effects
  props.bullets.forEach(bullet => {
    drawBulletWithTrail(ctx, bullet)
  })
  
  // Draw bots with danger effects
  props.bots.forEach(bot => {
    drawBot(ctx, bot)
  })
  
  // Draw particles
  particleSystem.draw(ctx)
  
  // Draw pause overlay
  if (props.gameState === 'paused') {
    drawPauseOverlay(ctx, props.settings.gridSize)
  }
  
  // Reset screen shake
  screenShake.reset(ctx)
  
  ctx.restore()
}

// Detect effects from game state changes
const detectEffects = (): void => {
  // Detect food collection (foods disappeared)
  const currentFoodIds = props.foods.map(f => `${f.x},${f.y},${f.type}`)
  const previousFoodIds = previousFoods.map(f => `${f.x},${f.y},${f.type}`)
  
  previousFoodIds.forEach((foodId, index) => {
    if (!currentFoodIds.includes(foodId)) {
      const food = previousFoods[index]
      // Food was eaten - create particles and screen shake
      particleSystem.createFoodParticles(food, food.type)
      screenShake.start(3, 200) // Light shake for food collection
    }
  })
  
  // Detect new foods spawning
  currentFoodIds.forEach((foodId, index) => {
    if (!previousFoodIds.includes(foodId)) {
      const food = props.foods[index]
      // Food spawned - create spawn effect and set spawn time
      if (!food.spawnTime) {
        food.spawnTime = currentTime
      }
      particleSystem.createFoodSpawnEffect(food, food.type)
    }
  })
  
  // Detect bullet impacts (bullets disappeared)
  const currentBulletIds = props.bullets.map(b => `${b.x},${b.y}`)
  const previousBulletIds = previousBullets.map(b => `${b.x},${b.y}`)
  
  previousBulletIds.forEach((bulletId, index) => {
    if (!currentBulletIds.includes(bulletId)) {
      const bullet = previousBullets[index]
      // Bullet hit something - create impact effect and screen shake
      particleSystem.createBulletImpact(bullet)
      screenShake.start(5, 300) // Stronger shake for bullet impact
    }
  })
  
  // Update previous state
  previousFoods = [...props.foods]
  previousBullets = [...props.bullets]
}

// Watch for game state changes and start animation
watch(() => props.gameState, (newState, oldState) => {
  if (newState === 'playing' && oldState !== 'playing') {
    lastTime = performance.now()
    animationFrame = requestAnimationFrame(animate)
  } else if (newState !== 'playing' && animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
})

// Watch for prop changes to detect effects and redraw
watch(() => [props.snake, props.snake2, props.foods, props.walls, props.bullets], () => {
  detectEffects()
  if (props.gameState !== 'playing') {
    draw() // Only redraw manually when not animating
  }
}, { deep: true })

onMounted(() => {
  previousFoods = [...props.foods]
  previousBullets = [...props.bullets]
  
  if (props.gameState === 'playing') {
    lastTime = performance.now()
    animationFrame = requestAnimationFrame(animate)
  } else {
    draw()
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

defineExpose({ draw })
</script>
