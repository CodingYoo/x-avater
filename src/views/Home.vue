<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 头部 -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
          <div class="flex items-center">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{{ $t('app.title') }}</h1>
                <p class="text-xs sm:text-sm text-gray-600 hidden sm:block">{{ $t('app.subtitle') }}</p>
              </div>
            </div>
          </div>

          <!-- 进度指示器和语言切换 -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <!-- 进度指示器 -->
            <div class="flex items-center space-x-2 sm:space-x-3">
              <div class="text-xs sm:text-sm text-gray-500 hidden md:block">{{ $t('header.progress') }}</div>
              <div class="progress-bar w-16 sm:w-24 lg:w-32">
                <div class="progress-fill" :style="{ width: `${appStore.overallProgress}%` }"></div>
              </div>
              <div class="text-xs sm:text-sm font-medium text-gray-700 min-w-0">{{ appStore.overallProgress }}%</div>
            </div>

            <!-- 语言切换器 -->
            <LanguageSwitcher @language-changed="handleLanguageChanged" />
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- 步骤指示器 -->
      <div class="mb-6 sm:mb-8 fade-in-up">
        <nav aria-label="Progress" class="px-2 sm:px-4">
          <ol class="flex items-center justify-center space-x-1 sm:space-x-3 lg:space-x-5 overflow-x-auto pb-2">
            <li class="flex items-center flex-shrink-0">
              <div class="flex flex-col sm:flex-row items-center">
                <div class="step-indicator w-8 h-8 sm:w-10 sm:h-10" :class="getStepClass('upload')">
                  <span v-if="isStepCompleted('upload')" class="text-white text-sm sm:text-base">✓</span>
                  <span v-else class="text-xs sm:text-sm font-medium">1</span>
                </div>
                <span
                  class="mt-1 sm:mt-0 sm:ml-2 lg:ml-3 text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-left">{{
                    $t('steps.upload') }}</span>
              </div>
            </li>

            <li class="flex items-center flex-shrink-0">
              <svg class="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-300 hidden sm:block"
                fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <div class="flex flex-col sm:flex-row items-center sm:ml-2 lg:ml-4">
                <div class="step-indicator w-8 h-8 sm:w-10 sm:h-10" :class="getStepClass('segment')">
                  <span v-if="isStepCompleted('segment')" class="text-white text-sm sm:text-base">✓</span>
                  <span v-else class="text-xs sm:text-sm font-medium">2</span>
                </div>
                <span
                  class="mt-1 sm:mt-0 sm:ml-2 lg:ml-3 text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-left">{{
                    $t('steps.segment') }}</span>
              </div>
            </li>

            <li class="flex items-center flex-shrink-0">
              <svg class="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-300 hidden sm:block"
                fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <div class="flex flex-col sm:flex-row items-center sm:ml-2 lg:ml-4">
                <div class="step-indicator w-8 h-8 sm:w-10 sm:h-10" :class="getStepClass('background')">
                  <span v-if="isStepCompleted('background')" class="text-white text-sm sm:text-base">✓</span>
                  <span v-else class="text-xs sm:text-sm font-medium">3</span>
                </div>
                <span
                  class="mt-1 sm:mt-0 sm:ml-2 lg:ml-3 text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-left">{{
                    $t('steps.background') }}</span>
              </div>
            </li>

            <li class="flex items-center flex-shrink-0">
              <svg class="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-300 hidden sm:block"
                fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
              <div class="flex flex-col sm:flex-row items-center sm:ml-2 lg:ml-4">
                <div class="step-indicator w-8 h-8 sm:w-10 sm:h-10" :class="getStepClass('download')">
                  <span v-if="isStepCompleted('download')" class="text-white text-sm sm:text-base">✓</span>
                  <span v-else class="text-xs sm:text-sm font-medium">4</span>
                </div>
                <span
                  class="mt-1 sm:mt-0 sm:ml-2 lg:ml-3 text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-left">{{
                    $t('steps.download') }}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- 内容区域 -->
      <div class="card-enhanced p-6 sm:p-8 fade-in-up">
        <!-- 上传步骤 -->
        <div v-if="appStore.currentStep === 'upload'">
          <Upload @proceed="handleProceedToSegment" />
        </div>

        <!-- AI抠图步骤 -->
        <div v-else-if="appStore.currentStep === 'segment'">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('segmentation.title') }}</h2>
            <p class="text-gray-600 mb-6">{{ $t('segmentation.subtitle') }}</p>

            <div v-if="segmentationStore.isProcessing" class="space-y-4">
              <div class="loading-spinner mx-auto"></div>
              <div class="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${segmentationStore.processingProgress}%` }"></div>
              </div>
              <p class="text-sm text-gray-500">{{ $t('segmentation.processing') }}: {{
                segmentationStore.processingProgress }}%</p>
            </div>

            <div v-else-if="segmentationStore.hasSegmentation" class="space-y-4">
              <div class="text-green-600">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p class="text-lg font-medium text-gray-700">{{ $t('segmentation.completed') }}</p>
              <button @click="appStore.nextStep" class="btn btn-primary btn-lg">
                {{ $t('segmentation.nextStep') }}
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 背景选择步骤 -->
        <div v-else-if="appStore.currentStep === 'background'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 预览区域 -->
            <div class="preview-section">
              <Preview :original-image="uploadStore.uploadedFile?.imageBitmap"
                :segmentation-mask="segmentationStore.segmentation?.mask"
                :background="backgroundStore.selectedBackground" :size="512" @rendered="handlePreviewRendered"
                @reprocess="handleReprocess" />
            </div>

            <!-- 背景选择区域 -->
            <div class="background-section">
              <BackgroundPicker @background-changed="handleBackgroundChanged" />

              <!-- 分割质量选项 -->
              <div class="segmentation-options mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-sm font-medium text-gray-700 mb-3">抠图质量设置</h3>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" :value="true" v-model="segmentationStore.useQuickMode"
                      class="radio radio-primary radio-sm" />
                    <span class="ml-2 text-sm">
                      <span class="font-medium">快速模式</span>
                      <span class="text-gray-500 block text-xs">速度快，适合简单背景</span>
                    </span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" :value="false" v-model="segmentationStore.useQuickMode"
                      class="radio radio-primary radio-sm" />
                    <span class="ml-2 text-sm">
                      <span class="font-medium">高质量模式</span>
                      <span class="text-gray-500 block text-xs">质量高，处理复杂背景</span>
                    </span>
                  </label>
                </div>
                <button @click="reprocessWithNewMode" class="btn btn-sm btn-outline mt-3"
                  :disabled="segmentationStore.isProcessing">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                    </path>
                  </svg>
                  重新抠图
                </button>
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-between mt-6">
                <button @click="appStore.previousStep" class="btn btn-outline">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                  </svg>
                  返回上一步
                </button>
                <button @click="appStore.nextStep" class="btn btn-primary"
                  :disabled="!backgroundStore.selectedBackground">
                  下载头像
                  <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6">
                    </path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 下载步骤 -->
        <div v-else-if="appStore.currentStep === 'download'">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 最终预览 -->
            <div class="final-preview">
              <Preview :original-image="uploadStore.uploadedFile?.imageBitmap"
                :segmentation-mask="segmentationStore.segmentation?.mask"
                :background="backgroundStore.selectedBackground" :size="512" @rendered="handleFinalPreviewRendered" />
            </div>

            <!-- 下载选项 -->
            <div class="download-section">
              <DownloadBtn :canvas="finalCanvas" :original-image="uploadStore.uploadedFile?.imageBitmap"
                :segmentation-mask="segmentationStore.segmentation?.mask"
                :background="backgroundStore.selectedBackground" @download-start="handleDownloadStart"
                @download-complete="handleDownloadComplete" @download-error="handleDownloadError" />

              <!-- 操作按钮 -->
              <div class="flex justify-between mt-6">
                <button @click="appStore.previousStep" class="btn btn-outline">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                  </svg>
                  返回上一步
                </button>
                <button @click="appStore.resetApp" class="btn btn-success">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                    </path>
                  </svg>
                  制作新头像
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全局错误提示 -->
      <div v-if="appStore.hasAnyError" class="mt-6">
        <div class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h4 class="font-medium">{{ appStore.currentError?.message }}</h4>
            <p class="text-sm opacity-80">错误代码: {{ appStore.currentError?.code }}</p>
          </div>
          <button @click="appStore.clearAllErrors" class="btn btn-sm btn-ghost">关闭</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUploadStore } from '@/stores/upload'
