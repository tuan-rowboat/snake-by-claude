<template>
  <div class="flex flex-col items-center">
    <div v-if="gameMode === 'single'" class="mb-4 flex gap-8 items-center">
      <div class="text-xl font-bold">Score: <span class="text-green-400 text-2xl">{{ score }}</span></div>
      <div v-if="bulletCount && bulletCount > 0" class="text-lg font-bold text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount }} (Press S to shoot)</div>
      <div class="text-sm opacity-75 animate-pulse">Press SPACE to {{ gameState === 'playing' ? 'Pause' : 'Resume' }}</div>
    </div>
    
    <div v-if="gameMode === 'multiplayer'" class="mb-4 flex gap-8 items-center">
      <div class="text-lg font-bold">
        Player 1: <span class="text-green-400 text-xl">{{ score }}</span>
        <div v-if="bulletCount && bulletCount > 0" class="text-sm text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount }}</div>
      </div>
      <div class="text-sm opacity-75 animate-pulse">Press SPACE to {{ gameState === 'playing' ? 'Pause' : 'Resume' }}</div>
      <div class="text-lg font-bold">
        Player 2: <span class="text-blue-400 text-xl">{{ score2 }}</span>
        <div v-if="bulletCount2 && bulletCount2 > 0" class="text-sm text-orange-400 animate-pulse">🔥 Bullets: {{ bulletCount2 }}</div>
      </div>
    </div>

    <div class="relative rounded-lg overflow-hidden shadow-2xl">
      <canvas
        ref="canvasRef"
        :width="GAME_WIDTH"
        :height="GAME_HEIGHT"
        class="border-2 border-gray-700"
      />
    </div>

    <div class="mt-4 text-sm opacity-75">
      <div v-if="gameMode === 'single'" class="text-center mb-2">🎮 Use Arrow Keys or WASD to move</div>
      <div v-if="gameMode === 'multiplayer'" class="text-center mb-2">
        🎮 Player 1: Arrow Keys | Player 2: WASD
      </div>
      
      <!-- Teleport Controls -->
      <div v-if="settings.teleportEnabled" class="text-center mb-2 bg-purple-900/30 p-2 rounded">
        <div class="text-purple-300 font-medium mb-1">🌀 Teleport Controls</div>
        <div v-if="gameMode === 'single'" class="text-xs">
          <span :class="{ 'text-gray-500': teleportCooldown && teleportCooldown > 0 }">
            T: Random Teleport | R: Direction Teleport
          </span>
          <div v-if="teleportCooldown && teleportCooldown > 0" class="text-yellow-400 mt-1">
            Cooldown: {{ Math.ceil(teleportCooldown / 1000) }}s
          </div>
        </div>
        <div v-if="gameMode === 'multiplayer'" class="text-xs">
          <div class="grid grid-cols-2 gap-4">
            <div :class="{ 'text-gray-500': teleportCooldown && teleportCooldown > 0 }">
              P1: T/R
              <div v-if="teleportCooldown && teleportCooldown > 0" class="text-yellow-400">
                {{ Math.ceil(teleportCooldown / 1000) }}s
              </div>
            </div>
            <div :class="{ 'text-gray-500': teleportCooldown2 && teleportCooldown2 > 0 }">
              P2: Q/X
              <div v-if="teleportCooldown2 && teleportCooldown2 > 0" class="text-yellow-400">
                {{ Math.ceil(teleportCooldown2 / 1000) }}s
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-4 gap-2 text-xs bg-gray-800 p-3 rounded">
        <div v-for="([type, props]) in Object.entries(FOOD_TYPES)" :key="type" class="flex items-center gap-1">
          <span>{{ props.emoji }}</span>
          <span>{{ props.points }}pts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue'
import type { Position, Food, Bullet, GameState, GameMode, Direction, GameSettings } from '../types/game'
import { GAME_WIDTH, GAME_HEIGHT, FOOD_TYPES } from '../utils/constants'
import { drawShape, drawSnakeEyes, drawGrid, drawWalls, drawPauseOverlay } from '../utils/drawing'

interface Props {
  gameState: GameState
  gameMode: GameMode
  snake: Position[]
  snake2: Position[]
  foods: Food[]
  walls: Position[]
  bullets: Bullet[]
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

const draw = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Clear canvas
  ctx.fillStyle = props.settings.bgColor
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  
  // Draw grid
  drawGrid(ctx)
  
  // Draw walls
  drawWalls(ctx, props.walls)
  
  // Draw foods
  props.foods.forEach(food => {
    const foodProps = FOOD_TYPES[food.type]
    drawShape(ctx, foodProps.shape, food.x * 25 + 2, food.y * 25 + 2, 25 - 4, foodProps.color)
    
    // Draw emoji
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(foodProps.emoji, food.x * 25 + 12, food.y * 25 + 16)
  })
  
  // Draw snake 1
  props.snake.forEach((segment, index) => {
    if (index === 0) {
      // Draw head
      drawShape(ctx, props.settings.headShape, segment.x * 25 + 1, segment.y * 25 + 1, 25 - 2, props.settings.headColor)
      
      // Draw eyes for head
      drawSnakeEyes(ctx, segment, props.direction, props.settings.headShape)
    } else {
      // Draw body with gradient effect
      const opacity = 1 - (index / props.snake.length) * 0.3
      ctx.fillStyle = props.settings.headColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
      ctx.fillRect(segment.x * 25 + 2, segment.y * 25 + 2, 25 - 4, 25 - 4)
    }
  })
  
  // Draw snake 2 (only in multiplayer mode)
  if (props.gameMode === 'multiplayer') {
    props.snake2.forEach((segment, index) => {
      if (index === 0) {
        // Draw head
        drawShape(ctx, props.settings.headShape, segment.x * 25 + 1, segment.y * 25 + 1, 25 - 2, props.settings.headColor2)
        
        // Draw eyes for head
        drawSnakeEyes(ctx, segment, props.direction2, props.settings.headShape)
      } else {
        // Draw body with gradient effect
        const opacity = 1 - (index / props.snake2.length) * 0.3
        ctx.fillStyle = props.settings.headColor2 + Math.floor(opacity * 255).toString(16).padStart(2, '0')
        ctx.fillRect(segment.x * 25 + 2, segment.y * 25 + 2, 25 - 4, 25 - 4)
      }
    })
  }
  
  // Draw bullets
  props.bullets.forEach(bullet => {
    const bulletColor = bullet.playerId === 1 ? '#ff6600' : '#ff0088'
    ctx.fillStyle = bulletColor
    ctx.fillRect(bullet.x * 25 + 8, bullet.y * 25 + 8, 9, 9)
    
    // Add glow effect
    ctx.shadowColor = bulletColor
    ctx.shadowBlur = 10
    ctx.fillRect(bullet.x * 25 + 8, bullet.y * 25 + 8, 9, 9)
    ctx.shadowBlur = 0
    
    // Draw bullet emoji
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('●', bullet.x * 25 + 12, bullet.y * 25 + 16)
  })
  
  // Draw pause overlay
  if (props.gameState === 'paused') {
    drawPauseOverlay(ctx)
  }
}

// Watch for prop changes to redraw
watch(() => [props.snake, props.snake2, props.foods, props.walls, props.bullets, props.gameState], draw, { deep: true })

onMounted(() => {
  draw()
})

defineExpose({ draw })
</script>
