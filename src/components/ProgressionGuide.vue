<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-2xl max-w-4xl w-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">🎓 Progression Guide</h2>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors text-xl"
      >
        ✕
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

    <!-- How to Unlock Tab -->
    <div v-if="activeTab === 'unlock'" class="space-y-6">
      <!-- Snake Skins -->
      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3 flex items-center">
          🐍 Snake Skins
          <span class="ml-2 text-sm text-gray-400">({{ unlockedSkinsCount }}/6 unlocked)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="skin in skinUnlockGuide" :key="skin.id" class="flex items-center space-x-3 p-2 rounded" :class="skin.unlocked ? 'bg-green-900/30' : 'bg-gray-800'">
            <span class="text-2xl">{{ skin.icon }}</span>
            <div class="flex-1">
              <div class="font-medium" :class="skin.unlocked ? 'text-green-400' : 'text-white'">
                {{ skin.name }}
                <span v-if="skin.unlocked" class="text-green-400 ml-2">✓</span>
                <span v-else class="text-red-400 ml-2">🔒</span>
              </div>
              <div class="text-sm text-gray-400">{{ skin.requirement }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trail Effects -->
      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3 flex items-center">
          ✨ Trail Effects
          <span class="ml-2 text-sm text-gray-400">({{ unlockedTrailsCount }}/6 unlocked)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="trail in trailUnlockGuide" :key="trail.id" class="flex items-center space-x-3 p-2 rounded" :class="trail.unlocked ? 'bg-purple-900/30' : 'bg-gray-800'">
            <span class="text-2xl">{{ trail.icon }}</span>
            <div class="flex-1">
              <div class="font-medium" :class="trail.unlocked ? 'text-purple-400' : 'text-white'">
                {{ trail.name }}
                <span v-if="trail.unlocked" class="text-purple-400 ml-2">✓</span>
                <span v-else class="text-red-400 ml-2">🔒</span>
              </div>
              <div class="text-sm text-gray-400">{{ trail.requirement }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colors -->
      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3 flex items-center">
          🎨 Special Colors
          <span class="ml-2 text-sm text-gray-400">({{ unlockedColorsCount }}/8 unlocked)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="color in colorUnlockGuide" :key="color.id" class="flex items-center space-x-3 p-2 rounded" :class="color.unlocked ? 'bg-yellow-900/30' : 'bg-gray-800'">
            <div class="w-6 h-6 rounded border-2" :style="{ backgroundColor: color.color }" :class="color.unlocked ? 'border-white' : 'border-gray-600'"></div>
            <div class="flex-1">
              <div class="font-medium" :class="color.unlocked ? 'text-yellow-400' : 'text-white'">
                {{ color.name }}
                <span v-if="color.unlocked" class="text-yellow-400 ml-2">✓</span>
                <span v-else class="text-red-400 ml-2">🔒</span>
              </div>
              <div class="text-sm text-gray-400">{{ color.requirement }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Head Shapes -->
      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3 flex items-center">
          🔷 Head Shapes
          <span class="ml-2 text-sm text-gray-400">({{ unlockedHeadShapesCount }}/5 unlocked)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="shape in headShapeUnlockGuide" :key="shape.id" class="flex items-center space-x-3 p-2 rounded" :class="shape.unlocked ? 'bg-blue-900/30' : 'bg-gray-800'">
            <span class="text-2xl">{{ shape.icon }}</span>
            <div class="flex-1">
              <div class="font-medium" :class="shape.unlocked ? 'text-blue-400' : 'text-white'">
                {{ shape.name }}
                <span v-if="shape.unlocked" class="text-blue-400 ml-2">✓</span>
                <span v-else class="text-red-400 ml-2">🔒</span>
              </div>
              <div class="text-sm text-gray-400">{{ shape.requirement }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Guide Tab -->
    <div v-if="activeTab === 'achievements'" class="space-y-4">
      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">🏆 Achievement Categories</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="category in achievementCategories" :key="category.type" class="bg-gray-800 p-3 rounded">
            <div class="flex items-center mb-2">
              <span class="text-xl mr-2">{{ category.icon }}</span>
              <span class="font-medium">{{ category.name }}</span>
            </div>
            <div class="text-sm text-gray-400 mb-2">{{ category.description }}</div>
            <div class="text-xs text-blue-400">Tips: {{ category.tips }}</div>
          </div>
        </div>
      </div>

      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">💡 Achievement Tips</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start">
            <span class="text-green-400 mr-2">•</span>
            <span><strong>Perfect Games:</strong> Avoid hitting walls and score 500+ points in a single game</span>
          </li>
          <li class="flex items-start">
            <span class="text-blue-400 mr-2">•</span>
            <span><strong>Speed Demon:</strong> Play on fast speed to improve your reflexes and earn this achievement faster</span>
          </li>
          <li class="flex items-start">
            <span class="text-purple-400 mr-2">•</span>
            <span><strong>Bullet Master:</strong> Use bullet foods strategically to break walls and clear paths</span>
          </li>
          <li class="flex items-start">
            <span class="text-orange-400 mr-2">•</span>
            <span><strong>Teleport Expert:</strong> Enable teleport mode and use T/R keys for tactical repositioning</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Daily Challenges Tab -->
    <div v-if="activeTab === 'challenges'" class="space-y-4">
      <div class="bg-gradient-to-r from-purple-800 to-pink-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">🌟 Daily Challenge System</h3>
        <div class="text-sm space-y-2">
          <p>• <strong>New Challenge Daily:</strong> Fresh challenges appear every day at midnight</p>
          <p>• <strong>5 Challenge Types:</strong> Score targets, survival time, food collection, bullet usage, teleport mastery</p>
          <p>• <strong>Bonus Rewards:</strong> Extra XP and sometimes exclusive unlockables</p>
          <p>• <strong>Progress Tracking:</strong> Your progress carries over between game sessions</p>
        </div>
      </div>

      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">📋 Challenge Types</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="challenge in challengeTypes" :key="challenge.type" class="bg-gray-800 p-3 rounded">
            <div class="flex items-center mb-2">
              <span class="text-xl mr-2">{{ challenge.icon }}</span>
              <span class="font-medium">{{ challenge.name }}</span>
            </div>
            <div class="text-sm text-gray-400 mb-2">{{ challenge.description }}</div>
            <div class="text-xs text-yellow-400">Strategy: {{ challenge.strategy }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Level System Tab -->
    <div v-if="activeTab === 'levels'" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-800 to-purple-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">📊 Experience & Leveling</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium mb-2 text-blue-400">💰 How to Earn XP</h4>
            <ul class="text-sm space-y-1">
              <li>• Score points: <span class="text-green-400">1 XP per 10 points</span></li>
              <li>• Survive time: <span class="text-green-400">1 XP per second</span></li>
              <li>• Eat food: <span class="text-green-400">2 XP per food</span></li>
              <li>• Unlock achievements: <span class="text-green-400">50 XP each</span></li>
              <li>• Complete daily challenges: <span class="text-green-400">80-150 XP</span></li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-2 text-purple-400">🎁 Bonus XP</h4>
            <ul class="text-sm space-y-1">
              <li>• Score 1000+ points: <span class="text-yellow-400">+50 XP</span></li>
              <li>• Survive 1 minute: <span class="text-yellow-400">+30 XP</span></li>
              <li>• Snake length 20+: <span class="text-yellow-400">+25 XP</span></li>
              <li>• Perfect game (500+ pts, no walls hit): <span class="text-yellow-400">+50 XP</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-bold mb-3">🎁 Level Rewards</h3>
        <div class="space-y-2 text-sm">
          <div v-for="reward in levelRewards" :key="reward.level" class="flex items-center justify-between p-2 rounded" :class="currentLevel >= reward.level ? 'bg-green-900/30' : 'bg-gray-800'">
            <div class="flex items-center">
              <span class="text-lg mr-2">{{ reward.icon }}</span>
              <span class="font-medium">Level {{ reward.level }}</span>
            </div>
            <div class="text-right">
              <div class="font-medium" :class="currentLevel >= reward.level ? 'text-green-400' : 'text-gray-400'">
                {{ reward.reward }}
              </div>
              <div v-if="currentLevel >= reward.level" class="text-green-400 text-xs">✓ Unlocked</div>
              <div v-else class="text-red-400 text-xs">🔒 Locked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  unlockedSkins: string[]
  unlockedTrails: string[]
  unlockedColors: string[]
  unlockedHeadShapes: string[]
  currentLevel: number
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const activeTab = ref('unlock')

const tabs = [
  { id: 'unlock', name: 'Unlock Guide', icon: '🔓' },
  { id: 'achievements', name: 'Achievements', icon: '🏆' },
  { id: 'challenges', name: 'Daily Challenges', icon: '🌟' },
  { id: 'levels', name: 'Level System', icon: '📊' }
]

// Computed counts
const unlockedSkinsCount = computed(() => props.unlockedSkins.length)
const unlockedTrailsCount = computed(() => props.unlockedTrails.length)
const unlockedColorsCount = computed(() => props.unlockedColors.length)
const unlockedHeadShapesCount = computed(() => props.unlockedHeadShapes.length)

// Unlock guides
const skinUnlockGuide = computed(() => [
  { id: 'solid', name: 'Classic Snake', icon: '🐍', requirement: 'Available from start', unlocked: props.unlockedSkins.includes('solid') },
  { id: 'stripes', name: 'Striped Snake', icon: '🦓', requirement: 'Reach Level 5', unlocked: props.unlockedSkins.includes('stripes') },
  { id: 'spots', name: 'Spotted Snake', icon: '🐆', requirement: 'Reach Level 20', unlocked: props.unlockedSkins.includes('spots') },
  { id: 'gradient', name: 'Gradient Snake', icon: '🌈', requirement: 'Score 1000 points in a single game', unlocked: props.unlockedSkins.includes('gradient') },
  { id: 'rainbow', name: 'Rainbow Snake', icon: '🌟', requirement: 'Complete 5 perfect games', unlocked: props.unlockedSkins.includes('rainbow') },
  { id: 'neon', name: 'Neon Snake', icon: '💫', requirement: 'Reach Level 50', unlocked: props.unlockedSkins.includes('neon') }
])

const trailUnlockGuide = computed(() => [
  { id: 'basic', name: 'Basic Trail', icon: '✨', requirement: 'Available from start', unlocked: props.unlockedTrails.includes('basic') },
  { id: 'sparkles', name: 'Sparkle Trail', icon: '💫', requirement: 'Reach Level 10', unlocked: props.unlockedTrails.includes('sparkles') },
  { id: 'fire', name: 'Fire Trail', icon: '🔥', requirement: 'Break 50 walls with bullets', unlocked: props.unlockedTrails.includes('fire') },
  { id: 'ice', name: 'Ice Trail', icon: '❄️', requirement: 'Survive 2 minutes in a single game', unlocked: props.unlockedTrails.includes('ice') },
  { id: 'electric', name: 'Electric Trail', icon: '⚡', requirement: 'Use teleport 100 times total', unlocked: props.unlockedTrails.includes('electric') },
  { id: 'shadow', name: 'Shadow Trail', icon: '🌑', requirement: 'Reach Level 30', unlocked: props.unlockedTrails.includes('shadow') }
])

const colorUnlockGuide = computed(() => [
  { id: '#00ff00', name: 'Classic Green', color: '#00ff00', requirement: 'Available from start', unlocked: props.unlockedColors.includes('#00ff00') },
  { id: '#0080ff', name: 'Ocean Blue', color: '#0080ff', requirement: 'Available from start', unlocked: props.unlockedColors.includes('#0080ff') },
  { id: '#ff0000', name: 'Ruby Red', color: '#ff0000', requirement: 'Available from start', unlocked: props.unlockedColors.includes('#ff0000') },
  { id: '#ffd700', name: 'Golden', color: '#ffd700', requirement: 'Reach 500 points (High Scorer achievement)', unlocked: props.unlockedColors.includes('#ffd700') },
  { id: '#ff6b6b', name: 'Coral Red', color: '#ff6b6b', requirement: 'Reach Level 15', unlocked: props.unlockedColors.includes('#ff6b6b') },
  { id: '#9c27b0', name: 'Portal Purple', color: '#9c27b0', requirement: 'Complete daily teleport challenge', unlocked: props.unlockedColors.includes('#9c27b0') },
  { id: '#00ffff', name: 'Cyan', color: '#00ffff', requirement: 'Eat 100 foods total', unlocked: props.unlockedColors.includes('#00ffff') },
  { id: '#ff6600', name: 'Fire Orange', color: '#ff6600', requirement: 'Fire 200 bullets total', unlocked: props.unlockedColors.includes('#ff6600') }
])

const headShapeUnlockGuide = computed(() => [
  { id: 'square', name: 'Square Head', icon: '⬜', requirement: 'Available from start', unlocked: props.unlockedHeadShapes.includes('square') },
  { id: 'circle', name: 'Circle Head', icon: '⭕', requirement: 'Available from start', unlocked: props.unlockedHeadShapes.includes('circle') },
  { id: 'triangle', name: 'Triangle Head', icon: '🔺', requirement: 'Play 10 games total', unlocked: props.unlockedHeadShapes.includes('triangle') },
  { id: 'diamond', name: 'Diamond Head', icon: '💎', requirement: 'Reach Level 25', unlocked: props.unlockedHeadShapes.includes('diamond') },
  { id: 'star', name: 'Star Head', icon: '⭐', requirement: 'Reach Level 30', unlocked: props.unlockedHeadShapes.includes('star') }
])

// Achievement categories
const achievementCategories = [
  {
    type: 'score',
    icon: '🎯',
    name: 'Score-Based',
    description: 'Reach specific score milestones',
    tips: 'Focus on eating high-value foods and building long chains'
  },
  {
    type: 'games_played',
    icon: '🎮',
    name: 'Persistence',
    description: 'Play multiple games',
    tips: 'Keep playing to naturally unlock these over time'
  },
  {
    type: 'foods_eaten',
    icon: '🍎',
    name: 'Food Collection',
    description: 'Eat various types of food',
    tips: 'Try different game modes and food settings for variety'
  },
  {
    type: 'walls_broken',
    icon: '💥',
    name: 'Destruction',
    description: 'Break walls using bullets',
    tips: 'Collect bullet foods and use them strategically on walls'
  },
  {
    type: 'survival_time',
    icon: '⏱️',
    name: 'Survival',
    description: 'Survive for extended periods',
    tips: 'Play defensively and use teleportation to avoid danger'
  },
  {
    type: 'perfect_games',
    icon: '⭐',
    name: 'Mastery',
    description: 'Complete flawless games',
    tips: 'Avoid walls, score 500+ points, and play carefully'
  },
  {
    type: 'bullet_master',
    icon: '🎯',
    name: 'Marksmanship',
    description: 'Fire bullets effectively',
    tips: 'Collect bullet foods and use them on walls and strategic targets'
  },
  {
    type: 'teleport_expert',
    icon: '🌀',
    name: 'Teleportation',
    description: 'Master teleport abilities',
    tips: 'Enable teleport mode and use T/R keys frequently'
  }
]

// Challenge types
const challengeTypes = [
  {
    type: 'score',
    icon: '🎯',
    name: 'Score Master',
    description: 'Reach a specific score target',
    strategy: 'Focus on high-value foods and avoid dying early'
  },
  {
    type: 'survival',
    icon: '⏱️',
    name: 'Endurance Test',
    description: 'Survive for a set amount of time',
    strategy: 'Play defensively, use teleportation, and avoid risks'
  },
  {
    type: 'food_collection',
    icon: '🍎',
    name: 'Hungry Snake',
    description: 'Eat a certain number of foods',
    strategy: 'Focus on food collection over score, play multiple games'
  },
  {
    type: 'bullet_usage',
    icon: '🔥',
    name: 'Sharp Shooter',
    description: 'Fire a specific number of bullets',
    strategy: 'Collect bullet foods and use them frequently'
  },
  {
    type: 'teleport_usage',
    icon: '🌀',
    name: 'Portal Master',
    description: 'Use teleportation abilities',
    strategy: 'Enable teleport mode and use it strategically'
  }
]

// Level rewards
const levelRewards = [
  { level: 5, icon: '🦓', reward: 'Striped Snake Skin' },
  { level: 10, icon: '✨', reward: 'Sparkle Trail Effect' },
  { level: 15, icon: '🎨', reward: 'Coral Red Color' },
  { level: 20, icon: '🐆', reward: 'Spotted Snake Skin' },
  { level: 25, icon: '🔥', reward: 'Fire Trail Effect' },
  { level: 30, icon: '⭐', reward: 'Star Head Shape' },
  { level: 35, icon: '💎', reward: 'Diamond Head Shape' },
  { level: 40, icon: '🌈', reward: 'Rainbow Snake Skin' },
  { level: 45, icon: '⚡', reward: 'Electric Trail Effect' },
  { level: 50, icon: '💫', reward: 'Neon Snake Skin' }
]
</script>