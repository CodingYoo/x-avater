// 核心数据结构定义（基于PRD附录B）

export interface Segmentation {
  mask: ImageBitmap  // 0-255 alpha
  width: number
  height: number
}

export interface Background {
  type: 'color' | 'image'
  value: string | ImageBitmap
}

// 文件上传相关类型
export interface UploadFile {
  file: File
  url: string
  width: number
  height: number
  imageBitmap?: ImageBitmap
}

// MediaPipe相关类型
export interface MediaPipeResults {
  segmentationMask: ImageBitmap
  image: ImageBitmap
}

// 应用状态类型
export interface AppState {
  isLoading: boolean
  error: string | null
  step: 'upload' | 'segment' | 'background' | 'download'
}

// 预设背景颜色
export const PRESET_COLORS = [
  '#FFFFFF', // 红色
  '#438EDB', // 青色
  '#FF0000', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 黄色
  '#DDA0DD', // 紫色
  '#98D8C8', // 薄荷绿
  '#F7DC6F', // 金色
] as const

export type PresetColor = typeof PRESET_COLORS[number]

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
}

// 下载配置
export interface DownloadConfig {
  format: 'png' | 'jpg'
  quality: number
  width: number
  height: number
}
