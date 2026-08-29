# 📝 Logo替换步骤

## 你的Logo说明
- 图片格式：PNG（黑色背景，带图形Logo）
- 尺寸：2001x2001px

## 替换步骤

### 方法1：直接复制（推荐）

1. **保存图片**
   - 右键点击你在聊天中发送的Logo图片
   - 选择"另存为"或"Save Image As"
   - 保存为 `logo.png`

2. **复制到项目**
   ```bash
   # 在项目根目录执行
   cp ~/Downloads/logo.png frontend/public/logo.png
   ```

3. **刷新浏览器**
   - 访问 http://localhost:5173
   - 按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows) 强制刷新

### 方法2：使用Docker复制

```bash
# 将logo复制到容器中
docker cp /path/to/your/logo.png blueteam-frontend:/app/public/logo.png

# 重启前端服务
docker compose restart frontend
```

### 方法3：直接放置文件

1. 打开项目目录
   ```bash
   cd /Users/rickbook2025/Documents/code/blueteamctf
   ```

2. 将logo.png文件拖拽到 `frontend/public/` 文件夹

3. 确保文件名为 `logo.png`

4. 刷新浏览器

## 验证Logo

访问以下地址查看logo是否成功：
- http://localhost:5173/logo.png

如果能看到你的Logo图片，说明替换成功！

## 注意事项

- **文件名必须是**: `logo.png` 或 `logo.svg`
- **位置必须是**: `frontend/public/logo.png`
- **建议尺寸**: 512x512px 或更大（当前2001x2001已足够）
- **支持格式**: PNG (推荐透明背景), SVG, JPG

## 如果Logo背景是黑色

你的Logo看起来有黑色背景。有两个选择：

1. **保持黑色背景**（直接使用）
2. **去除背景**（使用图片编辑工具将黑色背景改为透明）

推荐使用透明背景的PNG格式，在白色页面上显示效果更好。

## 当前临时Logo位置

```
frontend/public/logo.svg  ← 当前使用的临时SVG
frontend/public/logo.png  ← 你需要替换的位置
```

优先级：如果 logo.png 存在，页面会优先使用 PNG 格式。

