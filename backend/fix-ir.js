const { run, all } = require('./src/models/database');
async function fix() {
  await run("UPDATE challenges SET type = 'incident_response' WHERE id = 41", []);
  console.log('Fixed type for challenge 41');
  const c = await all("SELECT id, type, title FROM challenges WHERE id = 41", []);
  console.log(JSON.stringify(c));
}
fix().catch(e => console.error(e));