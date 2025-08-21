# GitHub Pages 部署指南（修复版）

## 🚀 快速部署

### 方法一：简化自动部署（推荐）

1. **Fork 本仓库**
   - 点击右上角的 "Fork" 按钮
   - 将仓库 fork 到你的 GitHub 账户

2. **配置仓库名称**
   - 如果你的仓库名不是 `x-avater`，需要修改 `vite.config.js`：
   ```js
   base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
   ```

3. **使用简化部署工作流**
   - 删除 `.github/workflows/deploy.yml`
   - 重命名 `.github/workflows/deploy-simple.yml` 为 `deploy.yml`

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

## 🐛 常见问题解决

### 1. GitHub Pages配置错误
**错误信息**：`Get Pages site failed`

**解决方案**：
- 使用简化部署工作流（方法一）
- 或者手动启用GitHub Pages：设置 → Pages → Source选择"GitHub Actions"

### 2. Node.js版本错误
**错误信息**：`Vite requires Node.js version 20.19+`

**解决方案**：
- GitHub Actions已配置Node.js 20
- 本地开发请升级到Node.js 20+

### 3. 构建失败
**解决方案**：
- 检查TypeScript错误（已修复）
- 使用 `npm run build:gh-pages` 进行本地测试

## 📋 部署检查清单

- [ ] 仓库已 fork 到个人账户
- [ ] `vite.config.js` 中的 base 路径已正确配置
- [ ] 选择了合适的部署方法
- [ ] 代码已推送到 main 分支
- [ ] GitHub Actions 工作流运行成功
- [ ] 网站可以正常访问

## 🎯 推荐流程

1. **首次部署**：使用方法一（简化自动部署）
2. **如果遇到问题**：使用方法二（手动部署）
3. **验证功能**：确保所有功能正常工作

## 🌟 部署后验证

访问网站后，确认以下功能：
- ✅ 页面正常加载
- ✅ 图片上传功能
- ✅ AI抠图功能（快速模式和高质量模式）
- ✅ 背景选择和自定义
- ✅ 语言切换
- ✅ 图片下载
