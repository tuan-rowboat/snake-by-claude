<template>
  <Transition name="achievement" appear>
    <div 
      v-if="show" 
      class="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 p-1 rounded-lg shadow-2xl max-w-sm"
    >
      <div class="bg-gray-900 p-4 rounded-lg">
        <div class="flex items-center space-x-3">
          <!-- Achievement Icon -->
          <div class="text-3xl animate-bounce">{{ achievement.icon }}</div>
          
          <!-- Achievement Info -->
          <div class="flex-1">
            <div class="text-sm font-bold text-green-400">Achievement Unlocked!</div>
            <div class="text-white font-medium">{{ achievement.name }}</div>
            <div class="text-xs text-gray-400">{{ achievement.description }}</div>
            
            <!-- Reward Info -->
            <div v-if="achievement.reward" class="text-xs text-yellow-400 mt-1">
              🎁 {{ achievement.reward.name }}
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="close"
            class="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { Achievement } from '../types/progression'

interface Props {
  show: boolean
  achievement: Achievement
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
  // Auto-close after 4 seconds
  if (props.show) {
    setTimeout(() => {
      if (props.show) {
        close()
      }
    }, 4000)
  }
})
</script>

<style scoped>
.achievement-enter-active {
  transition: all 0.5s ease-out;
}

.achievement-leave-active {
  transition: all 0.3s ease-in;
}

.achievement-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.achievement-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>