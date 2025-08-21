// MediaPipe Selfie Segmentation 类型声明

declare module '@mediapipe/selfie_segmentation' {
  export interface SelfieSegmentationConfig {
    locateFile?: (file: string) => string
  }

  export interface SelfieSegmentationOptions {
    modelSelection?: 0 | 1  // 0: general model, 1: landscape model
  }

  export interface SelfieSegmentationResults {
    segmentationMask: ImageBitmap
    image: ImageBitmap
  }

  export type OnResultsCallback = (results: SelfieSegmentationResults) => void

  export class SelfieSegmentation {
    constructor(config: SelfieSegmentationConfig)
    
    setOptions(options: SelfieSegmentationOptions): void
    onResults(callback: OnResultsCallback): void
    send(inputs: { image: ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement }): Promise<void>
    close(): void
  }
}

// 扩展全局类型
declare global {
  interface Window {
    // 如果需要在window上挂载MediaPipe相关对象
    mediapipeLoaded?: boolean
  }
}
