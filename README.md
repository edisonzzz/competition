# 🛡️ CTF Competition Platform

A CTF competition platform demo focused on blue team defense skills.

## 🚀 Quick Start

### Method 1: Docker (Recommended)

```bash
# One-click start
./docker-start.sh

# Access the platform
http://localhost:5173
```

**Clean data:**
```bash
# Full cleanup (including database)
./docker-clean.sh

# Or use Docker commands
docker compose down -v
```

### Method 2: Local Start

```bash
# Terminal 1 - Start backend
cd backend && npm run dev

# Terminal 2 - Start frontend
cd frontend && npm run dev

# Access: http://localhost:5173
```

## 📖 Documentation

- **[DOCKER.md](DOCKER.md)** - Docker usage guide (recommended)
- **[START.md](START.md)** - Local start guide
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Full project description

## 🔐 Test Accounts

- **Judge**: `judge` / `judge123`
- **Player**: `team1` / `team123`

## ✨ Features

- 🛡️ **Blue Team Focus**: Defense, forensics, incident response skills
- 👥 **Role System**: Player and Judge roles
- 📝 **Diverse Challenges**: 5 multiple choice + 5 hands-on (2300 total points)
- 🏆 **Real-time Leaderboard**: Dynamic score display
- ⚡ **Instant Scoring**: Auto-grading system
- 🐳 **Docker Support**: One-click start, quick cleanup

## 📝 Challenges

### Multiple Choice (5 questions, 700 points)
- Basic Defense Knowledge (100 pts)
- Log Analysis (100 pts)
- Network Security (150 pts)
- Incident Response (150 pts)
- Threat Detection (200 pts)

### Hands-on Challenges (5 questions, 1600 points)
- Linux Process Forensics (300 pts)
- Log Analysis Practice (250 pts)
- Command Recognition (300 pts)
- Port Analysis (350 pts)
- File Forensics (400 pts)

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT
- **Container**: Docker + Docker Compose

## 🐳 Docker Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Clean data
docker compose down -v

# View logs
docker compose logs -f

# Restart
docker compose restart
```

## 📊 Project Structure

```
blueteamctf/
├── backend/              # Node.js backend
├── frontend/             # React frontend
├── docker-compose.yml    # Docker compose file
├── docker-start.sh       # One-click start script
├── docker-clean.sh       # Cleanup script
└── DOCKER.md            # Docker documentation
```

## License

MIT