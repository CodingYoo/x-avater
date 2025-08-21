// 性能监控工具

export interface PerformanceMetrics {
  // 页面加载性能
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  
  // 自定义性能指标
  imageProcessingTime?: number
  segmentationTime?: number
  renderTime?: number
  downloadTime?: number
  
  // 内存使用
  memoryUsage?: {
    used: number
    total: number
    percentage: number
  }
  
  // 网络性能
  networkType?: string
  effectiveType?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []
  private timers: Map<string, number> = new Map()

  constructor() {
    this.initializeObservers()
    this.measureCoreWebVitals()
  }

  // 初始化性能观察器
  private initializeObservers() {
    // 观察导航性能
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)
      } catch (e) {
        console.warn('Navigation timing not supported')
      }

      // 观察资源加载性能
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('mediapipe') || entry.name.includes('.wasm')) {
              console.log(`MediaPipe resource loaded: ${entry.name} in ${entry.duration}ms`)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource timing not supported')
      }
    }
  }

  // 测量核心Web指标
  private measureCoreWebVitals() {
    // FCP (First Contentful Paint)
    this.measureFCP()
    
    // LCP (Largest Contentful Paint)
    this.measureLCP()
    
    // FID (First Input Delay)
    this.measureFID()
    
    // CLS (Cumulative Layout Shift)
    this.measureCLS()
  }

  private measureFCP() {
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime
              console.log(`FCP: ${entry.startTime}ms`)
            }
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
        this.observers.push(fcpObserver)
      } catch (e) {
        console.warn('FCP measurement not supported')
      }
    }
  }

  private measureLCP() {
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.lcp = lastEntry.startTime
          console.log(`LCP: ${lastEntry.startTime}ms`)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP measurement not supported')
      }
    }
  }

  private measureFID() {
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // 类型断言为PerformanceEventTiming
            const eventEntry = entry as any
            if (eventEntry.processingStart) {
              this.metrics.fid = eventEntry.processingStart - entry.startTime
              console.log(`FID: ${this.metrics.fid}ms`)
            }
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID measurement not supported')
      }
    }
  }

  private measureCLS() {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // 类型断言为LayoutShift
            const layoutEntry = entry as any
            if (!layoutEntry.hadRecentInput && layoutEntry.value) {
              clsValue += layoutEntry.value
            }
          }
          this.metrics.cls = clsValue
          console.log(`CLS: ${clsValue}`)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS measurement not supported')
      }
    }
  }

  // 开始计时
  startTimer(name: string) {
    this.timers.set(name, performance.now())
  }

  // 结束计时并记录
  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.timers.delete(name)
      
      // 记录到相应的指标
      switch (name) {
        case 'imageProcessing':
          this.metrics.imageProcessingTime = duration
          break
        case 'segmentation':
          this.metrics.segmentationTime = duration
          break
        case 'render':
          this.metrics.renderTime = duration
          break
        case 'download':
          this.metrics.downloadTime = duration
          break
      }
      
      console.log(`${name}: ${duration}ms`)
      return duration
    }
    return 0
  }

  // 测量内存使用
  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
      console.log(`Memory usage: ${this.metrics.memoryUsage.percentage.toFixed(2)}%`)
    }
  }

  // 测量网络信息
  measureNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.metrics.networkType = connection.type
      this.metrics.effectiveType = connection.effectiveType
      console.log(`Network: ${connection.effectiveType} (${connection.type})`)
    }
  }

  // 获取性能报告
  getPerformanceReport(): PerformanceMetrics {
    this.measureMemoryUsage()
    this.measureNetworkInfo()
    return { ...this.metrics }
  }

  // 检查性能是否符合要求
  checkPerformanceRequirements(): {
    passed: boolean
    issues: string[]
  } {
    const issues: string[] = []
    
    // 检查FCP (应该 ≤ 1.5s)
    if (this.metrics.fcp && this.metrics.fcp > 1500) {
      issues.push(`首屏渲染时间过长: ${this.metrics.fcp}ms (要求 ≤ 1500ms)`)
    }
    
    // 检查LCP (应该 ≤ 2.5s)
    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      issues.push(`最大内容渲染时间过长: ${this.metrics.lcp}ms (要求 ≤ 2500ms)`)
    }
    
    // 检查分割时间 (应该 ≤ 2s)
    if (this.metrics.segmentationTime && this.metrics.segmentationTime > 2000) {
      issues.push(`AI分割时间过长: ${this.metrics.segmentationTime}ms (要求 ≤ 2000ms)`)
    }
    
    // 检查内存使用 (应该 ≤ 80%)
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.percentage > 80) {
      issues.push(`内存使用过高: ${this.metrics.memoryUsage.percentage.toFixed(2)}% (要求 ≤ 80%)`)
    }
    
    return {
      passed: issues.length === 0,
      issues
    }
  }

  // 清理观察器
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.timers.clear()
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 性能优化工具函数
export const performanceUtils = {
  // 防抖函数
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  },

  // 节流函数
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // 图片预加载
  preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  },

  // 延迟加载
  lazyLoad(callback: () => void, delay: number = 0) {
    if (delay === 0) {
      requestAnimationFrame(callback)
    } else {
      setTimeout(callback, delay)
    }
  }
}
