<template>
  <div class="upload-container">
    <!-- 上传区域 -->
    <div ref="uploadArea" class="upload-area" :class="{
      'dragover': isDragOver,
      'uploading': uploadStore.isUploading,
      'has-file': uploadStore.hasFile
    }" @click="triggerFileInput" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop">
      <!-- 文件输入 -->
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
        @change="handleFileSelect" />

      <!-- 上传状态显示 -->
      <div v-if="uploadStore.isUploading" class="upload-loading">
        <div class="loading-spinner"></div>
        <p class="text-lg font-medium text-gray-700 mt-4">{{ $t('upload.processing') }}</p>
      </div>

      <!-- 已上传文件显示 -->
      <div v-else-if="uploadStore.hasFile" class="upload-success">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p class="text-lg font-medium text-gray-700 mb-2">{{ $t('upload.success') }}</p>
        <p class="text-sm text-gray-500 mb-4">{{ uploadStore.fileName }}</p>
        <p class="text-xs text-gray-400">
          {{ $t('upload.size') }}: {{ uploadStore.uploadedFile?.width }} × {{ uploadStore.uploadedFile?.height }}
          | {{ $t('upload.fileSize') }}: {{ formatFileSize(uploadStore.fileSize) }}
        </p>

        <!-- 重新上传按钮 -->
        <button @click.stop="clearAndReupload" class="btn btn-outline btn-sm mt-4">
          {{ $t('upload.reupload') }}
        </button>
      </div>

      <!-- 初始上传提示 -->
      <div v-else class="upload-prompt">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ $t('upload.title') }}</h3>
        <p class="text-gray-500 mb-4">{{ $t('upload.subtitle') }}</p>
        <div class="text-sm text-gray-400 space-y-1">
          <p>{{ $t('upload.formats') }}</p>
          <p>{{ $t('upload.maxSize') }}</p>
          <p>{{ $t('upload.recommended') }}</p>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="uploadStore.error" class="alert alert-error mt-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h4 class="font-medium">{{ uploadStore.error.message }}</h4>
        <p v-if="uploadStore.error.code === 'FILE_TOO_LARGE'" class="text-sm opacity-80">
          {{ $t('upload.errors.currentSize') }}：{{ formatFileSize(uploadStore.error.details?.size || 0) }}
        </p>
      </div>
      <button @click="uploadStore.clearError" class="btn btn-sm btn-ghost">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- 操作按钮 -->
    <div v-if="uploadStore.hasFile && !uploadStore.isUploading" class="flex justify-center mt-6">
      <button @click="$emit('proceed')" class="btn btn-primary btn-lg" :disabled="!uploadStore.hasFile">
        {{ $t('upload.proceed') }}
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUploadStore } from '@/stores/upload'

// Emits
defineEmits<{
  proceed: []
}>()

// Store
const uploadStore = useUploadStore()
const { t } = useI18n()

// 响应式数据
const isDragOver = ref(false)
const uploadArea = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 触发文件选择
const triggerFileInput = () => {
  if (!uploadStore.isUploading) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await uploadStore.uploadFile(file)
  }
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

// 拖拽处理
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  // 只有当离开整个上传区域时才取消高亮
  if (!uploadArea.value?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    await uploadStore.uploadFile(files[0])
  }
}

// 清空并重新上传
const clearAndReupload = () => {
  uploadStore.clearFile()
  triggerFileInput()
}

// 防止页面拖拽默认行为
const preventDefaults = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

onMounted(() => {
  // 防止整个页面的拖拽默认行为
  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, preventDefaults, false)
  })
})

onUnmounted(() => {
  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.removeEventListener(eventName, preventDefaults, false)
  })
})
</script>

<style scoped>
.upload-area {
  min-height: 300px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-area.has-file {
  @apply border-green-300 bg-green-50;
}

.upload-area.dragover {
  transform: scale(1.02);
}
</style>
