const express = require('express');
const { run, get, all } = require('../models/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

const MAX_SKIPS_PER_PHASE = 3;
const QUESTION_TIME_LIMIT_SECONDS = 180;
const MAX_QUESTIONS_PER_USER_PER_PHASE = {
  1: 5,  // Phase 1: max 5 MC questions per player
  2: 5,  // Phase 2: max 5 practical per player
  // Phase 3: no limit (team IR)
};

// Helper: apply language to challenge data
function applyLang(challenge, lang) {
  if (!challenge) return challenge;
  if (lang === 'fr' && challenge.title_fr) {
    challenge.title = challenge.title_fr;
    challenge.description = challenge.description_fr;
  }
  delete challenge.title_fr;
  delete challenge.description_fr;
  return challenge;
}

/**
 * Get next question from team pool
 * GET /api/pool/next
 * Rules:
 * - Team-shared pool
 * - Each member gets a different question
 * - Solved questions are excluded for the whole team
 * - Questions being answered by others are excluded
 * - Returns 3-minute countdown timer
 */
router.get('/next', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.user.team_id;
    const lang = req.query.lang || 'en';

    if (!teamId) {
      return res.status(400).json({ error: 'You are not part of any team' });
    }

    const activePhase = await get(
      'SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1'
    );

    if (!activePhase) {
      return res.status(400).json({ error: 'Competition has not started yet' });
    }

    const phaseNumber = activePhase.phase_number;

    // Check max questions per user per phase
    const maxQ = MAX_QUESTIONS_PER_USER_PER_PHASE[phaseNumber];
    if (maxQ) {
      const solvedCount = await get(
        `SELECT COUNT(*) as count FROM submissions
         WHERE user_id = ? AND phase_number = ? AND is_correct = 1`,
        [userId, phaseNumber]
      );
      if (solvedCount.count >= maxQ) {
        return res.json({
          assignment: null,
          message: 'You have completed the maximum number of questions for this phase',
          phase_number: phaseNumber,
          phase_name: activePhase.phase_name,
          max_questions: maxQ,
          completed: true
        });
      }
    }

    const skipCount = await get(
      `SELECT COUNT(*) as count FROM submissions
       WHERE user_id = ? AND skipped = 1 AND phase_number = ?`,
      [userId, phaseNumber]
    );

    const currentAssignment = await get(
      `SELECT qp.*, c.id as challenge_id, c.title, c.title_fr, c.description, c.description_fr, c.type, c.points,
              c.category, c.difficulty, c.hints, c.answer
       FROM question_pool qp
       JOIN challenges c ON c.id = qp.challenge_id
       WHERE qp.assigned_to_user_id = ?
         AND qp.skipped = 0
         AND qp.team_id = ?
         AND c.phase_number = ?
         AND c.is_active = 1
       LIMIT 1`,
      [userId, teamId, phaseNumber]
    );

    if (currentAssignment) {
      const assignedAt = new Date(currentAssignment.assigned_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - assignedAt) / 1000);

      if (elapsed > QUESTION_TIME_LIMIT_SECONDS) {
        await run(
          `UPDATE question_pool
           SET assigned_to_user_id = NULL,
               skipped = 0,
               returned_to_pool_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [currentAssignment.id]
        );

        await run(
          `INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned, skipped, phase_number, attempt_number)
           VALUES (?, ?, 'timeout', 0, 0, 1, ?, 0)`,
          [userId, currentAssignment.challenge_id, phaseNumber]
        );
      } else {
        let hints = currentAssignment.hints;
        try { hints = JSON.parse(hints); } catch(e) { hints = []; }

        const attemptCount = await get(
          `SELECT COUNT(*) as count FROM submissions
           WHERE user_id = ? AND challenge_id = ? AND skipped = 0 AND phase_number = ?`,
          [userId, currentAssignment.challenge_id, phaseNumber]
        );

        applyLang(currentAssignment, lang);

        let options = [];
        if (currentAssignment.type === 'multiple_choice' && hints && Array.isArray(hints) && hints.length > 0) {
          options = hints.map(h => ({ value: h.value, label: h.label }));
          hints = [];
        }

        return res.json({
          assignment: {
            id: currentAssignment.id,
            challenge_id: currentAssignment.challenge_id,
            title: currentAssignment.title,
            description: currentAssignment.description,
            type: currentAssignment.type,
            points: currentAssignment.points,
            category: currentAssignment.category,
            difficulty: currentAssignment.difficulty,
            hints: hints,
            options: options,
            time_remaining: QUESTION_TIME_LIMIT_SECONDS - elapsed,
            attempt_number: attemptCount.count + 1,
            phase_number: phaseNumber,
            phase_name: activePhase.phase_name
          }
        });
      }
    }

    const nextChallenge = await get(
      `SELECT c.*
       FROM challenges c
       WHERE c.phase_number = ?
         AND c.is_active = 1
         AND c.id NOT IN (
           SELECT DISTINCT s.challenge_id
           FROM submissions s
           JOIN users u ON u.id = s.user_id
           WHERE u.team_id = ? AND s.is_correct = 1
         )
         AND c.id NOT IN (
           SELECT challenge_id FROM submissions
           WHERE user_id = ? AND skipped = 1 AND phase_number = ?
         )
         AND c.id NOT IN (
           SELECT qp.challenge_id FROM question_pool qp
           WHERE qp.team_id = ? AND qp.assigned_to_user_id IS NOT NULL
             AND qp.assigned_to_user_id != ? AND qp.skipped = 0
         )
       ORDER BY RANDOM()
       LIMIT 1`,
      [phaseNumber, teamId, userId, phaseNumber, teamId, userId]
    );

    if (!nextChallenge) {
      return res.json({
        assignment: null,
        message: 'No questions available in the pool',
        phase_number: phaseNumber,
        phase_name: activePhase.phase_name
      });
    }

    const poolResult = await run(
      `INSERT INTO question_pool (team_id, challenge_id, assigned_to_user_id, assigned_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [teamId, nextChallenge.id, userId]
    );

    applyLang(nextChallenge, lang);

    let hints = nextChallenge.hints;
    try { hints = JSON.parse(hints); } catch(e) { hints = []; }

    let options = [];
    if (nextChallenge.type === 'multiple_choice' && hints && Array.isArray(hints) && hints.length > 0) {
      options = hints.map(h => ({ value: h.value, label: h.label }));
      hints = [];
    }

    res.json({
      assignment: {
        id: poolResult.lastID,
        challenge_id: nextChallenge.id,
        title: nextChallenge.title,
        description: nextChallenge.description,
        type: nextChallenge.type,
        points: nextChallenge.points,
        category: nextChallenge.category,
        difficulty: nextChallenge.difficulty,
        hints: hints,
        options: options,
        time_remaining: QUESTION_TIME_LIMIT_SECONDS,
        attempt_number: 1,
        phase_number: phaseNumber,
        phase_name: activePhase.phase_name
      }
    });

  } catch (error) {
    console.error('Failed to get pool question:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

/**
 * Skip current question
 * POST /api/pool/skip
 * Max 3 skips per member per phase
 */
router.post('/skip', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.user.team_id;
    const { challenge_id } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'You are not part of any team' });
    }

    const activePhase = await get(
      'SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1'
    );

    if (!activePhase) {
      return res.status(400).json({ error: 'Competition has not started' });
    }

    const phaseNumber = activePhase.phase_number;

    const skipCount = await get(
      `SELECT COUNT(*) as count FROM submissions
       WHERE user_id = ? AND skipped = 1 AND phase_number = ?`,
      [userId, phaseNumber]
    );

    if (skipCount.count >= MAX_SKIPS_PER_PHASE) {
      return res.status(400).json({
        error: `Maximum skips (${MAX_SKIPS_PER_PHASE}) reached for this phase`
      });
    }

    await run(
      `UPDATE question_pool
       SET assigned_to_user_id = NULL,
           skipped = 1,
           returned_to_pool_at = CURRENT_TIMESTAMP
       WHERE team_id = ? AND challenge_id = ? AND assigned_to_user_id = ?`,
      [teamId, challenge_id, userId]
    );

    await run(
      `INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned, skipped, phase_number, attempt_number)
       VALUES (?, ?, 'skipped', 0, 0, 1, ?, 0)`,
      [userId, challenge_id, phaseNumber]
    );

    res.json({
      success: true,
      message: `Skipped (${MAX_SKIPS_PER_PHASE - skipCount.count - 1} skips remaining)`,
      skips_remaining: MAX_SKIPS_PER_PHASE - skipCount.count - 1
    });

  } catch (error) {
    console.error('Failed to skip question:', error);
    res.status(500).json({ error: 'Failed to skip question' });
  }
});

