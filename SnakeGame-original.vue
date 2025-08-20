<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
    <h1 class="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
      🐍 Snake Game Deluxe
    </h1>
    
    <!-- Menu Screen -->
    <div v-if="gameState === 'menu'" class="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-2xl w-full">
      <h2 class="text-2xl font-bold mb-6 text-center">Game Settings</h2>
      
      <!-- Game Mode Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Game Mode</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="gameMode = 'single'"
            :class="[
              'p-3 rounded border-2 transition-all text-sm font-medium',
              gameMode === 'single' 
                ? 'border-green-400 bg-green-400/20 text-green-400' 
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            ]"
          >
            🐍 Single Player
          </button>
          <button
            @click="gameMode = 'multiplayer'"
            :class="[
              'p-3 rounded border-2 transition-all text-sm font-medium',
              gameMode === 'multiplayer' 
                ? 'border-blue-400 bg-blue-400/20 text-blue-400' 
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
            ]"
          >
            🐍🐍 Two Players
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Snake Head Shape</label>
          <select 
            v-model="headShape" 
            class="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white"
          >
            <option v-for="shape in HEAD_SHAPES" :key="shape" :value="shape">
              {{ shape.charAt(0).toUpperCase() + shape.slice(1) }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Wall Pattern</label>
          <select 
            v-model="wallPattern" 
            class="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white"
          >
            <option value="none">None</option>
            <option value="simple">Simple</option>
            <option value="cross">Cross</option>
            <option value="maze">Maze</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium mb-2">
            {{ gameMode === 'multiplayer' ? 'Player 1 Color' : 'Snake Color' }}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="color in HEAD_COLORS"
              :key="color"
              @click="headColor = color"
              :class="[
                'h-8 rounded border-2 transition-all',
                headColor === color ? 'border-white scale-110' : 'border-gray-600'
              ]"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
        
        <div v-if="gameMode === 'multiplayer'">
          <label class="block text-sm font-medium mb-2">Player 2 Color</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="color in HEAD_COLORS"
              :key="color"
              @click="headColor2 = color"
              :class="[
                'h-8 rounded border-2 transition-all',
                headColor2 === color ? 'border-white scale-110' : 'border-gray-600'
              ]"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
        
        <div v-if="gameMode === 'single'">
          <label class="block text-sm font-medium mb-2">Background Color</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="color in BG_COLORS.slice(0, 3)"
              :key="color"
              @click="bgColor = color"
              :class="[
                'h-8 rounded border-2 transition-all',
                bgColor === color ? 'border-white scale-110' : 'border-gray-600'
              ]"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium mb-2">Game Speed</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(_, speedKey) in SPEEDS"
              :key="speedKey"
              @click="speed = speedKey as SpeedType"
              :class="[
                'p-2 rounded transition-all text-sm hover:bg-green-500',
                speed === speedKey ? 'bg-green-600 scale-105' : 'bg-gray-700'
              ]"
            >
              {{ speedKey.charAt(0).toUpperCase() + speedKey.slice(1) }}
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Max Foods on Screen</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="num in [2, 3, 5]"
              :key="num"
              @click="maxFoods = num"
              :class="[
                'p-2 rounded transition-all hover:bg-blue-500',
                maxFoods === num ? 'bg-blue-600 scale-105' : 'bg-gray-700'
              ]"
            >
              {{ num }}
            </button>
          </div>
        </div>
      </div>
      
      <button
        @click="startGame"
        class="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-4 rounded hover:from-green-600 hover:to-blue-600 transition transform hover:scale-105"
      >
        Start Game
      </button>
      
      <!-- Controls Information -->
      <div v-if="gameMode === 'multiplayer'" class="mt-4 p-3 bg-gray-700 rounded">
        <h3 class="text-sm font-bold mb-2">🎮 Controls:</h3>
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div class="text-green-400 font-bold mb-1">Player 1 (Arrow Keys):</div>
            <div>↑ ↓ ← → to move</div>
          </div>
          <div>
            <div class="text-blue-400 font-bold mb-1">Player 2 (WASD Keys):</div>
            <div>W A S D to move</div>
          </div>
        </div>
        <div class="text-center mt-2 text-yellow-300">Press SPACE to pause/resume</div>
      </div>
      
      <div class="mt-4 p-3 bg-gray-700 rounded">
        <h3 class="text-sm font-bold mb-2">Food Values & Effects:</h3>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div class="col-span-3 text-yellow-300 font-bold">Regular Foods:</div>
          <div v-for="([type, props]) in Object.entries(FOOD_TYPES).filter(([_, props]) => !props.effect)" :key="type" class="flex items-center gap-1">
            <span>{{ props.emoji }}</span>
            <span>{{ props.points }}pts</span>
          </div>
          <div class="col-span-3 text-green-300 font-bold mt-2">Special Foods:</div>
          <div class="flex items-center gap-1 col-span-3">
            <span>🍄</span>
            <span class="text-green-400">Mushroom: x2 Length! (+5 pts)</span>
          </div>
          <div class="flex items-center gap-1 col-span-3">
            <span>☠️</span>
            <span class="text-purple-400">Poison: -2 Length! (-10 pts)</span>
          </div>
        </div>
      </div>
      
      <div v-if="highScores.length > 0" class="mt-4 pt-4 border-t border-gray-700">
        <h3 class="text-lg font-bold mb-2">🏆 High Scores</h3>
        <ol class="flex gap-4 justify-center">
          <li v-for="(score, i) in highScores" :key="i" class="flex items-center gap-1">
            <span>{{ ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] }}</span>
            <span class="font-mono text-yellow-400">{{ score }}</span>
          </li>
        </ol>
      </div>
    </div>
    
    <!-- Game Screen -->
    <div v-if="gameState === 'playing' || gameState === 'paused'" class="flex flex-col items-center">
      <div v-if="gameMode === 'single'" class="mb-4 flex gap-8 items-center">
        <div class="text-xl font-bold">Score: <span class="text-green-400 text-2xl">{{ score }}</span></div>
        <div class="text-sm opacity-75 animate-pulse">Press SPACE to {{ gameState === 'playing' ? 'Pause' : 'Resume' }}</div>
      </div>
      
      <div v-if="gameMode === 'multiplayer'" class="mb-4 flex gap-8 items-center">
        <div class="text-lg font-bold">
          Player 1: <span class="text-green-400 text-xl">{{ score }}</span>
        </div>
        <div class="text-sm opacity-75 animate-pulse">Press SPACE to {{ gameState === 'playing' ? 'Pause' : 'Resume' }}</div>
        <div class="text-lg font-bold">
          Player 2: <span class="text-blue-400 text-xl">{{ score2 }}</span>
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
        <div class="grid grid-cols-4 gap-2 text-xs bg-gray-800 p-3 rounded">
          <div v-for="([type, props]) in Object.entries(FOOD_TYPES)" :key="type" class="flex items-center gap-1">
            <span>{{ props.emoji }}</span>
            <span>{{ props.points }}pts</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Game Over Screen -->
    <div v-if="gameState === 'gameOver'" class="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
      <h2 class="text-3xl font-bold mb-4 text-red-500">Game Over!</h2>
      
      <div v-if="gameMode === 'single'">
        <div class="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          {{ score }}
        </div>
        <div class="text-lg mb-6 text-gray-400">Points</div>
      </div>
      
      <div v-if="gameMode === 'multiplayer'">
        <div class="text-2xl font-bold mb-4">
          <div v-if="winner === 'player1'" class="text-green-400">🏆 Player 1 Wins!</div>
          <div v-else-if="winner === 'player2'" class="text-blue-400">🏆 Player 2 Wins!</div>
          <div v-else class="text-yellow-400">🤝 It's a Tie!</div>
        </div>
        <div class="flex justify-center gap-8 mb-6">
          <div>
            <div class="text-green-400 text-2xl font-bold">{{ score }}</div>
            <div class="text-sm text-gray-400">Player 1</div>
          </div>
          <div>
            <div class="text-blue-400 text-2xl font-bold">{{ score2 }}</div>
            <div class="text-sm text-gray-400">Player 2</div>
          </div>
        </div>
      </div>
      
      <div v-if="highScores.indexOf(score) !== -1 && highScores.indexOf(score) === 0" class="text-yellow-400 text-xl mb-4 animate-pulse">
        🏆 New High Score! 🏆
      </div>
      
      <div class="flex gap-4">
        <button
          @click="startGame"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
        >
          Play Again
        </button>
        <button
          @click="gameState = 'menu'"
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
        >
          Main Menu
        </button>
      </div>
      
      <div v-if="highScores.length > 0" class="mt-6 pt-6 border-t border-gray-700">
        <h3 class="text-lg font-bold mb-2">🏆 High Scores</h3>
        <ol class="space-y-1">
          <li v-for="(s, i) in highScores" :key="i" :class="['flex justify-between', s === score ? 'text-green-400 font-bold' : '']">
            <span>{{ ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] }} </span>
            <span class="font-mono">{{ s }} pts</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'

