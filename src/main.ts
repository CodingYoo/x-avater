import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import './style.css'
import { performanceMonitor } from '@/utils/performance'
import { i18n, initializeI18n } from '@/i18n'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  }
]

const router = createRouter({
  history: createWebHistory('./'),
  routes,
  // 确保在GitHub Pages上正确处理路由
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

// 初始化i18n
initializeI18n()

app.use(pinia)
app.use(router)
app.use(i18n)

// 启动性能监控
performanceMonitor.startTimer('app-mount')
app.mount('#app')
performanceMonitor.endTimer('app-mount')

// 在开发环境中输出性能报告
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const report = performanceMonitor.getPerformanceReport()
    const requirements = performanceMonitor.checkPerformanceRequirements()

    console.group('🚀 Performance Report')
    console.table(report)

    if (requirements.passed) {
      console.log('✅ All performance requirements met!')
    } else {
      console.warn('⚠️ Performance issues detected:')
      requirements.issues.forEach(issue => console.warn(`- ${issue}`))
    }
    console.groupEnd()
  }, 3000) // 等待3秒让所有指标收集完成
}
