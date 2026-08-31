# 🚀 Start CTF Platform

## Quick Start (3 Steps)

### 1️⃣ Open first terminal - Start backend
```bash
cd backend
npm run dev
```
Wait until you see "CTF Platform backend started"

### 2️⃣ Open second terminal - Start frontend
```bash
cd frontend  
npm run dev
```
Wait until you see "Local: http://localhost:5173/"

### 3️⃣ Open browser
Visit: http://localhost:5173

## 🔐 Login for Testing

### Judge Login
- Username: `judge`
- Password: `judge123`
- Can view all submissions and manage the platform

### Player Login
- Username: `team1`
- Password: `team123`
- Can answer challenges and view leaderboard

## 📝 Challenge List

### Multiple Choice (5 questions)
- Basic Defense Knowledge - 100 pts
- Log Analysis - 100 pts
- Network Security - 150 pts
- Incident Response - 150 pts
- Threat Detection - 200 pts

### Hands-on Challenges (5 questions)
- Linux Process Forensics - 300 pts
- Log Analysis Practice - 250 pts
- Command Recognition - 300 pts
- Port Analysis - 350 pts
- File Forensics - 400 pts

Total: 2300 pts

## 💡 Tips

1. **First login as Judge** - Check the admin panel to understand the system
2. **Then login as Player** - Experience the challenge workflow
3. **Open multiple browser windows** - Simulate multiple teams competing
4. **Observe the real-time leaderboard** - Answers update rankings automatically

## ⚠️ Notes

- Backend runs on port 3000
- Frontend runs on port 5173
- Both services must be running
- Answers are case-insensitive, leading/trailing spaces are trimmed
- Each challenge can only be answered correctly once, wrong attempts can be retried

## 🔄 Reset Database (if needed)

```bash
cd backend
rm database/blueteam.db
node src/initDatabase.js
```

Good luck! 🎉