// Type definitions
interface Position {
  x: number
  y: number
}

interface Direction {
  x: number
  y: number
}

interface Food extends Position {
  type: FoodType
}

type FoodType = 'apple' | 'golden' | 'berry' | 'super' | 'banana' | 'cherry' | 'watermelon' | 'mushroom' | 'poison'

interface FoodProperties {
  color: string
  points: number
  spawnRate: number
  shape: ShapeType
  emoji: string
  effect?: 'double' | 'shrink'
}

type ShapeType = 'circle' | 'triangle' | 'diamond' | 'star' | 'rectangle' | 'square'

type HeadShape = 'square' | 'circle' | 'triangle' | 'diamond' | 'star'

type GameState = 'menu' | 'playing' | 'paused' | 'gameOver'

type GameMode = 'single' | 'multiplayer'

type Winner = 'player1' | 'player2' | 'tie' | null

type SpeedType = 'slow' | 'normal' | 'fast'

type WallPattern = 'none' | 'simple' | 'cross' | 'maze' | 'random'

// Game constants
const GRID_SIZE: number = 20
const CELL_SIZE: number = 25
const GAME_WIDTH: number = GRID_SIZE * CELL_SIZE
const GAME_HEIGHT: number = GRID_SIZE * CELL_SIZE

// Food types with their properties
const FOOD_TYPES: Record<FoodType, FoodProperties> = {
  apple: { color: '#ff0000', points: 10, spawnRate: 0.25, shape: 'circle', emoji: '🍎' },
  golden: { color: '#ffd700', points: 50, spawnRate: 0.08, shape: 'star', emoji: '⭐' },
  berry: { color: '#9932cc', points: 20, spawnRate: 0.15, shape: 'circle', emoji: '🫐' },
  super: { color: '#ff69b4', points: 100, spawnRate: 0.04, shape: 'diamond', emoji: '💎' },
  banana: { color: '#ffe135', points: 15, spawnRate: 0.13, shape: 'rectangle', emoji: '🍌' },
  cherry: { color: '#dc143c', points: 25, spawnRate: 0.1, shape: 'circle', emoji: '🍒' },
  watermelon: { color: '#fc6c85', points: 30, spawnRate: 0.07, shape: 'triangle', emoji: '🍉' },
  mushroom: { color: '#00ff00', points: 5, spawnRate: 0.08, shape: 'circle', emoji: '🍄', effect: 'double' },
  poison: { color: '#8b008b', points: -10, spawnRate: 0.1, shape: 'triangle', emoji: '☠️', effect: 'shrink' }
}

