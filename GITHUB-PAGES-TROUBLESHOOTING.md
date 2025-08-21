# GitHub Pages 空白页问题解决指南

## 🔧 已应用的修复

✅ **相对路径配置**：`base: './'` - 适用于任何仓库名
✅ **资源路径优化**：所有JS/CSS使用相对路径
✅ **.nojekyll文件**：避免Jekyll处理
✅ **homepage字段**：package.json中添加正确配置

## 🚀 立即修复步骤

### 1. 推送修复后的代码
```bash
git add .
git commit -m "Fix GitHub Pages blank page issue"
git push origin main
```

### 2. 等待GitHub Actions重新部署
- 查看Actions标签页
- 等待构建完成（约2-3分钟）

### 3. 清除浏览器缓存
- 按 Ctrl+F5 强制刷新
- 或者使用无痕模式访问

## 🔍 问题诊断清单

### 检查GitHub Pages设置
- [ ] 仓库是否为public
- [ ] Pages设置 → Source选择"GitHub Actions"
- [ ] 或者Source选择"Deploy from a branch" → gh-pages分支

### 检查部署状态
- [ ] Actions标签页显示绿色✅
- [ ] gh-pages分支存在且有内容
- [ ] 最新commit已触发部署

### 检查网站访问
- [ ] URL格式：`https://用户名.github.io/仓库名/`
- [ ] 浏览器开发者工具无404错误
- [ ] 网络标签页显示资源正常加载

## 🛠️ 备选解决方案

### 方案1：手动部署
```bash
npm run build:gh-pages
npm install -g gh-pages
gh-pages -d dist
```

### 方案2：检查仓库名配置
如果仍有问题，确认仓库名并手动设置：
```js
// vite.config.js
base: '/你的实际仓库名/',
```

### 方案3：使用GitHub Pages的根目录部署
1. 将dist内容复制到根目录
2. 设置Pages从main分支根目录部署

## 📊 常见错误和解决方案

| 错误现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 完全空白页 | 资源路径错误 | ✅ 已修复：使用相对路径 |
| 404错误 | base路径不匹配 | ✅ 已修复：自动适配 |
| 样式丢失 | CSS路径问题 | ✅ 已修复：相对路径 |
| JS不执行 | 脚本路径问题 | ✅ 已修复：相对路径 |

## 🎯 验证修复效果

访问你的GitHub Pages网站，应该看到：
- ✅ 正常的头像换背景界面
- ✅ 上传、抠图、背景选择功能正常
- ✅ 语言切换正常
- ✅ 响应式设计正常

## 📞 如果仍有问题

1. **检查浏览器控制台**：F12 → Console标签页
2. **检查网络请求**：F12 → Network标签页
3. **尝试不同浏览器**：Chrome、Firefox、Safari
4. **等待DNS传播**：新部署可能需要几分钟生效

## 🔄 回滚方案

如果需要恢复原配置：
```bash
cp vite.config.backup.js vite.config.js
npm run build:gh-pages
```
