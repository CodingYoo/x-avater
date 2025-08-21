<template>
  <div class="background-picker">
    <!-- 标题 -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('background.title') }}</h3>
      <p class="text-gray-600">{{ $t('background.subtitle') }}</p>
    </div>

    <!-- 背景类型切换 -->
    <div class="tabs tabs-boxed mb-6 justify-center">
      <a class="tab" :class="{ 'tab-active': backgroundType === 'color' }" @click="setBackgroundType('color')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z">
          </path>
        </svg>
        {{ $t('background.colorTab') }}
      </a>
      <a class="tab" :class="{ 'tab-active': backgroundType === 'image' }" @click="setBackgroundType('image')">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
          </path>
        </svg>
        {{ $t('background.imageTab') }}
      </a>
    </div>

    <!-- 纯色背景选择 -->
    <div v-if="backgroundType === 'color'" class="color-section">
      <h4 class="text-lg font-medium text-gray-700 mb-4">预设颜色</h4>

      <!-- 预设颜色网格 -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <button v-for="color in presetColors" :key="color" class="color-option"
          :class="{ 'selected': selectedBackground?.type === 'color' && selectedBackground.value === color }"
          :style="{ backgroundColor: color }" @click="selectColor(color)" :title="color">
          <div v-if="selectedBackground?.type === 'color' && selectedBackground.value === color" class="check-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- 自定义颜色选择器 -->
      <div class="custom-color-section">
        <h5 class="text-md font-medium text-gray-600 mb-3">自定义颜色</h5>
        <div class="flex items-center space-x-3">
          <input type="color" v-model="customColor"
            class="color-input w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
            @change="selectColor(customColor)" />
          <div class="flex-1">
            <input type="text" v-model="customColor" placeholder="#FF6B6B" class="input input-bordered w-full"
              @input="validateAndSelectColor" @blur="selectColor(customColor)" />
          </div>
          <button @click="selectColor(customColor)" class="btn btn-primary" :disabled="!isValidColor(customColor)">
            应用
          </button>
        </div>
      </div>
    </div>

    <!-- 图片背景选择 -->
    <div v-else-if="backgroundType === 'image'" class="image-section">
      <!-- 上传区域 -->
      <div class="upload-area" :class="{ 'dragover': isDragOver, 'uploading': backgroundStore.isLoadingBackground }"
        @click="triggerImageInput" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop">
        <input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
          @change="handleImageSelect" />

        <div v-if="backgroundStore.isLoadingBackground" class="upload-loading">
          <div class="loading-spinner"></div>
          <p class="text-lg font-medium text-gray-700 mt-4">正在加载背景图片...</p>
        </div>

        <div v-else-if="selectedBackground?.type === 'image'" class="upload-success">
          <div class="preview-image mb-4">
            <canvas ref="imagePreviewCanvas" class="w-32 h-32 mx-auto rounded-lg shadow-md" width="128"
              height="128"></canvas>
          </div>
          <p class="text-lg font-medium text-gray-700 mb-2">背景图片已选择</p>
          <button @click.stop="clearImage" class="btn btn-outline btn-sm">
            重新选择
          </button>
        </div>

        <div v-else class="upload-prompt">
          <div class="flex items-center justify-center mb-4">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
              </path>
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-gray-700 mb-2">上传背景图片</h4>
          <p class="text-gray-500 mb-4">点击或拖拽图片到此区域</p>
          <div class="text-sm text-gray-400 space-y-1">
            <p>支持格式：JPG、PNG、WEBP</p>
            <p>文件大小：最大 10MB</p>
            <p>建议尺寸：512×512 像素或更高</p>
          </div>
        </div>
      </div>

      <!-- 预设背景图片 -->
      <div class="preset-images mt-6">
        <h5 class="text-md font-medium text-gray-600 mb-3">预设背景</h5>
        <div class="grid grid-cols-3 gap-3">
          <button v-for="(preset, index) in presetBackgrounds" :key="index" class="preset-bg-option"
            :class="{ 'selected': selectedPresetIndex === index }" @click="selectPresetBackground(index)">
            <img :src="preset.thumbnail" :alt="preset.name" class="w-full h-20 object-cover rounded" />
            <span class="text-xs text-gray-600 mt-1">{{ preset.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="backgroundStore.error" class="alert alert-error mt-4">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h4 class="font-medium">{{ backgroundStore.error.message }}</h4>
        <p v-if="backgroundStore.error.code === 'BACKGROUND_TOO_LARGE'" class="text-sm opacity-80">
          文件大小限制：10MB
        </p>
      </div>
      <button @click="backgroundStore.clearError" class="btn btn-sm btn-ghost">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBackgroundStore } from '@/stores/background'
import { PRESET_COLORS } from '@/types'
import type { Background } from '@/types'

// Emits
const emit = defineEmits<{
  'background-changed': [background: Background]
}>()

// Store
const backgroundStore = useBackgroundStore()
const { t } = useI18n()

// 响应式数据
const backgroundType = ref<'color' | 'image'>('color')
const customColor = ref('#FF6B6B')
const isDragOver = ref(false)
const imageInput = ref<HTMLInputElement>()
const imagePreviewCanvas = ref<HTMLCanvasElement>()
const selectedPresetIndex = ref(-1)

// 预设颜色
const presetColors = PRESET_COLORS

// 预设背景图片（这里使用占位符，实际项目中应该是真实的图片）
const presetBackgrounds = [
  { name: '渐变蓝', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0Rjc5QTQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM1Qzk2QzQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==' },
  { name: '渐变紫', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4QjVDRjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNBNzc4RkYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==' },
  { name: '渐变绿', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzNEQ0MDEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2NEQ0MDEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==' }
]

// 计算属性
const selectedBackground = computed(() => backgroundStore.selectedBackground)

// 方法
const setBackgroundType = (type: 'color' | 'image') => {
  backgroundType.value = type
  if (type === 'color' && selectedBackground.value?.type !== 'color') {
    selectColor(presetColors[0])
  }
}

const selectColor = (color: string) => {
  if (isValidColor(color)) {
    backgroundStore.setColorBackground(color)
    emit('background-changed', { type: 'color', value: color })
  }
}

const isValidColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

const validateAndSelectColor = () => {
  if (isValidColor(customColor.value)) {
    selectColor(customColor.value)
  }
}

const triggerImageInput = () => {
  if (!backgroundStore.isLoadingBackground) {
    imageInput.value?.click()
  }
}

const handleImageSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const success = await backgroundStore.setImageBackground(file)
    if (success) {
      selectedPresetIndex.value = -1
      await nextTick()
      updateImagePreview()
      emit('background-changed', backgroundStore.selectedBackground)
    }
  }
  target.value = ''
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const success = await backgroundStore.setImageBackground(files[0])
    if (success) {
      selectedPresetIndex.value = -1
      await nextTick()
      updateImagePreview()
      emit('background-changed', backgroundStore.selectedBackground)
    }
  }
}

const clearImage = () => {
  backgroundStore.resetBackground()
  selectedPresetIndex.value = -1
  setBackgroundType('color')
}

const selectPresetBackground = async (index: number) => {
  selectedPresetIndex.value = index
  // 这里应该加载预设背景图片
  // 为了演示，我们创建一个简单的渐变背景
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createLinearGradient(0, 0, 512, 512)
  const preset = presetBackgrounds[index]

  if (preset.name === '渐变蓝') {
    gradient.addColorStop(0, '#4F79A4')
    gradient.addColorStop(1, '#5C96C4')
  } else if (preset.name === '渐变紫') {
    gradient.addColorStop(0, '#8B5CF6')
    gradient.addColorStop(1, '#A778FF')
  } else {
    gradient.addColorStop(0, '#34D401')
    gradient.addColorStop(1, '#64D401')
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)

  const imageBitmap = await createImageBitmap(canvas)
  backgroundStore.selectedBackground = { type: 'image', value: imageBitmap }

  await nextTick()
  updateImagePreview()
  emit('background-changed', backgroundStore.selectedBackground)
}

const updateImagePreview = () => {
  if (!imagePreviewCanvas.value || selectedBackground.value?.type !== 'image') {
    return
  }

  const canvas = imagePreviewCanvas.value
  const ctx = canvas.getContext('2d')!
  const image = selectedBackground.value.value as ImageBitmap

  ctx.clearRect(0, 0, 128, 128)
  ctx.drawImage(image, 0, 0, 128, 128)
}

// 监听背景变化
watch(selectedBackground, () => {
  if (selectedBackground.value?.type === 'image') {
    backgroundType.value = 'image'
    nextTick(() => {
      updateImagePreview()
    })
  } else if (selectedBackground.value?.type === 'color') {
    backgroundType.value = 'color'
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  if (selectedBackground.value?.type === 'image') {
    nextTick(() => {
      updateImagePreview()
    })
  }
})
</script>

<style scoped>
.color-option {
  @apply w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer transition-all duration-200 flex items-center justify-center;
}

.color-option:hover {
  @apply scale-105 shadow-md;
}

.color-option.selected {
  @apply border-blue-500 scale-105 shadow-lg;
}

.check-icon {
  @apply drop-shadow-lg;
}

.color-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: none;
  cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 0.5rem;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors cursor-pointer min-h-[200px] flex items-center justify-center;
}

.upload-area:hover {
  @apply border-primary bg-primary/5;
}

.upload-area.dragover {
  @apply border-primary bg-primary/10;
}

.upload-area.uploading {
  @apply cursor-not-allowed opacity-70;
}

.preset-bg-option {
  @apply p-2 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 text-center;
}

.preset-bg-option:hover {
  @apply border-blue-300 shadow-md;
}

.preset-bg-option.selected {
  @apply border-blue-500 shadow-lg;
}
</style>
