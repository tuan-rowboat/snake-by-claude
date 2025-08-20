<template>
  <Transition name="level-up" appear>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl">
        <div class="bg-gray-900 p-8 rounded-xl text-center max-w-md">
          <!-- Level Up Animation -->
          <div class="mb-6">
            <div class="text-6xl animate-bounce">🎉</div>
            <div class="text-4xl font-bold text-yellow-400 mt-2 animate-pulse">
              LEVEL UP!
            </div>
          </div>
          
          <!-- Level Information -->
          <div class="mb-6">
            <div class="text-2xl text-white mb-2">
              Level {{ newLevel }}
            </div>
            <div class="text-lg text-gray-300">
              +{{ experienceGained }} XP Gained
            </div>
          </div>
          
          <!-- Unlocked Rewards -->
          <div v-if="unlockedRewards.length > 0" class="mb-6">
            <div class="text-lg font-bold text-green-400 mb-3">🎁 New Unlocks!</div>
            <div class="space-y-2">
              <div 
                v-for="reward in unlockedRewards" 
                :key="reward.id"
                class="bg-gray-800 p-3 rounded-lg border border-green-500"
              >
                <div class="font-medium text-green-400">{{ reward.name }}</div>
                <div class="text-sm text-gray-400 capitalize">{{ reward.type.replace('_', ' ') }}</div>
              </div>
            </div>
          </div>
          
          <!-- Continue Button -->
          <button
            @click="close"
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700 transition transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { UnlockableReward } from '../types/progression'

interface Props {
  show: boolean
  newLevel: number
  experienceGained: number
  unlockedRewards: UnlockableReward[]
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const close = (): void => {
  emit('close')
}

onMounted(() => {
  // Auto-close after 5 seconds if user doesn't interact
  if (props.show) {
    setTimeout(() => {
      if (props.show) {
        close()
      }
    }, 5000)
  }
})
</script>

<style scoped>
.level-up-enter-active {
  transition: all 0.6s ease-out;
}

.level-up-leave-active {
  transition: all 0.3s ease-in;
}

.level-up-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-50px);
}

.level-up-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>