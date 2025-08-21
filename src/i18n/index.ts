import { createI18n } from 'vue-i18n'

// 动态导入语言包以避免TypeScript模块解析问题
const zhCN = {
  "app": {
    "title": "Avatar Background Swap - 头像换背景",
    "subtitle": "AI智能头像换背景",
    "description": "一键更换头像背景，AI智能抠图，快速生成个性化头像"
  },
  "header": {
    "progress": "进度",
    "languageSwitch": "切换语言"
  },
  "steps": {
    "upload": "上传图片",
    "segment": "AI抠图",
    "background": "选择背景",
    "download": "下载结果"
  },
  "upload": {
    "title": "上传头像图片",
    "subtitle": "点击或拖拽图片到此区域",
    "formats": "支持格式：JPG、PNG、WEBP",
    "maxSize": "文件大小：最大 5MB",
    "recommended": "建议尺寸：512×512 像素或更高",
    "processing": "正在处理图片...",
    "success": "图片上传成功",
    "reupload": "重新上传",
    "proceed": "开始AI抠图",
    "size": "尺寸",
    "fileSize": "大小",
    "errors": {
      "currentSize": "当前文件大小"
    }
  },
  "segmentation": {
    "title": "AI智能抠图",
    "subtitle": "正在使用AI技术分离人像和背景...",
    "processing": "处理进度",
    "completed": "抠图完成！",
    "nextStep": "选择背景"
  },
  "background": {
    "title": "选择背景",
    "subtitle": "选择预设颜色或上传自定义背景图片",
    "colorTab": "纯色背景",
    "imageTab": "图片背景"
  },
  "loading": {
    "title": "加载中...",
    "initializing": "正在启动应用",
    "subtitle": "请稍候，我们正在为您准备最佳体验",
    "steps": {
      "compatibility": "检查浏览器兼容性",
      "resources": "加载应用资源",
      "state": "初始化状态管理",
      "ui": "准备用户界面"
    }
  },
  "common": {
    "ok": "确定",
    "cancel": "取消",
    "loading": "加载中",
    "success": "成功",
    "error": "错误"
  }
}

const enUS = {
  "app": {
    "title": "Avatar Background Swap",
    "subtitle": "AI-Powered Avatar Background Replacement",
    "description": "One-click avatar background replacement with AI-powered image segmentation"
  },
  "header": {
    "progress": "Progress",
    "languageSwitch": "Switch Language"
  },
  "steps": {
    "upload": "Upload Image",
    "segment": "AI Segmentation",
    "background": "Choose Background",
    "download": "Download Result"
  },
  "upload": {
    "title": "Upload Avatar Image",
    "subtitle": "Click or drag image to this area",
    "formats": "Supported formats: JPG, PNG, WEBP",
    "maxSize": "File size: Max 5MB",
    "recommended": "Recommended size: 512×512 pixels or higher",
    "processing": "Processing image...",
    "success": "Image uploaded successfully",
    "reupload": "Re-upload",
    "proceed": "Start AI Segmentation",
    "size": "Size",
    "fileSize": "File Size",
    "errors": {
      "currentSize": "Current file size"
    }
  },
  "segmentation": {
    "title": "AI Smart Segmentation",
    "subtitle": "Using AI technology to separate portrait and background...",
    "processing": "Processing progress",
    "completed": "Segmentation completed!",
    "nextStep": "Choose Background"
  },
  "background": {
    "title": "Choose Background",
    "subtitle": "Select preset colors or upload custom background image",
    "colorTab": "Solid Color",
    "imageTab": "Image Background"
  },
  "preview": {
    "title": "Live Preview",
    "subtitle": "View AI segmentation and background composition effects"
  },
  "download": {
    "title": "Download Result",
    "subtitle": "Save your personalized avatar"
  },
  "navigation": {
    "previous": "Previous Step",
    "next": "Next Step",
    "restart": "Restart",
    "newAvatar": "Create New Avatar"
  },
  "loading": {
    "title": "Loading...",
    "initializing": "Starting Application",
    "subtitle": "Please wait, we're preparing the best experience for you",
    "steps": {
      "compatibility": "Checking browser compatibility",
      "resources": "Loading application resources",
      "state": "Initializing state management",
      "ui": "Preparing user interface"
    }
  },
  "common": {
    "ok": "OK",
    "cancel": "Cancel",
    "loading": "Loading",
    "success": "Success",
    "error": "Error"
  }
}

