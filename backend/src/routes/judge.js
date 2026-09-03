const express = require('express');
const { db, run, get, all } = require('../models/database');
const { auth, isJudge } = require('../middleware/auth');

const router = express.Router();

// Get competition status
router.get('/competition-status', auth, isJudge, async (req, res) => {
  try {
    const activePhase = await get("SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1");
    const allPhases = await all("SELECT * FROM competition_phases ORDER BY phase_number", []);
    const settings = await get("SELECT * FROM competition_settings LIMIT 1");
    res.json({
      is_active: !!activePhase,
      current_phase: activePhase ? activePhase.phase_number : null,
      phase_name: activePhase ? activePhase.phase_name : null,
      phases: allPhases.map(p => ({
        number: p.phase_number,
        name: p.phase_name,
        active: p.is_active === 1
      })),
      start_time: settings ? settings.start_time : null,
      end_time: settings ? settings.end_time : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get competition status' });
  }
});

// Start or stop competition
router.post('/competition-control', auth, isJudge, async (req, res) => {
  try {
    const { action } = req.body; // 'start' or 'stop'

    if (action === 'start') {
      await run("UPDATE competition_phases SET is_active = 0", []);
      await run("UPDATE competition_phases SET is_active = 1 WHERE phase_number = 1", []);
    } else if (action === 'next_phase') {
      const currentActive = await get("SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1");
      if (currentActive) {
        await run("UPDATE competition_phases SET is_active = 0 WHERE phase_number = ?", [currentActive.phase_number]);
        const nextPhase = currentActive.phase_number + 1;
        await run("UPDATE competition_phases SET is_active = 1 WHERE phase_number = ?", [nextPhase]);
      } else {
        await run("UPDATE competition_phases SET is_active = 1 WHERE phase_number = 1", []);
      }
    } else if (action === 'stop') {
      await run("UPDATE competition_phases SET is_active = 0", []);
    }

    const activePhase = await get("SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1");
    const allPhases = await all("SELECT * FROM competition_phases ORDER BY phase_number", []);
    res.json({
      success: true,
      is_active: !!activePhase,
      current_phase: activePhase ? activePhase.phase_number : null,
      phase_name: activePhase ? activePhase.phase_name : null,
      phases: allPhases.map(p => ({
        number: p.phase_number,
        name: p.phase_name,
        active: p.is_active === 1
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to control competition' });
  }
});

// Get all submissions (judge)
router.get('/submissions', auth, isJudge, async (req, res) => {
  try {
    const submissions = await all(`
      SELECT
        s.*,
        u.username,
        u.team_name,
        c.title as challenge_title,
        c.answer as correct_answer
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN challenges c ON s.challenge_id = c.id
      ORDER BY s.submitted_at DESC
      LIMIT 100
    `);

    res.json({ submissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Get platform statistics
router.get('/statistics', auth, isJudge, async (req, res) => {
  try {
    const totalUsers = await get("SELECT COUNT(*) as count FROM users WHERE role = 'player'");
    const totalTeams = await get("SELECT COUNT(*) as count FROM teams");
    const totalChallenges = await get("SELECT COUNT(*) as count FROM challenges WHERE is_active = 1");
    const totalSubmissions = await get("SELECT COUNT(*) as count FROM submissions");
    const correctSubmissions = await get("SELECT COUNT(*) as count FROM submissions WHERE is_correct = 1");

    res.json({
      statistics: {
        total_players: totalUsers.count,
        total_teams: totalTeams.count,
        total_challenges: totalChallenges.count,
        total_submissions: totalSubmissions.count,
        correct_submissions: correctSubmissions.count,
        accuracy_rate: totalSubmissions.count > 0
          ? (correctSubmissions.count / totalSubmissions.count * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Add new challenge
router.post('/challenges', auth, isJudge, async (req, res) => {
  try {
    const { type, title, description, points, category, answer, hints, difficulty } = req.body;

    const result = await run(`
      INSERT INTO challenges (type, title, description, points, category, answer, hints, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      type,
      title,
      description,
      points,
      category,
      answer,
      hints ? JSON.stringify(hints) : null,
      difficulty
    ]);

    res.json({
      message: 'Challenge added successfully',
      challenge_id: result.lastID
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add challenge' });
  }
});

module.exports = router;
