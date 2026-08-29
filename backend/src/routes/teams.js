const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../models/database');
const { auth, isJudge } = require('../middleware/auth');

const router = express.Router();

/**
 * Generate unique team code
 */
function generateTeamCode() {
  return 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a new team with 5 members
 * POST /api/teams/create
 */
router.post('/create', auth, isJudge, async (req, res) => {
  try {
    const { team_name, members } = req.body;

    // Validate input
    if (!team_name || !members || members.length !== 5) {
      return res.status(400).json({
        error: 'Team name and exactly 5 member accounts are required'
      });
    }

    // Check if team name already exists
    const existingTeam = await get('SELECT id FROM teams WHERE team_name = ?', [team_name]);
    if (existingTeam) {
      return res.status(409).json({ error: 'Team name already exists' });
    }

    // Check if any username already exists
    for (const member of members) {
      const existingUser = await get('SELECT id FROM users WHERE username = ?', [member.username]);
      if (existingUser) {
        return res.status(409).json({ error: `Username '${member.username}' already exists` });
      }
    }

    // Generate team code
    let teamCode = generateTeamCode();
    let codeExists = await get('SELECT id FROM teams WHERE team_code = ?', [teamCode]);
    while (codeExists) {
      teamCode = generateTeamCode();
      codeExists = await get('SELECT id FROM teams WHERE team_code = ?', [teamCode]);
    }

    // Begin transaction
    await run('BEGIN TRANSACTION');

    try {
      // Create team
      const teamResult = await run(
        'INSERT INTO teams (team_name, team_code) VALUES (?, ?)',
        [team_name, teamCode]
      );
      const teamId = teamResult.lastID;

      // Create 5 user accounts and link to team
      for (let i = 0; i < 5; i++) {
        const member = members[i];
        const memberNumber = i + 1;

        // Hash password
        const hashedPassword = await bcrypt.hash(member.password, 10);

        // Create user
        const userResult = await run(
          `INSERT INTO users (username, password, role, team_name, team_id, member_number)
           VALUES (?, ?, 'player', ?, ?, ?)`,
          [member.username, hashedPassword, team_name, teamId, memberNumber]
        );

        // Link to team_members
        await run(
          `INSERT INTO team_members (team_id, user_id, member_number)
           VALUES (?, ?, ?)`,
          [teamId, userResult.lastID, memberNumber]
        );
      }

      await run('COMMIT');

      res.json({
        success: true,
        message: 'Team created successfully',
        team: {
          id: teamId,
          team_name,
          team_code: teamCode,
          member_count: 5
        }
      });

    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ error: 'Failed to create team: ' + error.message });
  }
});

/**
 * Get all teams with member details
 * GET /api/teams
 */