import { useSegmentationStore } from '@/stores/segmentation'
import { useBackgroundStore } from '@/stores/background'
import Upload from '@/components/Upload.vue'
import Preview from '@/components/Preview.vue'
import BackgroundPicker from '@/components/BackgroundPicker.vue'
import DownloadBtn from '@/components/DownloadBtn.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import type { Background } from '@/types'
import type { SupportedLocale } from '@/i18n'

// Stores
const appStore = useAppStore()
const uploadStore = useUploadStore()
const segmentationStore = useSegmentationStore()
const backgroundStore = useBackgroundStore()

// 响应式数据
const finalCanvas = ref<HTMLCanvasElement>()

// 步骤样式
const getStepClass = (step: string) => {
  const current = appStore.currentStep
  const isCompleted = isStepCompleted(step)
  const isCurrent = current === step

  if (isCompleted) {
    return 'bg-blue-600 text-white'
  } else if (isCurrent) {
    return 'bg-blue-100 text-blue-600 border-2 border-blue-600'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const isStepCompleted = (step: string) => {
  const stepOrder = ['upload', 'segment', 'background', 'download']
  const currentStepIndex = stepOrder.indexOf(appStore.currentStep)
  const stepIndex = stepOrder.indexOf(step)

  // 只有当前步骤之前的步骤才算完成
  if (stepIndex < currentStepIndex) {
    return true
  }

  // 当前步骤和后续步骤不算完成
  return false
}

// 处理进入分割步骤
const handleProceedToSegment = async () => {
  try {
    await appStore.processImage()
  } catch (error) {
    console.error('Failed to process image:', error)
  }
}

// 处理背景变化
const handleBackgroundChanged = (background: Background) => {
  console.log('Background changed:', background)
}

// 使用新模式重新处理图片
const reprocessWithNewMode = async () => {
  if (!uploadStore.uploadedFile?.imageBitmap) {
    console.error('No image to reprocess')
    return
  }

  try {
    console.log(`Reprocessing with mode: ${segmentationStore.useQuickMode ? 'Quick' : 'High-Quality'}`)

    // 清除当前分割结果
    segmentationStore.clearSegmentation()

    // 重新执行分割
    const success = await segmentationStore.performSegmentation(uploadStore.uploadedFile.imageBitmap)

    if (success) {
      console.log('Reprocessing completed successfully')
    } else {
      console.error('Reprocessing failed')
    }
  } catch (error) {
    console.error('Failed to reprocess image:', error)
  }
}

// 处理预览渲染完成
const handlePreviewRendered = (canvas: HTMLCanvasElement) => {
  console.log('Preview rendered')
}

// 处理最终预览渲染完成
const handleFinalPreviewRendered = (canvas: HTMLCanvasElement) => {
  finalCanvas.value = canvas
}

// 处理重新处理
const handleReprocess = async () => {
  if (uploadStore.uploadedFile?.imageBitmap) {
    await segmentationStore.performSegmentation(uploadStore.uploadedFile.imageBitmap)
  }
}

// 处理下载开始
const handleDownloadStart = () => {
  console.log('Download started')
}

// 处理下载完成
const handleDownloadComplete = (filename: string, size: string) => {
  console.log('Download completed:', filename, size)
}

// 处理下载错误
const handleDownloadError = (error: string) => {
  console.error('Download error:', error)
}

// 处理语言切换
const handleLanguageChanged = (locale: SupportedLocale) => {
  console.log('Language changed to:', locale)
  // 可以在这里添加语言切换后的额外逻辑
}
</script>
