#!/usr/bin/env node

// 静态构建脚本 - 直接复制文件，不依赖复杂的构建工具
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始静态构建...\n');

// 清理dist目录
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
  console.log('🗑️  清理旧的dist目录');
}

// 创建dist目录
fs.mkdirSync(distDir, { recursive: true });
console.log('📁 创建新的dist目录');

// 复制文件的函数
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 复制: ${path.basename(src)}`);
    return true;
  } catch (error) {
    console.log(`❌ 复制失败: ${path.basename(src)} - ${error.message}`);
    return false;
  }
}

// 要复制的文件列表
const filesToCopy = [
  // 主页面 - 使用静态版本
  { src: 'public/index-static.html', dest: 'dist/index.html' },
  
  // 测试和工具页面
  { src: 'public/test.html', dest: 'dist/test.html' },
  { src: 'public/simple.html', dest: 'dist/simple.html' },
  { src: 'public/debug.html', dest: 'dist/debug.html' },
  { src: 'public/404.html', dest: 'dist/404.html' },
  
  // 图标文件
  { src: 'public/favicon.svg', dest: 'dist/favicon.svg' },
  { src: 'public/favicon-simple.svg', dest: 'dist/favicon-simple.svg' },
];

// 复制文件
console.log('\n📋 复制文件:');
let successCount = 0;
let totalCount = filesToCopy.length;

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(__dirname, dest);
  
  if (fs.existsSync(srcPath)) {
    if (copyFile(srcPath, destPath)) {
      successCount++;
    }
  } else {
    console.log(`⚠️  源文件不存在: ${src}`);
  }
});

// 创建favicon.ico（如果不存在）
const faviconIcoPath = path.join(distDir, 'favicon.ico');
if (!fs.existsSync(faviconIcoPath)) {
  // 复制SVG作为ICO的替代
  const faviconSvgPath = path.join(distDir, 'favicon-simple.svg');
  if (fs.existsSync(faviconSvgPath)) {
    fs.copyFileSync(faviconSvgPath, faviconIcoPath);
    console.log('✅ 创建: favicon.ico (从SVG复制)');
    successCount++;
    totalCount++;
  }
}

// 创建.nojekyll文件
const nojekyllPath = path.join(distDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('✅ 创建: .nojekyll');

// 创建CNAME文件（如果需要自定义域名）
// const cnamePath = path.join(distDir, 'CNAME');
// fs.writeFileSync(cnamePath, 'your-domain.com');

console.log('\n📊 构建结果:');
console.log(`✅ 成功: ${successCount}/${totalCount} 个文件`);

if (successCount === totalCount) {
  console.log('\n🎉 静态构建完成！');
  console.log('\n📁 生成的文件:');
  
  // 列出生成的文件
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file} (${size} KB)`);
  });
  
  console.log('\n🚀 部署说明:');
  console.log('1. 推送代码到GitHub:');
  console.log('   git add .');
  console.log('   git commit -m "Deploy static version"');
  console.log('   git push origin main');
  console.log('');
  console.log('2. 等待GitHub Actions部署完成');
  console.log('');
  console.log('3. 访问: https://你的用户名.github.io/你的仓库名/');
  console.log('');
  console.log('🎯 特点:');
  console.log('   - 纯静态HTML，无需复杂构建');
  console.log('   - 完整的头像换背景功能');
  console.log('   - 响应式设计，移动端友好');
  console.log('   - 包含测试和调试工具');
  
} else {
  console.log('\n❌ 构建过程中有错误，请检查上述信息');
  process.exit(1);
}
