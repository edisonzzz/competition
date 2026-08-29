const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'blueteam.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 删除所有表
  db.run('DROP TABLE IF EXISTS phase_submissions');
  db.run('DROP TABLE IF EXISTS phases');
  db.run('DROP TABLE IF EXISTS submissions');
  db.run('DROP TABLE IF EXISTS challenges');
  db.run('DROP TABLE IF EXISTS users');

  // 创建users表
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('player', 'judge')) DEFAULT 'player',
    team_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 创建challenges表
  db.run(`CREATE TABLE challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'practical', 'incident_response')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points INTEGER NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    answer TEXT NOT NULL,
    hints TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 创建submissions表
  db.run(`CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
  )`);

  // 创建phases表
  db.run(`CREATE TABLE phases (
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
  )`);

  // 创建phase_submissions表
  db.run(`CREATE TABLE phase_submissions (
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
  )`, () => {
    console.log('✅ 表结构创建完成');
    insertData();
  });
});

function insertData() {
  const judgePassword = bcrypt.hashSync('judge123', 10);
  const teamPassword = bcrypt.hashSync('team123', 10);

  // 插入用户
  const users = [
    ['judge', judgePassword, 'judge', null],
    ['team1', teamPassword, 'player', 'Blue Shield Team Alpha'],
    ['team2', teamPassword, 'player', 'Blue Shield Team Beta'],
    ['team3', teamPassword, 'player', 'Cyber Guardians'],
    ['team4', teamPassword, 'player', 'Security Vanguard'],
    ['team5', teamPassword, 'player', 'Blue Force Assault'],
    ['team6', teamPassword, 'player', 'Digital Defenders'],
    ['team7', teamPassword, 'player', 'Red Alert Squad'],
    ['team8', teamPassword, 'player', 'Hack Hunters'],
    ['team9', teamPassword, 'player', 'Code Warriors'],
    ['team10', teamPassword, 'player', 'Threat Trackers']
  ];

  const userStmt = db.prepare('INSERT INTO users (username, password, role, team_name) VALUES (?, ?, ?, ?)');
  users.forEach(u => userStmt.run(u));
  userStmt.finalize(() => console.log('✅ 用户插入完成'));

  // 插入题目（简化版，只显示关键代码）
  console.log('📝 插入题目...');
  
  db.close(() => {
    console.log('✅ 数据库创建完成: backend/database/blueteam.db');
    console.log('\n上传命令:');
    console.log('scp backend/database/blueteam.db root@116.62.236.60:/root/blueteamctf-cn/backend/database/');
  });
}
