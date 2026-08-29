#!/bin/sh
set -eu

TARGET="${1:-team1}"

cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

RESET_TARGET="$TARGET" docker compose exec -T -e RESET_TARGET="$TARGET" backend node <<'NODE'
const { run, get, all } = require('./src/models/database');

const target = process.env.RESET_TARGET || 'team1';
const challengeId = 41;

async function resetIncident() {
  await run('BEGIN TRANSACTION');

  try {
    if (target === 'all' || target === '--all') {
      const teams = await all("SELECT id, username, team_name FROM users WHERE role = 'player' ORDER BY username");

      await run('DELETE FROM phase_submissions WHERE challenge_id = ?', [challengeId]);
      await run('DELETE FROM submissions WHERE challenge_id = ?', [challengeId]);
      await run('COMMIT');

      console.log(`Reset Challenge ${challengeId} for ${teams.length} teams.`);
      for (const team of teams) {
        console.log(`- ${team.username}: ${team.team_name}`);
      }
      return;
    }

    const user = await get(
      "SELECT id, username, team_name FROM users WHERE username = ? AND role = 'player'",
      [target]
    );

    if (!user) {
      throw new Error(`Player account not found: ${target}`);
    }

    const phaseResult = await run(
      'DELETE FROM phase_submissions WHERE user_id = ? AND challenge_id = ?',
      [user.id, challengeId]
    );
    const challengeResult = await run(
      'DELETE FROM submissions WHERE user_id = ? AND challenge_id = ?',
      [user.id, challengeId]
    );

    await run('COMMIT');

    console.log(`Incident Response reset for ${user.username} (${user.team_name}).`);
    console.log(`Removed phase records: ${phaseResult.changes}`);
    console.log(`Removed final challenge records: ${challengeResult.changes}`);
    console.log('The challenge will open at Phase 1.');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

resetIncident()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(`Reset failed: ${error.message}`);
    process.exit(1);
  });
NODE