// 支持的语言列表
export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
] as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]['code']

// 获取浏览器默认语言
function getBrowserLocale(): SupportedLocale {
  try {
    const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN'

    // 检查是否支持浏览器语言
    for (const locale of SUPPORTED_LOCALES) {
      if (browserLang.startsWith(locale.code.split('-')[0])) {
        return locale.code
      }
    }
  } catch (error) {
    console.warn('Failed to get browser locale:', error)
  }

  // 默认返回中文
  return 'zh-CN'
}

// 从localStorage获取保存的语言设置
function getSavedLocale(): SupportedLocale | null {
  try {
    const saved = localStorage.getItem('app-locale')
    if (saved && SUPPORTED_LOCALES.some(locale => locale.code === saved)) {
      return saved as SupportedLocale
    }
  } catch (error) {
    console.warn('Failed to get saved locale:', error)
  }
  return null
}

// 保存语言设置到localStorage
export function saveLocale(locale: SupportedLocale) {
  try {
    localStorage.setItem('app-locale', locale)
  } catch (error) {
    console.warn('Failed to save locale:', error)
  }
}

// 获取初始语言设置
function getInitialLocale(): SupportedLocale {
  return getSavedLocale() || getBrowserLocale()
}

// 创建i18n实例
export const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  // 全局注入$t函数
  globalInjection: true,
  // 在生产环境中禁用警告
  silentTranslationWarn: process.env.NODE_ENV === 'production',
  // 缺失翻译时的回退策略
  missingWarn: process.env.NODE_ENV !== 'production',
  fallbackWarn: process.env.NODE_ENV !== 'production'
})

// 切换语言的工具函数
export function setLocale(locale: SupportedLocale) {
  if (SUPPORTED_LOCALES.some(l => l.code === locale)) {
    i18n.global.locale.value = locale
    saveLocale(locale)
    
    // 更新HTML lang属性
    document.documentElement.lang = locale
    
    // 更新页面标题
    const title = i18n.global.t('app.title')
    document.title = title
    
    console.log(`Language switched to: ${locale}`)
  } else {
    console.warn(`Unsupported locale: ${locale}`)
  }
}

// 获取当前语言
export function getCurrentLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale
}

// 获取语言显示名称
export function getLocaleName(locale: SupportedLocale): string {
  const found = SUPPORTED_LOCALES.find(l => l.code === locale)
  return found ? found.name : locale
}

// 获取语言标志
export function getLocaleFlag(locale: SupportedLocale): string {
  const found = SUPPORTED_LOCALES.find(l => l.code === locale)
  return found ? found.flag : '🌐'
}

// 检查是否为RTL语言
export function isRTL(_locale: SupportedLocale): boolean {
  // 目前支持的语言都是LTR，如果以后添加阿拉伯语等RTL语言需要更新
  return false
}

// 格式化数字
export function formatNumber(value: number, locale?: SupportedLocale): string {
  const currentLocale = locale || getCurrentLocale()
  return new Intl.NumberFormat(currentLocale).format(value)
}

// 格式化日期
export function formatDate(date: Date, locale?: SupportedLocale): string {
  const currentLocale = locale || getCurrentLocale()
  return new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// 格式化时间
export function formatTime(date: Date, locale?: SupportedLocale): string {
  const currentLocale = locale || getCurrentLocale()
  return new Intl.DateTimeFormat(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

// 格式化文件大小（本地化）
export function formatFileSize(bytes: number, locale?: SupportedLocale): string {
  const currentLocale = locale || getCurrentLocale()
  
  if (bytes === 0) {
    return currentLocale === 'zh-CN' ? '0 字节' : '0 Bytes'
  }
  
  const k = 1024
  const sizes = currentLocale === 'zh-CN' 
    ? ['字节', 'KB', 'MB', 'GB', 'TB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  
  return `${formatNumber(value, locale)} ${sizes[i]}`
}

// 初始化i18n
export function initializeI18n() {
  // 设置初始HTML lang属性
  document.documentElement.lang = getCurrentLocale()
  
  // 设置初始页面标题
  const title = i18n.global.t('app.title')
  document.title = title
  
  console.log(`I18n initialized with locale: ${getCurrentLocale()}`)
}

export default i18n
