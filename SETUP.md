# CTF Platform Quick Start Guide

## One-click Install

### macOS/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Windows
```bash
setup.bat
```

## Manual Start

### 1. Install dependencies and initialize database

```bash
# Backend
cd backend
npm install
node src/initDatabase.js

# Frontend
cd ../frontend
npm install
```

### 2. Start services

**Terminal 1 - Start backend:**
```bash
cd backend
npm run dev
```
Backend will run at: http://localhost:3000

**Terminal 2 - Start frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:5173

### 3. Access platform

Open browser and visit: http://localhost:5173

## Default Accounts

### Judge Account
- Username: `judge`
- Password: `judge123`
- Permissions: View all submissions, statistics, manage challenges

### Player Account
- Username: `team1`
- Password: `team123`
- Team: Blue Shield 1

### Player Account 2
- Username: `team2`
- Password: `team123`
- Team: Blue Shield 2

## Features

### Player Features
- ✅ View all challenges (5 multiple choice + 5 hands-on)
- ✅ Submit answers and get real-time feedback
- ✅ View personal scores and rankings
- ✅ View submission history
- ✅ Real-time leaderboard

### Judge Features
- ✅ View all team submissions
- ✅ View platform statistics
- ✅ Real-time competition monitoring
- ✅ Answer comparison

## Challenge Details

### Multiple Choice (5 questions)
1. Basic Defense Knowledge - Linux process commands (100 pts)
2. Log Analysis - User login log location (100 pts)
3. Network Security - iptables chain knowledge (150 pts)
4. Incident Response - Backdoor handling (150 pts)
5. Threat Detection - Cryptomining malware patterns (200 pts)

### Hands-on Challenges (5 questions)
1. Linux Process Forensics - Identify malicious process types (300 pts)
2. Log Analysis Practice - Identify brute force attacks (250 pts)
3. Command Recognition - Analyze attacker persistence (300 pts)
4. Port Analysis - Identify reverse shell connections (350 pts)
5. File Forensics - Identify SUID privilege escalation (400 pts)

Total: 2300 points

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT

## Project Structure

```
blueteamctf/
├── backend/              # Backend service
│   ├── src/
│   │   ├── server.js    # Entry point
│   │   ├── routes/      # Routes
│   │   ├── middleware/  # Middleware
│   │   └── models/      # Data models
│   └── database/        # SQLite database
├── frontend/            # Frontend app
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Shared components
│   │   └── services/   # API services
│   └── public/
└── README.md
```

## FAQ

### Port Conflict
If port 3000 or 5173 is already in use, modify:
- Backend: `PORT=3000` in `backend/.env`
- Frontend: `port: 5173` in `frontend/vite.config.js`

### Database Reset
Delete `backend/database/blueteam.db` file, then re-run:
```bash
cd backend
node src/initDatabase.js
```

### Clear Browser Cache
If experiencing login issues, clear localStorage:
```javascript
localStorage.clear()
```

## Development Notes

### Adding New Challenges
After judge login, new challenges can be added in the judge admin panel.

Or modify challenge data in `backend/src/initDatabase.js` and reset the database.

### API Documentation

#### Auth
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register
- GET `/api/auth/me` - Get current user

#### Challenges
- GET `/api/challenges` - Get all challenges
- GET `/api/challenges/:id` - Get challenge details

#### Submissions
- POST `/api/submissions` - Submit answer
- GET `/api/submissions/history` - Get submission history

#### Leaderboard
- GET `/api/leaderboard` - Get leaderboard
- GET `/api/leaderboard/stats` - Get challenge statistics

#### Judge (requires judge permission)
- GET `/api/judge/submissions` - Get all submissions
- GET `/api/judge/statistics` - Get platform statistics
- POST `/api/judge/challenges` - Add new challenge

## License

MIT