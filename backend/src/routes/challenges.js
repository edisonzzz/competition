const express = require('express');
const { db, run, get, all } = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all challenges list
router.get('/', auth, async (req, res) => {
  try {
    const challenges = await all(`
      SELECT id, type, title, description, points, category, difficulty,
             (SELECT COUNT(*) FROM submissions WHERE challenge_id = challenges.id AND user_id = ? AND is_correct = 1) as solved
      FROM challenges
      WHERE is_active = 1
      ORDER BY points ASC
    `, [req.user.id]);

    res.json({ challenges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load challenges' });
  }
});

// 获取单个题目详情
router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await get(`
      SELECT id, type, title, description, points, category, difficulty, hints,
             (SELECT COUNT(*) FROM submissions WHERE challenge_id = ? AND user_id = ? AND is_correct = 1) as solved
      FROM challenges
      WHERE id = ? AND is_active = 1
    `, [req.params.id, req.user.id, req.params.id]);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // 解析hints
    if (challenge.hints) {
      try {
        challenge.hints = JSON.parse(challenge.hints);
      } catch (e) {
        challenge.hints = [];
      }
    }

    res.json({ challenge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get challenge details' });
  }
});

module.exports = router;