// Wall patterns
const WALL_PATTERNS: Record<WallPattern, Position[]> = {
  none: [],
  simple: [
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 12, y: 14 }, { x: 13, y: 14 }, { x: 14, y: 14 },
    { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
    { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }
  ],
  cross: [
    // Horizontal line
    { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 },
    { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 },
    // Vertical line
    { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
    { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 10, y: 13 }, { x: 10, y: 14 }
  ],
  maze: [
    // Top left L
    { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
    // Top right L
    { x: 14, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 },
    // Bottom left L
    { x: 3, y: 14 }, { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 },
    // Bottom right L
    { x: 16, y: 14 }, { x: 16, y: 15 }, { x: 16, y: 16 }, { x: 15, y: 16 }, { x: 14, y: 16 },
    // Center obstacles
    { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
  ],
  random: [] // Will be generated randomly
}

// Snake head shapes
const HEAD_SHAPES: HeadShape[] = ['square', 'circle', 'triangle', 'diamond', 'star']
const HEAD_COLORS: string[] = ['#00ff00', '#0080ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8000']
const BG_COLORS: string[] = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#3d5a80']
const SPEEDS: Record<SpeedType, number> = { slow: 200, normal: 120, fast: 70 }

// Generate random walls
const generateRandomWalls = (count: number = 15): Position[] => {
  const walls: Position[] = []
  const forbidden: Position[] = [
    { x: 10, y: 10 }, // Starting position
    { x: 15, y: 15 }  // Initial food position
  ]
  
  while (walls.length < count) {
    const wall: Position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    
    // Check if wall is not in forbidden positions or already exists
    const isForbidden = forbidden.some(f => f.x === wall.x && f.y === wall.y)
    const exists = walls.some(w => w.x === wall.x && w.y === wall.y)
    
    if (!isForbidden && !exists) {
      walls.push(wall)
      // Add adjacent wall sometimes for more interesting patterns
      if (Math.random() > 0.5 && walls.length < count) {
        const directions: Direction[] = [
          { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 0, y: 1 }, { x: 0, y: -1 }
        ]
        const dir = directions[Math.floor(Math.random() * directions.length)]
        const adjacent: Position = {
          x: wall.x + dir.x,
          y: wall.y + dir.y
        }
        if (adjacent.x >= 0 && adjacent.x < GRID_SIZE && 
            adjacent.y >= 0 && adjacent.y < GRID_SIZE &&
            !forbidden.some(f => f.x === adjacent.x && f.y === adjacent.y)) {
          walls.push(adjacent)
        }
      }
    }
  }
  
  return walls
}

// Reactive state
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const gameMode: Ref<GameMode> = ref('single')
const snake: Ref<Position[]> = ref([{ x: 10, y: 10 }])
const snake2: Ref<Position[]> = ref([{ x: 8, y: 8 }])
const foods: Ref<Food[]> = ref([{ x: 15, y: 15, type: 'apple' }])
const walls: Ref<Position[]> = ref([])
const direction: Ref<Direction> = ref({ x: 1, y: 0 })
const direction2: Ref<Direction> = ref({ x: 1, y: 0 })
const gameState: Ref<GameState> = ref('menu')
const score: Ref<number> = ref(0)
const score2: Ref<number> = ref(0)
const winner: Ref<Winner> = ref(null)
const highScores: Ref<number[]> = ref([])

// Settings
const headShape: Ref<HeadShape> = ref('square')
const headColor: Ref<string> = ref('#00ff00')
const headColor2: Ref<string> = ref('#0080ff')
const bgColor: Ref<string> = ref('#1a1a2e')
const speed: Ref<SpeedType> = ref('normal')
const wallPattern: Ref<WallPattern> = ref('simple')
const maxFoods: Ref<number> = ref(3)

// Game loop variables
let gameLoopRef: number | null = null
let animationId: number | null = null

// Load high scores
onMounted(() => {
  const saved = localStorage.getItem('snakeHighScores')
  if (saved) {
    try {
      highScores.value = JSON.parse(saved) as number[]
    } catch (error) {
      console.error('Failed to parse high scores:', error)
      highScores.value = []
    }
  }
})

// Draw functions
const drawShape = (ctx: CanvasRenderingContext2D, shape: ShapeType, x: number, y: number, size: number, color: string | CanvasGradient): void => {
  ctx.fillStyle = color
  ctx.strokeStyle = typeof color === 'string' ? color : '#000000'
  
  switch (shape) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(x + size/2, y)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      ctx.fill()
      break
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(x + size/2, y)
      ctx.lineTo(x + size, y + size/2)
      ctx.lineTo(x + size/2, y + size)
      ctx.lineTo(x, y + size/2)
      ctx.closePath()
      ctx.fill()
      break
    case 'star':
      const cx = x + size/2
      const cy = y + size/2
      const spikes = 5
      const outerRadius = size/2
      const innerRadius = size/4
      
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (Math.PI / spikes) * i - Math.PI/2
        const px = cx + Math.cos(angle) * radius
        const py = cy + Math.sin(angle) * radius
        
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
      ctx.fill()
      break
    case 'rectangle':
      ctx.fillRect(x + size/4, y, size/2, size)
      break
    default: // square
      ctx.fillRect(x, y, size, size)
  }
}

// Draw game
const draw = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Clear canvas
  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  
  // Draw grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath()
    ctx.moveTo(i * CELL_SIZE, 0)
    ctx.lineTo(i * CELL_SIZE, GAME_HEIGHT)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, i * CELL_SIZE)
    ctx.lineTo(GAME_WIDTH, i * CELL_SIZE)
    ctx.stroke()
  }
  
  // Draw walls
  ctx.fillStyle = '#666666'
  ctx.strokeStyle = '#999999'
  walls.value.forEach(wall => {
    ctx.fillRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    ctx.strokeRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
  })
  
  // Draw snake
  snake.value.forEach((segment, index) => {
    if (index === 0) {
      // Draw head
      drawShape(ctx, headShape.value, segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, headColor.value)
      
      // Draw eyes for head
      if (headShape.value !== 'triangle') {
        ctx.fillStyle = 'white'
        const eyeSize = 3
        const eyeOffset = 5
        if (direction.value.x === 1) { // facing right
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
        } else if (direction.value.x === -1) { // facing left
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
        } else if (direction.value.y === -1) { // facing up
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
        } else { // facing down
          ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
          ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
        }
      }
    } else {
      // Draw body with gradient effect
      const opacity = 1 - (index / snake.value.length) * 0.3
      ctx.fillStyle = headColor.value + Math.floor(opacity * 255).toString(16).padStart(2, '0')
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
    }
  })
  
  // Draw snake 2 (only in multiplayer mode)
  if (gameMode.value === 'multiplayer') {
    snake2.value.forEach((segment, index) => {
      if (index === 0) {
        // Draw head
        drawShape(ctx, headShape.value, segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, headColor2.value)
        
        // Draw eyes for head
        if (headShape.value !== 'triangle') {
          ctx.fillStyle = 'white'
          const eyeSize = 3
          const eyeOffset = 5
          if (direction2.value.x === 1) { // facing right
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
          } else if (direction2.value.x === -1) { // facing left
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
          } else if (direction2.value.y === -1) { // facing up
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
          } else { // facing down
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
          }
        }
      } else {
        // Draw body with gradient effect
        const opacity = 1 - (index / snake2.value.length) * 0.3
        ctx.fillStyle = headColor2.value + Math.floor(opacity * 255).toString(16).padStart(2, '0')
        ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
      }
    })
  }
  
  // Draw foods
  foods.value.forEach(food => {
    const foodType = FOOD_TYPES[food.type]
    
    if (food.type === 'super') {
      // Rainbow effect for super fruit
      const gradient = ctx.createRadialGradient(
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        0,
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        CELL_SIZE/2
      )
      gradient.addColorStop(0, '#ff0000')
      gradient.addColorStop(0.5, '#00ff00')
      gradient.addColorStop(1, '#0000ff')
      ctx.fillStyle = gradient
      drawShape(ctx, 'diamond', food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, gradient)
    } else if (food.type === 'mushroom') {
      // Pulsing green effect for mushroom
      const time = Date.now() / 500
      const pulse = Math.sin(time) * 0.3 + 0.7
      ctx.shadowColor = '#00ff00'
      ctx.shadowBlur = 15 * pulse
      ctx.fillStyle = foodType.color
      drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color)
      // Draw x2 symbol
      ctx.shadowBlur = 0
      ctx.fillStyle = 'white'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('x2', food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2)
    } else if (food.type === 'poison') {
      // Dark purple with skull effect
      ctx.shadowColor = '#8b008b'
      ctx.shadowBlur = 10
      drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color)
      // Draw skull symbol
      ctx.shadowBlur = 0
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('☠', food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2 + 2)
    } else {
      // Add glow effect for high-value foods
      if (foodType.points >= 30) {
        ctx.shadowColor = foodType.color
        ctx.shadowBlur = 10
      }
      drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color)
      ctx.shadowBlur = 0
    }
  })
  
  // Draw pause overlay
  if (gameState.value === 'paused') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2)
  }
}

