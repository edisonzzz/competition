# 🛡️ 蓝队CTF竞赛平台

一个专注于蓝队防御技能的CTF竞赛平台Demo。

## 🚀 快速启动

### 方式1：Docker启动（推荐，支持快速清理）

```bash
# 一键启动
./docker-start.sh

# 访问平台
http://localhost:5173
```

**清理数据：**
```bash
# 完全清理（包括数据库）
./docker-clean.sh

# 或使用Docker命令
docker compose down -v
```

### 方式2：本地启动

```bash
# 终端1 - 启动后端
cd backend && npm run dev

# 终端2 - 启动前端
cd frontend && npm run dev

# 访问: http://localhost:5173
```

## 📖 详细文档

- **[DOCKER.md](DOCKER.md)** - Docker使用指南（推荐）
- **[START.md](START.md)** - 本地启动指南
- **[SETUP.md](SETUP.md)** - 详细安装步骤
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 完整项目说明

## 🔐 测试账号

- **裁判**: `judge` / `judge123`
- **队员**: `team1` / `team123`

## ✨ 功能特性

- 🛡️ **蓝队导向**: 专注于防御、取证、应急响应等蓝队技能
- 👥 **角色系统**: 支持队员和裁判两种角色
- 📝 **多样题型**: 5道选择题 + 5道实操题（总分2300分）
- 🏆 **实时排行榜**: 动态显示比赛成绩
- ⚡ **即时评分**: 自动评分系统
- 🐳 **Docker支持**: 一键启动，快速清理

## 📝 题目内容

### 选择题（5道，700分）
- 基础防御知识（100分）
- 日志分析（100分）
- 网络安全（150分）
- 应急响应（150分）
- 威胁检测（200分）

### 实操题（5道，1600分）
- Linux进程取证（300分）
- 日志分析实战（250分）
- 命令识别（300分）
- 端口分析（350分）
- 文件取证（400分）

## 🛠️ 技术栈

- **前端**: React + Vite + Tailwind CSS
- **后端**: Node.js + Express
- **数据库**: SQLite
- **认证**: JWT
- **容器**: Docker + Docker Compose

## 🐳 Docker命令速查

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 清理数据
docker compose down -v

# 查看日志
docker compose logs -f

# 重启
docker compose restart
```

## 📊 项目结构

```
blueteamctf/
├── backend/              # Node.js后端
├── frontend/             # React前端
├── docker-compose.yml    # Docker编排文件
├── docker-start.sh       # 一键启动脚本
├── docker-clean.sh       # 清理脚本
└── DOCKER.md            # Docker文档
```

## License

MIT
