require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const challengeRoutes = require('./routes/challenges');
const submissionRoutes = require('./routes/submissions');
const leaderboardRoutes = require('./routes/leaderboard');
const judgeRoutes = require('./routes/judge');
const teamsRoutes = require('./routes/teams');
const poolRoutes = require('./routes/pool');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/phases', require('./routes/phases'));
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/pool', poolRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ANSEN competition API is running' });
});

app.listen(PORT, () => {
  console.log('ANSEN competition backend started');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
