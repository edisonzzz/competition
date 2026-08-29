const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { migrate } = require('./migrations/001_ansen_schema');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'blueteam.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => {
    if (error) reject(error);
    else resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => {
    if (error) reject(error);
    else resolve(rows);
  });
});

const close = () => new Promise((resolve, reject) => {
  db.close(error => {
    if (error) reject(error);
    else resolve();
  });
});

const challengeSchema = `
  CREATE TABLE challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'practical', 'incident_response')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    category TEXT NOT NULL,
    answer TEXT,
    hints TEXT,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

async function ensureChallengeSchema() {
  const table = await get("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'challenges'");

  if (!table) {
    await run(challengeSchema);
    return;
  }

  if (table.sql.includes('incident_response')) {
    return;
  }

  console.log('Migrating challenges table for incident response support...');
  await run('PRAGMA foreign_keys = OFF');
  await run('DROP TABLE IF EXISTS challenges_new');
  await run(challengeSchema.replace('CREATE TABLE challenges', 'CREATE TABLE challenges_new'));

  const oldRows = await all('SELECT * FROM challenges');
  for (const row of oldRows) {
    await run(
      `INSERT INTO challenges_new
       (id, type, title, description, points, category, answer, hints, difficulty, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.type,
        row.title,
        row.description,
        row.points,
        row.category,
        row.answer,
        row.hints,
        row.difficulty,
        row.is_active ?? 1,
        row.created_at
      ]
    );
  }

  await run('DROP TABLE challenges');
  await run('ALTER TABLE challenges_new RENAME TO challenges');
  await run('PRAGMA foreign_keys = ON');
}

