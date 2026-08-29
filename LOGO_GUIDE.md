# 🎨 Logo替换指南

## 当前状态

目前使用的是临时的SVG格式logo（蓝色盾牌图标）。

## 如何替换为你的Logo

### 方法1：使用PNG格式（推荐）

1. 将你发送的盾牌图片保存到电脑
2. 将文件重命名为 `logo.png`
3. 复制到项目目录：
   ```bash
   cp /path/to/your/logo.png frontend/public/logo.png
   ```
4. 刷新浏览器即可看到新logo

### 方法2：替换SVG文件

如果你有SVG格式的logo：
```bash
cp /path/to/your/logo.svg frontend/public/logo.svg
```

## Logo显示位置

- ✅ 登录页面顶部
- ✅ 登录后左上角导航栏
- ✅ 浏览器标签页图标

## Logo规格建议

- **格式**: PNG 或 SVG
- **尺寸**: 建议 512x512px 或更大
- **背景**: 透明背景效果更好
- **文件名**: 
  - `logo.png` (PNG格式)
  - `logo.svg` (SVG格式)

## 验证Logo

替换后访问以下地址确认：
- http://localhost:5173/logo.png
- http://localhost:5173/logo.svg

如果能看到你的logo图片，说明替换成功！

