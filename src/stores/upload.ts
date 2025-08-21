import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UploadFile, AppError } from '@/types'

export const useUploadStore = defineStore('upload', () => {
  // 状态
  const uploadedFile = ref<UploadFile | null>(null)
  const isUploading = ref(false)
  const error = ref<AppError | null>(null)

  // 计算属性
  const hasFile = computed(() => uploadedFile.value !== null)
  const fileUrl = computed(() => uploadedFile.value?.url || '')
  const fileSize = computed(() => uploadedFile.value?.file.size || 0)
  const fileName = computed(() => uploadedFile.value?.file.name || '')

  // 文件验证
  const validateFile = (file: File): AppError | null => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        code: 'INVALID_FILE_TYPE',
        message: '仅支持 JPG、PNG、WEBP 格式的图片',
        details: { type: file.type }
      }
    }

    // 检查文件大小 (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        code: 'FILE_TOO_LARGE',
        message: '文件大小不能超过 5MB',
        details: { size: file.size, maxSize }
      }
    }

    return null
  }

  // 创建ImageBitmap
  const createImageBitmap = async (file: File): Promise<ImageBitmap> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = async () => {
        try {
          const bitmap = await window.createImageBitmap(img)
          resolve(bitmap)
        } catch (err) {
          reject(new Error('Failed to create ImageBitmap'))
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Actions
  const uploadFile = async (file: File) => {
    isUploading.value = true
    error.value = null

    try {
      // 验证文件
      const validationError = validateFile(file)
      if (validationError) {
        error.value = validationError
        return false
      }

      // 创建URL和ImageBitmap
      const url = URL.createObjectURL(file)
      const imageBitmap = await createImageBitmap(file)

      uploadedFile.value = {
        file,
        url,
        width: imageBitmap.width,
        height: imageBitmap.height,
        imageBitmap
      }

      return true
    } catch (err) {
      error.value = {
        code: 'UPLOAD_FAILED',
        message: '文件上传失败，请重试',
        details: err
      }
      return false
    } finally {
      isUploading.value = false
    }
  }

  const clearFile = () => {
    if (uploadedFile.value?.url) {
      URL.revokeObjectURL(uploadedFile.value.url)
    }
    if (uploadedFile.value?.imageBitmap) {
      uploadedFile.value.imageBitmap.close()
    }
    uploadedFile.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    uploadedFile,
    isUploading,
    error,
    
    // 计算属性
    hasFile,
    fileUrl,
    fileSize,
    fileName,
    
    // Actions
    uploadFile,
    clearFile,
    clearError,
    validateFile
  }
})
