# CTF Competition Platform (China Mirror Optimized)

> Cybersecurity Competition Platform - China Mirror Optimized

An incident response competition system based on event investigation workflow, optimized for China network environment.

## 🚀 Features

- ✅ **Structured Incident Response** - 5 Phases progressive workflow (Alert Triage -> Process Analysis -> Persistence Investigation -> Remediation -> Summary)
- ✅ **Three-panel Layout** - Left: SOP steps / Center: Terminal / Right: Submission form
- ✅ **Linux Terminal Emulator** - Hands-on terminal forensics challenges
- ✅ **Real-time Leaderboard** - Team progress charts
- ✅ **Judge Admin Panel** - Full competition control and data analytics

## 🌐 China Mirror Optimization

This version is optimized for China mainland network:

- 🚄 **npm Mirror** - Taobao npm registry (registry.npmmirror.com)
- 🚄 **Alpine Mirror** - Aliyun Alpine mirror
- 🚄 **Docker Build** - Optimized build workflow

## 📦 Quick Start

### 1. Clone project
```bash
cd /path/to/your/project
```

### 2. One-click start
```bash
./docker-start-cn.sh
```

### 3. Access system
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 4. Test accounts
- **Judge**: `judge` / `judge123`
- **Player**: `team1` / `team123`

## 🛠️ Manual Deployment

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Challenge Types

1. **Multiple Choice** (5 questions) - Radio button format
2. **Hands-on** (5 questions) - Text submission + Linux terminal
3. **Incident Response Event** (1 question) - 5 Phase investigation workflow

## 🎯 Incident Response Flow

```
Phase 1: Alert Triage
  ↓
Phase 2: Process Analysis
  ↓
Phase 3: Persistence Investigation
  ↓
Phase 4: Incident Remediation
  ↓
Phase 5: Summary & IOC Collection
```

## 🔧 Configuration

### npm Mirror
The project uses `.npmrc` with Taobao mirror:
```
registry=https://registry.npmmirror.com
```

### Docker Mirror
Dockerfile uses Aliyun mirror for China optimization:
```dockerfile
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
```

## 📝 Management Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Clean data and restart
./docker-clean.sh
./docker-start-cn.sh
```

## 🎓 Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Container**: Docker + Docker Compose

## 📄 License

MIT License

---

**CTF Competition Platform** - Cybersecurity Competition Platform