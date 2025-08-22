<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import BrowserCompatibility from '@/components/BrowserCompatibility.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const appStore = useAppStore()
const { t } = useI18n()
const router = useRouter()

// 响应式数据
const globalError = ref<Error | null>(null)
const isInitializing = ref(true)
const initializationSteps = computed(() => [
  t('loading.steps.compatibility'),
  t('loading.steps.resources'),
  t('loading.steps.state'),
  t('loading.steps.ui')
])
const currentInitStep = ref(0)

// 错误捕获
onErrorCaptured((error: Error) => {
  console.error('Global error captured:', error)
  globalError.value = error
  return false // 阻止错误继续传播
})

// 全局错误处理
const handleGlobalError = (error: Error) => {
  globalError.value = error
}

// 初始化应用
const initializeApp = async () => {
  try {
    console.log('🚀 开始初始化应用...')

    // 步骤1：检查浏览器兼容性
    console.log('📋 步骤1：检查浏览器兼容性')
    currentInitStep.value = 0
    await new Promise(resolve => setTimeout(resolve, 300))

    // 步骤2：加载应用资源
    console.log('📦 步骤2：加载应用资源')
    currentInitStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 400))

    // 步骤3：初始化状态管理
    console.log('🔧 步骤3：初始化状态管理')
    currentInitStep.value = 2
    await new Promise(resolve => setTimeout(resolve, 200))

    // 步骤4：准备用户界面
    console.log('🎨 步骤4：准备用户界面')
    currentInitStep.value = 3
    await new Promise(resolve => setTimeout(resolve, 200))

    console.log('✅ 应用初始化完成！')
    isInitializing.value = false
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    console.error('错误详情:', error)
    globalError.value = error instanceof Error ? error : new Error('初始化失败')
    isInitializing.value = false
  }
}

// 错误处理方法
const retryAfterError = () => {
  globalError.value = null
  // 可以在这里添加重试逻辑
}

const resetAfterError = () => {
  globalError.value = null
  appStore.resetApp()
}

const reportError = (error: Error | string) => {
  console.error('Error reported:', error)
  // 这里可以集成错误监控服务，如Sentry
}

const handleBrowserContinue = () => {
  // 用户选择继续使用不兼容的浏览器
  console.warn('User chose to continue with incompatible browser')
}

const handleBrowserRecheck = () => {
  // 重新检查浏览器兼容性
  console.log('Rechecking browser compatibility')
}

// 错误处理器引用
const errorHandler = (event: ErrorEvent) => {
  handleGlobalError(new Error(event.message))
}

const rejectionHandler = (event: PromiseRejectionEvent) => {
  handleGlobalError(new Error(event.reason))
}

// 生命周期
onMounted(() => {
  console.log('🔄 App组件已挂载，开始设置错误处理...')

  // 设置全局错误处理
  window.addEventListener('error', errorHandler)
  window.addEventListener('unhandledrejection', rejectionHandler)

  // 添加额外的调试信息
  console.log('🌍 当前环境:', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    timestamp: new Date().toISOString()
  })

  // 检查路由状态
  console.log('🛣️ 路由信息:', {
    currentRoute: router.currentRoute.value,
    hasRoutes: router.getRoutes().length > 0
  })

  // 初始化应用
  console.log('🎯 开始初始化应用...')
  initializeApp()
})

onUnmounted(() => {
  appStore.cleanup()

  // 清理全局错误监听器
  window.removeEventListener('error', errorHandler)
  window.removeEventListener('unhandledrejection', rejectionHandler)
})
</script>

<template>
  <div id="app">
    <!-- 浏览器兼容性检查 -->
    <BrowserCompatibility @continue="handleBrowserContinue" @recheck="handleBrowserRecheck" />

    <!-- 初始化加载 -->
    <LoadingOverlay :visible="isInitializing" type="progress" :title="t('loading.initializing')"
      :message="t('loading.subtitle')" :steps="initializationSteps" :current-step="currentInitStep"
      :progress="((currentInitStep + 1) / initializationSteps.length) * 100" />

    <!-- 全局错误边界 -->
    <ErrorBoundary :error="globalError" title="应用遇到了问题" :show-details="true" @retry="retryAfterError"
      @reset="resetAfterError" @report="reportError" />

    <!-- 主应用内容 -->
    <RouterView v-if="!isInitializing && !globalError" />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
