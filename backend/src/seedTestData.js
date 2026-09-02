const { run, get, all } = require('./models/database');
const bcrypt = require('bcryptjs');

async function createTestTeams() {
  console.log('Creating test teams...');
  const teams = [
    { name: 'Team Alpha', members: ['alpha_m1', 'alpha_m2', 'alpha_m3', 'alpha_m4', 'alpha_m5'] },
    { name: 'Team Beta', members: ['beta_m1', 'beta_m2', 'beta_m3', 'beta_m4', 'beta_m5'] },
    { name: 'Team Gamma', members: ['gamma_m1', 'gamma_m2', 'gamma_m3', 'gamma_m4', 'gamma_m5'] }
  ];
  const password = await bcrypt.hash('pass123', 10);

  for (const team of teams) {
    const existing = await get('SELECT id FROM teams WHERE team_name = ?', [team.name]);
    if (existing) { console.log(`  Team ${team.name} already exists`); continue; }
    const teamCode = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const teamResult = await run('INSERT INTO teams (team_name, team_code) VALUES (?, ?)', [team.name, teamCode]);
    const teamId = teamResult.lastID;
    for (let i = 0; i < 5; i++) {
      const memberNumber = i + 1;
      const userResult = await run(
        `INSERT INTO users (username, password, role, team_name, team_id, member_number) VALUES (?, ?, 'player', ?, ?, ?)`,
        [team.members[i], password, team.name, teamId, memberNumber]
      );
      await run(`INSERT INTO team_members (team_id, user_id, member_number) VALUES (?, ?, ?)`, [teamId, userResult.lastID, memberNumber]);
    }
    console.log(`  Created ${team.name} with 5 members`);
  }
}

// ============================================================
// PHASE 1: 5 Multiple Choice Questions (EN + FR)
// ============================================================
const phase1Challenges = [
  {
    id: 1, type: 'multiple_choice', difficulty: 'easy', points: 100,
    category: 'Basic Knowledge',
    title: 'Basic Defense Knowledge',
    title_fr: 'Connaissances de base en défense',
    description: 'Which command can view all running processes in a Linux system?\n\nA) ls\nB) ps\nC) top\nD) netstat',
    description_fr: 'Quelle commande permet de voir tous les processus en cours sous Linux ?\n\nA) ls\nB) ps\nC) top\nD) netstat',
    answer: 'B',
    hints: JSON.stringify([{value:'A',label:'ls'},{value:'B',label:'ps'},{value:'C',label:'top'},{value:'D',label:'netstat'}])
  },
  {
    id: 2, type: 'multiple_choice', difficulty: 'easy', points: 100,
    category: 'Log Analysis',
    title: 'Log Analysis',
    title_fr: 'Analyse de journaux',
    description: 'When analyzing an intrusion, which Linux log file typically stores authentication and SSH login records?\n\nA) /var/log/messages\nB) /var/log/syslog\nC) /var/log/auth.log\nD) /var/log/kern.log',
    description_fr: 'Lors de l\'analyse d\'une intrusion, quel fichier de journal Linux stocke les enregistrements d\'authentification et de connexion SSH ?\n\nA) /var/log/messages\nB) /var/log/syslog\nC) /var/log/auth.log\nD) /var/log/kern.log',
    answer: 'C',
    hints: JSON.stringify([{value:'A',label:'/var/log/messages'},{value:'B',label:'/var/log/syslog'},{value:'C',label:'/var/log/auth.log'},{value:'D',label:'/var/log/kern.log'}])
  },
  {
    id: 3, type: 'multiple_choice', difficulty: 'medium', points: 150,
    category: 'Network Defense',
    title: 'Network Security',
    title_fr: 'Sécurité réseau',
    description: 'In iptables, which chain processes packets destined for the local machine?\n\nA) INPUT\nB) OUTPUT\nC) FORWARD\nD) PREROUTING',
    description_fr: 'Dans iptables, quelle chaîne traite les paquets destinés à la machine locale ?\n\nA) INPUT\nB) OUTPUT\nC) FORWARD\nD) PREROUTING',
    answer: 'A',
    hints: JSON.stringify([{value:'A',label:'INPUT'},{value:'B',label:'OUTPUT'},{value:'C',label:'FORWARD'},{value:'D',label:'PREROUTING'}])
  },
  {
    id: 4, type: 'multiple_choice', difficulty: 'medium', points: 150,
    category: 'Incident Response',
    title: 'Incident Response',
    title_fr: 'Réponse aux incidents',
    description: 'When a backdoor is discovered on a production system, which action should be performed first?\n\nA) Delete the backdoor immediately\nB) Isolate the host from the network\nC) Restart the system\nD) Change all passwords',
    description_fr: 'Lorsqu\'une porte dérobée est découverte sur un système de production, quelle action doit être effectuée en premier ?\n\nA) Supprimer immédiatement la porte dérobée\nB) Isoler l\'hôte du réseau\nC) Redémarrer le système\nD) Changer tous les mots de passe',
    answer: 'B',
    hints: JSON.stringify([{value:'A',label:'Delete immediately'},{value:'B',label:'Isolate host'},{value:'C',label:'Restart'},{value:'D',label:'Change passwords'}])
  },
  {
    id: 5, type: 'multiple_choice', difficulty: 'hard', points: 200,
    category: 'Threat Identification',
    title: 'Threat Detection',
    title_fr: 'Détection des menaces',
    description: 'Which behavior most strongly indicates a cryptocurrency-mining trojan?\n\nA) Disk space rapidly decreases\nB) Network traffic briefly increases\nC) The host makes frequent DNS queries\nD) CPU usage remains above 90%',
    description_fr: 'Quel comportement indique le plus fortement un cheval de Troie de minage de cryptomonnaie ?\n\nA) L\'espace disque diminue rapidement\nB) Le trafic réseau augmente brièvement\nC) L\'hôte effectue des requêtes DNS fréquentes\nD) L\'utilisation du CPU reste au-dessus de 90%',
    answer: 'D',
    hints: JSON.stringify([{value:'A',label:'Disk space decreases'},{value:'B',label:'Network traffic'},{value:'C',label:'DNS queries'},{value:'D',label:'CPU > 90%'}])
  }
];

