#!/bin/sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
echo "Updating ANSEN competition platform..."

if docker compose ps --status running --services 2>/dev/null | grep -q '^backend$'; then
  docker compose exec -T backend sh -c "if [ -f /app/database/blueteam.db ]; then cp /app/database/blueteam.db /app/database/blueteam.db.backup-$STAMP; fi"
  echo "Database backup created in the Docker volume: blueteam.db.backup-$STAMP"
fi

docker compose down
docker compose build --no-cache
docker compose up -d

echo "Waiting for services..."
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3001/health >/dev/null 2>&1 \
    && curl -fsS http://127.0.0.1:5173 >/dev/null 2>&1; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "Services did not become ready. Recent logs:"
    docker compose logs --tail=80
    exit 1
  fi
  sleep 2
done

LOGIN_RESPONSE="$(curl -fsS -X POST http://127.0.0.1:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"team1","password":"team123"}')"
TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"

if [ -z "$TOKEN" ]; then
  echo "Login verification failed: $LOGIN_RESPONSE"
  exit 1
fi

CHALLENGES="$(curl -fsS http://127.0.0.1:5173/api/challenges -H "Authorization: Bearer $TOKEN")"
PHASES="$(curl -fsS http://127.0.0.1:5173/api/phases/41/phases -H "Authorization: Bearer $TOKEN")"
LEADERBOARD="$(curl -fsS http://127.0.0.1:5173/api/leaderboard)"

printf '%s' "$CHALLENGES" | grep -q 'Server Compromise - SSH Brute Force Attack'
printf '%s' "$PHASES" | grep -q 'IR Summary & Incident Closure'
printf '%s' "$LEADERBOARD" | grep -Eq '"total_points":[1-9][0-9]*'

TEAM_COUNT="$(printf '%s' "$LEADERBOARD" | grep -o '"username":"team[0-9]*"' | wc -l | tr -d ' ')"
if [ "$TEAM_COUNT" -ne 10 ]; then
  echo "Expected 10 teams but found $TEAM_COUNT"
  exit 1
fi

echo "Verification passed: incident flow available, 10 teams, and non-zero leaderboard scores."
docker compose ps
