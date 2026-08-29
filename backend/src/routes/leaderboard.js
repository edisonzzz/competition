const express = require('express');
const { db, run, get, all } = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get individual leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const leaderboard = await all(`
      SELECT
        u.id,
        u.username,
        u.team_name,
        u.team_id,
        COALESCE(SUM(s.points_earned), 0) as total_points,
        COUNT(DISTINCT CASE WHEN s.is_correct = 1 THEN s.challenge_id END) as solved_count,
        MAX(s.submitted_at) as last_submission
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = 1
      WHERE u.role = 'player'
      GROUP BY u.id
      ORDER BY total_points DESC, last_submission ASC
    `);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// 获取团队排行榜
router.get('/teams', auth, async (req, res) => {
  try {
    const teamLeaderboard = await all(`
      SELECT
        t.id,
        t.team_name,
        t.team_code,
        COUNT(DISTINCT tm.user_id) as member_count,
        COALESCE(SUM(s.points_earned), 0) as total_points,
        COUNT(DISTINCT CASE WHEN s.is_correct = 1 THEN s.challenge_id END) as solved_count,
        MAX(s.submitted_at) as last_submission
      FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      LEFT JOIN users u ON u.id = tm.user_id
      LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = 1
      GROUP BY t.id
      ORDER BY total_points DESC, last_submission ASC
    `);

    res.json({ teams: teamLeaderboard });
  } catch (error) {
    console.error('Failed to get team leaderboard:', error);
    res.status(500).json({ error: 'Failed to load team leaderboard' });
  }
});

// 获取题目解决统计
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await all(`
      SELECT
        c.id,
        c.title,
        c.category,
        c.points,
        COUNT(DISTINCT s.user_id) as solve_count
      FROM challenges c
      LEFT JOIN submissions s ON c.id = s.challenge_id AND s.is_correct = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY solve_count DESC
    `);

    res.json({ stats });
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({ error: 'Failed to load challenge statistics' });
  }
});

module.exports = router;