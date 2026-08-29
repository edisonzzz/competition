const { run, get, all } = require('../models/database');

/**
 * ANSEN Competition Platform Schema Migration
 * Adds support for:
 * - Team management (5 members + 1 team account)
 * - Question pool (prevents duplicate questions per team)
 * - Competition phases (3 phases with timing)
 * - Question templates (bulk import)
 * - Audit logging
 */

async function migrateUsersTable() {
  console.log('Migrating users table...');

  // Check if new columns already exist
  const tableInfo = await all("PRAGMA table_info(users)");
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('team_id')) {
    await run('ALTER TABLE users ADD COLUMN team_id INTEGER');
  }

  if (!columnNames.includes('member_number')) {
    await run('ALTER TABLE users ADD COLUMN member_number INTEGER CHECK(member_number BETWEEN 1 AND 5)');
  }

  console.log('Users table migrated.');
}

async function migrateChallengesTable() {
  console.log('Migrating challenges table...');

  const tableInfo = await all("PRAGMA table_info(challenges)");
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('phase_number')) {
    await run('ALTER TABLE challenges ADD COLUMN phase_number INTEGER DEFAULT 1');
  }

  if (!columnNames.includes('team_id')) {
    await run('ALTER TABLE challenges ADD COLUMN team_id INTEGER');
  }

  if (!columnNames.includes('assigned_to_user_id')) {
    await run('ALTER TABLE challenges ADD COLUMN assigned_to_user_id INTEGER');
  }

  console.log('Challenges table migrated.');
}

async function migrateSubmissionsTable() {
  console.log('Migrating submissions table...');

  const tableInfo = await all("PRAGMA table_info(submissions)");
  const columnNames = tableInfo.map(col => col.name);

  if (!columnNames.includes('attempt_number')) {
    await run('ALTER TABLE submissions ADD COLUMN attempt_number INTEGER DEFAULT 1');
  }

  if (!columnNames.includes('time_taken_seconds')) {
    await run('ALTER TABLE submissions ADD COLUMN time_taken_seconds INTEGER');
  }

  if (!columnNames.includes('skipped')) {
    await run('ALTER TABLE submissions ADD COLUMN skipped INTEGER DEFAULT 0');
  }

  if (!columnNames.includes('phase_number')) {
    await run('ALTER TABLE submissions ADD COLUMN phase_number INTEGER DEFAULT 1');
  }

  console.log('Submissions table migrated.');
}

async function createTeamsTable() {
  console.log('Creating teams table...');

  await run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name TEXT UNIQUE NOT NULL,
      team_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(team_code)');

  console.log('Teams table created.');
}

async function createTeamMembersTable() {
  console.log('Creating team_members table...');

  await run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      member_number INTEGER NOT NULL CHECK(member_number BETWEEN 1 AND 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(team_id, user_id),
      UNIQUE(team_id, member_number)
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id)');

  console.log('Team members table created.');
}

async function createQuestionPoolTable() {
  console.log('Creating question_pool table...');

  await run(`
    CREATE TABLE IF NOT EXISTS question_pool (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      assigned_to_user_id INTEGER,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      skipped INTEGER DEFAULT 0,
      returned_to_pool_at DATETIME,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE(team_id, challenge_id, assigned_to_user_id)
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_question_pool_team ON question_pool(team_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_question_pool_challenge ON question_pool(challenge_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_question_pool_user ON question_pool(assigned_to_user_id)');

  console.log('Question pool table created.');
}

async function createCompetitionPhasesTable() {
  console.log('Creating competition_phases table...');

  await run(`
    CREATE TABLE IF NOT EXISTS competition_phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase_number INTEGER UNIQUE NOT NULL CHECK(phase_number BETWEEN 1 AND 3),
      phase_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      start_time DATETIME,
      end_time DATETIME,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default phases
  const existingPhases = await get('SELECT COUNT(*) as count FROM competition_phases');
  if (existingPhases.count === 0) {
    await run(`
      INSERT INTO competition_phases (phase_number, phase_name, duration_minutes, is_active)
      VALUES
        (1, 'Multiple Choice Questions', 30, 0),
        (2, 'Technical/Practical Challenges', 25, 0),
        (3, 'Incident Response (Team Collaboration)', 35, 0)
    `);
  }

  console.log('Competition phases table created.');
}

async function createQuestionTemplatesTable() {
  console.log('Creating question_templates table...');

  await run(`
    CREATE TABLE IF NOT EXISTS question_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'practical', 'incident_response')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      points INTEGER NOT NULL,
      category TEXT,
      answer TEXT NOT NULL,
      hints TEXT,
      options TEXT,
      created_by_judge_id INTEGER,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by_judge_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_question_templates_type ON question_templates(type)');
  await run('CREATE INDEX IF NOT EXISTS idx_question_templates_difficulty ON question_templates(difficulty)');
  await run('CREATE INDEX IF NOT EXISTS idx_question_templates_active ON question_templates(is_active)');

  console.log('Question templates table created.');
}

async function createAuditLogTable() {
  console.log('Creating audit_log table...');

  await run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      team_id INTEGER,
      challenge_id INTEGER,
      action TEXT NOT NULL CHECK(action IN ('view', 'submit', 'skip', 'correct', 'incorrect')),
      attempt_number INTEGER,
      answer TEXT,
      is_correct INTEGER,
      points_earned INTEGER DEFAULT 0,
      time_taken_seconds INTEGER,
      phase_number INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_audit_log_team ON audit_log(team_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp)');
  await run('CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action)');

  console.log('Audit log table created.');
}

async function migrate() {
  console.log('Starting ANSEN schema migration...');

  try {
    await migrateUsersTable();
    await migrateChallengesTable();
    await migrateSubmissionsTable();
    await createTeamsTable();
    await createTeamMembersTable();
    await createQuestionPoolTable();
    await createCompetitionPhasesTable();
    await createQuestionTemplatesTable();
    await createAuditLogTable();

    console.log('✅ ANSEN schema migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