// Generate random food
const generateFood = (): Food => {
  const occupiedPositions: Position[] = [
    ...snake.value,
    ...foods.value,
    ...walls.value
  ]
  
  // Include snake2 positions if in multiplayer mode
  if (gameMode.value === 'multiplayer') {
    occupiedPositions.push(...snake2.value)
  }
  
  let newFood: Food
  let attempts = 0
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      type: 'apple'
    }
    attempts++
    if (attempts > 100) break // Prevent infinite loop
  } while (occupiedPositions.some(pos => pos.x === newFood.x && pos.y === newFood.y))
  
  // Determine food type based on spawn rates
  const rand = Math.random()
  let cumulative = 0
  for (const [type, props] of Object.entries(FOOD_TYPES) as [FoodType, FoodProperties][]) {
    cumulative += props.spawnRate
    if (rand < cumulative) {
      newFood.type = type
      break
    }
  }
  
  return newFood
}

// Game loop
const gameLoop = (): void => {
  if (gameState.value !== 'playing') return

  if (gameMode.value === 'single') {
    // Single player game loop
    const newSnake = [...snake.value]
    const head: Position = { ...newSnake[0] }
    
    // Move head
    head.x += direction.value.x
    head.y += direction.value.y
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameState.value = 'gameOver'
      return
    }
    
    // Check wall obstacle collision
    if (walls.value.some(wall => wall.x === head.x && wall.y === head.y)) {
      gameState.value = 'gameOver'
      return
    }
    
    // Check self collision
    if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameState.value = 'gameOver'
      return
    }
    
    newSnake.unshift(head)
    
    // Check food collision
    const eatenFoodIndex = foods.value.findIndex(food => food.x === head.x && food.y === head.y)
    if (eatenFoodIndex !== -1) {
      const eatenFood = foods.value[eatenFoodIndex]
      const foodType = FOOD_TYPES[eatenFood.type]
      const points = foodType.points
      
      // Handle special effects
      if (foodType.effect === 'double') {
        // Double the snake length (mushroom effect)
        const currentLength = newSnake.length
        for (let i = 0; i < currentLength - 1; i++) {
          const lastSegment = newSnake[newSnake.length - 1]
          newSnake.push({ ...lastSegment })
        }
        score.value += points
      } else if (foodType.effect === 'shrink') {
        // Reduce snake length by 2 (poison effect)
        if (newSnake.length > 3) { // Keep minimum length of 3
          newSnake.pop()
          newSnake.pop()
        }
        score.value = Math.max(0, score.value + points) // Don't go below 0
      } else {
        // Normal food - just add points
        score.value += points
      }
      
      // Remove eaten food and generate new one
      const newFoods = foods.value.filter((_, index) => index !== eatenFoodIndex)
      // Add new food if below max
      if (newFoods.length < maxFoods.value) {
        newFoods.push(generateFood())
      }
      foods.value = newFoods
    } else {
      // Only pop if we didn't eat food
      newSnake.pop()
    }
    
    snake.value = newSnake
    
  } else {
    // Multiplayer game loop
    const newSnake1 = [...snake.value]
    const newSnake2 = [...snake2.value]
    const head1: Position = { ...newSnake1[0] }
    const head2: Position = { ...newSnake2[0] }
    
    // Move heads
    head1.x += direction.value.x
    head1.y += direction.value.y
    head2.x += direction2.value.x
    head2.y += direction2.value.y
    
    let player1Dead = false
    let player2Dead = false
    
    // Check collisions for player 1
    if (head1.x < 0 || head1.x >= GRID_SIZE || head1.y < 0 || head1.y >= GRID_SIZE) {
      player1Dead = true
    }
    if (walls.value.some(wall => wall.x === head1.x && wall.y === head1.y)) {
      player1Dead = true
    }
    if (newSnake1.some(seg => seg.x === head1.x && seg.y === head1.y)) {
      player1Dead = true
    }
    if (snake2.value.some(seg => seg.x === head1.x && seg.y === head1.y)) {
      player1Dead = true
    }
    
    // Check collisions for player 2
    if (head2.x < 0 || head2.x >= GRID_SIZE || head2.y < 0 || head2.y >= GRID_SIZE) {
      player2Dead = true
    }
    if (walls.value.some(wall => wall.x === head2.x && wall.y === head2.y)) {
      player2Dead = true
    }
    if (newSnake2.some(seg => seg.x === head2.x && seg.y === head2.y)) {
      player2Dead = true
    }
    if (snake.value.some(seg => seg.x === head2.x && seg.y === head2.y)) {
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
        winner.value = 'tie'
      } else if (player1Dead) {
        winner.value = 'player2'
      } else {
        winner.value = 'player1'
      }
      gameState.value = 'gameOver'
      return
    }
    
    newSnake1.unshift(head1)
    newSnake2.unshift(head2)
    
    // Check food collisions for both players
    const eatenFoodIndex1 = foods.value.findIndex(food => food.x === head1.x && food.y === head1.y)
    const eatenFoodIndex2 = foods.value.findIndex(food => food.x === head2.x && food.y === head2.y)
    
    let foodsToRemove: number[] = []
    
    if (eatenFoodIndex1 !== -1) {
      const eatenFood = foods.value[eatenFoodIndex1]
      const foodType = FOOD_TYPES[eatenFood.type]
      const points = foodType.points
      
      // Handle special effects for player 1
      if (foodType.effect === 'double') {
        const currentLength = newSnake1.length
        for (let i = 0; i < currentLength - 1; i++) {
          const lastSegment = newSnake1[newSnake1.length - 1]
          newSnake1.push({ ...lastSegment })
        }
        score.value += points
      } else if (foodType.effect === 'shrink') {
        if (newSnake1.length > 3) {
          newSnake1.pop()
          newSnake1.pop()
        }
        score.value = Math.max(0, score.value + points)
      } else {
        score.value += points
      }
      
      foodsToRemove.push(eatenFoodIndex1)
    } else {
      newSnake1.pop()
    }
    
    if (eatenFoodIndex2 !== -1 && eatenFoodIndex2 !== eatenFoodIndex1) {
      const eatenFood = foods.value[eatenFoodIndex2]
      const foodType = FOOD_TYPES[eatenFood.type]
      const points = foodType.points
      
      // Handle special effects for player 2
      if (foodType.effect === 'double') {
        const currentLength = newSnake2.length
        for (let i = 0; i < currentLength - 1; i++) {
          const lastSegment = newSnake2[newSnake2.length - 1]
          newSnake2.push({ ...lastSegment })
        }
        score2.value += points
      } else if (foodType.effect === 'shrink') {
        if (newSnake2.length > 3) {
          newSnake2.pop()
          newSnake2.pop()
        }
        score2.value = Math.max(0, score2.value + points)
      } else {
        score2.value += points
      }
      
      foodsToRemove.push(eatenFoodIndex2)
    } else if (eatenFoodIndex2 === -1) {
      newSnake2.pop()
    }
    
    // Remove eaten foods and generate new ones
    if (foodsToRemove.length > 0) {
      const newFoods = foods.value.filter((_, index) => !foodsToRemove.includes(index))
      // Add new foods if below max
      while (newFoods.length < maxFoods.value) {
        newFoods.push(generateFood())
      }
      foods.value = newFoods
    }
    
    snake.value = newSnake1
    snake2.value = newSnake2
  }
  
  // Spawn new foods periodically
  if (foods.value.length < maxFoods.value && Math.random() < 0.1) {
    foods.value.push(generateFood())
  }
}

