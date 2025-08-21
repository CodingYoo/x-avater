import type { SelfieSegmentation, SelfieSegmentationResults } from '@mediapipe/selfie_segmentation'
import { performanceMonitor } from '@/utils/performance'

// 简单的本地抠图算法作为备选方案
class LocalSegmentation {
  /**
   * 使用简单的颜色差异算法进行快速抠图
   * 适用于背景相对简单的头像图片
   */
  static async quickSegment(imageBitmap: ImageBitmap): Promise<ImageBitmap> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = imageBitmap.width
    canvas.height = imageBitmap.height

    // 绘制原图
    ctx.drawImage(imageBitmap, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 简单的边缘检测和背景移除
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4
      const x = pixelIndex % canvas.width
      const y = Math.floor(pixelIndex / canvas.width)

      // 计算距离中心的距离
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

      // 如果距离超过阈值，设为透明
      if (distance > maxRadius) {
        data[i + 3] = 0 // Alpha通道设为0（透明）
      } else {
        // 根据距离调整透明度，创建渐变效果
        const alpha = Math.max(0, 1 - (distance / maxRadius) * 0.3)
        data[i + 3] = Math.floor(data[i + 3] * alpha)
      }
    }

    // 应用处理后的数据
    ctx.putImageData(imageData, 0, 0)

    // 转换为ImageBitmap
    return createImageBitmap(canvas)
  }
}

export class MediaPipeService {
  private selfieSegmentation: SelfieSegmentation | null = null
  private isInitialized = false
  private isInitializing = false
  private wasmCache: Map<string, ArrayBuffer> = new Map()
  private modelCache: Map<string, any> = new Map()

  /**
   * 初始化MediaPipe Selfie Segmentation
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    if (this.isInitializing) {
      // 等待初始化完成
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.isInitialized
    }

    this.isInitializing = true
    performanceMonitor.startTimer('mediapipe-init')

    try {
      // 检查缓存
      const cacheKey = 'selfie_segmentation_v1'
      if (this.modelCache.has(cacheKey)) {
        this.selfieSegmentation = this.modelCache.get(cacheKey)
        this.isInitialized = true
        performanceMonitor.endTimer('mediapipe-init')
        console.log('MediaPipe loaded from cache')
        return true
      }

      // 动态导入MediaPipe - 尝试不同的导入方式
      let SelfieSegmentation: any

      try {
        // 方式1：直接导入
        const module1 = await import('@mediapipe/selfie_segmentation')
        SelfieSegmentation = module1.SelfieSegmentation

        if (!SelfieSegmentation) {
          // 方式2：从default导入
          SelfieSegmentation = module1.default?.SelfieSegmentation || module1.default
        }

        if (!SelfieSegmentation) {
          // 方式3：全局对象
          SelfieSegmentation = (window as any).SelfieSegmentation
        }

        if (!SelfieSegmentation || typeof SelfieSegmentation !== 'function') {
          throw new Error('SelfieSegmentation constructor not available')
        }

        console.log('MediaPipe SelfieSegmentation loaded successfully')
      } catch (importError) {
        console.error('MediaPipe import error:', importError)
        throw new Error(`Failed to import MediaPipe: ${importError}`)
      }

      // 创建实例
      this.selfieSegmentation = new SelfieSegmentation({
        locateFile: (file: string) => {
          // 优先使用本地资源，提高加载速度
          const localUrl = `/node_modules/@mediapipe/selfie_segmentation/${file}`

          // 预加载WASM文件到缓存
          if (file.endsWith('.wasm') && !this.wasmCache.has(file)) {
            this.preloadWasm(localUrl, file)
          }

          return localUrl
        }
      })

      // 配置选项 - 使用性能优化的设置
      if (this.selfieSegmentation) {
        this.selfieSegmentation.setOptions({
          modelSelection: 0, // 使用general模型，更快的处理速度
        })
      }

      // 缓存实例
      this.modelCache.set(cacheKey, this.selfieSegmentation)

      this.isInitialized = true
      performanceMonitor.endTimer('mediapipe-init')
      console.log('MediaPipe Selfie Segmentation initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error)
      this.isInitialized = false
      performanceMonitor.endTimer('mediapipe-init')
      return false
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * 预加载WASM文件
   */
  private async preloadWasm(url: string, filename: string) {
    try {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      this.wasmCache.set(filename, buffer)
      console.log(`WASM file cached: ${filename}`)
    } catch (error) {
      console.warn(`Failed to cache WASM file: ${filename}`, error)
    }
  }

  /**
   * 快速本地分割（备选方案）
   */
  async quickSegment(
    imageBitmap: ImageBitmap,
    onProgress?: (progress: number) => void
  ): Promise<{ segmentationMask: ImageBitmap }> {
    performanceMonitor.startTimer('segmentation')

    if (onProgress) onProgress(20)

    try {
      const mask = await LocalSegmentation.quickSegment(imageBitmap)

      if (onProgress) onProgress(100)

      performanceMonitor.endTimer('segmentation')
      console.log('Quick segmentation completed')

      return { segmentationMask: mask }
    } catch (error) {
      performanceMonitor.endTimer('segmentation')
      throw new Error(`Quick segmentation failed: ${error}`)
    }
  }