async function ensureTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('player', 'judge')),
      team_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureChallengeSchema();

  await run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      answer TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      points_earned INTEGER DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      phase_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target_objective TEXT,
      required_fields TEXT,
      points INTEGER DEFAULT 0,
      time_limit INTEGER,
      hints TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS phase_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      phase_id INTEGER NOT NULL,
      phase_number INTEGER NOT NULL,
      submission_data TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      points_earned INTEGER DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id),
      FOREIGN KEY (phase_id) REFERENCES phases(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS competition_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time DATETIME,
      end_time DATETIME,
      is_active INTEGER DEFAULT 1
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_phases_challenge ON phases(challenge_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_phase_submissions_user ON phase_submissions(user_id)');
}

async function seedUsers() {
  const users = [
    { username: 'judge', password: 'judge123', role: 'judge', teamName: null },
    { username: 'team1', password: 'team123', role: 'player', teamName: 'Blue Shield Team Alpha' },
    { username: 'team2', password: 'team123', role: 'player', teamName: 'Blue Shield Team Beta' },
    { username: 'team3', password: 'team123', role: 'player', teamName: 'Cyber Guardians' },
    { username: 'team4', password: 'team123', role: 'player', teamName: 'Security Vanguard' },
    { username: 'team5', password: 'team123', role: 'player', teamName: 'Blue Force Assault' },
    { username: 'team6', password: 'team123', role: 'player', teamName: 'Digital Defenders' },
    { username: 'team7', password: 'team123', role: 'player', teamName: 'Red Alert Squad' },
    { username: 'team8', password: 'team123', role: 'player', teamName: 'Hack Hunters' },
    { username: 'team9', password: 'team123', role: 'player', teamName: 'Code Warriors' },
    { username: 'team10', password: 'team123', role: 'player', teamName: 'Threat Trackers' }
  ];

  // Only upsert users — do NOT delete users created by seedTestData.js
  for (const user of users) {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    await run(
      `INSERT INTO users (username, password, role, team_name)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(username) DO UPDATE SET
         password = excluded.password,
         role = excluded.role,
         team_name = excluded.team_name`,
      [user.username, passwordHash, user.role, user.teamName]
    );
  }
}

const challenges = [
  {
    id: 1,
    type: 'multiple_choice',
    title: 'Basic Defense Knowledge',
    description: 'Which command can view all running processes in a Linux system?',
    points: 100,
    category: 'Basic Knowledge',
    answer: 'B',
    difficulty: 'easy',
    hints: [
      { value: 'A', label: 'ls' },
      { value: 'B', label: 'ps' },
      { value: 'C', label: 'top' },
      { value: 'D', label: 'netstat' }
    ]
  },
  {
    id: 2,
    type: 'multiple_choice',
    title: 'Log Analysis',
    description: 'When analyzing an intrusion, which Linux log file typically stores authentication and SSH login records?',
    points: 100,
    category: 'Log Analysis',
    answer: 'C',
    difficulty: 'easy',
    hints: [
      { value: 'A', label: '/var/log/messages' },
      { value: 'B', label: '/var/log/syslog' },
      { value: 'C', label: '/var/log/auth.log' },
      { value: 'D', label: '/var/log/kern.log' }
    ]
  },
  {
    id: 3,
    type: 'multiple_choice',
    title: 'Network Security',
    description: 'In iptables, which chain processes packets destined for the local machine?',
    points: 150,
    category: 'Network Defense',
    answer: 'A',
    difficulty: 'medium',
    hints: [
      { value: 'A', label: 'INPUT' },
      { value: 'B', label: 'OUTPUT' },
      { value: 'C', label: 'FORWARD' },
      { value: 'D', label: 'PREROUTING' }
    ]
  },
  {
    id: 4,
    type: 'multiple_choice',
    title: 'Incident Response',
    description: 'When a backdoor is discovered on a production system, which action should be performed first?',
    points: 150,
    category: 'Incident Response',
    answer: 'B',
    difficulty: 'medium',
    hints: [
      { value: 'A', label: 'Delete the backdoor immediately' },
      { value: 'B', label: 'Isolate the host from the network' },
      { value: 'C', label: 'Restart the system' },
      { value: 'D', label: 'Change all passwords' }
    ]
  },
  {
    id: 5,
    type: 'multiple_choice',
    title: 'Threat Detection',
    description: 'Which behavior most strongly indicates a cryptocurrency-mining trojan?',
    points: 200,
    category: 'Threat Identification',
    answer: 'D',
    difficulty: 'hard',
    hints: [
      { value: 'A', label: 'Disk space rapidly decreases' },
      { value: 'B', label: 'Network traffic briefly increases' },
      { value: 'C', label: 'The host makes frequent DNS queries' },
      { value: 'D', label: 'CPU usage remains above 90%' }
    ]
  },
  {
    id: 6,
    type: 'practical',
    title: 'Linux Process Forensics',
    description: 'A production server has sustained 95% CPU usage. Investigation reveals `/tmp/.systemd-monitor` running as root with PID 1337. Identify the most likely malware category.',
    points: 300,
    category: 'Linux Forensics',
    answer: 'CryptoMiner',
    difficulty: 'medium',
    hints: ['Inspect CPU usage.', 'Review processes executing from temporary directories.', 'Look for processes imitating system services.']
  },
  {
    id: 7,
    type: 'practical',
    title: 'Log Analysis Practice',
    description: 'Authentication logs show repeated failed SSH logins from 192.168.1.100 followed by a successful login to the admin account. Identify the attack type.',
    points: 250,
    category: 'Log Analysis',
    answer: 'BruteForce',
    difficulty: 'easy',
    hints: ['Look for repeated authentication failures.', 'The final login succeeds.', 'The affected service is SSH.']
  },
  {
    id: 8,
    type: 'practical',
    title: 'Command Identification',
    description: 'Command history contains `echo "*/5 * * * * /tmp/.hidden" | crontab -`. Identify the attacker objective.',
    points: 300,
    category: 'Command Analysis',
    answer: 'Persistence',
    difficulty: 'medium',
    hints: ['Review the purpose of crontab.', 'The command creates a recurring task.', 'Consider persistence mechanisms.']
  },
  {
    id: 9,
    type: 'practical',
    title: 'Port Analysis',
    description: 'Netstat shows `10.0.1.15:33456 -> 185.220.101.5:4444 ESTABLISHED` for PID 1337. Identify the connection type.',
    points: 350,
    category: 'Network Analysis',
    answer: 'ReverseShell',
    difficulty: 'hard',
    hints: ['Port 4444 is commonly used by penetration-testing frameworks.', 'The local process initiated an outbound connection.', 'Review reverse-shell behavior.']
  },
  {
    id: 10,
    type: 'practical',
    title: 'File Forensics',
    description: 'The file `/usr/bin/find` has permissions `-rwsr-xr-x` and is owned by root. Identify the security risk.',
    points: 400,
    category: 'Linux Forensics',
    answer: 'SUIDEscalation',
    difficulty: 'hard',
    hints: ['Inspect the special permission bit.', 'The executable is owned by root.', 'Consider privilege escalation.']
  },
  {
    id: 41,
    type: 'incident_response',
    title: 'Server Compromise - SSH Brute Force Attack',
    description: 'A production web server (10.0.1.15) has been compromised. Investigate the alert, identify the attacker activity, contain the threat, and close the incident by following the five-phase SOP.',
    points: 1000,
    category: 'Incident Response',
    answer: 'Complete all 5 phases',
    difficulty: 'hard',
    hints: ['Start with authentication logs.', 'Correlate suspicious processes with outbound connections.', 'Review command history and scheduled tasks.']
  }
];

async function seedChallenges() {
  const canonicalIds = challenges.map(challenge => challenge.id);
  const placeholders = canonicalIds.map(() => '?').join(', ');

  // UPSERT canonical challenges — do NOT delete challenges created by seedTestData.js
  for (const challenge of challenges) {
    await run(
      `INSERT INTO challenges
       (id, type, title, description, points, category, answer, hints, difficulty, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET
         type = excluded.type,
         title = excluded.title,
         description = excluded.description,
         points = excluded.points,
         category = excluded.category,
         answer = excluded.answer,
         hints = excluded.hints,
         difficulty = excluded.difficulty,
         is_active = 1`,
      [
        challenge.id,
        challenge.type,
        challenge.title,
        challenge.description,
        challenge.points,
        challenge.category,
        challenge.answer,
        JSON.stringify(challenge.hints),
        challenge.difficulty
      ]
    );
  }
}

const incidentPhases = [
  {
    number: 1,
    title: 'Alert Triage & Initial Analysis',
    description: 'Review the SIEM alert and authentication log. Confirm the affected asset, attack type, source address, and compromised account.',
    objective: 'Classify the initial-access event and extract the first indicators.',
    fields: [
      { name: 'attack_type', label: 'Attack Type', answer: 'BruteForce', type: 'text' },
      { name: 'source_ip', label: 'Source IP Address', answer: '192.168.1.100', type: 'text' },
      { name: 'compromised_user', label: 'Compromised Account', answer: 'admin', type: 'text' }
    ],
    hints: ['Run `cat /var/log/auth.log`.', 'Look for repeated failures followed by a successful login.']
  },
  {
    number: 2,
    title: 'Process & Connection Analysis',
    description: 'Correlate the suspicious outbound connection with the process list to identify the malicious PID, process name, C2 address, and port.',
    objective: 'Locate the active malicious process and its command-and-control channel.',
    fields: [
      { name: 'malicious_pid', label: 'Malicious Process PID', answer: '1337', type: 'text' },
      { name: 'process_name', label: 'Process Name', answer: '.systemd-monitor', type: 'text' },
      { name: 'c2_ip', label: 'C2 IP Address', answer: '185.220.101.5', type: 'text' },
      { name: 'c2_port', label: 'C2 Port', answer: '4444', type: 'text' }
    ],
    hints: ['Run `ps aux`.', 'Run `netstat -tulpn`.']
  },
  {
    number: 3,
    title: 'Command & File Forensics',
    description: 'Inspect shell history, dropped files, and scheduled tasks to determine how the attacker established persistence.',
    objective: 'Identify the persistence mechanism and malicious file path.',
    fields: [
      { name: 'persistence_method', label: 'Persistence Method', answer: 'Crontab', type: 'text' },
      { name: 'drop_path', label: 'Malicious File Path', answer: '/tmp/.hidden_miner', type: 'text' },
      { name: 'cron_schedule', label: 'Cron Schedule', answer: '*/5 * * * *', type: 'text' }
    ],
    hints: ['Run `history`.', 'Inspect `/home/admin/.bash_history`.', 'Review scheduled tasks.']
  },
  {
    number: 4,
    title: 'Practical Remediation & Containment',
    description: 'Terminate the malicious process, block the command-and-control address, and remove the persistence mechanism.',
    objective: 'Document effective containment and remediation commands.',
    fields: [
      { name: 'kill_command', label: 'Process Termination Command', answer: 'kill 1337', type: 'text' },
      { name: 'block_command', label: 'C2 Blocking Command', answer: 'iptables -A OUTPUT -d 185.220.101.5 -j DROP', type: 'text' },
      { name: 'persistence_removal', label: 'Persistence Removal Command', answer: 'crontab -r', type: 'text' }
    ],
    hints: ['Terminate PID 1337.', 'Block outbound traffic to the C2 IP.', 'Remove the malicious scheduled task.']
  },
  {
    number: 5,
    title: 'IR Summary & Incident Closure',
    description: 'Summarize the root cause, confirm remediation, and submit the primary indicators of compromise for incident closure.',
    objective: 'Complete the incident record and close the investigation.',
    fields: [
      { name: 'root_cause', label: 'Root Cause', answer: 'SSH Brute Force', type: 'text' },
      { name: 'primary_ioc', label: 'Primary IOC', answer: '185.220.101.5', type: 'text' },
      { name: 'remediation_status', label: 'Remediation Status', answer: 'Complete', type: 'text' }
    ],
    hints: ['Combine the initial-access and C2 findings.', 'Confirm that containment and persistence removal are complete.']
  }
];

async function seedIncidentPhases() {
  for (const phase of incidentPhases) {
    const existingRows = await all(
      'SELECT id FROM phases WHERE challenge_id = 41 AND phase_number = ? ORDER BY id',
      [phase.number]
    );
    const existing = existingRows[0];

    if (existing) {
      await run(
        `UPDATE phases SET
           title = ?, description = ?, target_objective = ?, required_fields = ?,
           points = 200, time_limit = 600, hints = ?
         WHERE id = ?`,
        [
          phase.title,
          phase.description,
          phase.objective,
          JSON.stringify(phase.fields),
          JSON.stringify(phase.hints),
          existing.id
        ]
      );

      for (const duplicate of existingRows.slice(1)) {
        await run('DELETE FROM phase_submissions WHERE phase_id = ?', [duplicate.id]);
        await run('DELETE FROM phases WHERE id = ?', [duplicate.id]);
      }
    } else {
      await run(
        `INSERT INTO phases
         (challenge_id, phase_number, title, description, target_objective,
          required_fields, points, time_limit, hints)
         VALUES (41, ?, ?, ?, ?, ?, 200, 600, ?)`,
        [
          phase.number,
          phase.title,
          phase.description,
          phase.objective,
          JSON.stringify(phase.fields),
          JSON.stringify(phase.hints)
        ]
      );
    }
  }

  await run('CREATE UNIQUE INDEX IF NOT EXISTS idx_phases_unique_number ON phases(challenge_id, phase_number)');
}

async function seedMockScores() {
  const scoreSummary = await get(`
    SELECT
      COALESCE(SUM(s.points_earned), 0) AS points,
      COUNT(DISTINCT CASE WHEN s.points_earned > 0 THEN u.id END) AS scored_teams
    FROM users u
    LEFT JOIN submissions s ON s.user_id = u.id AND s.is_correct = 1
    WHERE u.role = 'player'
  `);

  if (Number(scoreSummary.points) > 0 && Number(scoreSummary.scored_teams) === 10) {
    return;
  }

  await run('DELETE FROM submissions');

  const answerByChallenge = new Map(challenges.map(challenge => [challenge.id, challenge.answer]));
  const pointsByChallenge = new Map(challenges.map(challenge => [challenge.id, challenge.points]));
  const solvedByTeam = {
    team1: [1, 2, 6],
    team2: [1, 2, 3, 7],
    team3: [1, 4, 7],
    team4: [2, 3, 5],
    team5: [1, 6],
    team6: [3, 7],
    team7: [1, 2, 4],
    team8: [1, 5],
    team9: [2, 3],
    team10: [1]
  };

  let hoursAgo = 20;
  for (const [username, challengeIds] of Object.entries(solvedByTeam)) {
    const user = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) continue;

    for (const challengeId of challengeIds) {
      await run(
        `INSERT INTO submissions
         (user_id, challenge_id, answer, is_correct, points_earned, submitted_at)
         VALUES (?, ?, ?, 1, ?, datetime('now', ?))`,
        [
          user.id,
          challengeId,
          answerByChallenge.get(challengeId),
          pointsByChallenge.get(challengeId),
          `-${hoursAgo} hours`
        ]
      );
      hoursAgo = Math.max(1, hoursAgo - 1);
    }
  }
}

async function initialize() {
  console.log('Initializing ANSEN competition database...');
  await ensureTables();
  await migrate();
  await seedUsers();
  await seedChallenges();
  await seedIncidentPhases();
  await seedMockScores();
  await run('INSERT OR IGNORE INTO competition_settings (id, is_active) VALUES (1, 1)');

  const teamCount = await get("SELECT COUNT(*) AS count FROM users WHERE role = 'player'");
  const challengeCount = await get('SELECT COUNT(*) AS count FROM challenges WHERE is_active = 1');
  const phaseCount = await get('SELECT COUNT(*) AS count FROM phases WHERE challenge_id = 41');
  const seededPoints = await get(`
    SELECT COALESCE(SUM(s.points_earned), 0) AS points
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    WHERE u.role = 'player' AND s.is_correct = 1
  `);

  console.log(`Ready: ${teamCount.count} teams, ${challengeCount.count} challenges, ${phaseCount.count} phases, ${seededPoints.points} seeded points.`);
  await close();
}

initialize().catch(async error => {
  console.error('Database initialization failed:', error);
  try {
    await close();
  } catch (_) {
    // Ignore close errors after initialization failure.
  }
  process.exit(1);
});
