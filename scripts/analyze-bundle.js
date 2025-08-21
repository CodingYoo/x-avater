#!/usr/bin/env node

/**
 * Bundle分析脚本
 * 用于分析构建后的文件大小和性能指标
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { gzipSync } from 'zlib'

const DIST_DIR = 'dist'
const SIZE_LIMITS = {
  js: 500 * 1024,      // 500KB for JS files
  css: 100 * 1024,     // 100KB for CSS files
  total: 2 * 1024 * 1024, // 2MB total (gzipped)
  mediapipe: 1 * 1024 * 1024 // 1MB for MediaPipe chunk
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileSize(filePath) {
  try {
    const content = readFileSync(filePath)
    const gzipped = gzipSync(content)
    return {
      raw: content.length,
      gzipped: gzipped.length
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return { raw: 0, gzipped: 0 }
  }
}

function analyzeDirectory(dir) {
  const files = []
  
  function walkDir(currentDir) {
    const items = readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = join(currentDir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else {
        const ext = extname(item).toLowerCase()
        if (['.js', '.css', '.html', '.wasm'].includes(ext)) {
          const sizes = getFileSize(fullPath)
          files.push({
            path: fullPath.replace(dir + '/', ''),
            ext: ext.slice(1),
            ...sizes
          })
        }
      }
    }
  }
  
  walkDir(dir)
  return files
}

function categorizeFiles(files) {
  const categories = {
    vendor: [],
    mediapipe: [],
    components: [],
    app: [],
    css: [],
    other: []
  }
  
  for (const file of files) {
    if (file.ext === 'css') {
      categories.css.push(file)
    } else if (file.path.includes('vendor') || file.path.includes('vue-vendor')) {
      categories.vendor.push(file)
    } else if (file.path.includes('mediapipe')) {
      categories.mediapipe.push(file)
    } else if (file.path.includes('components')) {
      categories.components.push(file)
    } else if (file.ext === 'js') {
      categories.app.push(file)
    } else {
      categories.other.push(file)
    }
  }
  
  return categories
}

function checkSizeLimits(categories) {
  const issues = []
  
  // 检查总大小
  const totalGzipped = Object.values(categories)
    .flat()
    .reduce((sum, file) => sum + file.gzipped, 0)
  
  if (totalGzipped > SIZE_LIMITS.total) {
    issues.push(`Total bundle size exceeds limit: ${formatBytes(totalGzipped)} > ${formatBytes(SIZE_LIMITS.total)}`)
  }
  
  // 检查MediaPipe大小
  const mediapipeSize = categories.mediapipe.reduce((sum, file) => sum + file.gzipped, 0)
  if (mediapipeSize > SIZE_LIMITS.mediapipe) {
    issues.push(`MediaPipe bundle size exceeds limit: ${formatBytes(mediapipeSize)} > ${formatBytes(SIZE_LIMITS.mediapipe)}`)
  }
  
  // 检查单个JS文件大小
  const largeJsFiles = [...categories.vendor, ...categories.app, ...categories.components]
    .filter(file => file.gzipped > SIZE_LIMITS.js)
  
  for (const file of largeJsFiles) {
    issues.push(`Large JS file: ${file.path} (${formatBytes(file.gzipped)}) > ${formatBytes(SIZE_LIMITS.js)}`)
  }
  
  // 检查CSS文件大小
  const largeCssFiles = categories.css.filter(file => file.gzipped > SIZE_LIMITS.css)
  for (const file of largeCssFiles) {
    issues.push(`Large CSS file: ${file.path} (${formatBytes(file.gzipped)}) > ${formatBytes(SIZE_LIMITS.css)}`)
  }
  
  return issues
}

function generateReport(categories) {
  console.log('\n📊 Bundle Analysis Report\n')
  console.log('=' .repeat(60))
  
  // 总览
  const totalRaw = Object.values(categories).flat().reduce((sum, file) => sum + file.raw, 0)
  const totalGzipped = Object.values(categories).flat().reduce((sum, file) => sum + file.gzipped, 0)
  
  console.log(`\n📈 Overview:`)
  console.log(`Total size (raw): ${formatBytes(totalRaw)}`)
  console.log(`Total size (gzipped): ${formatBytes(totalGzipped)}`)
  console.log(`Compression ratio: ${((1 - totalGzipped / totalRaw) * 100).toFixed(1)}%`)
  
  // 分类统计
  console.log(`\n📂 By Category:`)
  for (const [category, files] of Object.entries(categories)) {
    if (files.length === 0) continue
    
    const categoryGzipped = files.reduce((sum, file) => sum + file.gzipped, 0)
    const percentage = ((categoryGzipped / totalGzipped) * 100).toFixed(1)
    
    console.log(`${category.padEnd(12)}: ${formatBytes(categoryGzipped).padStart(8)} (${percentage}%)`)
    
    // 显示最大的文件
    const largest = files.sort((a, b) => b.gzipped - a.gzipped)[0]
    if (largest) {
      console.log(`  └─ Largest: ${largest.path} (${formatBytes(largest.gzipped)})`)
    }
  }
  
  // 详细文件列表
  console.log(`\n📋 Detailed Files:`)
  const allFiles = Object.values(categories).flat().sort((a, b) => b.gzipped - a.gzipped)
  
  console.log('File'.padEnd(40) + 'Raw'.padStart(10) + 'Gzipped'.padStart(10) + 'Ratio'.padStart(8))
  console.log('-'.repeat(68))
  
  for (const file of allFiles.slice(0, 15)) { // 只显示前15个最大的文件
    const ratio = ((1 - file.gzipped / file.raw) * 100).toFixed(0) + '%'
    console.log(
      file.path.slice(0, 39).padEnd(40) +
      formatBytes(file.raw).padStart(10) +
      formatBytes(file.gzipped).padStart(10) +
      ratio.padStart(8)
    )
  }
  
  if (allFiles.length > 15) {
    console.log(`... and ${allFiles.length - 15} more files`)
  }
}

function main() {
  try {
    console.log('🔍 Analyzing bundle...')
    
    const files = analyzeDirectory(DIST_DIR)
    const categories = categorizeFiles(files)
    
    generateReport(categories)
    
    // 检查大小限制
    const issues = checkSizeLimits(categories)
    
    if (issues.length > 0) {
      console.log('\n⚠️  Size Limit Issues:')
      for (const issue of issues) {
        console.log(`  ❌ ${issue}`)
      }
      console.log('\n💡 Consider:')
      console.log('  - Code splitting for large chunks')
      console.log('  - Tree shaking unused code')
      console.log('  - Lazy loading non-critical components')
      console.log('  - Using dynamic imports for MediaPipe')
      
      process.exit(1)
    } else {
      console.log('\n✅ All size limits are within acceptable ranges!')
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message)
    process.exit(1)
  }
}

main()