/**
 * Get skip status
 * GET /api/pool/skip-status
 */
router.get('/skip-status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const activePhase = await get(
      'SELECT * FROM competition_phases WHERE is_active = 1 ORDER BY phase_number LIMIT 1'
    );

    if (!activePhase) {
      return res.json({ skips_used: 0, skips_max: MAX_SKIPS_PER_PHASE });
    }

    const skipCount = await get(
      `SELECT COUNT(*) as count FROM submissions
       WHERE user_id = ? AND skipped = 1 AND phase_number = ?`,
      [userId, activePhase.phase_number]
    );

    res.json({
      skips_used: skipCount.count,
      skips_max: MAX_SKIPS_PER_PHASE,
      skips_remaining: MAX_SKIPS_PER_PHASE - skipCount.count
    });

  } catch (error) {
    console.error('Failed to get skip status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * Release timed-out questions
 * POST /api/pool/release-timeout
 */
router.post('/release-timeout', auth, async (req, res) => {
  try {
    const timeouts = await all(
      `SELECT qp.*, c.phase_number
       FROM question_pool qp
       JOIN challenges c ON c.id = qp.challenge_id
       WHERE qp.assigned_to_user_id IS NOT NULL
         AND qp.skipped = 0
         AND (strftime('%s','now') - strftime('%s', qp.assigned_at)) > ?`,
      [QUESTION_TIME_LIMIT_SECONDS]
    );

    for (const t of timeouts) {
      await run(
        `UPDATE question_pool
         SET assigned_to_user_id = NULL,
             skipped = 0,
             returned_to_pool_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [t.id]
      );

      await run(
        `INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned, skipped, phase_number, attempt_number)
         VALUES (?, ?, 'timeout', 0, 0, 1, ?, 0)`,
        [t.assigned_to_user_id, t.challenge_id, t.phase_number]
      );
    }

    res.json({ released: timeouts.length });

  } catch (error) {
    console.error('Failed to release timeouts:', error);
    res.status(500).json({ error: 'Failed to release timeouts' });
  }
});

module.exports = router;