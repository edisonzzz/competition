# 蓝队CTF平台快速启动指南

## 一键安装

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Windows
```bash
setup.bat
```

## 手动启动

### 1. 安装依赖并初始化数据库

```bash
# 后端
cd backend
npm install
node src/initDatabase.js

# 前端
cd ../frontend
npm install
```

### 2. 启动服务

**终端1 - 启动后端：**
```bash
cd backend
npm run dev
```
后端将运行在: http://localhost:3000

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```
前端将运行在: http://localhost:5173

### 3. 访问平台

打开浏览器访问: http://localhost:5173

## 默认账号

### 裁判账号
- 用户名: `judge`
- 密码: `judge123`
- 权限: 查看所有提交、统计数据、管理题目

### 队员账号
- 用户名: `team1`
- 密码: `team123`
- 队伍名: 蓝盾一队

### 队员账号2
- 用户名: `team2`
- 密码: `team123`
- 队伍名: 蓝盾二队

## 功能说明

### 队员功能
- ✅ 查看所有题目（5道选择题 + 5道实操题）
- ✅ 提交答案并实时获得反馈
- ✅ 查看个人得分和排名
- ✅ 查看提交历史
- ✅ 实时排行榜

### 裁判功能
- ✅ 查看所有队伍提交记录
- ✅ 查看平台统计数据
- ✅ 实时监控比赛进度
- ✅ 查看答案对比

## 题目说明

### 选择题（5道）
1. 基础防御知识 - Linux进程查看命令 (100分)
2. 日志分析 - 用户登录日志位置 (100分)
3. 网络安全 - iptables链知识 (150分)
4. 应急响应 - 后门处理流程 (150分)
5. 威胁检测 - 挖矿木马特征 (200分)

### 实操题（5道）
1. Linux进程取证 - 识别恶意进程类型 (300分)
2. 日志分析实战 - 识别暴力破解攻击 (250分)
3. 命令识别 - 分析攻击者持久化手法 (300分)
4. 端口分析 - 识别反向Shell连接 (350分)
5. 文件取证 - 识别SUID提权风险 (400分)

总分: 2300分

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS
- **后端**: Node.js + Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT

## 项目结构

```
blueteamctf/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── server.js    # 入口文件
│   │   ├── routes/      # 路由
│   │   ├── middleware/  # 中间件
│   │   └── models/      # 数据模型
│   └── database/        # SQLite数据库
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # 公共组件
│   │   └── services/   # API服务
│   └── public/
└── README.md
```

## 常见问题

### 端口被占用
如果3000或5173端口被占用，可以修改：
- 后端: `backend/.env` 中的 `PORT=3000`
- 前端: `frontend/vite.config.js` 中的 `port: 5173`

### 数据库重置
删除 `backend/database/blueteam.db` 文件，然后重新运行：
```bash
cd backend
node src/initDatabase.js
```

### 清除浏览器缓存
如果遇到登录问题，清除浏览器的localStorage：
```javascript
localStorage.clear()
```

## 开发说明

### 添加新题目
裁判登录后，在裁判管理页面可以添加新题目。

或者修改 `backend/src/initDatabase.js` 中的题目数据，然后重置数据库。

### API接口文档

#### 认证
- POST `/api/auth/login` - 登录
- POST `/api/auth/register` - 注册
- GET `/api/auth/me` - 获取当前用户

#### 题目
- GET `/api/challenges` - 获取所有题目
- GET `/api/challenges/:id` - 获取题目详情

#### 提交
- POST `/api/submissions` - 提交答案
- GET `/api/submissions/history` - 获取提交历史

#### 排行榜
- GET `/api/leaderboard` - 获取排行榜
- GET `/api/leaderboard/stats` - 获取题目统计

#### 裁判（需要裁判权限）
- GET `/api/judge/submissions` - 获取所有提交
- GET `/api/judge/statistics` - 获取平台统计
- POST `/api/judge/challenges` - 添加新题目

## License

MIT
