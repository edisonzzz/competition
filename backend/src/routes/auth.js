const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, run, get, all } = require('../models/database');

const router = express.Router();

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, team_id: user.team_id, member_number: user.member_number },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        team_name: user.team_name,
        team_id: user.team_id,
        member_number: user.member_number
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 注册新队伍
router.post('/register', async (req, res) => {
  try {
    const { username, password, team_name } = req.body;

    if (!username || !password || !team_name) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = await run(
      'INSERT INTO users (username, password, role, team_name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, 'player', team_name]
    );

    res.json({
      message: 'Registration successful',
      user_id: result.lastID
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await get('SELECT id, username, role, team_name, team_id, member_number FROM users WHERE id = ?', [decoded.id]);

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
