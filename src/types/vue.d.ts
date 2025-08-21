// Vue 组件相关类型定义

import { DefineComponent } from 'vue'

// 组件 Props 类型
export interface UploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
}

export interface PreviewProps {
  originalImage?: ImageBitmap
  segmentationMask?: ImageBitmap
  background?: Background
  width?: number
  height?: number
}

export interface BackgroundPickerProps {
  selectedBackground?: Background
  presetColors?: string[]
}

export interface DownloadBtnProps {
  canvas?: HTMLCanvasElement
  filename?: string
  disabled?: boolean
}

// 组件 Emits 类型
export interface UploadEmits {
  (e: 'file-selected', file: File): void
  (e: 'error', error: string): void
}

export interface BackgroundPickerEmits {
  (e: 'background-changed', background: Background): void
}

export interface DownloadBtnEmits {
  (e: 'download-start'): void
  (e: 'download-complete'): void
  (e: 'download-error', error: string): void
}

// 组件实例类型
export type UploadComponent = DefineComponent<UploadProps, {}, {}, {}, {}, {}, {}, UploadEmits>
export type PreviewComponent = DefineComponent<PreviewProps>
export type BackgroundPickerComponent = DefineComponent<BackgroundPickerProps, {}, {}, {}, {}, {}, {}, BackgroundPickerEmits>
export type DownloadBtnComponent = DefineComponent<DownloadBtnProps, {}, {}, {}, {}, {}, {}, DownloadBtnEmits>
