# 网络安全竞技平台 (国内镜像优化版)

> Cybersecurity Competition Platform - China Mirror Optimized

基于事件调查流程的应急响应竞赛系统，针对国内网络环境优化。

## 🚀 特性

- ✅ **流程化应急响应** - 5个Phase逐步推进（告警接入 → 进程分析 → 持久化排查 → 应急响应 → 总结报告）
- ✅ **三栏布局界面** - 左栏SOP步骤 / 中栏终端操作 / 右栏提交表单
- ✅ **Linux终端模拟器** - 实操题支持终端取证
- ✅ **实时排行榜** - 队伍进度曲线图
- ✅ **裁判管理面板** - 完整的比赛控制和数据分析

## 🌐 国内镜像优化

本版本已针对中国大陆网络环境优化：

- 🚄 **npm镜像** - 使用淘宝npm镜像 (registry.npmmirror.com)
- 🚄 **Alpine镜像** - 使用阿里云Alpine镜像
- 🚄 **Docker构建** - 优化的构建流程

## 📦 快速开始

### 1. 克隆项目
```bash
cd /path/to/your/project
# 项目已复制到 blueteamctf-cn 目录
```

### 2. 一键启动
```bash
cd blueteamctf-cn
./docker-start-cn.sh
```

### 3. 访问系统
- **前端**: http://localhost:5173
- **后端**: http://localhost:3001

### 4. 测试账号
- **裁判**: `judge` / `judge123`
- **队员**: `team1` / `team123`

## 🛠️ 手动部署

如果不使用Docker，可以手动部署：

### 后端
```bash
cd backend
npm install
npm run dev
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 📊 题目类型

1. **选择题** (5道) - 单选按钮格式
2. **实操题** (5道) - 文本提交 + Linux终端
3. **应急响应事件** (1道) - 5个Phase流程化调查

## 🎯 应急响应流程

```
Phase 1: 告警接入与初筛 (Alert Triage)
  ↓
Phase 2: 定位可疑进程与连接 (Process Analysis)
  ↓
Phase 3: 排查痕迹与持久化 (Persistence Investigation)
  ↓
Phase 4: 响应处置与阻断 (Incident Remediation)
  ↓
Phase 5: 溯源复盘与结单 (Summary & IOC Collection)
```

## 🔧 配置说明

### npm镜像源
项目已配置 `.npmrc` 文件使用淘宝镜像：
```
registry=https://registry.npmmirror.com
```

### Docker镜像源
Dockerfile已优化使用阿里云镜像：
```dockerfile
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
```

## 📝 管理命令

```bash
# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 清理数据重新开始
./docker-clean.sh
./docker-start-cn.sh
```

## 🎓 技术栈

- **前端**: React 18 + Vite + TailwindCSS
- **后端**: Node.js + Express
- **数据库**: SQLite3
- **容器**: Docker + Docker Compose

## 📄 许可证

MIT License

## 🙋 支持

如有问题请提Issue或联系管理员。

---

**网络安全竞技平台** - Cybersecurity Competition Platform