// ============================================================
// PHASE 2: 5 Practical / Hands-on Challenges (EN + FR)
// ============================================================
const phase2Challenges = [
  {
    id: 6, type: 'practical', difficulty: 'medium', points: 300,
    category: 'Linux Forensics',
    title: 'Linux Process Forensics',
    title_fr: 'Analyse de processus Linux',
    description: 'A production server has sustained 95% CPU usage. Investigation reveals `/tmp/.systemd-monitor` running as root with PID 1337. Identify the most likely malware category.\n\nAnswer: CryptoMiner / RemoteControl / Ransomware / DDoSTrojan',
    description_fr: 'Un serveur de production a une utilisation CPU de 95%. L\'enquête révèle `/tmp/.systemd-monitor` tournant en tant que root avec le PID 1337. Identifiez la catégorie de malware la plus probable.\n\nRéponse : CryptoMiner / RemoteControl / Ransomware / DDoSTrojan',
    answer: 'CryptoMiner',
    hints: JSON.stringify(['Check CPU usage', 'Process in temp directory', 'Disguised as system service'])
  },
  {
    id: 7, type: 'practical', difficulty: 'easy', points: 250,
    category: 'Log Analysis',
    title: 'Log Analysis Practice',
    title_fr: 'Pratique d\'analyse de journaux',
    description: 'Authentication logs show repeated failed SSH logins from 192.168.1.100 followed by a successful login to the admin account. Identify the attack type.\n\nAnswer: BruteForce / SQLInjection / XSS / CSRF',
    description_fr: 'Les journaux d\'authentification montrent des échecs répétés de connexion SSH depuis 192.168.1.100 suivis d\'une connexion réussie au compte admin. Identifiez le type d\'attaque.\n\nRéponse : BruteForce / SQLInjection / XSS / CSRF',
    answer: 'BruteForce',
    hints: JSON.stringify(['Multiple failed attempts', 'Final success', 'SSH service'])
  },
  {
    id: 8, type: 'practical', difficulty: 'medium', points: 300,
    category: 'Command Analysis',
    title: 'Command Identification',
    title_fr: 'Identification de commandes',
    description: 'Command history contains `echo "*/5 * * * * /tmp/.hidden" | crontab -`. Identify the attacker objective.\n\nAnswer: Persistence / InformationGathering / LateralMovement / CoveringTracks',
    description_fr: 'L\'historique des commandes contient `echo "*/5 * * * * /tmp/.hidden" | crontab -`. Identifiez l\'objectif de l\'attaquant.\n\nRéponse : Persistence / InformationGathering / LateralMovement / CoveringTracks',
    answer: 'Persistence',
    hints: JSON.stringify(['Crontab purpose', 'Recurring task', 'Persistence mechanism'])
  },
  {
    id: 9, type: 'practical', difficulty: 'hard', points: 350,
    category: 'Network Analysis',
    title: 'Port Analysis',
    title_fr: 'Analyse de ports',
    description: 'Netstat shows `10.0.1.15:33456 -> 185.220.101.5:4444 ESTABLISHED` for PID 1337. Identify the connection type.\n\nAnswer: ReverseShell / ForwardProxy / DatabaseConnection / WebService',
    description_fr: 'Netstat montre `10.0.1.15:33456 -> 185.220.101.5:4444 ESTABLISHED` pour le PID 1337. Identifiez le type de connexion.\n\nRéponse : ReverseShell / ForwardProxy / DatabaseConnection / WebService',
    answer: 'ReverseShell',
    hints: JSON.stringify(['Port 4444 common for pentesting', 'Outbound connection', 'Reverse shell behavior'])
  },
  {
    id: 10, type: 'practical', difficulty: 'hard', points: 400,
    category: 'Linux Forensics',
    title: 'File Forensics',
    title_fr: 'Analyse de fichiers',
    description: 'The file `/usr/bin/find` has permissions `-rwsr-xr-x` and is owned by root. Identify the security risk.\n\nAnswer: SUIDEscalation / DirectoryTraversal / BufferOverflow / PermissionLeak',
    description_fr: 'Le fichier `/usr/bin/find` a les permissions `-rwsr-xr-x` et appartient à root. Identifiez le risque de sécurité.\n\nRéponse : SUIDEscalation / DirectoryTraversal / BufferOverflow / PermissionLeak',
    answer: 'SUIDEscalation',
    hints: JSON.stringify(['Special permission bit', 'Root-owned', 'Privilege escalation'])
  }
];