router.get('/', auth, isJudge, async (req, res) => {
  try {
    const teams = await all(`
      SELECT
        t.*,
        COUNT(DISTINCT tm.user_id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to retrieve teams' });
  }
});

/**
 * Get specific team details with all members
 * GET /api/teams/:id
 */
router.get('/:id', auth, isJudge, async (req, res) => {
  try {
    const { id } = req.params;

    const team = await get('SELECT * FROM teams WHERE id = ?', [id]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await all(`
      SELECT
        u.id,
        u.username,
        u.role,
        u.created_at,
        tm.member_number,
        COUNT(DISTINCT s.id) as submissions_count,
        COALESCE(SUM(CASE WHEN s.is_correct = 1 THEN s.points_earned ELSE 0 END), 0) as total_points
      FROM team_members tm
      JOIN users u ON u.id = tm.user_id
      LEFT JOIN submissions s ON s.user_id = u.id
      WHERE tm.team_id = ?
      GROUP BY u.id, tm.member_number
      ORDER BY tm.member_number
    `, [id]);

    // Get team's total score
    const teamScore = await get(`
      SELECT
        COALESCE(SUM(CASE WHEN s.is_correct = 1 THEN s.points_earned ELSE 0 END), 0) as total_points,
        COUNT(DISTINCT CASE WHEN s.is_correct = 1 THEN s.challenge_id END) as solved_count
      FROM users u
      JOIN submissions s ON s.user_id = u.id
      WHERE u.team_id = ?
    `, [id]);

    res.json({
      team: {
        ...team,
        ...teamScore,
        members
      }
    });

  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ error: 'Failed to retrieve team details' });
  }
});

/**
 * Delete team and all associated data
 * DELETE /api/teams/:id
 */
router.delete('/:id', auth, isJudge, async (req, res) => {
  try {
    const { id } = req.params;

    const team = await get('SELECT * FROM teams WHERE id = ?', [id]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await run('BEGIN TRANSACTION');

    try {
      // Get all user IDs for this team
      const userIds = await all('SELECT user_id FROM team_members WHERE team_id = ?', [id]);

      // Delete submissions
      for (const { user_id } of userIds) {
        await run('DELETE FROM submissions WHERE user_id = ?', [user_id]);
        await run('DELETE FROM phase_submissions WHERE user_id = ?', [user_id]);
        await run('DELETE FROM audit_log WHERE user_id = ?', [user_id]);
      }

      // Delete question pool entries
      await run('DELETE FROM question_pool WHERE team_id = ?', [id]);

      // Delete team members
      await run('DELETE FROM team_members WHERE team_id = ?', [id]);

      // Delete users
      for (const { user_id } of userIds) {
        await run('DELETE FROM users WHERE id = ?', [user_id]);
      }

      // Delete team
      await run('DELETE FROM teams WHERE id = ?', [id]);

      await run('COMMIT');

      res.json({
        success: true,
        message: `Team '${team.team_name}' and all associated data deleted successfully`
      });

    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

/**
 * Reset individual user progress
 * POST /api/teams/reset-user/:userId
 */
router.post('/reset-user/:userId', auth, isJudge, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await get('SELECT * FROM users WHERE id = ? AND role = "player"', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await run('BEGIN TRANSACTION');

    try {
      // Delete submissions
      const submissionsResult = await run('DELETE FROM submissions WHERE user_id = ?', [userId]);

      // Delete phase submissions
      const phaseResult = await run('DELETE FROM phase_submissions WHERE user_id = ?', [userId]);

      // Delete audit log
      await run('DELETE FROM audit_log WHERE user_id = ?', [userId]);

      // Return questions to pool (mark as skipped/returned)
      await run(`
        UPDATE question_pool
        SET assigned_to_user_id = NULL,
            skipped = 1,
            returned_to_pool_at = CURRENT_TIMESTAMP
        WHERE assigned_to_user_id = ?
      `, [userId]);

      await run('COMMIT');

      res.json({
        success: true,
        message: `Progress reset for ${user.username}`,
        deleted: {
          submissions: submissionsResult.changes,
          phase_submissions: phaseResult.changes
        }
      });

    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Reset user error:', error);
    res.status(500).json({ error: 'Failed to reset user progress' });
  }
});

/**
 * Reset entire team progress (all members)
 * POST /api/teams/reset-team/:teamId
 */
router.post('/reset-team/:teamId', auth, isJudge, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await get('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await all('SELECT user_id FROM team_members WHERE team_id = ?', [teamId]);

    await run('BEGIN TRANSACTION');

    try {
      let totalSubmissions = 0;
      let totalPhases = 0;

      for (const { user_id } of members) {
        const subResult = await run('DELETE FROM submissions WHERE user_id = ?', [user_id]);
        const phaseResult = await run('DELETE FROM phase_submissions WHERE user_id = ?', [user_id]);
        await run('DELETE FROM audit_log WHERE user_id = ?', [user_id]);

        totalSubmissions += subResult.changes;
        totalPhases += phaseResult.changes;
      }

      // Reset team's question pool
      await run('DELETE FROM question_pool WHERE team_id = ?', [teamId]);

      await run('COMMIT');

      res.json({
        success: true,
        message: `All progress reset for team '${team.team_name}'`,
        deleted: {
          submissions: totalSubmissions,
          phase_submissions: totalPhases,
          members_reset: members.length
        }
      });

    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Reset team error:', error);
    res.status(500).json({ error: 'Failed to reset team progress' });
  }
});

/**
 * Get team's question pool status
 * GET /api/teams/:teamId/question-pool
 */
router.get('/:teamId/question-pool', auth, isJudge, async (req, res) => {
  try {
    const { teamId } = req.params;

    const poolStatus = await all(`
      SELECT
        qp.*,
        c.title as challenge_title,
        c.type as challenge_type,
        c.difficulty,
        c.points,
        u.username as assigned_to_username
      FROM question_pool qp
      JOIN challenges c ON c.id = qp.challenge_id
      LEFT JOIN users u ON u.id = qp.assigned_to_user_id
      WHERE qp.team_id = ?
      ORDER BY qp.assigned_at DESC
    `, [teamId]);

    res.json({ pool: poolStatus });

  } catch (error) {
    console.error('Get question pool error:', error);
    res.status(500).json({ error: 'Failed to retrieve question pool' });
  }
});

module.exports = router;
