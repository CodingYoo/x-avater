import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Background, AppError, PresetColor } from '@/types'
import { PRESET_COLORS } from '@/types'

export const useBackgroundStore = defineStore('background', () => {
  // 状态
  const selectedBackground = ref<Background>({
    type: 'color',
    value: PRESET_COLORS[0] // 默认选择第一个预设颜色
  })
  const isLoadingBackground = ref(false)
  const error = ref<AppError | null>(null)

  // 计算属性
  const isColorBackground = computed(() => selectedBackground.value.type === 'color')
  const isImageBackground = computed(() => selectedBackground.value.type === 'image')
  const backgroundValue = computed(() => selectedBackground.value.value)

  // 验证背景图片文件
  const validateBackgroundFile = (file: File): AppError | null => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        code: 'INVALID_BACKGROUND_TYPE',
        message: '背景图片仅支持 JPG、PNG、WEBP 格式',
        details: { type: file.type }
      }
    }

    // 检查文件大小 (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        code: 'BACKGROUND_TOO_LARGE',
        message: '背景图片大小不能超过 10MB',
        details: { size: file.size, maxSize }
      }
    }

    return null
  }

  // 创建背景ImageBitmap
  const createBackgroundBitmap = async (file: File): Promise<ImageBitmap> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = async () => {
        try {
          const bitmap = await window.createImageBitmap(img)
          resolve(bitmap)
        } catch (err) {
          reject(new Error('Failed to create background ImageBitmap'))
        }
      }
      img.onerror = () => reject(new Error('Failed to load background image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Actions
  const setColorBackground = (color: PresetColor | string) => {
    // 清理之前的图片背景
    if (isImageBackground.value && selectedBackground.value.value instanceof ImageBitmap) {
      selectedBackground.value.value.close()
    }

    selectedBackground.value = {
      type: 'color',
      value: color
    }
    error.value = null
  }

  const setImageBackground = async (file: File): Promise<boolean> => {
    isLoadingBackground.value = true
    error.value = null

    try {
      // 验证文件
      const validationError = validateBackgroundFile(file)
      if (validationError) {
        error.value = validationError
        return false
      }

      // 清理之前的图片背景
      if (isImageBackground.value && selectedBackground.value.value instanceof ImageBitmap) {
        selectedBackground.value.value.close()
      }

      // 创建ImageBitmap
      const imageBitmap = await createBackgroundBitmap(file)

      selectedBackground.value = {
        type: 'image',
        value: imageBitmap
      }

      return true
    } catch (err) {
      error.value = {
        code: 'BACKGROUND_LOAD_FAILED',
        message: '背景图片加载失败，请重试',
        details: err
      }
      return false
    } finally {
      isLoadingBackground.value = false
    }
  }

  const resetBackground = () => {
    // 清理图片背景
    if (isImageBackground.value && selectedBackground.value.value instanceof ImageBitmap) {
      selectedBackground.value.value.close()
    }

    selectedBackground.value = {
      type: 'color',
      value: PRESET_COLORS[0]
    }
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // 获取预设颜色列表
  const getPresetColors = () => {
    return [...PRESET_COLORS]
  }

  // 清理资源
  const cleanup = () => {
    if (isImageBackground.value && selectedBackground.value.value instanceof ImageBitmap) {
      selectedBackground.value.value.close()
    }
  }

  return {
    // 状态
    selectedBackground,
    isLoadingBackground,
    error,
    
    // 计算属性
    isColorBackground,
    isImageBackground,
    backgroundValue,
    
    // Actions
    setColorBackground,
    setImageBackground,
    resetBackground,
    clearError,
    getPresetColors,
    cleanup,
    validateBackgroundFile
  }
})
