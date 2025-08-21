<template>
  <div class="preview-container">
    <!-- 预览标题 -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">实时预览</h3>
      <p class="text-gray-600">查看AI抠图和背景合成效果</p>
    </div>

    <!-- Canvas容器 -->
    <div class="canvas-container relative mx-auto aspect-square w-full max-w-lg"
      :style="{ maxWidth: canvasSize + 'px', maxHeight: canvasSize + 'px' }">
      <!-- 背景Canvas -->
      <canvas ref="backgroundCanvas" class="canvas-layer absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        :width="canvasSize" :height="canvasSize"></canvas>

      <!-- 人像Canvas -->
      <canvas ref="foregroundCanvas" class="canvas-layer absolute top-0 left-0 w-full h-full rounded-lg"
        :width="canvasSize" :height="canvasSize"></canvas>

      <!-- 加载遮罩 -->
      <div v-if="isProcessing"
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
        <div class="text-center text-white">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-sm">{{ processingText }}</p>
          <div v-if="progress > 0" class="w-32 bg-gray-600 rounded-full h-1 mt-2 mx-auto">
            <div class="bg-white h-1 rounded-full transition-all duration-300" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="absolute top-2 right-2 flex space-x-2">
        <!-- 切换显示模式 -->
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-sm btn-circle btn-ghost bg-white bg-opacity-80 hover:bg-opacity-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
              </path>
            </svg>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
            <li><a @click="setViewMode('composite')" :class="{ 'active': viewMode === 'composite' }">合成效果</a></li>
            <li><a @click="setViewMode('original')" :class="{ 'active': viewMode === 'original' }">原始图片</a></li>
            <li><a @click="setViewMode('mask')" :class="{ 'active': viewMode === 'mask' }">分割蒙版</a></li>
          </ul>
        </div>

        <!-- 重新处理按钮 -->
        <button v-if="canReprocess" @click="$emit('reprocess')"
          class="btn btn-sm btn-circle btn-ghost bg-white bg-opacity-80 hover:bg-opacity-100" title="重新处理">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
            </path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 预览信息 -->
    <div class="mt-4 text-center text-sm text-gray-500">
      <div class="flex justify-center items-center space-x-4">
        <span>尺寸: {{ canvasSize }}×{{ canvasSize }}</span>
        <span v-if="originalImage">原图: {{ originalImage.width }}×{{ originalImage.height }}</span>
        <span v-if="renderTime > 0">渲染: {{ renderTime }}ms</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-error mt-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h4 class="font-medium">预览渲染失败</h4>
        <p class="text-sm opacity-80">{{ error }}</p>
      </div>
      <button @click="clearError" class="btn btn-sm btn-ghost">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Background } from '@/types'

// Props
interface Props {
  originalImage?: ImageBitmap
  segmentationMask?: ImageBitmap
  background?: Background
  size?: number
  autoRender?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 512,
  autoRender: true
})

// Emits
const emit = defineEmits<{
  reprocess: []
  rendered: [canvas: HTMLCanvasElement]
}>()

// 响应式数据
const backgroundCanvas = ref<HTMLCanvasElement>()
const foregroundCanvas = ref<HTMLCanvasElement>()
const isProcessing = ref(false)
const processingText = ref('')
const progress = ref(0)
const error = ref('')
const viewMode = ref<'composite' | 'original' | 'mask'>('composite')
const renderTime = ref(0)

// 计算属性
const canvasSize = computed(() => props.size)
const canReprocess = computed(() => props.originalImage && props.segmentationMask)

