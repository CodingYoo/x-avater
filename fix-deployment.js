#!/usr/bin/env node

// 修复GitHub Pages部署问题
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 修复GitHub Pages部署问题...\n');

// 1. 备份当前工作流
const workflowDir = path.join(__dirname, '.github', 'workflows');
const currentWorkflow = path.join(workflowDir, 'deploy.yml');
const backupWorkflow = path.join(workflowDir, 'deploy-backup.yml');

if (fs.existsSync(currentWorkflow)) {
  fs.copyFileSync(currentWorkflow, backupWorkflow);
  console.log('✅ 已备份当前工作流到 deploy-backup.yml');
}

// 2. 使用修复版工作流
const fixedWorkflow = path.join(workflowDir, 'deploy-fixed.yml');
if (fs.existsSync(fixedWorkflow)) {
  fs.copyFileSync(fixedWorkflow, currentWorkflow);
  console.log('✅ 已应用修复版工作流');
}

// 3. 检查构建脚本
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts['build:gh-pages']) {
    console.log('✅ build:gh-pages 脚本存在');
  } else {
    console.log('❌ build:gh-pages 脚本不存在，请检查 package.json');
  }
}

// 4. 验证构建输出
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  console.log(`✅ dist 目录存在，包含 ${files.length} 个文件`);
  
  const requiredFiles = ['index.html', 'favicon.svg', '404.html', 'test.html', 'simple.html'];
  const missingFiles = requiredFiles.filter(file => !files.includes(file));
  
  if (missingFiles.length === 0) {
    console.log('✅ 所有必需文件都存在');
  } else {
    console.log(`❌ 缺少文件: ${missingFiles.join(', ')}`);
  }
} else {
  console.log('❌ dist 目录不存在，请先运行构建');
}

console.log('\n🚀 修复完成！请执行以下步骤：\n');
console.log('1. 推送修复后的工作流：');
console.log('   git add .');
console.log('   git commit -m "Fix GitHub Pages deployment workflow"');
console.log('   git push origin main\n');
console.log('2. 等待GitHub Actions重新部署（3-5分钟）\n');
console.log('3. 检查Actions标签页的部署日志\n');
console.log('4. 重新测试网站访问\n');
console.log('📋 修复内容：');
console.log('   - 使用正确的构建命令：npm run build:gh-pages');
console.log('   - 添加构建文件列表调试信息');
console.log('   - 使用更可靠的部署Action');
console.log('   - 强制清理旧的部署文件');
console.log('   - 禁用Jekyll处理\n');
console.log('🔍 如果仍有问题：');
console.log('   - 检查GitHub Pages设置是否正确');
console.log('   - 确认仓库是public');
console.log('   - 查看Actions运行日志');
console.log('   - 尝试手动部署：gh-pages -d dist');
