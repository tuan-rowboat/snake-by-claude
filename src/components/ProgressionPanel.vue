<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-2xl max-w-4xl w-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Player Progress</h2>
      <button
        @click="handleGuideClick"
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
        type="button"
      >
        📖 Guide
      </button>
    </div>
    
    <!-- Navigation Tabs -->
    <div class="flex mb-4 bg-gray-700 rounded-lg p-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex-1 py-2 px-4 rounded text-sm font-medium transition-all',
          activeTab === tab.id 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
        ]"
      >
        {{ tab.icon }} {{ tab.name }}
      </button>
    </div>

    <!-- Level & Experience Tab -->
    <div v-if="activeTab === 'level'" class="space-y-4">
      <div class="text-center mb-6">
        <div class="text-3xl font-bold text-blue-400">Level {{ playerLevel.level }}</div>
        <div class="text-sm text-gray-400 mt-2">
          {{ playerLevel.experience }} / {{ playerLevel.experienceToNext }} XP
        </div>
        
        <!-- Experience Bar -->
        <div class="w-full bg-gray-700 rounded-full h-4 mt-3">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            :style="{ width: experiencePercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Player Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="stat in displayStats" :key="stat.key" class="bg-gray-700 p-3 rounded text-center">
          <div class="text-lg font-bold text-blue-400">{{ stat.value }}</div>
          <div class="text-xs text-gray-400">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Daily Challenge -->
      <div v-if="todaysChallenge" class="bg-gradient-to-r from-purple-800 to-pink-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-2">🌟 Daily Challenge</h3>
        <div class="text-sm mb-2">{{ todaysChallenge.title }}</div>
        <div class="text-xs text-gray-300 mb-3">{{ todaysChallenge.objective }}</div>
        
        <!-- Challenge Progress -->
        <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            class="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            :style="{ width: challengePercentage + '%' }"
          ></div>
        </div>
        <div class="text-xs text-center">
          {{ todaysChallenge.progress }} / {{ todaysChallenge.target }}
          <span v-if="todaysChallenge.completed" class="text-green-400 ml-2">✓ Completed!</span>
        </div>
        
        <div class="text-xs text-yellow-400 mt-2">
          Reward: {{ todaysChallenge.reward.experience }} XP
          <span v-if="todaysChallenge.reward.unlockable">
            + {{ todaysChallenge.reward.unlockable.name }}
          </span>
        </div>
      </div>

      <!-- Weekly Challenge -->
      <div v-if="thisWeeksChallenge" class="bg-gradient-to-r from-indigo-800 to-purple-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-2">
          🏆 Weekly Challenge 
          <span :class="[
            'text-xs px-2 py-1 rounded',
            thisWeeksChallenge.difficulty === 'easy' ? 'bg-green-600' :
            thisWeeksChallenge.difficulty === 'medium' ? 'bg-yellow-600' :
            thisWeeksChallenge.difficulty === 'hard' ? 'bg-red-600' : 'bg-purple-600'
          ]">{{ thisWeeksChallenge.difficulty.toUpperCase() }}</span>
        </h3>
        <div class="text-sm mb-2">{{ thisWeeksChallenge.title }}</div>
        <div class="text-xs text-gray-300 mb-3">{{ thisWeeksChallenge.objective }}</div>
        
        <!-- Challenge Progress -->
        <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div 
            class="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full transition-all duration-500"
            :style="{ width: weeklyPercentage + '%' }"
          ></div>
        </div>
        <div class="text-xs text-center">
          {{ thisWeeksChallenge.progress }} / {{ thisWeeksChallenge.target }}
          <span v-if="thisWeeksChallenge.completed" class="text-green-400 ml-2">✓ Completed!</span>
        </div>
        
        <div class="text-xs text-indigo-300 mt-2">
          Reward: {{ thisWeeksChallenge.reward.experience }} XP
          <span v-if="thisWeeksChallenge.reward.unlockable">
            + {{ thisWeeksChallenge.reward.unlockable.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Achievements Tab -->
    <div v-if="activeTab === 'achievements'" class="space-y-3">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        :class="[
          'p-3 rounded-lg border-2 transition-all',
          achievement.unlocked 
            ? 'bg-green-900 border-green-500' 
            : achievement.milestone 
              ? 'bg-purple-900 border-purple-500' 
              : 'bg-gray-700 border-gray-600'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ achievement.icon }}</span>
            <div class="flex-1">
              <div :class="[
                'font-medium flex items-center gap-2',
                achievement.unlocked ? 'text-green-400' : 'text-white'
              ]">
                {{ achievement.name }}
                <span v-if="achievement.milestone" class="text-xs px-2 py-1 bg-purple-600 rounded text-purple-200">
                  MILESTONE
                </span>
              </div>
              <div class="text-sm text-gray-400">{{ achievement.description }}</div>
              
              <!-- Multi-step Achievement Steps -->
              <div v-if="achievement.steps && achievement.steps.length > 0" class="mt-2 space-y-1">
                <div class="text-xs text-purple-400 font-medium">Requirements:</div>
                <div 
                  v-for="step in achievement.steps" 
                  :key="step.id"
                  :class="[
                    'text-xs flex items-center justify-between px-2 py-1 rounded',
                    step.completed ? 'bg-green-800 text-green-200' : 'bg-gray-600 text-gray-300'
                  ]"
                >
                  <span>{{ step.name }}</span>
                  <span :class="step.completed ? 'text-green-400' : 'text-gray-400'">
                    {{ step.completed ? '✓' : `${step.progress}/${step.requirement}` }}
                  </span>
                </div>
              </div>
              
              <!-- Achievement Reward -->
              <div v-if="achievement.reward" class="text-xs text-yellow-400 mt-1">
                Unlocks: {{ achievement.reward.name }}
              </div>
            </div>
          </div>
          
          <div class="text-right">
            <div v-if="achievement.unlocked" class="text-green-400 font-bold">
              ✓ UNLOCKED
            </div>
            <div v-else-if="achievement.steps && achievement.steps.length > 0" class="text-sm">
              <div class="text-gray-400">{{ achievement.progress }} / {{ achievement.requirement }} steps</div>
              
              <!-- Progress Bar -->
              <div class="w-20 bg-gray-600 rounded-full h-2 mt-1">
                <div 
                  class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: (achievement.progress / achievement.requirement * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div v-else class="text-sm">
              <div class="text-gray-400">{{ achievement.progress }} / {{ achievement.requirement }}</div>
              
              <!-- Progress Bar -->
              <div class="w-20 bg-gray-600 rounded-full h-2 mt-1">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: (achievement.progress / achievement.requirement * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customization Tab -->
    <div v-if="activeTab === 'customization'" class="space-y-6">
      <!-- Quick Instructions -->
      <div class="bg-blue-900/30 p-3 rounded-lg border border-blue-500">
        <div class="flex items-center mb-2">
          <span class="text-xl mr-2">💡</span>
          <span class="font-medium text-blue-400">How to Unlock More Items</span>
        </div>
        <div class="text-sm text-gray-300">
          • <strong>Play games</strong> to earn XP and level up for automatic unlocks
          • <strong>Complete achievements</strong> for special rewards and unlockables  
          • <strong>Finish daily challenges</strong> for bonus XP and exclusive items
          • <strong>Click the "📖 Guide" button above</strong> for detailed unlock requirements
        </div>
      </div>
      <!-- Snake Skins -->
      <div>
        <h3 class="text-lg font-bold mb-3">🐍 Snake Skins</h3>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div
            v-for="skin in availableSkins"
            :key="skin.id"
            @click="selectSkin(skin.id)"
            :class="[
              'aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all',
              selectedSkin === skin.id 
                ? 'border-blue-500 bg-blue-900' 
                : skin.unlocked 
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-400' 
                  : 'border-gray-800 bg-gray-800 opacity-50 cursor-not-allowed'
            ]"
          >
            <div class="h-full flex flex-col items-center justify-center">
              <div class="text-2xl mb-1">{{ getSkinIcon(skin.pattern) }}</div>
              <div class="text-xs text-center">{{ skin.name }}</div>
              <div v-if="!skin.unlocked" class="text-xs text-red-400 mt-1" :title="skin.requirement || 'Requirements unknown'">🔒</div>
              <div v-if="selectedSkin === skin.id" class="text-xs text-blue-400 mt-1">✓</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trail Effects -->
      <div>
        <h3 class="text-lg font-bold mb-3">✨ Trail Effects</h3>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div
            v-for="trail in availableTrails"
            :key="trail.id"
            @click="selectTrail(trail.id)"
            :class="[
              'aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all',
              selectedTrail === trail.id 
                ? 'border-purple-500 bg-purple-900' 
                : trail.unlocked 
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-400' 
                  : 'border-gray-800 bg-gray-800 opacity-50 cursor-not-allowed'
            ]"
          >
            <div class="h-full flex flex-col items-center justify-center">
              <div class="text-2xl mb-1">{{ getTrailIcon(trail.effect) }}</div>
              <div class="text-xs text-center">{{ trail.name }}</div>
              <div v-if="!trail.unlocked" class="text-xs text-red-400 mt-1" :title="trail.requirement || 'Requirements unknown'">🔒</div>
              <div v-if="selectedTrail === trail.id" class="text-xs text-purple-400 mt-1">✓</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Color Palette -->
      <div>
        <h3 class="text-lg font-bold mb-3">🎨 Unlocked Colors</h3>
        <div class="grid grid-cols-8 gap-2">
          <div
            v-for="color in unlockedColors"
            :key="color"
            :style="{ backgroundColor: color }"
            class="aspect-square rounded border-2 border-gray-600 hover:border-white transition-all cursor-pointer"
            :title="`Color: ${color}`"
          ></div>
        </div>
      </div>
    </div>

    <!-- Statistics Tab -->
    <div v-if="activeTab === 'stats'" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Game Statistics -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold mb-3">📊 Game Statistics</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Games:</span>
              <span class="font-bold">{{ stats.totalGames }}</span>
            </div>
            <div class="flex justify-between">
              <span>Highest Score:</span>
              <span class="font-bold text-yellow-400">{{ stats.highestScore }}</span>
            </div>
            <div class="flex justify-between">
              <span>Total Score:</span>
              <span class="font-bold">{{ stats.totalScore.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Perfect Games:</span>
              <span class="font-bold text-green-400">{{ stats.perfectGames }}</span>
            </div>
            <div class="flex justify-between">
              <span>Favorite Mode:</span>
              <span class="font-bold capitalize">{{ stats.favoriteGameMode }}</span>
            </div>
          </div>
        </div>

        <!-- Action Statistics -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-bold mb-3">🎯 Action Statistics</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Foods Eaten:</span>
              <span class="font-bold">{{ stats.totalFoodsEaten }}</span>
            </div>
            <div class="flex justify-between">
              <span>Walls Broken:</span>
              <span class="font-bold">{{ stats.totalWallsBroken }}</span>
            </div>
            <div class="flex justify-between">
              <span>Bullets Fired:</span>
              <span class="font-bold">{{ stats.totalBulletsFired }}</span>
            </div>
            <div class="flex justify-between">
              <span>Teleports Used:</span>
              <span class="font-bold">{{ stats.totalTeleports }}</span>
            </div>
            <div class="flex justify-between">
              <span>Longest Snake:</span>
              <span class="font-bold text-blue-400">{{ stats.longestSnake }} segments</span>
            </div>
            <div class="flex justify-between">
              <span>Avg. Game Time:</span>
              <span class="font-bold">{{ formatTime(stats.averageGameTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Summary -->
      <div class="bg-gradient-to-r from-blue-800 to-purple-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">🏆 Progress Summary</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-400">{{ playerLevel.level }}</div>
            <div class="text-xs text-gray-300">Player Level</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-400">{{ unlockedAchievements.length }}</div>
            <div class="text-xs text-gray-300">Achievements</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-400">{{ totalUnlockables }}</div>
            <div class="text-xs text-gray-300">Unlocked Items</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-400">{{ playerLevel.totalExperience }}</div>
            <div class="text-xs text-gray-300">Total XP</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Close Button -->
    <div class="flex justify-center mt-6">
      <button
        @click="$emit('close')"
        class="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-2 px-6 rounded hover:from-gray-700 hover:to-gray-800 transition transform hover:scale-105"
      >
        Close
      </button>
    </div>
    
    <!-- Progression Guide Modal -->
    <div v-if="showGuide" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50" @click.self="showGuide = false">
      <ProgressionGuide
        :unlocked-skins="unlockedSkins"
        :unlocked-trails="unlockedTrails"
        :unlocked-colors="unlockedColors"
        :unlocked-head-shapes="unlockedHeadShapes"
        :current-level="playerLevel.level"
        @close="showGuide = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { 
  Achievement, 
  PlayerLevel, 
  PlayerStats, 
  DailyChallenge,
  WeeklyChallenge,
  SnakeSkin,
  TrailEffect
} from '../types/progression'
import ProgressionGuide from './ProgressionGuide.vue'

interface Props {
  playerLevel: PlayerLevel
  achievements: Achievement[]
  stats: PlayerStats
  todaysChallenge: DailyChallenge | null
  thisWeeksChallenge: WeeklyChallenge | null
  unlockedSkins: string[]
  unlockedTrails: string[]
  unlockedColors: string[]
  unlockedHeadShapes: string[]
  selectedSkin: string
  selectedTrail: string
}

interface Emits {
  (e: 'close'): void
  (e: 'select-skin', skinId: string): void
  (e: 'select-trail', trailId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref('level')
const showGuide = ref(false)

const tabs = [
  { id: 'level', name: 'Level', icon: '📊' },
  { id: 'achievements', name: 'Achievements', icon: '🏆' },
  { id: 'customization', name: 'Customize', icon: '🎨' },
  { id: 'stats', name: 'Statistics', icon: '📈' }
]

// Available skins and trails data
const availableSkins: SnakeSkin[] = [
  { id: 'solid', name: 'Classic', description: 'Classic solid snake', pattern: 'solid', unlocked: true },
  { id: 'stripes', name: 'Stripes', description: 'Striped pattern', pattern: 'stripes', unlocked: false, requirement: 'Reach Level 5' },
  { id: 'spots', name: 'Spots', description: 'Spotted pattern', pattern: 'spots', unlocked: false, requirement: 'Reach Level 20' },
  { id: 'gradient', name: 'Gradient', description: 'Gradient effect', pattern: 'gradient', unlocked: false, requirement: 'Score 1000 points' },
  { id: 'rainbow', name: 'Rainbow', description: 'Rainbow colors', pattern: 'rainbow', unlocked: false, requirement: 'Complete 5 perfect games' },
  { id: 'neon', name: 'Neon', description: 'Neon glow effect', pattern: 'neon', unlocked: false, requirement: 'Reach Level 50' }
]

const availableTrails: TrailEffect[] = [
  { id: 'basic', name: 'Basic', description: 'Basic trail', effect: 'sparkles', unlocked: true },
  { id: 'sparkles', name: 'Sparkles', description: 'Sparkling trail', effect: 'sparkles', unlocked: false, requirement: 'Reach Level 10' },
  { id: 'fire', name: 'Fire', description: 'Fiery trail', effect: 'fire', unlocked: false, requirement: 'Break 50 walls' },
  { id: 'ice', name: 'Ice', description: 'Icy trail', effect: 'ice', unlocked: false, requirement: 'Survive 2 minutes' },
  { id: 'electric', name: 'Electric', description: 'Electric effect', effect: 'electric', unlocked: false, requirement: 'Use teleport 100 times' },
  { id: 'shadow', name: 'Shadow', description: 'Shadow trail', effect: 'shadow', unlocked: false, requirement: 'Reach Level 30' }
]

// Update unlocked status based on props
availableSkins.forEach(skin => {
  skin.unlocked = props.unlockedSkins.includes(skin.id)
})

availableTrails.forEach(trail => {
  trail.unlocked = props.unlockedTrails.includes(trail.id)
})

// Computed properties
const experiencePercentage = computed(() => {
  return (props.playerLevel.experience / props.playerLevel.experienceToNext) * 100
})

const challengePercentage = computed(() => {
  if (!props.todaysChallenge) return 0
  return Math.min(100, (props.todaysChallenge.progress / props.todaysChallenge.target) * 100)
})

const weeklyPercentage = computed(() => {
  if (!props.thisWeeksChallenge) return 0
  return Math.min(100, (props.thisWeeksChallenge.progress / props.thisWeeksChallenge.target) * 100)
})

const unlockedAchievements = computed(() => {
  return props.achievements.filter(a => a.unlocked)
})

const totalUnlockables = computed(() => {
  return props.unlockedSkins.length + props.unlockedTrails.length + props.unlockedColors.length
})

const displayStats = computed(() => [
  { key: 'games', label: 'Games Played', value: props.stats.totalGames },
  { key: 'score', label: 'High Score', value: props.stats.highestScore },
  { key: 'foods', label: 'Foods Eaten', value: props.stats.totalFoodsEaten },
  { key: 'survival', label: 'Total Time', value: formatTime(props.stats.totalSurvivalTime) }
])

// Methods
const handleGuideClick = (): void => {
  showGuide.value = true
}

const selectSkin = (skinId: string): void => {
  const skin = availableSkins.find(s => s.id === skinId)
  if (skin?.unlocked) {
    emit('select-skin', skinId)
  }
}

const selectTrail = (trailId: string): void => {
  const trail = availableTrails.find(t => t.id === trailId)
  if (trail?.unlocked) {
    emit('select-trail', trailId)
  }
}

const getSkinIcon = (pattern: string): string => {
  const icons: Record<string, string> = {
    solid: '🐍',
    stripes: '🦓',
    spots: '🐆',
    gradient: '🌈',
    rainbow: '🌟',
    neon: '💫'
  }
  return icons[pattern] || '🐍'
}

const getTrailIcon = (effect: string): string => {
  const icons: Record<string, string> = {
    sparkles: '✨',
    fire: '🔥',
    ice: '❄️',
    electric: '⚡',
    rainbow: '🌈',
    shadow: '🌑'
  }
  return icons[effect] || '✨'
}

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
</script>