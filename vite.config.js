import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages部署配置
  base: process.env.NODE_ENV === 'production' ? '/x-avater/' : '/',

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
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@mediapipe/selfie_segmentation'],
    include: ['vue', 'vue-router', 'pinia']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
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
    rollupOptions: {
      output: {
        // 更细粒度的代码分割
        manualChunks: {
          // Vue核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI库
          'ui-vendor': ['daisyui'],
          // MediaPipe（单独分块，按需加载）
          'mediapipe': ['@mediapipe/selfie_segmentation'],
          // 工具函数
          'utils': ['src/services/mediapipe.ts'],
        },
        // 文件命名策略
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('mediapipe')) {
              return 'assets/mediapipe-[hash].js'
            }
            if (facadeModuleId.includes('components')) {
              return 'assets/components-[hash].js'
            }
          }
          return 'assets/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 启用源码映射（仅开发环境）
    sourcemap: false,
  },
  // 预加载优化
  experimental: {
    renderBuiltUrl (filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})