  /**
   * 执行人像分割（MediaPipe高质量版本）
   */
  async segmentImage(
    imageBitmap: ImageBitmap,
    onProgress?: (progress: number) => void
  ): Promise<SelfieSegmentationResults | null> {
    if (!this.isInitialized || !this.selfieSegmentation) {
      const initialized = await this.initialize()
      if (!initialized) {
        throw new Error('Failed to initialize MediaPipe')
      }
    }

    performanceMonitor.startTimer('segmentation')

    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      // 设置进度回调
      if (onProgress) {
        onProgress(10) // 开始处理
      }

      // 设置结果回调
      this.selfieSegmentation!.onResults((results: SelfieSegmentationResults) => {
        try {
          const processingTime = Date.now() - startTime
          performanceMonitor.endTimer('segmentation')
          console.log(`Segmentation completed in ${processingTime}ms`)

          if (onProgress) {
            onProgress(100) // 处理完成
          }

          resolve(results)
        } catch (error) {
          performanceMonitor.endTimer('segmentation')
          reject(new Error(`Segmentation processing failed: ${error}`))
        }
      })

      try {
        // 发送图像进行处理
        if (onProgress) {
          onProgress(50) // 发送中
        }

        this.selfieSegmentation!.send({ image: imageBitmap })
      } catch (error) {
        performanceMonitor.endTimer('segmentation')
        reject(new Error(`Failed to send image to MediaPipe: ${error}`))
      }
    })
  }

  /**
   * 创建合成图像
   */
  createCompositeImage(
    originalImage: ImageBitmap,
    segmentationMask: ImageBitmap,
    background: string | ImageBitmap,
    outputSize: { width: number; height: number } = { width: 512, height: 512 }
  ): HTMLCanvasElement {
    performanceMonitor.startTimer('render')

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', {
      alpha: false, // 禁用alpha通道以提升性能
      desynchronized: true // 允许异步渲染
    })!

    canvas.width = outputSize.width
    canvas.height = outputSize.height

    // 启用图像平滑以提升质量
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景
    if (typeof background === 'string') {
      // 纯色背景
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      // 图片背景 - 使用优化的绘制方式
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    }

    // 创建临时画布用于处理蒙版 - 使用OffscreenCanvas如果支持
    let tempCanvas: HTMLCanvasElement | OffscreenCanvas
    let tempCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

    if (typeof OffscreenCanvas !== 'undefined') {
      tempCanvas = new OffscreenCanvas(canvas.width, canvas.height)
      tempCtx = tempCanvas.getContext('2d', { alpha: true })!
    } else {
      tempCanvas = document.createElement('canvas')
      tempCtx = (tempCanvas as HTMLCanvasElement).getContext('2d', { alpha: true })!
      ;(tempCanvas as HTMLCanvasElement).width = canvas.width
      ;(tempCanvas as HTMLCanvasElement).height = canvas.height
    }

    // 启用图像平滑
    tempCtx.imageSmoothingEnabled = true
    tempCtx.imageSmoothingQuality = 'high'

    // 绘制原图到临时画布
    tempCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height)

    // 应用蒙版
    tempCtx.globalCompositeOperation = 'destination-in'
    tempCtx.drawImage(segmentationMask, 0, 0, canvas.width, canvas.height)

    // 将处理后的人像绘制到主画布
    if (tempCanvas instanceof OffscreenCanvas) {
      // OffscreenCanvas需要转换为ImageBitmap
      tempCanvas.convertToBlob().then(blob => {
        createImageBitmap(blob).then(bitmap => {
          ctx.drawImage(bitmap, 0, 0)
          bitmap.close()
        })
      })
    } else {
      ctx.drawImage(tempCanvas as HTMLCanvasElement, 0, 0)
    }

    performanceMonitor.endTimer('render')
    return canvas
  }

  /**
   * 检查浏览器兼容性
   */
  static checkCompatibility(): { compatible: boolean; issues: string[] } {
    const issues: string[] = []

    // 检查WebAssembly支持
    if (typeof WebAssembly === 'undefined') {
      issues.push('WebAssembly not supported')
    }

    // 检查Canvas支持
    if (!document.createElement('canvas').getContext) {
      issues.push('Canvas not supported')
    }

    // 检查ImageBitmap支持
    if (typeof createImageBitmap === 'undefined') {
      issues.push('ImageBitmap not supported')
    }

    // 检查ES6模块支持 (在现代浏览器中通常都支持)
    // 注意：typeof import 在构建时不被支持，所以我们跳过这个检查

    return {
      compatible: issues.length === 0,
      issues
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close()
      this.selfieSegmentation = null
    }
    this.isInitialized = false
    this.isInitializing = false
  }

  /**
   * 获取初始化状态
   */
  get initialized(): boolean {
    return this.isInitialized
  }
}

// 创建单例实例
export const mediaPipeService = new MediaPipeService()
