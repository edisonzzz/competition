# 🛡️ 蓝队CTF竞赛平台 - 项目总结

## ✅ 项目已完成

你的蓝队CTF竞赛平台demo已经创建完成！这是一个功能完整的Web应用，包含前端和后端。

## 📁 项目结构

```
blueteamctf/
├── backend/                    # Node.js后端
│   ├── src/
│   │   ├── server.js          # 服务器入口
│   │   ├── initDatabase.js    # 数据库初始化脚本
│   │   ├── routes/            # API路由
│   │   ├── middleware/        # 认证中间件
│   │   └── models/            # 数据库模型
│   ├── database/              # SQLite数据库文件
│   ├── package.json
│   └── .env                   # 环境配置
├── frontend/                  # React前端
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 公共组件
│   │   ├── services/         # API服务
│   │   └── App.jsx           # 主应用
│   ├── package.json
│   └── vite.config.js        # Vite配置
├── setup.sh                   # Linux/Mac安装脚本
├── setup.bat                  # Windows安装脚本
├── README.md                  # 项目说明
├── SETUP.md                   # 详细安装指南
└── LOGO.md                    # Logo说明
```

## 🚀 快速启动

### 方法1：使用启动脚本（推荐）

```bash
# macOS/Linux
chmod +x setup.sh
./setup.sh
```

### 方法2：手动启动

**步骤1：初始化数据库**
```bash
cd backend
npm install
node src/initDatabase.js
```

**步骤2：启动后端（新终端窗口）**
```bash
cd backend
npm run dev
```
后端运行在 http://localhost:3000

**步骤3：启动前端（新终端窗口）**
```bash
cd frontend
npm run dev
```
前端运行在 http://localhost:5173

**步骤4：访问平台**

浏览器打开: http://localhost:5173

## 🔐 测试账号

### 裁判账号
- **用户名**: `judge`
- **密码**: `judge123`
- **权限**: 查看所有提交、统计数据、管理比赛

### 队员账号1
- **用户名**: `team1`
- **密码**: `team123`
- **队伍**: 蓝盾一队

### 队员账号2
- **用户名**: `team2`
- **密码**: `team123`
- **队伍**: 蓝盾二队

## 🎯 功能特性

### 队员功能
✅ 用户注册与登录  
✅ 查看题目列表（按难度、类型、状态筛选）  
✅ 答题提交与实时评分  
✅ 个人仪表盘（统计、进度、最近提交）  
✅ 实时排行榜  
✅ 提交历史记录  
✅ 题目提示系统  

### 裁判功能
✅ 裁判专属管理面板  
✅ 查看所有队伍提交记录  
✅ 平台统计数据（队伍数、题目数、正确率）  
✅ 实时监控比赛进度  
✅ 答案对比查看  

## 📝 题目内容

### 选择题（5道，共700分）
1. **基础防御知识** - Linux进程查看命令 (100分) ⭐
2. **日志分析** - 用户登录日志位置 (100分) ⭐
3. **网络安全** - iptables防火墙链 (150分) ⭐⭐
4. **应急响应** - 后门处理流程 (150分) ⭐⭐
5. **威胁检测** - 挖矿木马识别 (200分) ⭐⭐⭐

### 实操题（5道，共1600分）
1. **Linux进程取证** - 识别恶意进程类型 (300分) ⭐⭐
2. **日志分析实战** - SSH暴力破解识别 (250分) ⭐
3. **命令识别** - 分析攻击者持久化 (300分) ⭐⭐
4. **端口分析** - 反向Shell识别 (350分) ⭐⭐⭐
5. **文件取证** - SUID提权风险 (400分) ⭐⭐⭐

**总分**: 2300分

## 🛠️ 技术栈

### 前端
- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **图标**: Lucide React

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: SQLite3
- **认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs

## 📡 API接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 队伍注册
- `GET /api/auth/me` - 获取当前用户

### 题目相关
- `GET /api/challenges` - 获取所有题目
- `GET /api/challenges/:id` - 获取题目详情

### 提交相关
- `POST /api/submissions` - 提交答案
- `GET /api/submissions/history` - 提交历史

### 排行榜
- `GET /api/leaderboard` - 获取排行榜
- `GET /api/leaderboard/stats` - 题目统计

### 裁判功能（需要裁判权限）
- `GET /api/judge/submissions` - 所有提交记录
- `GET /api/judge/statistics` - 平台统计
- `POST /api/judge/challenges` - 添加新题目

## 🎨 关于Logo

你提供的盾牌logo图片需要手动保存到以下位置：
- `frontend/public/logo.png` - 前端使用
- `logo.png` - 项目根目录备份

详见 `LOGO.md` 文件。

## 🐛 常见问题

### 1. 端口被占用
修改配置：
- 后端: `backend/.env` 中的 `PORT`
- 前端: `frontend/vite.config.js` 中的 `server.port`

### 2. 数据库重置
```bash
rm backend/database/blueteam.db
cd backend
node src/initDatabase.js
```

### 3. 清除浏览器缓存
```javascript
// 在浏览器控制台执行
localStorage.clear()
location.reload()
```

## 📚 扩展建议

### 可以添加的功能
- 🎯 更多题目类型（上传附件、多步骤题目）
- ⏱️ 比赛时间控制（开始/结束时间）
- 📊 详细的数据分析图表
- 💬 队伍之间的公告系统
- 🏆 首杀、一血等特殊奖励
- 📧 邮件通知系统
- 🔒 题目动态开放（解锁前置题目）
- 💾 提交代码高亮显示
- 📱 移动端适配优化

### 安全加固建议（生产环境）
- 使用PostgreSQL/MySQL替代SQLite
- 添加HTTPS支持
- 实现请求频率限制
- 添加CSRF保护
- 日志审计系统
- 定期备份数据库

## 📄 许可证

MIT License

## 💡 使用提示

1. **首次使用**：建议先用裁判账号登录查看管理面板，了解平台整体情况
2. **测试答题**：用team1账号登录，尝试答几道题目体验流程
3. **查看排行榜**：实时更新，支持多个队伍同时竞赛
4. **自定义题目**：修改 `backend/src/initDatabase.js` 添加更多题目

祝你的蓝队CTF比赛圆满成功！🎉