// 渲染合成图像
const renderComposite = async () => {
  if (!props.originalImage || !props.segmentationMask || !props.background) {
    return
  }

  if (!backgroundCanvas.value || !foregroundCanvas.value) {
    return
  }

  isProcessing.value = true
  processingText.value = '正在渲染预览...'
  progress.value = 0
  error.value = ''

  const startTime = Date.now()

  try {
    const bgCtx = backgroundCanvas.value.getContext('2d')!
    const fgCtx = foregroundCanvas.value.getContext('2d')!

    // 清空画布
    bgCtx.clearRect(0, 0, canvasSize.value, canvasSize.value)
    fgCtx.clearRect(0, 0, canvasSize.value, canvasSize.value)

    progress.value = 20

    // 绘制背景
    if (props.background.type === 'color') {
      bgCtx.fillStyle = props.background.value as string
      bgCtx.fillRect(0, 0, canvasSize.value, canvasSize.value)
    } else {
      const bgImage = props.background.value as ImageBitmap
      bgCtx.drawImage(bgImage, 0, 0, canvasSize.value, canvasSize.value)
    }

    progress.value = 50

    // 创建临时画布处理人像蒙版
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = canvasSize.value
    tempCanvas.height = canvasSize.value

    // 绘制原图到临时画布
    tempCtx.drawImage(props.originalImage, 0, 0, canvasSize.value, canvasSize.value)

    progress.value = 70

    // 应用蒙版
    tempCtx.globalCompositeOperation = 'destination-in'
    tempCtx.drawImage(props.segmentationMask, 0, 0, canvasSize.value, canvasSize.value)

    progress.value = 90

    // 将处理后的人像绘制到前景画布
    fgCtx.drawImage(tempCanvas, 0, 0)

    progress.value = 100
    renderTime.value = Date.now() - startTime

    // 触发渲染完成事件
    await nextTick()
    const compositeCanvas = createCompositeCanvas()
    if (compositeCanvas) {
      emit('rendered', compositeCanvas)
    }

  } catch (err) {
    error.value = `渲染失败: ${err}`
    console.error('Preview render error:', err)
  } finally {
    isProcessing.value = false
    processingText.value = ''
    progress.value = 0
  }
}

// 创建合成画布用于导出
const createCompositeCanvas = (): HTMLCanvasElement | null => {
  if (!backgroundCanvas.value || !foregroundCanvas.value) {
    return null
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = canvasSize.value
  canvas.height = canvasSize.value

  // 绘制背景
  ctx.drawImage(backgroundCanvas.value, 0, 0)
  // 绘制前景
  ctx.drawImage(foregroundCanvas.value, 0, 0)

  return canvas
}

// 设置显示模式
const setViewMode = (mode: 'composite' | 'original' | 'mask') => {
  viewMode.value = mode
  renderViewMode()
}

// 根据显示模式渲染
const renderViewMode = () => {
  if (!backgroundCanvas.value || !foregroundCanvas.value) {
    return
  }

  const bgCtx = backgroundCanvas.value.getContext('2d')!
  const fgCtx = foregroundCanvas.value.getContext('2d')!

  bgCtx.clearRect(0, 0, canvasSize.value, canvasSize.value)
  fgCtx.clearRect(0, 0, canvasSize.value, canvasSize.value)

  switch (viewMode.value) {
    case 'original':
      if (props.originalImage) {
        bgCtx.drawImage(props.originalImage, 0, 0, canvasSize.value, canvasSize.value)
      }
      break
    case 'mask':
      if (props.segmentationMask) {
        bgCtx.fillStyle = '#000000'
        bgCtx.fillRect(0, 0, canvasSize.value, canvasSize.value)
        bgCtx.drawImage(props.segmentationMask, 0, 0, canvasSize.value, canvasSize.value)
      }
      break
    case 'composite':
    default:
      renderComposite()
      break
  }
}

// 清除错误
const clearError = () => {
  error.value = ''
}

// 监听属性变化
watch(
  () => [props.originalImage, props.segmentationMask, props.background],
  () => {
    if (props.autoRender) {
      nextTick(() => {
        renderViewMode()
      })
    }
  },
  { deep: true }
)

// 监听显示模式变化
watch(viewMode, () => {
  renderViewMode()
})

// 生命周期
onMounted(() => {
  if (props.autoRender) {
    nextTick(() => {
      renderViewMode()
    })
  }
})

onUnmounted(() => {
  // 清理资源
  if (backgroundCanvas.value) {
    const ctx = backgroundCanvas.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize.value, canvasSize.value)
    }
  }
  if (foregroundCanvas.value) {
    const ctx = foregroundCanvas.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasSize.value, canvasSize.value)
    }
  }
})

// 暴露方法
defineExpose({
  renderComposite,
  createCompositeCanvas,
  setViewMode
})
</script>

<style scoped>
.canvas-container {
  max-width: 100%;
  aspect-ratio: 1;
}

.canvas-layer {
  border: 1px solid #e5e7eb;
}

.dropdown-content {
  z-index: 1000;
}
</style>
