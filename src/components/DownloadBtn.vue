<template>
  <div class="download-section">
    <!-- 下载标题 -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">下载结果</h3>
      <p class="text-gray-600">保存您的个性化头像</p>
    </div>

    <!-- 下载选项 -->
    <div class="download-options mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- 格式选择 -->
        <div class="option-group">
          <label class="label">
            <span class="label-text font-medium text-sm sm:text-base">文件格式</span>
          </label>
          <select v-model="downloadFormat" class="select select-bordered w-full text-sm sm:text-base">
            <option value="png">PNG (推荐)</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <!-- 尺寸选择 -->
        <div class="option-group">
          <label class="label">
            <span class="label-text font-medium text-sm sm:text-base">图片尺寸</span>
          </label>
          <select v-model="downloadSize" class="select select-bordered w-full text-sm sm:text-base">
            <option value="512">512×512 (标准)</option>
            <option value="1024">1024×1024 (高清)</option>
            <option value="256">256×256 (小尺寸)</option>
          </select>
        </div>
      </div>

      <!-- 质量设置 (仅JPG格式) -->
      <div v-if="downloadFormat === 'jpg'" class="quality-section mt-4">
        <label class="label">
          <span class="label-text font-medium">图片质量: {{ Math.round(quality * 100) }}%</span>
        </label>
        <input type="range" min="0.1" max="1" step="0.1" v-model.number="quality" class="range range-primary" />
        <div class="w-full flex justify-between text-xs text-gray-500 mt-1">
          <span>低质量</span>
          <span>中等质量</span>
          <span>高质量</span>
        </div>
      </div>
    </div>

    <!-- 预览信息 -->
    <div class="preview-info bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm">
        <div class="info-item">
          <span class="text-gray-600">格式:</span>
          <span class="font-medium ml-1">{{ downloadFormat.toUpperCase() }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-600">尺寸:</span>
          <span class="font-medium ml-1">{{ downloadSize }}×{{ downloadSize }}</span>
        </div>
        <div class="info-item">
          <span class="text-gray-600">预估大小:</span>
          <span class="font-medium ml-1">{{ estimatedSize }}</span>
        </div>
      </div>
    </div>

    <!-- 下载按钮 -->
    <div class="download-actions">
      <button @click="downloadImage" :disabled="!canDownload || isDownloading"
        class="btn btn-primary btn-lg w-full text-sm sm:text-base" :class="{ 'loading': isDownloading }">
        <svg v-if="!isDownloading" class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8z"></path>
        </svg>
        {{ isDownloading ? '正在生成...' : '下载头像' }}
      </button>

      <!-- 批量下载选项 -->
      <div class="batch-download mt-4">
        <details class="collapse collapse-arrow bg-base-200">
          <summary class="collapse-title text-sm font-medium">批量下载选项</summary>
          <div class="collapse-content">
            <div class="space-y-3 pt-2">
              <label class="cursor-pointer label justify-start">
                <input type="checkbox" v-model="batchOptions.allSizes" class="checkbox checkbox-sm mr-3" />
                <span class="label-text">下载所有尺寸</span>
              </label>
              <label class="cursor-pointer label justify-start">
                <input type="checkbox" v-model="batchOptions.allFormats" class="checkbox checkbox-sm mr-3" />
                <span class="label-text">下载所有格式</span>
              </label>
              <button @click="batchDownload" :disabled="!canBatchDownload || isDownloading"
                class="btn btn-outline btn-sm w-full">
                批量下载
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- 下载历史 -->
    <div v-if="downloadHistory.length > 0" class="download-history mt-6">
      <h4 class="text-md font-medium text-gray-700 mb-3">下载历史</h4>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div v-for="(item, index) in downloadHistory" :key="index"
          class="flex items-center justify-between text-sm bg-white p-2 rounded border">
          <div class="flex items-center">
            <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-gray-700">{{ item.filename }}</span>
          </div>
          <span class="text-gray-500">{{ item.size }}</span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="alert alert-error mt-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h4 class="font-medium">下载失败</h4>
        <p class="text-sm opacity-80">{{ error }}</p>
      </div>
      <button @click="clearError" class="btn btn-sm btn-ghost">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  canvas?: HTMLCanvasElement
  originalImage?: ImageBitmap
  segmentationMask?: ImageBitmap
  background?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Emits
const emit = defineEmits<{
  'download-start': []
  'download-complete': [filename: string, size: string]
  'download-error': [error: string]
}>()

// 响应式数据
const downloadFormat = ref<'png' | 'jpg' | 'webp'>('png')
const downloadSize = ref<'256' | '512' | '1024'>('512')
const quality = ref(0.9)
const isDownloading = ref(false)
const error = ref('')

const batchOptions = ref({
  allSizes: false,
  allFormats: false
})

const downloadHistory = ref<Array<{ filename: string; size: string; timestamp: Date }>>([])

// 计算属性
const canDownload = computed(() => {
  return !props.disabled && props.canvas && !isDownloading.value
})

const canBatchDownload = computed(() => {
  return canDownload.value && (batchOptions.value.allSizes || batchOptions.value.allFormats)
})

const estimatedSize = computed(() => {
  const size = parseInt(downloadSize.value)
  const pixels = size * size

  let bytesPerPixel = 4 // RGBA
  if (downloadFormat.value === 'jpg') {
    bytesPerPixel = 3 * quality.value // RGB with compression
  } else if (downloadFormat.value === 'webp') {
    bytesPerPixel = 2.5 // WebP compression
  }

  const bytes = pixels * bytesPerPixel

  if (bytes < 1024) {
    return `${Math.round(bytes)} B`
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
})

// 方法
const createDownloadCanvas = (size: number): HTMLCanvasElement | null => {
  if (!props.originalImage || !props.segmentationMask || !props.background) {
    return null
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = size
  canvas.height = size

  try {
    // 绘制背景
    if (props.background.type === 'color') {
      ctx.fillStyle = props.background.value
      ctx.fillRect(0, 0, size, size)
    } else {
      ctx.drawImage(props.background.value, 0, 0, size, size)
    }

    // 创建临时画布处理人像蒙版
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = size
    tempCanvas.height = size

    // 绘制原图到临时画布
    tempCtx.drawImage(props.originalImage, 0, 0, size, size)

    // 应用蒙版
    tempCtx.globalCompositeOperation = 'destination-in'
    tempCtx.drawImage(props.segmentationMask, 0, 0, size, size)

    // 将处理后的人像绘制到主画布
    ctx.drawImage(tempCanvas, 0, 0)

    return canvas
  } catch (err) {
    console.error('Failed to create download canvas:', err)
    return null
  }
}

const downloadImage = async () => {
  if (!canDownload.value) return

  isDownloading.value = true
  error.value = ''
  emit('download-start')

  try {
    const size = parseInt(downloadSize.value)
    const canvas = createDownloadCanvas(size)

    if (!canvas) {
      throw new Error('无法创建下载画布')
    }

    const mimeType = `image/${downloadFormat.value}`
    const qualityParam = downloadFormat.value === 'jpg' ? quality.value : undefined

    // 转换为Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('无法生成图片'))
        }
      }, mimeType, qualityParam)
    })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    const filename = `avatar_${timestamp}.${downloadFormat.value}`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    // 记录下载历史
    const sizeStr = formatFileSize(blob.size)
    downloadHistory.value.unshift({
      filename,
      size: sizeStr,
      timestamp: new Date()
    })

    // 限制历史记录数量
    if (downloadHistory.value.length > 5) {
      downloadHistory.value = downloadHistory.value.slice(0, 5)
    }

    emit('download-complete', filename, sizeStr)

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '下载失败'
    error.value = errorMsg
    emit('download-error', errorMsg)
  } finally {
    isDownloading.value = false
  }
}

const batchDownload = async () => {
  if (!canBatchDownload.value) return

  const sizes = batchOptions.value.allSizes ? ['256', '512', '1024'] : [downloadSize.value]
  const formats = batchOptions.value.allFormats ? ['png', 'jpg', 'webp'] : [downloadFormat.value]

  for (const size of sizes) {
    for (const format of formats) {
      const originalSize = downloadSize.value
      const originalFormat = downloadFormat.value

      downloadSize.value = size as any
      downloadFormat.value = format as any

      await downloadImage()

      // 短暂延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500))

      downloadSize.value = originalSize
      downloadFormat.value = originalFormat
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

const clearError = () => {
  error.value = ''
}

// 监听格式变化，自动调整质量
watch(downloadFormat, (newFormat) => {
  if (newFormat === 'jpg' && quality.value > 0.95) {
    quality.value = 0.9 // JPG默认质量
  } else if (newFormat === 'webp' && quality.value < 0.8) {
    quality.value = 0.85 // WebP默认质量
  }
})
</script>

<style scoped>
.option-group {
  @apply space-y-2;
}

.info-item {
  @apply flex items-center;
}

.download-history {
  @apply border-t pt-4;
}

.collapse-content {
  @apply px-4 pb-4;
}
</style>
