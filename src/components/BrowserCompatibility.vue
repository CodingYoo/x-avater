<template>
  <div v-if="!isCompatible" class="browser-compatibility">
    <!-- 兼容性警告遮罩 -->
    <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <!-- 警告图标 -->
        <div class="flex items-center justify-center mb-4">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>

        <!-- 警告标题 -->
        <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
          浏览器兼容性问题
        </h3>

        <!-- 警告描述 -->
        <p class="text-gray-600 text-center mb-6">
          您的浏览器可能不支持此应用的某些功能。为了获得最佳体验，请升级您的浏览器或使用推荐的浏览器。
        </p>

        <!-- 兼容性问题列表 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">检测到的问题：</h4>
          <ul class="space-y-2">
            <li v-for="issue in compatibilityIssues" :key="issue" class="flex items-center text-sm text-red-600">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              {{ getIssueDescription(issue) }}
            </li>
          </ul>
        </div>

        <!-- 推荐浏览器 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">推荐浏览器：</h4>
          <div class="grid grid-cols-2 gap-3">
            <a
              v-for="browser in recommendedBrowsers"
              :key="browser.name"
              :href="browser.downloadUrl"
              target="_blank"
              class="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div class="w-8 h-8 mr-3 flex-shrink-0">
                <img :src="browser.icon" :alt="browser.name" class="w-full h-full" />
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ browser.name }}</div>
                <div class="text-xs text-gray-500">{{ browser.version }}+</div>
              </div>
            </a>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="continueAnyway"
            class="flex-1 btn btn-outline"
          >
            仍要继续
          </button>
          
          <button
            @click="checkAgain"
            class="flex-1 btn btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            重新检测
          </button>
        </div>

        <!-- 详细信息 -->
        <div class="mt-4">
          <details class="text-sm">
            <summary class="cursor-pointer text-gray-500 hover:text-gray-700">
              查看详细信息
            </summary>
            <div class="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
              <div><strong>用户代理:</strong> {{ userAgent }}</div>
              <div><strong>检测时间:</strong> {{ new Date().toLocaleString() }}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Emits
defineEmits<{
  continue: []
  recheck: []
}>()

// 响应式数据
const compatibilityIssues = ref<string[]>([])
const userAgent = ref('')

// 推荐浏览器列表
const recommendedBrowsers = [
  {
    name: 'Chrome',
    version: '90',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0Mjg1RjQiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    downloadUrl: 'https://www.google.com/chrome/'
  },
  {
    name: 'Firefox',
    version: '88',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRjk1MDAiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    downloadUrl: 'https://www.mozilla.org/firefox/'
  },
  {
    name: 'Safari',
    version: '14',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdBRkYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    downloadUrl: 'https://www.apple.com/safari/'
  },
  {
    name: 'Edge',
    version: '90',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDc4RDQiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    downloadUrl: 'https://www.microsoft.com/edge'
  }
]

// 计算属性
const isCompatible = computed(() => compatibilityIssues.value.length === 0)

// 方法
const checkBrowserCompatibility = () => {
  const issues: string[] = []
  userAgent.value = navigator.userAgent

  // 检查WebAssembly支持
  if (typeof WebAssembly === 'undefined') {
    issues.push('webassembly')
  }

  // 检查Canvas支持
  const canvas = document.createElement('canvas')
  if (!canvas.getContext || !canvas.getContext('2d')) {
    issues.push('canvas')
  }

  // 检查ImageBitmap支持
  if (typeof createImageBitmap === 'undefined') {
    issues.push('imagebitmap')
  }

  // 检查Fetch API支持
  if (typeof fetch === 'undefined') {
    issues.push('fetch')
  }

  // 检查Promise支持
  if (typeof Promise === 'undefined') {
    issues.push('promise')
  }

  // 检查ES6模块支持
  try {
    new Function('import("")')
  } catch {
    issues.push('modules')
  }

  // 检查File API支持
  if (typeof File === 'undefined' || typeof FileReader === 'undefined') {
    issues.push('fileapi')
  }

  // 检查URL.createObjectURL支持
  if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
    issues.push('objecturl')
  }

  // 检查特定浏览器版本
  const isOldChrome = /Chrome\/([0-9]+)/.test(userAgent.value) && 
    parseInt(RegExp.$1) < 90
  const isOldFirefox = /Firefox\/([0-9]+)/.test(userAgent.value) && 
    parseInt(RegExp.$1) < 88
  const isOldSafari = /Version\/([0-9]+).*Safari/.test(userAgent.value) && 
    parseInt(RegExp.$1) < 14
  const isOldEdge = /Edg\/([0-9]+)/.test(userAgent.value) && 
    parseInt(RegExp.$1) < 90

  if (isOldChrome || isOldFirefox || isOldSafari || isOldEdge) {
    issues.push('oldversion')
  }

  // 检查IE浏览器
  if (/MSIE|Trident/.test(userAgent.value)) {
    issues.push('ie')
  }

  compatibilityIssues.value = issues
}

const getIssueDescription = (issue: string): string => {
  const descriptions: Record<string, string> = {
    webassembly: 'WebAssembly 不受支持',
    canvas: 'Canvas API 不受支持',
    imagebitmap: 'ImageBitmap API 不受支持',
    fetch: 'Fetch API 不受支持',
    promise: 'Promise 不受支持',
    modules: 'ES6 模块不受支持',
    fileapi: 'File API 不受支持',
    objecturl: 'URL.createObjectURL 不受支持',
    oldversion: '浏览器版本过旧',
    ie: 'Internet Explorer 不受支持'
  }
  return descriptions[issue] || '未知兼容性问题'
}

const continueAnyway = () => {
  emit('continue')
}

const checkAgain = () => {
  checkBrowserCompatibility()
  emit('recheck')
}

// 生命周期
onMounted(() => {
  checkBrowserCompatibility()
})
</script>

<style scoped>
.browser-compatibility {
  /* 确保兼容性检查在最顶层 */
  z-index: 9998;
}
</style>
