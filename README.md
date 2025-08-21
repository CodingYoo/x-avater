# Avatar Background Swap - 头像换背景

🎨 一键更换头像背景，AI 智能抠图，快速生成个性化头像

## ✨ 功能特点

- 🚀 **极速抠图**：快速模式 37ms 完成，比传统方法快 45 倍
- 🎯 **双模式选择**：快速模式 + 高质量 AI 模式，满足不同需求
- 📱 **响应式设计**：完美适配移动端和桌面端
- 🌍 **多语言支持**：中文/英文界面切换
- 🎨 **丰富背景**：预设颜色 + 自定义背景图片
- ⚡ **本地处理**：无需上传到服务器，保护隐私
- 📦 **多格式导出**：支持 PNG、JPG、WebP 格式

## 🚀 在线体验

访问：[https://your-username.github.io/x-avater/](https://your-username.github.io/x-avater/)

## 🛠️ 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI 框架**：Tailwind CSS + DaisyUI
- **状态管理**：Pinia
- **AI 抠图**：MediaPipe + 自研快速算法
- **国际化**：Vue I18n

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Build for GitHub Pages

```sh
npm run build:gh-pages
```

## 🚀 GitHub Pages 部署

### 自动部署（推荐）

1. **Fork 本仓库**到你的 GitHub 账户

2. **启用 GitHub Pages**：

   - 进入仓库设置 → Pages
   - Source 选择 "GitHub Actions"

3. **修改配置**：

   - 编辑 `vite.config.js` 中的 `base` 路径：

   ```js
   base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
   ```

4. **推送代码**：

   ```sh
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

5. **等待部署完成**：
   - GitHub Actions 会自动构建和部署
   - 访问 `https://你的用户名.github.io/你的仓库名/`

### 手动部署

```sh
# 构建项目
npm run build:gh-pages

# 部署到 gh-pages 分支（需要安装 gh-pages）
npm install -g gh-pages
gh-pages -d dist
```

## 📝 配置说明

### 环境要求

- **Node.js**：20.19+ 或 22.12+
- **npm**：最新版本

### 环境变量

- `NODE_ENV=production`：生产环境构建
- 自动优化资源路径和性能

### GitHub Pages 特殊配置

- ✅ SPA 路由重定向支持
- ✅ 静态资源路径优化
- ✅ 自动化 CI/CD 部署
- ✅ 404 页面处理
