const { getClient } = require('./db_client');
/*
(module.exports.getSerial = async () => {
  const client = await getClient();

  //const entries = await client.query('SELECT * FROM my_table WHERE name = $1;', [name]);
  const entries = await client.query('SELECT serijski_broj FROM uredaj WHERE id = 16');
  console.log(`Database entries: ${entries.rowCount} row(s)`);
  console.log(Object.keys(entries.rows?.[0]).join('\t'));
  console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);
  await client.end();
  return entries.rows[0];
})();
*/

async function getId(ser) {
  const client = await getClient();

  const entries = await client.query('SELECT id FROM uredaj WHERE serijski_broj = $1;', [ser]);
  //const entries = client.query('SELECT id FROM uredaj WHERE serijski_broj = $1;', [ser]);
  //const entries = await client.query('SELECT serijski_broj FROM uredaj WHERE id = 16');
  //console.log(`Database entries: ${entries.rowCount} row(s)`);
  //console.log(Object.keys(entries.rows?.[0]).join('\t'));
  //console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);
  await client.end();
  return entries.rows.map((r) => Object.values(r));
}


module.exports = { getId };