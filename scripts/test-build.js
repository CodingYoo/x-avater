#!/usr/bin/env node

// 测试构建结果的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 测试构建结果...\n');

const distDir = path.join(__dirname, '..', 'dist');

// 检查必要文件是否存在
const requiredFiles = [
  'index.html',
  '404.html',
  'favicon-simple.svg',
  'favicon.svg',
  'assets'
];

console.log('📋 检查必要文件:');
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

// 检查index.html内容
console.log('\n🔍 检查index.html内容:');
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  // 检查关键内容
  const checks = [
    { name: 'HTML结构', test: content.includes('<div id="app"></div>') },
    { name: '相对路径资源', test: content.includes('src="./assets/') },
    { name: 'favicon引用', test: content.includes('href="./favicon-simple.svg"') },
    { name: 'SPA重定向脚本', test: content.includes('sessionStorage.redirect') }
  ];
  
  for (const check of checks) {
    console.log(`${check.test ? '✅' : '❌'} ${check.name}`);
    if (!check.test) allFilesExist = false;
  }
}

// 检查404.html内容
console.log('\n🔍 检查404.html内容:');
const notFoundPath = path.join(distDir, '404.html');
if (fs.existsSync(notFoundPath)) {
  const content = fs.readFileSync(notFoundPath, 'utf-8');
  const hasRedirectScript = content.includes('sessionStorage.redirect');
  console.log(`${hasRedirectScript ? '✅' : '❌'} SPA重定向脚本`);
  if (!hasRedirectScript) allFilesExist = false;
}

// 检查assets目录
console.log('\n📦 检查assets目录:');
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  console.log(`✅ JS文件: ${jsFiles.length}个`);
  console.log(`✅ CSS文件: ${cssFiles.length}个`);
  
  // 列出主要文件
  console.log('\n📄 主要文件:');
  files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file} (${size} KB)`);
  });
}

console.log('\n📊 测试结果:');
if (allFilesExist) {
  console.log('✅ 所有检查通过！构建结果正确。');
  console.log('\n🚀 部署建议:');
  console.log('1. 推送代码到GitHub触发自动部署');
  console.log('2. 或者手动部署dist目录到你的服务器');
  console.log('3. 确保服务器支持SPA路由（404重定向到index.html）');
} else {
  console.log('❌ 发现问题，请检查构建配置。');
  process.exit(1);
}
