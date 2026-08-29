# ANSEN CN Server Update

This package fixes the deployed server issues together:

- Incident Response no longer calls browser-side `localhost:3001`; it uses `/api`.
- Exactly 10 English demo teams are created or updated.
- Exactly 11 English challenges are retained.
- Challenge 41 includes five SOP investigation phases.
- Demo leaderboard scores are linked by real usernames/IDs.
- Chinese legacy seed data is removed and cannot return after restart.
- Frontend/backend Docker builds use clean Linux dependencies and `npmmirror.com`.

## Upload from macOS

```bash
scp /Users/rickbook2025/Documents/code/ansen-blueteamctf-cn-fixed.tar.gz root@116.62.236.60:/root/
```

## Apply on the server

```bash
cd /root/blueteamctf-cn

docker compose exec -T backend sh -c \
  'cp /app/database/blueteam.db /app/database/blueteam.db.before-fixed-update'

docker compose down
cd /root
mv blueteamctf-cn "blueteamctf-cn-old-$(date +%Y%m%d-%H%M%S)"
tar -xzf ansen-blueteamctf-cn-fixed.tar.gz
cd /root/blueteamctf-cn
chmod +x server-refresh.sh
./server-refresh.sh
```

Do not run `docker compose down -v`; the `-v` option deletes the database volume.

## Expected verification

The script must print:

```text
Verification passed: incident flow available, 10 teams, and non-zero leaderboard scores.
```

Then open:

```text
http://116.62.236.60:5173
```

Accounts:

- Judge: `judge` / `judge123`
- Players: `team1` through `team10` / `team123`
