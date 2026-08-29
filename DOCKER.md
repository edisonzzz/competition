# 🐳 蓝队CTF平台 - Docker版本

## 快速启动

### 一键启动（推荐）

```bash
./docker-start.sh
```

### 手动启动

```bash
# 构建并启动所有服务
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

## 访问平台

- **前端**: http://localhost:5173
- **后端**: http://localhost:3001

## 测试账号

- **裁判**: `judge` / `judge123`
- **队员**: `team1` / `team123`

## Docker 命令

### 服务管理

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 查看服务状态
docker compose ps

# 查看实时日志
docker compose logs -f

# 查看后端日志
docker compose logs -f backend

# 查看前端日志
docker compose logs -f frontend
```

### 数据管理

```bash
# 清理所有数据（包括数据库）
docker compose down -v

# 只停止服务，保留数据
docker compose down

# 重新初始化数据库
docker compose exec backend node src/initDatabase.js
```

### 完全清理

```bash
# 使用清理脚本
./docker-clean.sh

# 或手动清理
docker compose down -v
docker rmi blueteamctf-backend blueteamctf-frontend
```

## 数据持久化

数据库文件存储在Docker volume中：
- Volume名称: `blueteamctf_blueteam-data`
- 容器内路径: `/app/database`

即使停止容器（`docker compose down`），数据仍会保留。

## 开发模式

代码通过volume挂载，修改代码后会自动重载：
- 后端：`nodemon` 自动重启
- 前端：Vite HMR 热更新

## 网络配置

所有服务在同一个Docker网络中：
- 网络名: `blueteam-network`
- 后端容器名: `blueteam-backend`
- 前端容器名: `blueteam-frontend`
- 前端通过 `http://backend:3000` 访问后端

## 端口映射

- `3001` → 后端API（宿主机端口）
- `3000` → 后端API（容器内端口）
- `5173` → 前端Web界面

## 故障排查

### 端口已被占用

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:3000"  # 将3000改为3001
  - "5174:5173"  # 将5173改为5174
```

### 查看详细日志

```bash
# 查看后端错误
docker compose logs backend

# 查看前端错误
docker compose logs frontend

# 实时跟踪所有日志
docker compose logs -f --tail=100
```

### 进入容器调试

```bash
# 进入后端容器
docker compose exec backend sh

# 进入前端容器
docker compose exec frontend sh
```

### 重建镜像

```bash
# 强制重新构建
docker compose build --no-cache

# 重新启动
docker compose up -d
```

## 生产环境部署

生产环境建议修改：

1. 修改 `backend/.env` 中的 `JWT_SECRET`
2. 使用 `NODE_ENV=production`
3. 配置反向代理（Nginx）
4. 启用HTTPS
5. 设置资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## 优势

✅ **一键启动** - 无需手动安装Node.js和依赖  
✅ **环境隔离** - 不污染本地环境  
✅ **快速清理** - 一条命令清除所有数据  
✅ **易于部署** - 直接部署到任何支持Docker的服务器  
✅ **数据持久化** - 数据不会因容器重启而丢失  
✅ **开发友好** - 代码修改自动热更新  

## 系统要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB+ 可用内存
- 5GB+ 可用磁盘空间

## License

MIT
