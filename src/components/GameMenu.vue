<template>
  <div class="bg-gray-800 p-3 rounded-lg shadow-2xl max-w-5xl w-full">
    <h2 class="text-lg font-bold mb-3 text-center">Game Settings</h2>
    
    <!-- Compact Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      
      <!-- Column 1: Game Mode & Core Settings -->
      <div class="space-y-3">
        <!-- Game Mode -->
        <div>
          <label class="block text-xs font-medium mb-1">Mode</label>
          <div class="grid grid-cols-2 gap-1">
            <button
              @click="updateGameMode('single')"
              data-testid="single-player-btn"
              :class="[
                'p-1.5 rounded text-xs font-medium transition-all',
                gameMode === 'single' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              ]"
            >
              🐍 Single
            </button>
            <button
              @click="updateGameMode('multiplayer')"
              data-testid="multiplayer-btn"
              :class="[
                'p-1.5 rounded text-xs font-medium transition-all',
                gameMode === 'multiplayer' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              ]"
            >
              🐍🐍 Multi
            </button>
          </div>
        </div>

        <!-- Basic Settings -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium mb-1">Shape</label>
            <select 
              :value="settings.headShape"
              @change="updateSettings('headShape', ($event.target as HTMLSelectElement).value)"
              class="w-full p-1 bg-gray-700 rounded border border-gray-600 text-white text-xs"
            >
              <option v-for="shape in HEAD_SHAPES" :key="shape" :value="shape">
                {{ shape.charAt(0).toUpperCase() + shape.slice(1) }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium mb-1">Walls</label>
            <select 
              :value="settings.wallPattern"
              @change="updateSettings('wallPattern', ($event.target as HTMLSelectElement).value)"
              data-testid="wall-pattern-select"
              class="w-full p-1 bg-gray-700 rounded border border-gray-600 text-white text-xs"
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

        <!-- Speed & Foods -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium mb-1">Speed</label>
            <div class="flex gap-1">
              <button
                v-for="(_, label) in SPEEDS"
                :key="label"
                @click="updateSettings('speed', label)"
                :data-testid="`speed-${label}`"
                :class="[
                  'flex-1 py-1 rounded text-xs font-medium transition-all',
                  settings.speed === label ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                ]"
              >
                {{ label.charAt(0).toUpperCase() }}
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-medium mb-1">Foods</label>
            <div class="flex gap-1">
              <button
                v-for="num in [1, 2, 3, 4, 5]"
                :key="num"
                @click="updateSettings('maxFoods', num)"
                :data-testid="`max-foods-${num}`"
                :class="[
                  'flex-1 py-1 rounded text-xs font-medium transition-all',
                  settings.maxFoods === num ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                ]"
              >
                {{ num }}
              </button>
            </div>
          </div>
        </div>

        <!-- Canvas Size -->
        <div>
          <label class="block text-xs font-medium mb-1">Canvas Size</label>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="(size, label) in GRID_SIZES"
              :key="label"
              @click="updateSettings('gridSize', size)"
              :data-testid="`grid-size-${label}`"
              :class="[
                'py-1 rounded text-xs font-medium transition-all',
                settings.gridSize === size ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              ]"
            >
              {{ label.charAt(0).toUpperCase() }}
            </button>
          </div>
        </div>
      </div>

      <!-- Column 2: Colors & Features -->
      <div class="space-y-3">
        <!-- Colors -->
        <div>
          <label class="block text-xs font-medium mb-1">Colors</label>
          <div class="space-y-1">
            <div class="flex items-center gap-1">
              <span class="text-xs w-10">{{ gameMode === 'multiplayer' ? 'P1:' : 'Snake:' }}</span>
              <div class="flex gap-1">
                <button
                  v-for="color in HEAD_COLORS.slice(0, 6)"
                  :key="color"
                  @click="updateSettings('headColor', color)"
                  :class="[
                    'w-5 h-5 rounded border transition-all',
                    settings.headColor === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            
            <div v-if="gameMode === 'multiplayer'" class="flex items-center gap-1">
              <span class="text-xs w-10">P2:</span>
              <div class="flex gap-1">
                <button
                  v-for="color in HEAD_COLORS.slice(0, 6)"
                  :key="color"
                  @click="updateSettings('headColor2', color)"
                  :class="[
                    'w-5 h-5 rounded border transition-all',
                    settings.headColor2 === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
            
            <div v-if="gameMode === 'single'" class="flex items-center gap-1">
              <span class="text-xs w-10">BG:</span>
              <div class="flex gap-1">
                <button
                  v-for="color in BG_COLORS.slice(0, 3)"
                  :key="color"
                  @click="updateSettings('bgColor', color)"
                  :class="[
                    'w-5 h-5 rounded border transition-all',
                    settings.bgColor === color ? 'border-white scale-110' : 'border-gray-600'
                  ]"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Audio Compact -->
        <div class="p-2 bg-gray-700 rounded">
          <h4 class="text-xs font-bold mb-2">🔊 Audio</h4>
          <div class="grid grid-cols-2 gap-1 mb-2">
            <button
              @click="updateSettings('soundEnabled', !settings.soundEnabled)"
              data-testid="sound-toggle"
              :class="[
                'p-1 rounded text-xs transition-all',
                settings.soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
              ]"
            >
              SFX
            </button>
            <button
              @click="updateSettings('musicEnabled', !settings.musicEnabled)"
              data-testid="music-toggle"
              :class="[
                'p-1 rounded text-xs transition-all',
                settings.musicEnabled ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
              ]"
            >
              Music
            </button>
          </div>
          
          <div class="space-y-1">
            <div class="flex items-center gap-1">
              <span class="text-xs w-8">SFX:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="settings.soundVolume"
                @input="updateSettings('soundVolume', parseFloat(($event.target as HTMLInputElement).value))"
                data-testid="sound-volume"
                class="flex-1 h-1 slider"
                :disabled="!settings.soundEnabled"
              />
              <span class="text-xs w-6">{{ Math.round(settings.soundVolume * 100) }}</span>
            </div>
            
            <div class="flex items-center gap-1">
              <span class="text-xs w-8">Music:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="settings.musicVolume"
                @input="updateSettings('musicVolume', parseFloat(($event.target as HTMLInputElement).value))"
                data-testid="music-volume"
                class="flex-1 h-1 slider"
                :disabled="!settings.musicEnabled"
              />
              <span class="text-xs w-6">{{ Math.round(settings.musicVolume * 100) }}</span>
            </div>
          </div>
        </div>

        <!-- Features Compact -->
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
            <span class="text-xs">🌀 Teleport</span>
            <button
              @click="updateSettings('teleportEnabled', !settings.teleportEnabled)"
              data-testid="teleport-toggle"
              :class="[
                'relative inline-flex h-3 w-6 items-center rounded-full transition-colors',
                settings.teleportEnabled ? 'bg-green-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-2 w-2 transform rounded-full bg-white transition-transform',
                  settings.teleportEnabled ? 'translate-x-3' : 'translate-x-0.5'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Column 3: Bots -->
      <div class="space-y-3">
        <div class="p-2 bg-gray-700 rounded">
          <h4 class="text-xs font-bold mb-2">🤖 Enemy Bots</h4>
          
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs">Enabled</span>
            <button
              @click="updateSettings('botsEnabled', !settings.botsEnabled)"
              data-testid="bots-toggle"
              :class="[
                'relative inline-flex h-3 w-6 items-center rounded-full transition-colors',
                settings.botsEnabled ? 'bg-red-600' : 'bg-gray-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-2 w-2 transform rounded-full bg-white transition-transform',
                  settings.botsEnabled ? 'translate-x-3' : 'translate-x-0.5'
                ]"
              />
            </button>
          </div>
          
          <div v-if="settings.botsEnabled" class="space-y-2">
            <div>
              <label class="block text-xs font-medium mb-1">Count (0=Random)</label>
              <div class="grid grid-cols-6 gap-1">
                <button
                  v-for="num in [0, 1, 2, 3, 4, 5]"
                  :key="num"
                  @click="updateSettings('botCount', num)"
                  data-testid="`bot-count-${num}`"
                  :class="[
                    'py-1 rounded text-xs font-medium transition-all',
                    settings.botCount === num ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                  ]"
                >
                  {{ num === 0 ? '?' : num }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium mb-1">Difficulty</label>
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="difficulty in ['easy', 'medium', 'hard']"
                  :key="difficulty"
                  @click="updateSettings('botDifficulty', difficulty)"
                  data-testid="`bot-difficulty-${difficulty}`"
                  :class="[
                    'py-1 rounded text-xs font-medium transition-all',
                    settings.botDifficulty === difficulty ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                  ]"
                >
                  {{ difficulty.charAt(0).toUpperCase() }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Challenges (Compact) -->
    <div v-if="todaysChallenge || thisWeeksChallenge || (activeSeasonalEvents && activeSeasonalEvents.length > 0)" class="mt-3">
      <!-- Collapsible Header -->
      <button
        @click="toggleChallenges"
        class="w-full flex items-center justify-between p-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 mb-2"
      >
        <h3 class="text-sm font-bold text-white">🌟 Challenges</h3>
        <div class="flex items-center space-x-1">
          <span class="bg-white bg-opacity-20 text-xs px-1 py-0.5 rounded">
            {{ 
              (todaysChallenge ? 1 : 0) + 
              (thisWeeksChallenge ? 1 : 0) + 
              (activeSeasonalEvents ? activeSeasonalEvents.length : 0)
            }}
          </span>
          <span 
            class="transform transition-transform duration-200 text-white text-xs"
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
    
    <!-- Start Game Button -->
    <button
      @click="$emit('start-game')"
      data-testid="start-game-btn"
      class="w-full mt-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 px-4 rounded hover:from-green-600 hover:to-blue-600 transition transform hover:scale-105"
    >
      🎮 Start Game
    </button>
    
    <!-- Compact Info Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-3">
      <!-- Controls -->
      <div class="p-2 bg-gray-700 rounded">
        <h4 class="text-xs font-bold mb-1">🎮 Controls</h4>
        <div class="text-xs space-y-0.5">
          <div v-if="gameMode === 'single'">Arrow/WASD</div>
          <div v-if="gameMode === 'multiplayer'">
            <div class="text-green-400">P1: Arrows</div>
            <div class="text-blue-400">P2: WASD</div>
          </div>
          <div class="text-yellow-300">SPACE: Pause</div>
        </div>
      </div>
      
      <!-- Food Guide -->
      <div class="p-2 bg-gray-700 rounded">
        <h4 class="text-xs font-bold mb-1">🍎 Foods</h4>
        <div class="text-xs">
          <div class="grid grid-cols-2 gap-0.5">
            <span>🍎 1pt</span><span>🍌 2pt</span>
            <span>🍒 3pt</span><span>🍉 5pt</span>
          </div>
          <div class="mt-1 space-y-0.5">
            <div>🍄 +2 🔥 Bullets</div>
            <div>☠️ -2 💊 -1~3</div>
          </div>
        </div>
      </div>
      
      <!-- Progress Info -->
      <div class="p-2 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded border border-blue-500/30">
        <h4 class="text-xs font-bold mb-1 text-blue-400">💡 Progress</h4>
        <div class="text-xs text-gray-300">
          Earn XP, unlock achievements! 
          <span class="text-purple-400">📊 Progress</span> for details.
        </div>
      </div>
    </div>
    
    <div v-if="highScores.length > 0" class="mt-3 pt-2 border-t border-gray-700">
      <h4 class="text-sm font-bold mb-1">🏆 High Scores</h4>
      <ol class="flex gap-2 justify-center text-xs">
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
