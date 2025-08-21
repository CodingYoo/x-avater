import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState, AppError } from '@/types'
import { useUploadStore } from './upload'
import { useSegmentationStore } from './segmentation'
import { useBackgroundStore } from './background'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentStep = ref<AppState['step']>('upload')
  const isLoading = ref(false)
  const globalError = ref<AppError | null>(null)

  // 获取其他stores
  const uploadStore = useUploadStore()
  const segmentationStore = useSegmentationStore()
  const backgroundStore = useBackgroundStore()

  // 计算属性
  const canProceedToSegment = computed(() => {
    return uploadStore.hasFile && !uploadStore.isUploading
  })

  const canProceedToBackground = computed(() => {
    return canProceedToSegment.value && 
           segmentationStore.hasSegmentation && 
           !segmentationStore.isProcessing
  })

  const canDownload = computed(() => {
    return canProceedToBackground.value && 
           backgroundStore.selectedBackground !== null
  })

  const overallProgress = computed(() => {
    let progress = 0
    
    if (uploadStore.hasFile) progress += 25
    if (segmentationStore.hasSegmentation) progress += 25
    if (backgroundStore.selectedBackground) progress += 25
    if (currentStep.value === 'download') progress += 25
    
    return progress
  })

  const hasAnyError = computed(() => {
    return !!(globalError.value || 
              uploadStore.error || 
              segmentationStore.error || 
              backgroundStore.error)
  })

  const currentError = computed(() => {
    return globalError.value || 
           uploadStore.error || 
           segmentationStore.error || 
           backgroundStore.error
  })

  // Actions
  const setStep = (step: AppState['step']) => {
    currentStep.value = step
  }

  const nextStep = () => {
    switch (currentStep.value) {
      case 'upload':
        if (canProceedToSegment.value) {
          currentStep.value = 'segment'
        }
        break
      case 'segment':
        if (canProceedToBackground.value) {
          currentStep.value = 'background'
        }
        break
      case 'background':
        if (canDownload.value) {
          currentStep.value = 'download'
        }
        break
    }
  }

  const previousStep = () => {
    switch (currentStep.value) {
      case 'segment':
        currentStep.value = 'upload'
        break
      case 'background':
        currentStep.value = 'segment'
        break
      case 'download':
        currentStep.value = 'background'
        break
    }
  }

  const resetApp = () => {
    currentStep.value = 'upload'
    isLoading.value = false
    globalError.value = null
    
    // 清理所有stores
    uploadStore.clearFile()
    segmentationStore.clearSegmentation()
    backgroundStore.resetBackground()
  }

  const setGlobalError = (error: AppError) => {
    globalError.value = error
  }

  const clearAllErrors = () => {
    globalError.value = null
    uploadStore.clearError()
    segmentationStore.clearError()
    backgroundStore.clearError()
  }

  // 完整的处理流程
  const processImage = async (): Promise<boolean> => {
    if (!uploadStore.uploadedFile?.imageBitmap) {
      setGlobalError({
        code: 'NO_IMAGE',
        message: '请先上传图片'
      })
      return false
    }

    isLoading.value = true
    clearAllErrors()

    try {
      // 执行分割
      setStep('segment')
      const segmentSuccess = await segmentationStore.performSegmentation(
        uploadStore.uploadedFile.imageBitmap
      )

      if (!segmentSuccess) {
        return false
      }

      // 进入背景选择步骤
      setStep('background')
      return true
    } catch (err) {
      setGlobalError({
        code: 'PROCESSING_FAILED',
        message: '图像处理失败，请重试',
        details: err
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 清理所有资源
  const cleanup = () => {
    uploadStore.clearFile()
    segmentationStore.cleanup()
    backgroundStore.cleanup()
  }

  return {
    // 状态
    currentStep,
    isLoading,
    globalError,
    
    // 计算属性
    canProceedToSegment,
    canProceedToBackground,
    canDownload,
    overallProgress,
    hasAnyError,
    currentError,
    
    // Actions
    setStep,
    nextStep,
    previousStep,
    resetApp,
    setGlobalError,
    clearAllErrors,
    processImage,
    cleanup
  }
})
