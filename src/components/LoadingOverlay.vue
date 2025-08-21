<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-overlay">
      <!-- 加载遮罩 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
          <!-- 加载动画 -->
          <div class="flex flex-col items-center">
            <!-- 自定义加载器或默认spinner -->
            <div v-if="type === 'spinner'" class="loading-spinner-large mb-4"></div>
            
            <div v-else-if="type === 'dots'" class="loading-dots mb-4">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            
            <div v-else-if="type === 'pulse'" class="loading-pulse mb-4">
              <div class="pulse-circle"></div>
            </div>
            
            <div v-else-if="type === 'progress'" class="w-full mb-4">
              <div class="progress-bar">
                <div 
                  class="progress-fill transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
              <div class="text-center text-sm text-gray-600 mt-2">
                {{ progress }}%
              </div>
            </div>

            <!-- 加载文本 -->
            <h3 class="text-lg font-semibold text-gray-900 mb-2 text-center">
              {{ title }}
            </h3>
            
            <p v-if="message" class="text-gray-600 text-center text-sm mb-4">
              {{ message }}
            </p>

            <!-- 进度步骤 -->
            <div v-if="steps && steps.length > 0" class="w-full">
              <div class="space-y-2">
                <div
                  v-for="(step, index) in steps"
                  :key="index"
                  class="flex items-center text-sm"
                  :class="{
                    'text-green-600': index < currentStep,
                    'text-blue-600': index === currentStep,
                    'text-gray-400': index > currentStep
                  }"
                >
                  <div class="w-4 h-4 mr-3 flex-shrink-0">
                    <svg v-if="index < currentStep" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <div v-else-if="index === currentStep" class="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <div v-else class="w-2 h-2 bg-current rounded-full opacity-30"></div>
                  </div>
                  {{ step }}
                </div>
              </div>
            </div>

            <!-- 取消按钮 -->
            <button
              v-if="cancellable"
              @click="$emit('cancel')"
              class="mt-4 btn btn-outline btn-sm"
            >
              取消
            </button>

            <!-- 估计时间 -->
            <div v-if="estimatedTime" class="mt-4 text-xs text-gray-500 text-center">
              预计还需 {{ formatTime(estimatedTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  visible?: boolean
  type?: 'spinner' | 'dots' | 'pulse' | 'progress'
  title?: string
  message?: string
  progress?: number
  steps?: string[]
  currentStep?: number
  cancellable?: boolean
  estimatedTime?: number // 秒
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: 'spinner',
  title: '加载中...',
  message: '',
  progress: 0,
  steps: () => [],
  currentStep: 0,
  cancellable: false,
  estimatedTime: 0
})

// Emits
defineEmits<{
  cancel: []
}>()

// 方法
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} 秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes} 分 ${remainingSeconds} 秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours} 小时 ${minutes} 分钟`
  }
}
</script>

<style scoped>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 大型加载spinner */
.loading-spinner-large {
  @apply w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin;
}

/* 点状加载器 */
.loading-dots {
  @apply flex space-x-2;
}

.loading-dots .dot {
  @apply w-3 h-3 bg-blue-600 rounded-full;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.loading-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 脉冲加载器 */
.loading-pulse {
  @apply relative w-12 h-12;
}

.pulse-circle {
  @apply absolute inset-0 w-full h-full bg-blue-600 rounded-full;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

.pulse-circle::before {
  content: '';
  @apply absolute inset-0 w-full h-full bg-blue-400 rounded-full;
  animation: pulse-scale 1.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

@keyframes pulse-scale {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 进度条样式 */
.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full;
}
</style>
