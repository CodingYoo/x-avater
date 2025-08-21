#!/usr/bin/env node

// 验证部署准备情况
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 验证部署准备情况...\n');

let allGood = true;

// 1. 检查工作流文件
const workflowFile = path.join(__dirname, '.github', 'workflows', 'deploy.yml');
if (fs.existsSync(workflowFile)) {
  const content = fs.readFileSync(workflowFile, 'utf8');
  if (content.includes('npm run build:gh-pages')) {
    console.log('✅ GitHub Actions工作流使用正确的构建命令');
  } else {
    console.log('❌ GitHub Actions工作流构建命令错误');
    allGood = false;
  }
  
  if (content.includes('peaceiris/actions-gh-pages')) {
    console.log('✅ 使用可靠的部署Action');
  } else {
    console.log('⚠️  使用标准GitHub Pages部署');
  }
} else {
  console.log('❌ GitHub Actions工作流文件不存在');
  allGood = false;
}

// 2. 检查构建配置
const viteConfig = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfig)) {
  const content = fs.readFileSync(viteConfig, 'utf8');
  if (content.includes("base: './'") || content.includes('base: "./"')) {
    console.log('✅ Vite配置使用相对路径');
  } else {
    console.log('❌ Vite配置路径可能有问题');
    allGood = false;
  }
} else {
  console.log('❌ Vite配置文件不存在');
  allGood = false;
}

// 3. 检查构建输出
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  console.log(`✅ 构建输出包含 ${files.length} 个文件`);
  
  // 检查关键文件
  const criticalFiles = [
    'index.html',
    'test.html', 
    'simple.html',
    'debug.html',
    'favicon.svg',
    '404.html'
  ];
  
  const missingFiles = criticalFiles.filter(file => !files.includes(file));
  if (missingFiles.length === 0) {
    console.log('✅ 所有关键文件都存在');
  } else {
    console.log(`❌ 缺少关键文件: ${missingFiles.join(', ')}`);
    allGood = false;
  }
  
  // 检查assets目录
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`✅ Assets目录包含 ${assetFiles.length} 个文件`);
    
    const hasJS = assetFiles.some(f => f.includes('index-') && f.endsWith('.js'));
    const hasCSS = assetFiles.some(f => f.includes('index-') && f.endsWith('.css'));
    
    if (hasJS && hasCSS) {
      console.log('✅ 主要JS和CSS文件存在');
    } else {
      console.log('❌ 缺少主要JS或CSS文件');
      allGood = false;
    }
  } else {
    console.log('❌ Assets目录不存在');
    allGood = false;
  }
} else {
  console.log('❌ 构建输出目录不存在，请先运行构建');
  allGood = false;
}

// 4. 检查package.json
const packageJson = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJson)) {
  const content = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  if (content.scripts && content.scripts['build:gh-pages']) {
    console.log('✅ build:gh-pages脚本存在');
  } else {
    console.log('❌ build:gh-pages脚本不存在');
    allGood = false;
  }
  
  if (content.homepage) {
    console.log(`✅ homepage字段: ${content.homepage}`);
  } else {
    console.log('⚠️  没有homepage字段');
  }
} else {
  console.log('❌ package.json不存在');
  allGood = false;
}

// 5. 检查.nojekyll文件
const nojekyll = path.join(__dirname, 'public', '.nojekyll');
if (fs.existsSync(nojekyll)) {
  console.log('✅ .nojekyll文件存在');
} else {
  console.log('⚠️  .nojekyll文件不存在');
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 所有检查通过！部署准备就绪！\n');
  console.log('📋 下一步操作：');
  console.log('1. git add .');
  console.log('2. git commit -m "Fix deployment and add debugging tools"');
  console.log('3. git push origin main');
  console.log('4. 等待GitHub Actions部署完成（3-5分钟）');
  console.log('5. 访问测试页面验证修复效果\n');
  console.log('🔗 测试页面：');
  console.log('   - 简单测试: /test.html');
  console.log('   - 简化应用: /simple.html');
  console.log('   - 高级调试: /debug.html');
} else {
  console.log('❌ 发现问题，请先解决后再部署\n');
  console.log('🔧 可能的解决方案：');
  console.log('1. 重新运行构建: npm run build:gh-pages');
  console.log('2. 检查配置文件是否正确');
  console.log('3. 确保所有必需文件都存在');
}

console.log('\n🚀 部署后，主应用应该能够正常工作！');
