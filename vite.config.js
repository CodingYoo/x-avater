import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'

// 修复版本 - 使用相对路径，适用于任何GitHub Pages仓库
export default defineConfig({
  // 使用相对路径，自动适配任何仓库名
  base: './',

  // 确保public目录被正确处理
  publicDir: 'public',

  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 移除生产环境中的注释
          comments: false
        }
      }
    }),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    // GitHub Pages部署优化
    outDir: 'dist',
    assetsDir: 'assets',

    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // 生产环境移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000,

    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI组件
          'ui-vendor': ['vue-i18n'],
          // MediaPipe相关
          'mediapipe-vendor': ['@mediapipe/selfie_segmentation'],
        },
      },
    },
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vue-i18n',
    ],
  },
})
