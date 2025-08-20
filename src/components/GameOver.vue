<template>
  <div class="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
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
    
    <div v-if="isNewHighScore && gameMode === 'single'" class="text-yellow-400 text-xl mb-4 animate-pulse">
      🏆 New High Score! 🏆
    </div>
    
    <!-- Progression Summary -->
    <div class="mb-6 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
      <div class="text-sm font-medium text-purple-400 mb-1">📈 Progress Earned</div>
      <div class="text-xs text-gray-300">
        XP gained, achievements progress, and unlocks are tracked automatically.
        <br>
        <span class="text-purple-400">Check your "📊 Progress" in the main menu!</span>
      </div>
    </div>
    
    <div class="flex gap-4">
      <button
        @click="$emit('restart-game')"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
      >
        Play Again
      </button>
      <button
        @click="$emit('return-to-menu')"
        class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
      >
        Main Menu
      </button>
    </div>
    
    <div v-if="highScores.length > 0 && gameMode === 'single'" class="mt-6 pt-6 border-t border-gray-700">
      <h3 class="text-lg font-bold mb-2">🏆 High Scores</h3>
      <ol class="space-y-1">
        <li v-for="(s, i) in highScores" :key="i" :class="['flex justify-between', s === score ? 'text-green-400 font-bold' : '']">
          <span>{{ ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] }} </span>
          <span class="font-mono">{{ s }} pts</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameMode, Winner } from '../types/game'

interface Props {
  gameMode: GameMode
  score: number
  score2: number
  winner: Winner
  highScores: number[]
  isNewHighScore: boolean
}

interface Emits {
  (e: 'restart-game'): void
  (e: 'return-to-menu'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
