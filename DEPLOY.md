# GitHub Pages 部署指南

## 🚀 快速部署

### 方法一：自动部署（推荐）

1. **Fork 本仓库**

   - 点击右上角的 "Fork" 按钮
   - 将仓库 fork 到你的 GitHub 账户

2. **配置仓库名称**

   - 如果你的仓库名不是 `x-avater`，需要修改 `vite.config.js`：

   ```js
   base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
   ```

3. **启用 GitHub Pages**

   - 进入仓库设置 → Pages
   - Source 选择 "GitHub Actions"

4. **推送代码触发部署**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

5. **等待部署完成**
   - 查看 Actions 标签页的部署进度
   - 部署完成后访问：`https://你的用户名.github.io/你的仓库名/`

### 方法二：手动部署

1. **安装依赖**

   ```bash
   npm install
   ```

2. **构建项目**

   ```bash
   npm run build:gh-pages
   ```

3. **部署到 GitHub Pages**

   ```bash
   # 安装 gh-pages 工具
   npm install -g gh-pages

   # 部署 dist 目录到 gh-pages 分支
   gh-pages -d dist
   ```

## 📋 部署检查清单

- [ ] 仓库已 fork 到个人账户
- [ ] `vite.config.js` 中的 base 路径已正确配置
- [ ] GitHub Pages 已启用并设置为 GitHub Actions
- [ ] 代码已推送到 main 分支
- [ ] GitHub Actions 工作流运行成功
- [ ] 网站可以正常访问

## 🔧 配置说明

### 重要文件

- `.github/workflows/deploy.yml` - GitHub Actions 部署工作流
- `vite.config.js` - Vite 构建配置，包含 base 路径设置
- `public/404.html` - SPA 路由重定向处理
- `package.json` - 包含 GitHub Pages 专用构建脚本

### 环境变量

- `NODE_ENV=production` - 生产环境构建
- 自动启用代码压缩和优化

## 🐛 常见问题

### 1. 页面显示空白

- ✅ **已修复**：使用 Hash 路由模式，避免服务器端路由配置问题
- 检查 `vite.config.js` 中的 base 路径是否正确
- 确保仓库名与配置的路径一致

### 2. 资源文件 404

- 确认 GitHub Pages 已正确启用
- 检查 Actions 部署是否成功
- 运行 `npm run build:test` 验证构建结果

### 3. 路由不工作

- ✅ **已修复**：使用 Hash 路由模式（URL 中包含#）
- `404.html` 文件已自动包含在构建中
- SPA 重定向脚本已包含在 `index.html` 中

### 4. 测试构建结果

运行以下命令测试构建是否正确：

```bash
npm run build:test
```

## 📊 性能优化

构建后的文件大小：

- 总体积：~380KB (gzipped: ~110KB)
- Vue 核心：97KB (gzipped: 37KB)
- MediaPipe：44KB (gzipped: 16KB)
- 应用代码：87KB (gzipped: 28KB)

## 🔗 相关链接

- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Vue.js 部署指南](https://vuejs.org/guide/best-practices/production-deployment.html)
