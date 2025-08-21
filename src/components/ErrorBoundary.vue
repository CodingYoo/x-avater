<template>
  <div v-if="hasError" class="error-boundary">
    <!-- 全屏错误遮罩 -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <!-- 错误图标 -->
        <div class="flex items-center justify-center mb-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>

        <!-- 错误标题 -->
        <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
          {{ errorTitle }}
        </h3>

        <!-- 错误描述 -->
        <p class="text-gray-600 text-center mb-6">
          {{ errorMessage }}
        </p>

        <!-- 错误详情（开发模式） -->
        <div v-if="showDetails && errorDetails" class="mb-6">
          <details class="bg-gray-50 rounded-lg p-4">
            <summary class="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              错误详情
            </summary>
            <pre class="text-xs text-gray-600 overflow-auto max-h-32">{{ errorDetails }}</pre>
          </details>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="retry" class="flex-1 btn btn-primary" :disabled="isRetrying">
            <svg v-if="isRetrying" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            <span v-else>
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                </path>
              </svg>
            </span>
            {{ isRetrying ? '重试中...' : '重试' }}
          </button>

          <button @click="reset" class="flex-1 btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
              </path>
            </svg>
            重新开始
          </button>

          <button @click="goToSimple" class="flex-1 btn btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z">
              </path>
            </svg>
            简化版
          </button>
        </div>

        <!-- 反馈链接 -->
        <div class="mt-4 text-center">
          <button @click="reportError" class="text-sm text-gray-500 hover:text-gray-700 underline">
            报告此问题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  error?: Error | string | null
  title?: string
  showDetails?: boolean
  retryable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  title: '出现了一个错误',
  showDetails: false,
  retryable: true
})

// Emits
const emit = defineEmits<{
  retry: []
  reset: []
  report: [error: Error | string]
}>()

// 响应式数据
const isRetrying = ref(false)

// 计算属性
const hasError = computed(() => props.error !== null)

const errorTitle = computed(() => {
  if (typeof props.error === 'string') {
    return props.title
  } else if (props.error instanceof Error) {
    return props.error.name || props.title
  }
  return props.title
})

const errorMessage = computed(() => {
  if (typeof props.error === 'string') {
    return props.error
  } else if (props.error instanceof Error) {
    return props.error.message || '发生了未知错误'
  }
  return '发生了未知错误'
})

const errorDetails = computed(() => {
  if (props.error instanceof Error) {
    return props.error.stack || props.error.toString()
  } else if (typeof props.error === 'string') {
    return props.error
  }
  return null
})

// 方法
const retry = async () => {
  if (!props.retryable) return

  isRetrying.value = true
  try {
    emit('retry')
    // 延迟一下让用户看到重试状态
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isRetrying.value = false
  }
}

const reset = () => {
  emit('reset')
}

const reportError = () => {
  emit('report', props.error || 'Unknown error')

  // 可以在这里添加错误报告逻辑
  // 比如发送到错误监控服务
  console.error('Error reported:', props.error)
}

const goToSimple = () => {
  console.log('🔄 跳转到简化页面...')
  window.location.href = './simple.html'
}
</script>

<style scoped>
.error-boundary {
  /* 确保错误边界在最顶层 */
  z-index: 9999;
}

/* 错误详情的滚动条样式 */
pre::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

pre::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
