<template>
  <div class="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-2xl w-full">
    <h2 class="text-2xl font-bold mb-6 text-center">Game Settings</h2>
    
    <!-- Game Mode Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Game Mode</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="updateGameMode('single')"
          data-testid="single-player-btn"
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
          @click="updateGameMode('multiplayer')"
          data-testid="multiplayer-btn"
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
          :value="settings.headShape"
          @change="updateSettings('headShape', ($event.target as HTMLSelectElement).value)"
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
          :value="settings.wallPattern"
          @change="updateSettings('wallPattern', ($event.target as HTMLSelectElement).value)"
          data-testid="wall-pattern-select"
          class="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white"
        >
          <option value="none">None</option>
          <option value="simple">Simple</option>
          <option value="cross">Cross</option>
          <option value="maze">Maze</option>
          <option value="random">Random</option>
          <option value="moving">Moving Walls</option>
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
            @click="updateSettings('headColor', color)"
            :class="[
              'h-8 rounded border-2 transition-all',
              settings.headColor === color ? 'border-white scale-110' : 'border-gray-600'
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
            @click="updateSettings('headColor2', color)"
            :class="[
              'h-8 rounded border-2 transition-all',
              settings.headColor2 === color ? 'border-white scale-110' : 'border-gray-600'
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
            @click="updateSettings('bgColor', color)"
            :class="[
              'h-8 rounded border-2 transition-all',
              settings.bgColor === color ? 'border-white scale-110' : 'border-gray-600'
            ]"
            :style="{ backgroundColor: color }"
          />
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label class="block text-sm font-medium mb-2">Speed</label>
        <div class="flex gap-2">
          <button
            v-for="(_, label) in SPEEDS"
            :key="label"
            @click="updateSettings('speed', label)"
            :data-testid="`speed-${label}`"
            :class="[
              'flex-1 py-2 px-3 rounded text-sm font-medium transition-all',
              settings.speed === label ? 'bg-blue-600 scale-105' : 'bg-gray-700'
            ]"
          >
            {{ label.charAt(0).toUpperCase() + label.slice(1) }}
          </button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Max Foods</label>
        <div class="flex gap-2">
          <button
            v-for="num in [1, 2, 3, 4, 5]"
            :key="num"
            @click="updateSettings('maxFoods', num)"
            :data-testid="`max-foods-${num}`"
            :class="[
              'flex-1 py-2 px-3 rounded text-sm font-medium transition-all',
              settings.maxFoods === num ? 'bg-blue-600 scale-105' : 'bg-gray-700'
            ]"
          >
            {{ num }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Teleport Feature Toggle -->
    <div class="mt-4">
      <div class="flex items-center justify-between p-3 bg-gray-700 rounded border border-gray-600">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🌀</span>
          <div>
            <label class="text-sm font-medium">Teleport Mode</label>
            <p class="text-xs text-gray-400">Jump through walls or across the map</p>
          </div>
        </div>
        <button
          @click="updateSettings('teleportEnabled', !settings.teleportEnabled)"
          data-testid="teleport-toggle"
          :class="[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
            settings.teleportEnabled ? 'bg-green-600' : 'bg-gray-600'
          ]"
        >
          <span
            :class="[
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
              settings.teleportEnabled ? 'translate-x-6' : 'translate-x-1'
            ]"
          />
        </button>
      </div>
    </div>
    
    <button
      @click="$emit('start-game')"
      data-testid="start-game-btn"
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
        <div class="flex items-center gap-1 col-span-3">
          <span>🔥</span>
          <span class="text-orange-400">Bullet: 5 Shots! Press S to fire (+20 pts)</span>
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
import { HEAD_SHAPES, HEAD_COLORS, BG_COLORS, SPEEDS, FOOD_TYPES } from '../utils/constants'

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
