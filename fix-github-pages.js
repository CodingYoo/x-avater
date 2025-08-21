#!/usr/bin/env node

// 快速修复GitHub Pages空白页问题
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 修复GitHub Pages空白页问题...\n');

// 1. 备份原配置
const originalConfig = path.join(__dirname, 'vite.config.js');
const backupConfig = path.join(__dirname, 'vite.config.backup.js');

if (fs.existsSync(originalConfig)) {
  fs.copyFileSync(originalConfig, backupConfig);
  console.log('✅ 已备份原配置文件到 vite.config.backup.js');
}

// 2. 使用修复版配置
const fixConfig = path.join(__dirname, 'vite.config.fix.js');
if (fs.existsSync(fixConfig)) {
  fs.copyFileSync(fixConfig, originalConfig);
  console.log('✅ 已应用修复版配置');
}

// 3. 检查package.json中的homepage字段
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 如果没有homepage字段，添加一个通用的
  if (!packageJson.homepage) {
    packageJson.homepage = './';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ 已添加homepage字段到package.json');
  }
}

// 4. 创建.nojekyll文件（GitHub Pages优化）
const nojekyllPath = path.join(__dirname, 'public', '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '');
  console.log('✅ 已创建.nojekyll文件');
}

console.log('\n🚀 修复完成！请执行以下步骤：\n');
console.log('1. 重新构建项目：');
console.log('   npm run build:gh-pages\n');
console.log('2. 推送到GitHub：');
console.log('   git add .');
console.log('   git commit -m "Fix GitHub Pages blank page issue"');
console.log('   git push origin main\n');
console.log('3. 等待GitHub Actions重新部署\n');
console.log('📋 修复内容：');
console.log('   - 使用相对路径配置（base: "./"）');
console.log('   - 添加.nojekyll文件');
console.log('   - 优化资源路径配置');
console.log('   - 备份原配置文件\n');
console.log('🔍 如果仍有问题，请检查：');
console.log('   - GitHub Pages设置是否正确');
console.log('   - 仓库是否为public');
console.log('   - gh-pages分支是否存在内容');
