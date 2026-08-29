const express = require('express');
const { run, get, all } = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Scoring penalties by question type and attempt count
 * MC:  1st=100%, 2nd=60%, wrong=-20%
 * Tech: 1st=100%, 2nd=60%, wrong=0
 * IR:   1st=100%, 2nd=70%, wrong=0
 */
function calculatePoints(questionType, basePoints, attemptNumber, isCorrect) {
  if (!isCorrect) {
    if (questionType === 'multiple_choice') {
      return Math.round(-basePoints * 0.2);
    }
    return 0;
  }

  switch (questionType) {
    case 'multiple_choice':
      if (attemptNumber === 1) return basePoints;
      if (attemptNumber >= 2) return Math.round(basePoints * 0.6);
      return basePoints;
    case 'practical':
      if (attemptNumber === 1) return basePoints;
      if (attemptNumber >= 2) return Math.round(basePoints * 0.6);
      return basePoints;
    case 'incident_response':
      if (attemptNumber === 1) return basePoints;
      if (attemptNumber >= 2) return Math.round(basePoints * 0.7);
      return basePoints;
    default:
      return isCorrect ? basePoints : 0;
  }
}

// Submit answer
router.post('/', auth, async (req, res) => {
  try {
    const { challenge_id, answer } = req.body;

    if (!challenge_id || !answer) {
      return res.status(400).json({ error: 'Challenge ID and answer are required' });
    }

    const activePhase = await get(
      'SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1'
    );

    const phaseNumber = activePhase ? activePhase.phase_number : 1;

    const alreadySolved = await get(`
      SELECT id FROM submissions
      WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
    `, [req.user.id, challenge_id]);

    if (alreadySolved) {
      return res.status(400).json({ error: 'You have already solved this challenge' });
    }

    const teamSolved = req.user.team_id ? await get(`
      SELECT s.id FROM submissions s
      JOIN users u ON u.id = s.user_id
      WHERE u.team_id = ? AND s.challenge_id = ? AND s.is_correct = 1
    `, [req.user.team_id, challenge_id]) : null;

    if (teamSolved) {
      return res.status(400).json({ error: 'A teammate has already solved this challenge' });
    }

    const challenge = await get('SELECT * FROM challenges WHERE id = ?', [challenge_id]);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const attemptInfo = await get(`
      SELECT COUNT(*) as attempt_count
      FROM submissions
      WHERE user_id = ? AND challenge_id = ? AND skipped = 0
    `, [req.user.id, challenge_id]);

    const attemptNumber = attemptInfo.attempt_count + 1;

    let isCorrect = false;
    if (challenge.type === 'multiple_choice') {
      isCorrect = answer.trim().toUpperCase() === challenge.answer.trim().toUpperCase();
    } else {
      const userAnswer = answer.trim().toLowerCase();
      const correctAnswer = challenge.answer.trim().toLowerCase();
      isCorrect = userAnswer === correctAnswer;
    }

    const pointsEarned = calculatePoints(
      challenge.type,
      challenge.points,
      attemptNumber,
      isCorrect
    );

    if (req.user.team_id) {
      await run(
        `UPDATE question_pool
         SET assigned_to_user_id = NULL,
             skipped = 0,
             returned_to_pool_at = CURRENT_TIMESTAMP
         WHERE team_id = ? AND challenge_id = ? AND assigned_to_user_id = ?`,
        [req.user.team_id, challenge_id, req.user.id]
      );
    }

    const subResult = await run(`
      INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned, phase_number, attempt_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      challenge_id,
      answer,
      isCorrect ? 1 : 0,
      pointsEarned,
      phaseNumber,
      attemptNumber
    ]);

    await run(`
      INSERT INTO audit_log (user_id, team_id, challenge_id, action, attempt_number, answer, is_correct, points_earned, phase_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      req.user.team_id,
      challenge_id,
      isCorrect ? 'correct' : 'incorrect',
      attemptNumber,
      answer,
      isCorrect ? 1 : 0,
      pointsEarned,
      phaseNumber
    ]);

    let teamTotalPoints = 0;
    if (req.user.team_id) {
      const teamScore = await get(`
        SELECT COALESCE(SUM(s.points_earned), 0) as total
        FROM submissions s
        JOIN users u ON u.id = s.user_id
        WHERE u.team_id = ? AND s.is_correct = 1
      `, [req.user.team_id]);
      teamTotalPoints = teamScore.total;
    }

    const response = {
      is_correct: isCorrect,
      points_earned: pointsEarned,
      attempt_number: attemptNumber,
      message: '',
      team_total_points: teamTotalPoints
    };

    if (isCorrect) {
      if (pointsEarned === challenge.points) {
        response.message = 'Correct! Full score earned.';
      } else {
        const penalty = Math.round((1 - pointsEarned / challenge.points) * 100);
        const typeLabel = challenge.type === 'multiple_choice' ? 'MC' : challenge.type === 'practical' ? 'Technical' : 'IR';
        response.message = `Correct! (${typeLabel}, attempt ${attemptNumber}, ${penalty}% penalty applied)`;
      }
    } else {
      if (challenge.type === 'multiple_choice') {
        response.message = `Wrong answer. ${Math.abs(pointsEarned)} pts deducted. You can keep trying (max -20%).`;
      } else {
        response.message = `Wrong answer. Try again (attempt ${attemptNumber}).`;
      }
    }

    res.json(response);

  } catch (error) {
    console.error('Submission failed:', error);
    res.status(500).json({ error: 'Submission failed: ' + error.message });
  }
});

// Get user submission history
router.get('/history', auth, async (req, res) => {
  try {
    const submissions = await all(`
      SELECT s.*, c.title, c.points as challenge_points, c.category, c.type as challenge_type, c.difficulty
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
    `, [req.user.id]);

    res.json({ submissions });
  } catch (error) {
    console.error('Failed to get submission history:', error);
    res.status(500).json({ error: 'Failed to get submission history' });
  }
});

module.exports = router;