// Animation loop
const animate = (): void => {
  draw()
  animationId = requestAnimationFrame(animate)
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
    const newDirection: Direction = { ...direction.value }
    switch (e.key) {
      case 'ArrowUp':
        if (direction.value.y === 0) {
          newDirection.x = 0
          newDirection.y = -1
        }
        break
      case 'ArrowDown':
        if (direction.value.y === 0) {
          newDirection.x = 0
          newDirection.y = 1
        }
        break
      case 'ArrowLeft':
        if (direction.value.x === 0) {
          newDirection.x = -1
          newDirection.y = 0
        }
        break
      case 'ArrowRight':
        if (direction.value.x === 0) {
          newDirection.x = 1
          newDirection.y = 0
        }
        break
    }
    direction.value = newDirection
    
    // Player 2 controls (WASD) - only in multiplayer mode
    if (gameMode.value === 'multiplayer') {
      const newDirection2: Direction = { ...direction2.value }
      switch (e.key) {
        case 'w':
        case 'W':
          if (direction2.value.y === 0) {
            newDirection2.x = 0
            newDirection2.y = -1
          }
          break
        case 's':
        case 'S':
          if (direction2.value.y === 0) {
            newDirection2.x = 0
            newDirection2.y = 1
          }
          break
        case 'a':
        case 'A':
          if (direction2.value.x === 0) {
            newDirection2.x = -1
            newDirection2.y = 0
          }
          break
        case 'd':
        case 'D':
          if (direction2.value.x === 0) {
            newDirection2.x = 1
            newDirection2.y = 0
          }
          break
      }
      direction2.value = newDirection2
    } else {
      // Single player mode - also allow WASD for player 1
      switch (e.key) {
        case 'w':
        case 'W':
          if (direction.value.y === 0) {
            newDirection.x = 0
            newDirection.y = -1
          }
          break
        case 's':
        case 'S':
          if (direction.value.y === 0) {
            newDirection.x = 0
            newDirection.y = 1
          }
          break
        case 'a':
        case 'A':
          if (direction.value.x === 0) {
            newDirection.x = -1
            newDirection.y = 0
          }
          break
        case 'd':
        case 'D':
          if (direction.value.x === 0) {
            newDirection.x = 1
            newDirection.y = 0
          }
          break
      }
      direction.value = newDirection
    }
  }
}

