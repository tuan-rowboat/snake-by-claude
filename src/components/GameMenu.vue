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
        
        <!-- Audio Controls -->
        <div class="p-3 bg-gray-700 rounded border border-gray-600">
          <h3 class="text-sm font-bold mb-2 flex items-center">
            <span class="mr-2">🔊</span>Audio
          </h3>
          
          <div class="grid grid-cols-2 gap-2 mb-2">
            <!-- Sound Effects Toggle -->
            <button
              @click="updateSettings('soundEnabled', !settings.soundEnabled)"
              data-testid="sound-toggle"
              :class="[
                'flex items-center justify-center p-2 rounded text-xs transition-all',
                settings.soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
              ]"
            >
              🔊 SFX
            </button>
            
            <!-- Background Music Toggle -->
            <button
              @click="updateSettings('musicEnabled', !settings.musicEnabled)"
              data-testid="music-toggle"
              :class="[
                'flex items-center justify-center p-2 rounded text-xs transition-all',
                settings.musicEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              ]"
            >
              🎵 Music
            </button>
          </div>
          
          <!-- Volume Sliders -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs w-12">SFX:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="settings.soundVolume"
                @input="updateSettings('soundVolume', parseFloat(($event.target as HTMLInputElement).value))"
                data-testid="sound-volume"
                class="flex-1 h-1 bg-gray-600 rounded slider"
                :disabled="!settings.soundEnabled"
              />
              <span class="text-xs w-8 text-gray-400">{{ Math.round(settings.soundVolume * 100) }}%</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-xs w-12">Music:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="settings.musicVolume"
                @input="updateSettings('musicVolume', parseFloat(($event.target as HTMLInputElement).value))"
                data-testid="music-volume"
                class="flex-1 h-1 bg-gray-600 rounded slider"
                :disabled="!settings.musicEnabled"
              />
              <span class="text-xs w-8 text-gray-400">{{ Math.round(settings.musicVolume * 100) }}%</span>
            </div>
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
    
    <!-- Active Challenges -->
    <div v-if="todaysChallenge || thisWeeksChallenge || (activeSeasonalEvents && activeSeasonalEvents.length > 0)" class="mt-4">
      <!-- Collapsible Header -->
      <button
        @click="toggleChallenges"
        class="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 mb-3"
      >
        <h3 class="text-lg font-bold text-white">🌟 Active Challenges</h3>
        <div class="flex items-center space-x-2">
          <!-- Challenge Count Badge -->
          <span class="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
            {{ 
              (todaysChallenge ? 1 : 0) + 
              (thisWeeksChallenge ? 1 : 0) + 
              (activeSeasonalEvents ? activeSeasonalEvents.length : 0)
            }} active
          </span>
          <!-- Expand/Collapse Icon -->
          <span 
            class="transform transition-transform duration-200 text-white"
            :class="challengesExpanded ? 'rotate-180' : 'rotate-0'"
          >
            ▼
          </span>
        </div>
      </button>
      
      <!-- Collapsible Content -->
      <div 
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :class="challengesExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'"
      >
        <div class="space-y-3">
      
      <!-- Daily Challenge -->
      <div v-if="todaysChallenge" class="p-3 bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg border border-purple-500">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-bold text-purple-200">📅 Daily Challenge</h4>
          <span v-if="todaysChallenge.completed" class="text-xs text-green-400">✓ Completed!</span>
        </div>
        <div class="text-xs text-white mb-2">{{ todaysChallenge.title }}</div>
        <div class="text-xs text-purple-200 mb-2">{{ todaysChallenge.objective }}</div>
        <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            class="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: Math.min(100, (todaysChallenge.progress / todaysChallenge.target) * 100) + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-purple-300">{{ todaysChallenge.progress }} / {{ todaysChallenge.target }}</span>
          <span class="text-yellow-400">{{ todaysChallenge.reward.experience }} XP</span>
        </div>
      </div>
      
      <!-- Weekly Challenge -->
      <div v-if="thisWeeksChallenge" class="p-3 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg border border-indigo-500">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-bold text-indigo-200">🏆 Weekly Challenge</h4>
          <div class="flex items-center gap-2">
            <span :class="[
              'text-xs px-2 py-1 rounded',
              thisWeeksChallenge.difficulty === 'easy' ? 'bg-green-600 text-green-200' :
              thisWeeksChallenge.difficulty === 'medium' ? 'bg-yellow-600 text-yellow-200' :
              thisWeeksChallenge.difficulty === 'hard' ? 'bg-red-600 text-red-200' : 'bg-purple-600 text-purple-200'
            ]">{{ thisWeeksChallenge.difficulty.toUpperCase() }}</span>
            <span v-if="thisWeeksChallenge.completed" class="text-xs text-green-400">✓ Done!</span>
          </div>
        </div>
        <div class="text-xs text-white mb-2">{{ thisWeeksChallenge.title }}</div>
        <div class="text-xs text-indigo-200 mb-2">{{ thisWeeksChallenge.objective }}</div>
        <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            class="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all duration-500"
            :style="{ width: Math.min(100, (thisWeeksChallenge.progress / thisWeeksChallenge.target) * 100) + '%' }"
          ></div>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-indigo-300">{{ thisWeeksChallenge.progress }} / {{ thisWeeksChallenge.target }}</span>
          <span class="text-indigo-300">{{ thisWeeksChallenge.reward.experience }} XP</span>
        </div>
      </div>
      
      <!-- Seasonal Events -->
      <div v-if="activeSeasonalEvents && activeSeasonalEvents.length > 0" class="space-y-2">
        <div 
          v-for="event in activeSeasonalEvents" 
          :key="event.id"
          class="p-3 bg-gradient-to-r from-green-800 to-teal-800 rounded-lg border border-green-500"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-bold text-green-200">{{ event.icon }} {{ event.name }}</h4>
            <span :class="[
              'text-xs px-2 py-1 rounded',
              event.theme === 'spring' ? 'bg-green-600 text-green-200' :
              event.theme === 'summer' ? 'bg-yellow-600 text-yellow-200' :
              event.theme === 'fall' ? 'bg-orange-600 text-orange-200' :
              event.theme === 'winter' ? 'bg-blue-600 text-blue-200' :
              'bg-purple-600 text-purple-200'
            ]">{{ event.theme.toUpperCase() }}</span>
          </div>
          <div class="text-xs text-green-200 mb-2">{{ event.description }}</div>
          <div class="text-xs text-green-300">
            {{ event.challenges.filter(c => c.completed).length }} / {{ event.challenges.length }} challenges completed
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
    
    <!-- Progression Tip -->
    <div class="mt-4 p-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
      <div class="flex items-center mb-1">
        <span class="text-sm mr-2">💡</span>
        <span class="text-sm font-medium text-blue-400">Progression System</span>
      </div>
      <div class="text-xs text-gray-300">
        Complete challenges, earn XP, unlock achievements, and customize your snake! 
        <span class="text-purple-400">Click "📊 Progress" button</span> to view detailed stats and rewards.
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
import { ref } from 'vue'
import type { GameMode, GameSettings } from '../types/game'
import type { DailyChallenge, WeeklyChallenge, SeasonalEvent } from '../types/progression'
import { HEAD_SHAPES, HEAD_COLORS, BG_COLORS, SPEEDS, FOOD_TYPES, GRID_SIZES } from '../utils/constants'

interface Props {
  gameMode: GameMode
  settings: GameSettings
  highScores: number[]
  todaysChallenge?: DailyChallenge | null
  thisWeeksChallenge?: WeeklyChallenge | null
  activeSeasonalEvents?: SeasonalEvent[]
}

interface Emits {
  (e: 'update-game-mode', mode: GameMode): void
  (e: 'update-settings', key: keyof GameSettings, value: any): void
  (e: 'start-game'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Collapse state for challenges section
const challengesExpanded = ref(true)

const updateGameMode = (mode: GameMode) => {
  emit('update-game-mode', mode)
}

const updateSettings = (key: keyof GameSettings, value: any) => {
  emit('update-settings', key, value)
}

const toggleChallenges = () => {
  challengesExpanded.value = !challengesExpanded.value
}
</script>

<style scoped>
/* Custom slider styles */
.slider {
  background: linear-gradient(to right, #4ade80 0%, #22c55e 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #22c55e;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #22c55e;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}
</style>
