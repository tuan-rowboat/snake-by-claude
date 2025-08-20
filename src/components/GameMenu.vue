<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-2xl max-w-4xl w-full">
    <h2 class="text-xl font-bold mb-4 text-center">Game Settings</h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-4">
        <!-- Game Mode Selection -->
        <div>
          <label class="block text-sm font-medium mb-2">Game Mode</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="updateGameMode('single')"
              data-testid="single-player-btn"
              :class="[
                'p-2 rounded border-2 transition-all text-sm font-medium',
                gameMode === 'single' 
                  ? 'border-green-400 bg-green-400/20 text-green-400' 
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              ]"
            >
              🐍 Single
            </button>
            <button
              @click="updateGameMode('multiplayer')"
              data-testid="multiplayer-btn"
              :class="[
                'p-2 rounded border-2 transition-all text-sm font-medium',
                gameMode === 'multiplayer' 
                  ? 'border-blue-400 bg-blue-400/20 text-blue-400' 
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              ]"
            >
              🐍🐍 Multi
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">Head Shape</label>
            <select 
              :value="settings.headShape"
              @change="updateSettings('headShape', ($event.target as HTMLSelectElement).value)"
              class="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white text-sm"
            >
              <option v-for="shape in HEAD_SHAPES" :key="shape" :value="shape">
                {{ shape.charAt(0).toUpperCase() + shape.slice(1) }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Wall Pattern</label>
            <select 
              :value="settings.wallPattern"
              @change="updateSettings('wallPattern', ($event.target as HTMLSelectElement).value)"
              data-testid="wall-pattern-select"
              class="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white text-sm"
            >
              <option value="none">None</option>
              <option value="simple">Simple</option>
              <option value="cross">Cross</option>
              <option value="maze">Maze</option>
              <option value="random">Random</option>
              <option value="moving">Moving</option>
            </select>
          </div>
        </div>
        <!-- Colors -->
        <div>
          <label class="block text-sm font-medium mb-1">
            {{ gameMode === 'multiplayer' ? 'Player Colors' : 'Colors' }}
          </label>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs w-16">{{ gameMode === 'multiplayer' ? 'P1:' : 'Snake:' }}</span>
              <div class="flex gap-1">
                <button
                  v-for="color in HEAD_COLORS"
                  :key="color"
                  @click="updateSettings('headColor', color)"
                  :class="[
                    'w-6 h-6 rounded border transition-all',
                    settings.headColor === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            
            <div v-if="gameMode === 'multiplayer'" class="flex items-center gap-2">
              <span class="text-xs w-16">P2:</span>
              <div class="flex gap-1">
                <button
                  v-for="color in HEAD_COLORS"
                  :key="color"
                  @click="updateSettings('headColor2', color)"
                  :class="[
                    'w-6 h-6 rounded border transition-all',
                    settings.headColor2 === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            
            <div v-if="gameMode === 'single'" class="flex items-center gap-2">
              <span class="text-xs w-16">BG:</span>
              <div class="flex gap-1">
                <button
                  v-for="color in BG_COLORS.slice(0, 3)"
                  :key="color"
                  @click="updateSettings('bgColor', color)"
                  :class="[
                    'w-6 h-6 rounded border transition-all',
                    settings.bgColor === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="space-y-4">
        <!-- Speed & Foods -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1">Speed</label>
            <div class="flex gap-1">
              <button
                v-for="(_, label) in SPEEDS"
                :key="label"
                @click="updateSettings('speed', label)"
                :data-testid="`speed-${label}`"
                :class="[
                  'flex-1 py-1 px-2 rounded text-xs font-medium transition-all',
                  settings.speed === label ? 'bg-blue-600 scale-105' : 'bg-gray-700'
                ]"
              >
                {{ label.charAt(0).toUpperCase() + label.slice(1) }}
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Max Foods</label>
            <div class="flex gap-1">
              <button
                v-for="num in [1, 2, 3, 4, 5]"
                :key="num"
                @click="updateSettings('maxFoods', num)"
                :data-testid="`max-foods-${num}`"
                :class="[
                  'flex-1 py-1 px-2 rounded text-xs font-medium transition-all',
                  settings.maxFoods === num ? 'bg-blue-600 scale-105' : 'bg-gray-700'
                ]"
              >
                {{ num }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Canvas Size -->
        <div>
          <label class="block text-sm font-medium mb-1">Canvas Size</label>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="(size, label) in GRID_SIZES"
              :key="label"
              @click="updateSettings('gridSize', size)"
              :data-testid="`grid-size-${label}`"
              :class="[
                'py-1 px-2 rounded text-xs font-medium transition-all',
                settings.gridSize === size ? 'bg-green-600 scale-105' : 'bg-gray-700'
              ]"
            >
              {{ label.charAt(0).toUpperCase() + label.slice(1) }}
            </button>
          </div>
        </div>
        
        <!-- Teleport Toggle -->
        <div>
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600">
            <div class="flex items-center space-x-2">
              <span class="text-lg">🌀</span>
              <div>
                <label class="text-sm font-medium">Teleport Mode</label>
                <p class="text-xs text-gray-400">Jump through walls</p>
              </div>
            </div>
            <button
              @click="updateSettings('teleportEnabled', !settings.teleportEnabled)"
              data-testid="teleport-toggle"
              :class="[
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                settings.teleportEnabled ? 'bg-green-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200',
                  settings.teleportEnabled ? 'translate-x-5' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <button
      @click="$emit('start-game')"
      data-testid="start-game-btn"
      class="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-4 rounded hover:from-green-600 hover:to-blue-600 transition transform hover:scale-105"
    >
      🎮 Start Game
    </button>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <!-- Controls Information -->
      <div class="p-3 bg-gray-700 rounded">
        <h3 class="text-sm font-bold mb-2">🎮 Controls</h3>
        <div class="text-xs space-y-1">
          <div v-if="gameMode === 'single'">Arrow Keys or WASD to move</div>
          <div v-if="gameMode === 'multiplayer'">
            <div class="text-green-400">P1: Arrow Keys</div>
            <div class="text-blue-400">P2: WASD</div>
          </div>
          <div class="text-yellow-300">SPACE: Pause/Resume</div>
        </div>
      </div>
      
      <!-- Food Guide -->
      <div class="p-3 bg-gray-700 rounded">
        <h3 class="text-sm font-bold mb-2">🍎 Food Guide</h3>
        <div class="grid grid-cols-2 gap-1 text-xs">
          <div v-for="([type, props]) in Object.entries(FOOD_TYPES).filter(([_, props]) => !props.effect)" :key="type" class="flex items-center gap-1">
            <span>{{ props.emoji }}</span>
            <span>{{ props.points }}pts</span>
          </div>
        </div>
        <div class="mt-2 space-y-1 text-xs">
          <div class="text-green-300 font-bold">Special Effects:</div>
          <div><span>🍄</span> x2 Length <span>☠️</span> -2 Length</div>
          <div><span>🔥</span> 5 Bullets <span>🧪</span> +1-3 Length</div>
          <div><span>💊</span> -1-3 Length</div>
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
</template>

<script setup lang="ts">
import type { GameMode, GameSettings } from '../types/game'
import { HEAD_SHAPES, HEAD_COLORS, BG_COLORS, SPEEDS, FOOD_TYPES, GRID_SIZES } from '../utils/constants'

interface Props {
  gameMode: GameMode
  settings: GameSettings
  highScores: number[]
}

interface Emits {
  (e: 'update-game-mode', mode: GameMode): void
  (e: 'update-settings', key: keyof GameSettings, value: any): void
  (e: 'start-game'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const updateGameMode = (mode: GameMode) => {
  emit('update-game-mode', mode)
}

const updateSettings = (key: keyof GameSettings, value: any) => {
  emit('update-settings', key, value)
}
</script>