// Start new game
const startGame = (): void => {
  // Initialize player 1
  snake.value = [{ x: 10, y: 10 }]
  direction.value = { x: 1, y: 0 }
  score.value = 0
  
  // Initialize player 2 (only in multiplayer mode)
  if (gameMode.value === 'multiplayer') {
    snake2.value = [{ x: 8, y: 8 }]
    direction2.value = { x: 1, y: 0 }
    score2.value = 0
  } else {
    // Reset player 2 data in single player mode
    snake2.value = []
    score2.value = 0
  }
  
  // Reset winner
  winner.value = null
  
  // Set walls based on pattern
  let newWalls: Position[] = []
  if (wallPattern.value === 'random') {
    newWalls = generateRandomWalls()
  } else if (wallPattern.value !== 'none') {
    newWalls = WALL_PATTERNS[wallPattern.value]
  }
  walls.value = newWalls
  
  // Generate initial foods
  const initialFoods: Food[] = []
  for (let i = 0; i < maxFoods.value; i++) {
    initialFoods.push(generateFood())
  }
  foods.value = initialFoods
  
  gameState.value = 'playing'
}

// Save high score
const saveHighScore = (): void => {
  const newScores = [...highScores.value, score.value].sort((a, b) => b - a).slice(0, 5)
  highScores.value = newScores
  localStorage.setItem('snakeHighScores', JSON.stringify(newScores))
}

// Watch for game state changes
watch(gameState, (newState: GameState) => {
  if (newState === 'playing') {
    gameLoopRef = setInterval(gameLoop, SPEEDS[speed.value])
    if (!animationId) {
      animate()
    }
  } else {
    if (gameLoopRef) {
      clearInterval(gameLoopRef)
      gameLoopRef = null
    }
  }
  
  if (newState === 'gameOver') {
    saveHighScore()
  }
})

// Watch for speed changes
watch(speed, (newSpeed: SpeedType) => {
  if (gameState.value === 'playing' && gameLoopRef) {
    clearInterval(gameLoopRef)
    gameLoopRef = setInterval(gameLoop, SPEEDS[newSpeed])
  }
})

// Setup event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (gameLoopRef) {
    clearInterval(gameLoopRef)
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
