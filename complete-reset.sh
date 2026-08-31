#!/bin/bash

echo "========================================"
echo "Complete Database Reset Script"
echo "========================================"

docker compose exec -T backend node << 'NODEJS'
const { run, all } = require('./src/models/database');
const bcrypt = require('bcryptjs');

async function fullReset() {
  console.log('Starting full reset...\n');

  // 1. Create tables
  console.log('Creating tables...');
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('player', 'judge')) DEFAULT 'player',
    team_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS challenges (
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

  await run(`CREATE TABLE IF NOT EXISTS submissions (
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

  await run(`CREATE TABLE IF NOT EXISTS phases (
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

  await run(`CREATE TABLE IF NOT EXISTS phase_submissions (
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
  )`);

  console.log('Tables created\n');

  // 2. Clear old data
  console.log('Clearing old data...');
  await run('DELETE FROM phase_submissions');
  await run('DELETE FROM phases');
  await run('DELETE FROM submissions');
  await run('DELETE FROM challenges');
  await run('DELETE FROM users WHERE id > 1');
  console.log('Data cleared\n');

  // 3. Create 10 teams
  console.log('Creating 10 teams...');
  const teams = [
    'Blue Shield Team Alpha', 'Blue Shield Team Beta', 'Cyber Guardians',
    'Security Vanguard', 'Blue Force Assault', 'Digital Defenders',
    'Red Alert Squad', 'Hack Hunters', 'Code Warriors', 'Threat Trackers'
  ];

  for (let i = 0; i < 10; i++) {
    const hashedPassword = bcrypt.hashSync('team123', 10);
    await run('INSERT INTO users (username, password, role, team_name) VALUES (?, ?, ?, ?)',
      ['team' + (i + 1), hashedPassword, 'player', teams[i]]);
    console.log(`  team${i + 1}: ${teams[i]}`);
  }

  // 4. Insert 5 multiple choice questions
  console.log('\nInserting multiple choice questions...');
  const mc = [
    {id: 1, title: 'Basic Defense Knowledge', desc: 'Which command can view all running processes in a Linux system?', cat: 'Basic Knowledge', points: 100, diff: 'easy', ans: 'B',
     opts: [{value:'A',label:'ls'},{value:'B',label:'ps'},{value:'C',label:'top'},{value:'D',label:'netstat'}]},
    {id: 2, title: 'Log Analysis', desc: 'When analyzing intrusion incidents, which log file typically stores user login records in Linux?', cat: 'Log Analysis', points: 100, diff: 'easy', ans: 'C',
     opts: [{value:'A',label:'/var/log/messages'},{value:'B',label:'/var/log/syslog'},{value:'C',label:'/var/log/auth.log'},{value:'D',label:'/var/log/kern.log'}]},
    {id: 3, title: 'Network Security', desc: 'In iptables, which chain is used to process packets destined for the local machine?', cat: 'Network Defense', points: 150, diff: 'medium', ans: 'A',
     opts: [{value:'A',label:'INPUT'},{value:'B',label:'OUTPUT'},{value:'C',label:'FORWARD'},{value:'D',label:'PREROUTING'}]},
    {id: 4, title: 'Incident Response', desc: 'When a backdoor is discovered on the system, which operation should be performed first?', cat: 'Incident Response', points: 150, diff: 'medium', ans: 'B',
     opts: [{value:'A',label:'Delete backdoor files immediately'},{value:'B',label:'Disconnect network connection'},{value:'C',label:'Restart the system'},{value:'D',label:'Change all passwords'}]},
    {id: 5, title: 'Threat Detection', desc: 'Which behavior most likely indicates the presence of a crypto mining trojan?', cat: 'Threat Identification', points: 200, diff: 'hard', ans: 'D',
     opts: [{value:'A',label:'Disk space rapidly decreasing'},{value:'B',label:'Network traffic suddenly increasing'},{value:'C',label:'Frequent DNS queries'},{value:'D',label:'CPU usage consistently above 90%'}]}
  ];

  for (const c of mc) {
    await run('INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [c.id, 'multiple_choice', c.title, c.desc, c.cat, c.points, c.diff, c.ans, JSON.stringify(c.opts)]);
    console.log(`  ${c.id}. ${c.title}`);
  }

  // 5. Insert 5 practical challenges
  console.log('\nInserting practical challenges...');
  const practical = [
    {id: 6, title: 'Linux Process Forensics', desc: 'Your server CPU usage is 95%. A suspicious process /tmp/.systemd-monitor with PID 1337 is found.\n\n**Task**: What type of malicious program is this? (Answer: CryptoMiner/RemoteControl/Ransomware/DDoSTrojan)', cat: 'Linux Forensics', points: 300, ans: 'CryptoMiner'},
    {id: 7, title: 'Log Analysis Practice', desc: 'Analyze auth.log showing multiple failed SSH login attempts from 192.168.1.100, finally succeeded.\n\n**Task**: What type of attack? (Answer: BruteForce/SQLInjection/XSS/CSRF)', cat: 'Log Analysis', points: 250, ans: 'BruteForce'},
    {id: 8, title: 'Command Identification', desc: 'Command history shows: echo "*/5 * * * * /tmp/.hidden" | crontab -\n\n**Task**: Purpose of this command? (Answer: Persistence/InformationGathering/LateralMovement/CoveringTracks)', cat: 'Command Analysis', points: 300, ans: 'Persistence'},
    {id: 9, title: 'Port Analysis', desc: 'Netstat shows: tcp 10.0.1.15:33456 -> 185.220.101.5:4444 ESTABLISHED\n\n**Task**: Connection type? (Answer: ReverseShell/ForwardProxy/DatabaseConnection/WebService)', cat: 'Network Analysis', points: 350, ans: 'ReverseShell'},
    {id: 10, title: 'File Forensics', desc: 'File permissions: -rwsr-xr-x 1 root root /usr/bin/find\n\n**Task**: Security risk? (Answer: SUIDEscalation/DirectoryTraversal/BufferOverflow/PermissionLeak)', cat: 'Linux Forensics', points: 400, ans: 'SUIDEscalation'}
  ];

  for (const c of practical) {
    await run('INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [c.id, 'practical', c.title, c.desc, c.cat, c.points, 'medium', c.ans, JSON.stringify(['Check logs', 'Analyze carefully'])]);
    console.log(`  ${c.id}. ${c.title}`);
  }

  // 6. Insert incident response event
  console.log('\nInserting incident response event...');
  await run('INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
    [41, 'incident_response', 'Server Compromise - SSH Brute Force Attack',
     'A production web server (10.0.1.15) has been compromised. The monitoring system detected unusual CPU usage and suspicious network connections. Your task is to investigate the incident following the standard SOP and complete all phases of the incident response process.',
     'Incident Response', 1000, 'hard', 'Complete all 5 phases', JSON.stringify(['Check system logs', 'Focus on auth logs'])]);
  console.log('  41. Server Compromise - SSH Brute Force Attack');

  // 7. Create 5 Phases
  const phases = [
    {num: 1, title: 'Alert Triage & Initial Analysis', desc: 'Review SIEM alerts', fields: [{name:'attack_type',label:'Attack Type',answer:'BruteForce'},{name:'source_ip',label:'Source IP',answer:'192.168.1.100'}], points: 200},
    {num: 2, title: 'Process & Connection Analysis', desc: 'Identify malicious process', fields: [{name:'malicious_pid',label:'PID',answer:'1337'}], points: 200},
    {num: 3, title: 'Persistence Analysis', desc: 'Find persistence method', fields: [{name:'persistence_method',label:'Method',answer:'Crontab'}], points: 200},
    {num: 4, title: 'Incident Remediation', desc: 'Stop the attack', fields: [{name:'kill_action',label:'Command',answer:'kill 1337'}], points: 200},
    {num: 5, title: 'Incident Summary', desc: 'Generate report', fields: [{name:'root_cause',label:'Root Cause',answer:'SSH Brute Force'}], points: 200}
  ];

  for (const p of phases) {
    await run('INSERT INTO phases (challenge_id, phase_number, title, description, target_objective, required_fields, points) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [41, p.num, p.title, p.desc, p.title, JSON.stringify(p.fields), p.points]);
  }
  console.log('  Created 5 phases');

  // 8. Add mock submission data
  console.log('\nAdding mock submissions...');
  const subs = [
    {uid: 2, cid: 1, ans: 'B', correct: 1, pts: 100},
    {uid: 2, cid: 2, ans: 'C', correct: 1, pts: 100},
    {uid: 2, cid: 6, ans: 'CryptoMiner', correct: 1, pts: 300},
    {uid: 3, cid: 1, ans: 'B', correct: 1, pts: 100},
    {uid: 3, cid: 3, ans: 'A', correct: 1, pts: 150},
    {uid: 4, cid: 1, ans: 'B', correct: 1, pts: 100},
    {uid: 4, cid: 4, ans: 'B', correct: 1, pts: 150},
    {uid: 5, cid: 1, ans: 'B', correct: 1, pts: 100},
    {uid: 5, cid: 2, ans: 'C', correct: 1, pts: 100},
    {uid: 5, cid: 3, ans: 'A', correct: 1, pts: 150}
  ];

  for (const s of subs) {
    await run('INSERT INTO submissions (user_id, challenge_id, answer, is_correct, points_earned) VALUES (?, ?, ?, ?, ?)',
      [s.uid, s.cid, s.ans, s.correct, s.pts]);
  }
  console.log(`  Added ${subs.length} mock submissions`);

  // Verify
  console.log('\nFinal Statistics:');
  const stats = {
    teams: await all('SELECT COUNT(*) as c FROM users WHERE role = "player"'),
    challenges: await all('SELECT COUNT(*) as c FROM challenges'),
    submissions: await all('SELECT COUNT(*) as c FROM submissions'),
    phases: await all('SELECT COUNT(*) as c FROM phases')
  };
  console.log(`  Teams: ${stats.teams[0].c}`);
  console.log(`  Challenges: ${stats.challenges[0].c}`);
  console.log(`  Submissions: ${stats.submissions[0].c}`);
  console.log(`  Phases: ${stats.phases[0].c}`);

  console.log('\nDatabase reset complete!');
  process.exit(0);
}

fullReset().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
NODEJS