// ============================================================
// PHASE 3: 1 Incident Response (5 Phases, EN + FR)
// ============================================================
const phase3Challenge = {
  id: 41, type: 'incident_response', difficulty: 'hard', points: 1000,
  category: 'Incident Response',
  title: 'Server Compromise - SSH Brute Force Attack',
  title_fr: 'Compromission de serveur - Attaque par force brute SSH',
  description: 'A production web server (10.0.1.15) has been compromised. Investigate the alert, identify the attacker activity, contain the threat, and close the incident by following the five-phase SOP.',
  description_fr: 'Un serveur web de production (10.0.1.15) a été compromis. Enquêtez sur l\'alerte, identifiez l\'activité de l\'attaquant, contenez la menace et clôturez l\'incident en suivant la procédure en cinq phases.',
  answer: 'Complete all 5 phases',
  hints: JSON.stringify(['Start with authentication logs', 'Correlate processes and connections', 'Review scheduled tasks'])
};

const phase3Phases = [
  {
    challenge_id: 41, phase_number: 1,
    title: 'Alert Triage & Initial Analysis',
    title_fr: 'Tri d\'alerte et analyse initiale',
    description: 'Review the SIEM alert and authentication log. Confirm the affected asset, attack type, source address, and compromised account.',
    description_fr: 'Examinez l\'alerte SIEM et le journal d\'authentification. Confirmez l\'actif affecté, le type d\'attaque, l\'adresse source et le compte compromis.',
    points: 200,
    required_fields: JSON.stringify([
      {name:'attack_type',label:'Attack Type',answer:'BruteForce',label_fr:'Type d\'attaque'},
      {name:'source_ip',label:'Source IP Address',answer:'192.168.1.100',label_fr:'Adresse IP source'},
      {name:'compromised_account',label:'Compromised Account',answer:'admin',label_fr:'Compte compromis'}
    ])
  },
  {
    challenge_id: 41, phase_number: 2,
    title: 'Process & Connection Analysis',
    title_fr: 'Analyse des processus et connexions',
    description: 'Correlate the suspicious outbound connection with the process list to identify the malicious PID, process name, C2 address, and port.',
    description_fr: 'Corrélez la connexion sortante suspecte avec la liste des processus pour identifier le PID malveillant, le nom du processus, l\'adresse C2 et le port.',
    points: 200,
    required_fields: JSON.stringify([
      {name:'malicious_pid',label:'Malicious Process PID',answer:'1337',label_fr:'PID du processus malveillant'},
      {name:'process_name',label:'Process Name',answer:'.systemd-monitor',label_fr:'Nom du processus'},
      {name:'c2_ip',label:'C2 IP Address',answer:'185.220.101.5',label_fr:'Adresse IP C2'},
      {name:'c2_port',label:'C2 Port',answer:'4444',label_fr:'Port C2'}
    ])
  },
  {
    challenge_id: 41, phase_number: 3,
    title: 'Command & File Forensics',
    title_fr: 'Analyse des commandes et fichiers',
    description: 'Inspect shell history, dropped files, and scheduled tasks to determine how the attacker established persistence.',
    description_fr: 'Inspectez l\'historique du shell, les fichiers déposés et les tâches planifiées pour déterminer comment l\'attaquant a établi sa persistance.',
    points: 200,
    required_fields: JSON.stringify([
      {name:'persistence_method',label:'Persistence Method',answer:'Crontab',label_fr:'Méthode de persistance'},
      {name:'malicious_file_path',label:'Malicious File Path',answer:'/tmp/.hidden_miner',label_fr:'Chemin du fichier malveillant'},
      {name:'cron_schedule',label:'Cron Schedule',answer:'*/5 * * * *',label_fr:'Programmation cron'}
    ])
  },
  {
    challenge_id: 41, phase_number: 4,
    title: 'Practical Remediation & Containment',
    title_fr: 'Remédiation et confinement',
    description: 'Terminate the malicious process, block the command-and-control address, and remove the persistence mechanism.',
    description_fr: 'Terminez le processus malveillant, bloquez l\'adresse de commande et de contrôle, et supprimez le mécanisme de persistance.',
    points: 200,
    required_fields: JSON.stringify([
      {name:'kill_command',label:'Process Termination Command',answer:'kill 1337',label_fr:'Commande de terminaison'},
      {name:'c2_block_command',label:'C2 Blocking Command',answer:'iptables -A OUTPUT -d 185.220.101.5 -j DROP',label_fr:'Commande de blocage C2'},
      {name:'persistence_remove_command',label:'Persistence Removal Command',answer:'crontab -r',label_fr:'Suppression persistance'}
    ])
  },
  {
    challenge_id: 41, phase_number: 5,
    title: 'IR Summary & Incident Closure',
    title_fr: 'Résumé et clôture d\'incident',
    description: 'Summarize the root cause, confirm remediation, and submit the primary indicators of compromise for incident closure.',
    description_fr: 'Résumez la cause racine, confirmez la remédiation et soumettez les indicateurs de compromission principaux pour la clôture de l\'incident.',
    points: 200,
    required_fields: JSON.stringify([
      {name:'root_cause',label:'Root Cause',answer:'SSH Brute Force',label_fr:'Cause racine'},
      {name:'primary_ioc',label:'Primary IOC',answer:'185.220.101.5',label_fr:'IOC principal'},
      {name:'remediation_status',label:'Remediation Status',answer:'Complete',label_fr:'État de la remédiation'}
    ])
  }
];

