import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Segmentation, AppError } from '@/types'
import { mediaPipeService } from '@/services/mediapipe'

export const useSegmentationStore = defineStore('segmentation', () => {
  // 状态
  const segmentation = ref<Segmentation | null>(null)
  const isProcessing = ref(false)
  const error = ref<AppError | null>(null)
  const isModelLoaded = ref(false)
  const useQuickMode = ref(true) // 默认使用快速模式

  // 计算属性
  const hasSegmentation = computed(() => segmentation.value !== null)
  const processingProgress = ref(0)

  // 初始化MediaPipe
  const initializeMediaPipe = async (): Promise<boolean> => {
    if (isModelLoaded.value) {
      return true
    }

    try {
      const initialized = await mediaPipeService.initialize()
      if (initialized) {
        isModelLoaded.value = true
        return true
      } else {
        error.value = {
          code: 'MEDIAPIPE_INIT_FAILED',
          message: 'AI模型加载失败，请检查网络连接',
          details: 'MediaPipe initialization failed'
        }
        return false
      }
    } catch (err) {
      console.warn('MediaPipe初始化失败，将使用快速模式:', err)
      error.value = {
        code: 'MEDIAPIPE_INIT_FAILED',
        message: 'AI模型加载失败，将使用快速模式',
        details: err
      }
      // 即使MediaPipe失败，也返回true，让应用继续运行
      return true
    }
  }

  // 执行人像分割
  const performSegmentation = async (imageBitmap: ImageBitmap): Promise<boolean> => {
    isProcessing.value = true
    error.value = null
    processingProgress.value = 0

    try {
      let results: any

      if (useQuickMode.value) {
        // 使用快速本地分割
        console.log('Using quick local segmentation mode')
        results = await mediaPipeService.quickSegment(
          imageBitmap,
          (progress) => {
            processingProgress.value = progress
          }
        )
      } else {
        // 使用MediaPipe高质量分割
        console.log('Using MediaPipe high-quality segmentation mode')
        if (!isModelLoaded.value) {
          const initialized = await initializeMediaPipe()
          if (!initialized) return false
        }

        results = await mediaPipeService.segmentImage(
          imageBitmap,
          (progress) => {
            processingProgress.value = progress
          }
        )
      }

      if (results && results.segmentationMask) {
        segmentation.value = {
          mask: results.segmentationMask,
          width: results.segmentationMask.width,
          height: results.segmentationMask.height
        }
        isProcessing.value = false
        return true
      } else {
        error.value = {
          code: 'SEGMENTATION_FAILED',
          message: '人像分割失败，请重试',
          details: 'No results returned from segmentation'
        }
        isProcessing.value = false
        return false
      }
    } catch (err) {
      error.value = {
        code: 'SEGMENTATION_FAILED',
        message: '人像分割失败，请重试',
        details: err
      }
      isProcessing.value = false
      return false
    }
  }

  // 清理分割结果
  const clearSegmentation = () => {
    if (segmentation.value?.mask) {
      segmentation.value.mask.close()
    }
    segmentation.value = null
    error.value = null
    processingProgress.value = 0
  }

  // 清理MediaPipe实例
  const cleanup = () => {
    mediaPipeService.cleanup()
    isModelLoaded.value = false
    clearSegmentation()
  }

  const clearError = () => {
    error.value = null
  }

  // 切换分割模式
  const toggleSegmentationMode = () => {
    useQuickMode.value = !useQuickMode.value
    console.log(`Segmentation mode switched to: ${useQuickMode.value ? 'Quick' : 'High-Quality'}`)
  }

  // 设置分割模式
  const setSegmentationMode = (quick: boolean) => {
    useQuickMode.value = quick
    console.log(`Segmentation mode set to: ${quick ? 'Quick' : 'High-Quality'}`)
  }

  return {
    // 状态
    segmentation,
    isProcessing,
    error,
    useQuickMode,
    isModelLoaded,
    processingProgress,
    
    // 计算属性
    hasSegmentation,
    
    // Actions
    initializeMediaPipe,
    performSegmentation,
    clearSegmentation,
    cleanup,
    clearError,
    toggleSegmentationMode,
    setSegmentationMode
  }
})
