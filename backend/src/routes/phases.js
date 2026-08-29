const express = require('express');
const { run, get, all } = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取challenge的所有phases
router.get('/:challengeId/phases', auth, async (req, res) => {
  try {
    const { challengeId } = req.params;

    const phases = await all(
      'SELECT * FROM phases WHERE challenge_id = ? ORDER BY phase_number',
      [challengeId]
    );

    // 获取用户的提交进度
    const userSubmissions = await all(
      `SELECT
         phase_id,
         phase_number,
         MAX(is_correct) AS is_correct,
         MAX(CASE WHEN is_correct = 1 THEN points_earned ELSE 0 END) AS points_earned
       FROM phase_submissions
       WHERE user_id = ? AND challenge_id = ?
       GROUP BY phase_id, phase_number`,
      [req.user.id, challengeId]
    );

    // 合并数据
    const phasesWithProgress = phases.map(phase => {
      const submission = userSubmissions.find(s => s.phase_id === phase.id);
      return {
        ...phase,
        required_fields: phase.required_fields ? JSON.parse(phase.required_fields) : [],
        hints: phase.hints ? JSON.parse(phase.hints) : [],
        completed: submission ? submission.is_correct === 1 : false,
        points_earned: submission ? submission.points_earned : 0
      };
    });

    res.json({ phases: phasesWithProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load phases' });
  }
});

// 提交phase答案
router.post('/:challengeId/phases/:phaseId/submit', auth, async (req, res) => {
  try {
    const { challengeId, phaseId } = req.params;
    const { answers } = req.body;

    // 获取phase信息
    const phase = await get('SELECT * FROM phases WHERE id = ? AND challenge_id = ?', [phaseId, challengeId]);
    if (!phase) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    const previousPhase = await get(
      `SELECT id FROM phases
       WHERE challenge_id = ? AND phase_number < ?
       ORDER BY phase_number DESC LIMIT 1`,
      [challengeId, phase.phase_number]
    );

    if (previousPhase) {
      const previousCompleted = await get(
        `SELECT id FROM phase_submissions
         WHERE user_id = ? AND phase_id = ? AND is_correct = 1
         LIMIT 1`,
        [req.user.id, previousPhase.id]
      );

      if (!previousCompleted) {
        return res.status(409).json({ error: 'Complete the previous phase first' });
      }
    }

    // 检查是否已经完成
    const existing = await get(
      'SELECT * FROM phase_submissions WHERE user_id = ? AND phase_id = ? AND is_correct = 1',
      [req.user.id, phaseId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Phase already completed' });
    }

    // 验证答案
    const requiredFields = JSON.parse(phase.required_fields || '[]');
    let allCorrect = true;
    let correctCount = 0;

    for (const field of requiredFields) {
      const userAnswer = answers[field.name];
      const correctAnswer = field.answer;

      if (userAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
        correctCount++;
      } else {
        allCorrect = false;
      }
    }

    const isCorrect = allCorrect && correctCount === requiredFields.length;
    const pointsEarned = isCorrect ? phase.points : Math.floor(phase.points * (correctCount / requiredFields.length));

    // 记录提交
    await run(
      'INSERT INTO phase_submissions (user_id, challenge_id, phase_id, phase_number, submission_data, is_correct, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, challengeId, phaseId, phase.phase_number, JSON.stringify(answers), isCorrect ? 1 : 0, pointsEarned]
    );

    // 检查是否所有phase都完成
    const totalPhases = await get('SELECT COUNT(*) as count FROM phases WHERE challenge_id = ?', [challengeId]);
    const completedPhases = await get(
      `SELECT COUNT(DISTINCT phase_id) as count
       FROM phase_submissions
       WHERE user_id = ? AND challenge_id = ? AND is_correct = 1`,
      [req.user.id, challengeId]
    );

    let challengeCompleted = false;
    let nextPhase = null;

    if (isCorrect) {
      nextPhase = await get(
        `SELECT id, phase_number, title
         FROM phases
         WHERE challenge_id = ? AND phase_number > ?
         ORDER BY phase_number ASC LIMIT 1`,
        [challengeId, phase.phase_number]
      );
    }

    if (completedPhases.count === totalPhases.count) {
      challengeCompleted = true;

      const totalPoints = await get(
        `SELECT COALESCE(SUM(best_points), 0) as total
         FROM (
           SELECT phase_id, MAX(points_earned) as best_points
           FROM phase_submissions
           WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
           GROUP BY phase_id
         )`,
        [req.user.id, challengeId]
      );

      const existingChallengeSubmission = await get(
        `SELECT id FROM submissions
         WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
         LIMIT 1`,
        [req.user.id, challengeId]
      );

      if (!existingChallengeSubmission) {
        await run(
          'INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, challengeId, 'Completed all phases', 1, totalPoints.total]
        );
      }
    }

    res.json({
      is_correct: isCorrect,
      points_earned: pointsEarned,
      correct_count: correctCount,
      total_fields: requiredFields.length,
      completed_phase_number: isCorrect ? phase.phase_number : null,
      next_phase_id: nextPhase?.id || null,
      next_phase_number: nextPhase?.phase_number || null,
      challenge_completed: challengeCompleted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// 获取用户的phase提交历史
router.get('/:challengeId/progress', auth, async (req, res) => {
  try {
    const { challengeId } = req.params;

    const submissions = await all(
      `SELECT ps.*, p.title, p.phase_number
       FROM phase_submissions ps
       JOIN phases p ON ps.phase_id = p.id
       WHERE ps.user_id = ? AND ps.challenge_id = ?
       ORDER BY ps.submitted_at DESC`,
      [req.user.id, challengeId]
    );

    const progress = submissions.map(s => ({
      ...s,
      submission_data: JSON.parse(s.submission_data)
    }));

    res.json({ progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

module.exports = router;