async function seedChallenges() {
  const existing = await get('SELECT COUNT(*) as count FROM challenges WHERE is_active = 1');
  if (existing.count > 50) {
    console.log('  Clearing old challenges first...');
    await run('DELETE FROM challenges');
    await run('DELETE FROM submissions');
    await run('DELETE FROM phase_submissions');
    await run('DELETE FROM phases');
    await run('DELETE FROM question_pool');
    console.log('  Old data cleared.');
  }

  console.log('Creating Phase 1: 5 Multiple Choice questions...');
  for (const c of phase1Challenges) {
    const exists = await get('SELECT id FROM challenges WHERE id = ?', [c.id]);
    if (exists) { await run('DELETE FROM challenges WHERE id = ?', [c.id]); }
    await run(
      `INSERT INTO challenges (id, type, title, title_fr, description, description_fr, points, category, answer, hints, difficulty, phase_number, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [c.id, c.type, c.title, c.title_fr, c.description, c.description_fr, c.points, c.category, c.answer, c.hints, c.difficulty]
    );
    console.log(`  ${c.id}. ${c.title} / ${c.title_fr}`);
  }

  console.log('Creating Phase 2: 5 Practical challenges...');
  for (const c of phase2Challenges) {
    const exists = await get('SELECT id FROM challenges WHERE id = ?', [c.id]);
    if (exists) { await run('DELETE FROM challenges WHERE id = ?', [c.id]); }
    await run(
      `INSERT INTO challenges (id, type, title, title_fr, description, description_fr, points, category, answer, hints, difficulty, phase_number, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1)`,
      [c.id, c.type, c.title, c.title_fr, c.description, c.description_fr, c.points, c.category, c.answer, c.hints, c.difficulty]
    );
    console.log(`  ${c.id}. ${c.title} / ${c.title_fr}`);
  }

  console.log('Creating Phase 3: 1 Incident Response...');
  const c = phase3Challenge;
  const exists = await get('SELECT id FROM challenges WHERE id = ?', [c.id]);
  if (exists) { await run('DELETE FROM challenges WHERE id = ?', [c.id]); }
  await run(
    `INSERT INTO challenges (id, type, title, title_fr, description, description_fr, points, category, answer, hints, difficulty, phase_number, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 3, 1)`,
    [c.id, c.type, c.title, c.title_fr, c.description, c.description_fr, c.points, c.category, c.answer, c.hints, c.difficulty]
  );
  console.log(`  ${c.id}. ${c.title} / ${c.title_fr}`);

  console.log('Creating 5 Phases for Incident Response...');
  await run('DELETE FROM phases WHERE challenge_id = 41', []);
  for (const p of phase3Phases) {
    await run(
      `INSERT INTO phases (challenge_id, phase_number, title, title_fr, description, description_fr, target_objective, required_fields, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.challenge_id, p.phase_number, p.title, p.title_fr, p.description, p.description_fr, p.title, p.required_fields, p.points]
    );
  }
  console.log('  5 phases created.');
}

async function seedTestData() {
  try {
    await createTestTeams();
    await seedChallenges();
    const teamCount = await get('SELECT COUNT(*) as count FROM teams');
    const userCount = await get('SELECT COUNT(*) as count FROM users WHERE role = "player"');
    const challengeCount = await get('SELECT COUNT(*) as count FROM challenges WHERE is_active = 1');
    const phaseCount = await get('SELECT COUNT(*) as count FROM phases');
    console.log(`\nSummary: Teams=${teamCount.count}, Players=${userCount.count}, Challenges=${challengeCount.count}, Phases=${phaseCount.count}`);
    console.log('  Phase 1: 5 Multiple Choice (EN/FR)');
    console.log('  Phase 2: 5 Practical (EN/FR)');
    console.log('  Phase 3: 1 Incident Response with 5 sub-phases (EN/FR)');
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedTestData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { seedTestData };